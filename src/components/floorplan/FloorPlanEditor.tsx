import { useEffect, useRef, useState, useCallback } from 'react';
import { Canvas as FabricCanvas, PencilBrush, FabricObject, Group } from 'fabric';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save, X } from 'lucide-react';
import { FloorPlanToolbar } from './FloorPlanToolbar';
import { ReadingMarkerPopover } from './ReadingMarkerPopover';
import { ReadingLinkDialog } from './ReadingLinkDialog';
import { FloorPlanReadingDialog } from './FloorPlanReadingDialog';
import {
  FloorPlanTool,
  EquipmentType,
  EQUIPMENT_TYPES,
  createRoom,
  createWall,
  createDoor,
  createWindow,
  createAffectedArea,
  createEquipmentMarker,
  createReadingMarker,
  createArrow,
  createLabel,
  drawGrid,
  clearGrid,
  serializeFloorPlan,
  loadFloorPlan,
  exportFloorPlanAsImage,
  getReadingMarkers,
  updateReadingMarkerStyle,
} from '@/lib/floorPlanTools';
import {
  useFloorPlanReadings,
  useJobReadingsForLinking,
  useLinkReadingToMarker,
  useUnlinkReadingFromMarker,
} from '@/hooks/useFloorPlans';
import { useJobChambers, useCreateAndLinkReading } from '@/hooks/useJobReadings';
import { useTenant } from '@/hooks/useTenant';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/types';

type MoistureReading = Tables<'moisture_readings'>;

interface FloorPlanEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
  existingPlan?: {
    id: string;
    name: string;
    floor_number: number;
    canvas_data: unknown;
  };
  onSave: (data: {
    name: string;
    floor_number: number;
    canvas_data: object;
    thumbnail: Blob;
  }) => Promise<void>;
}

export const FloorPlanEditor = ({
  open,
  onOpenChange,
  jobId,
  existingPlan,
  onSave,
}: FloorPlanEditorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [activeTool, setActiveTool] = useState<FloorPlanTool>('select');
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentType>(EQUIPMENT_TYPES[0]);
  const [showGrid, setShowGrid] = useState(true);
  const [planName, setPlanName] = useState(existingPlan?.name || 'Floor Plan');
  const [floorNumber, setFloorNumber] = useState(existingPlan?.floor_number || 1);
  const [isSaving, setIsSaving] = useState(false);
  const [readingCounter, setReadingCounter] = useState(1);
  
  // Reading linking state
  const [readingMode, setReadingMode] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<{
    markerId: string;
    readingNumber: number;
    linkedReadingId: string | null;
  } | null>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [addReadingDialogOpen, setAddReadingDialogOpen] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState({ x: 0, y: 0 });

  // Undo/Redo history
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Drawing state
  const isDrawingRef = useRef(false);
  const startPointRef = useRef<{ x: number; y: number } | null>(null);

  // Data fetching
  const { data: floorPlanReadings = [] } = useFloorPlanReadings(existingPlan?.id);
  const { data: allJobReadings = [] } = useJobReadingsForLinking(jobId);
  const { data: chambers = [] } = useJobChambers(jobId);
  const { data: tenant } = useTenant();
  const linkMutation = useLinkReadingToMarker();
  const unlinkMutation = useUnlinkReadingFromMarker();
  const createAndLinkMutation = useCreateAndLinkReading();

  // Get unit settings from tenant
  const temperatureUnit = (tenant?.temperature_unit || 'F') as 'F' | 'C';
  const units = (tenant?.humidity_ratio_unit === 'g/kg' ? 'metric' : 'imperial') as 'imperial' | 'metric';

  // Build map of linked readings
  const linkedReadingsMap = new Map<string, MoistureReading>();
  floorPlanReadings.forEach((reading) => {
    if (reading.marker_id) {
      linkedReadingsMap.set(reading.marker_id, reading);
    }
  });

  // Get list of already linked reading IDs
  const linkedReadingIds = floorPlanReadings.map((r) => r.id);

  // Initialize canvas
  useEffect(() => {
    if (!open || !canvasRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight - 48; // Account for toolbar

    const canvas = new FabricCanvas(canvasRef.current, {
      width,
      height,
      backgroundColor: '#ffffff',
      selection: true,
    });

    // Initialize brush for freehand drawing
    canvas.freeDrawingBrush = new PencilBrush(canvas);
    canvas.freeDrawingBrush.color = '#1f2937';
    canvas.freeDrawingBrush.width = 3;

    setFabricCanvas(canvas);

    // Draw initial grid
    if (showGrid) {
      drawGrid(canvas);
    }

    // Load existing plan if editing
    if (existingPlan?.canvas_data) {
      loadFloorPlan(canvas, JSON.stringify(existingPlan.canvas_data)).then(() => {
        // Update marker colors based on linked status
        updateMarkerColors(canvas);
        // Find highest reading number for counter
        const markers = getReadingMarkers(canvas);
        if (markers.length > 0) {
          const maxNumber = Math.max(
            ...markers.map((m) => (m as any).readingNumber || 0)
          );
          setReadingCounter(maxNumber + 1);
        }
        saveToHistory(canvas);
      });
    } else {
      saveToHistory(canvas);
    }

    return () => {
      canvas.dispose();
      setFabricCanvas(null);
    };
  }, [open]);

  // Update marker colors when linked readings change
  const updateMarkerColors = useCallback((canvas: FabricCanvas) => {
    const markers = getReadingMarkers(canvas);
    markers.forEach((marker) => {
      const markerId = (marker as any).markerId;
      const isLinked = linkedReadingsMap.has(markerId);
      updateReadingMarkerStyle(marker, isLinked);
    });
    canvas.renderAll();
  }, [linkedReadingsMap]);

  // Update marker colors when floorPlanReadings changes
  useEffect(() => {
    if (fabricCanvas) {
      updateMarkerColors(fabricCanvas);
    }
  }, [floorPlanReadings, fabricCanvas, updateMarkerColors]);

  // Handle grid toggle
  useEffect(() => {
    if (!fabricCanvas) return;
    
    if (showGrid) {
      drawGrid(fabricCanvas);
    } else {
      clearGrid(fabricCanvas);
    }
    fabricCanvas.renderAll();
  }, [showGrid, fabricCanvas]);

  // Handle tool change
  useEffect(() => {
    if (!fabricCanvas) return;

    const isPenMode = activeTool === 'pen';
    const isSelectMode = activeTool === 'select';
    
    fabricCanvas.isDrawingMode = isPenMode;
    fabricCanvas.selection = isSelectMode;

    // Remove existing event listeners
    fabricCanvas.off('mouse:down');
    fabricCanvas.off('mouse:move');
    fabricCanvas.off('mouse:up');

    if (isSelectMode || isPenMode) {
      return;
    }

    // Add drawing event listeners for shape tools
    fabricCanvas.on('mouse:down', (opt) => {
      const pointer = opt.scenePoint;
      if (!pointer) return;
      isDrawingRef.current = true;
      startPointRef.current = { x: pointer.x, y: pointer.y };
    });

    fabricCanvas.on('mouse:up', (opt) => {
      if (!isDrawingRef.current || !startPointRef.current) return;
      
      const pointer = opt.scenePoint;
      if (!pointer) return;
      const start = startPointRef.current;
      
      handleToolAction(start.x, start.y, pointer.x, pointer.y);
      
      isDrawingRef.current = false;
      startPointRef.current = null;
      saveToHistory(fabricCanvas);
    });
  }, [activeTool, fabricCanvas, selectedEquipment, readingCounter]);

  // Handle reading mode - marker clicks
  useEffect(() => {
    if (!fabricCanvas) return;

    const handleSelection = (opt: { selected?: FabricObject[] }) => {
      if (!readingMode) return;
      
      const selected = opt.selected;
      if (!selected || selected.length !== 1) return;

      const obj = selected[0] as Group;
      // @ts-ignore
      if (obj.objectType === 'reading') {
        const markerId = (obj as any).markerId;
        const readingNumber = (obj as any).readingNumber;
        const linkedReadingId = (obj as any).linkedReadingId;

        setSelectedMarker({
          markerId,
          readingNumber,
          linkedReadingId: linkedReadingsMap.get(markerId)?.id || linkedReadingId,
        });
        
        // Calculate position for popover
        const objCenter = obj.getCenterPoint();
        setPopoverPosition({ x: objCenter.x, y: objCenter.y });
        setPopoverOpen(true);
      }
    };

    fabricCanvas.on('selection:created', handleSelection);
    fabricCanvas.on('selection:updated', handleSelection);

    return () => {
      fabricCanvas.off('selection:created', handleSelection);
      fabricCanvas.off('selection:updated', handleSelection);
    };
  }, [fabricCanvas, readingMode, linkedReadingsMap]);

  const handleToolAction = (startX: number, startY: number, endX: number, endY: number) => {
    if (!fabricCanvas) return;

    const width = Math.abs(endX - startX);
    const height = Math.abs(endY - startY);
    const left = Math.min(startX, endX);
    const top = Math.min(startY, endY);

    switch (activeTool) {
      case 'room':
        createRoom(fabricCanvas, left, top, Math.max(width, 50), Math.max(height, 50));
        break;
      case 'wall':
        createWall(fabricCanvas, startX, startY, endX, endY);
        break;
      case 'door':
        createDoor(fabricCanvas, startX, startY);
        break;
      case 'window':
        createWindow(fabricCanvas, startX, startY);
        break;
      case 'affected':
        createAffectedArea(fabricCanvas, left, top, Math.max(width, 50), Math.max(height, 50));
        break;
      case 'equipment':
        createEquipmentMarker(fabricCanvas, startX, startY, selectedEquipment);
        break;
      case 'reading':
        createReadingMarker(fabricCanvas, startX, startY, readingCounter);
        setReadingCounter((prev) => prev + 1);
        break;
      case 'arrow':
        createArrow(fabricCanvas, startX, startY, endX, endY);
        break;
      case 'label':
        createLabel(fabricCanvas, startX, startY);
        break;
    }
  };

  const saveToHistory = useCallback((canvas: FabricCanvas) => {
    const json = serializeFloorPlan(canvas);
    setHistory((prev) => {
      const newHistory = prev.slice(0, historyIndex + 1);
      return [...newHistory, json];
    });
    setHistoryIndex((prev) => prev + 1);
  }, [historyIndex]);

  const handleUndo = useCallback(() => {
    if (!fabricCanvas || historyIndex <= 0) return;
    
    const newIndex = historyIndex - 1;
    loadFloorPlan(fabricCanvas, history[newIndex]);
    setHistoryIndex(newIndex);
  }, [fabricCanvas, history, historyIndex]);

  const handleRedo = useCallback(() => {
    if (!fabricCanvas || historyIndex >= history.length - 1) return;
    
    const newIndex = historyIndex + 1;
    loadFloorPlan(fabricCanvas, history[newIndex]);
    setHistoryIndex(newIndex);
  }, [fabricCanvas, history, historyIndex]);

  const handleZoomIn = useCallback(() => {
    if (!fabricCanvas) return;
    const zoom = fabricCanvas.getZoom();
    fabricCanvas.setZoom(Math.min(zoom * 1.2, 3));
  }, [fabricCanvas]);

  const handleZoomOut = useCallback(() => {
    if (!fabricCanvas) return;
    const zoom = fabricCanvas.getZoom();
    fabricCanvas.setZoom(Math.max(zoom / 1.2, 0.5));
  }, [fabricCanvas]);

  const handleSave = async () => {
    if (!fabricCanvas) return;
    
    setIsSaving(true);
    try {
      // Clear grid before export
      const gridWasShown = showGrid;
      if (gridWasShown) {
        clearGrid(fabricCanvas);
        fabricCanvas.renderAll();
      }

      const canvasData = JSON.parse(serializeFloorPlan(fabricCanvas));
      const thumbnail = await exportFloorPlanAsImage(fabricCanvas);

      // Restore grid
      if (gridWasShown) {
        drawGrid(fabricCanvas);
        fabricCanvas.renderAll();
      }

      await onSave({
        name: planName,
        floor_number: floorNumber,
        canvas_data: canvasData,
        thumbnail,
      });

      toast.success('Floor plan saved');
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to save floor plan:', error);
      toast.error('Failed to save floor plan');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (!fabricCanvas) return;
    const activeObjects = fabricCanvas.getActiveObjects();
    activeObjects.forEach((obj) => {
      // @ts-ignore
      if (obj.objectType !== 'grid') {
        fabricCanvas.remove(obj);
      }
    });
    fabricCanvas.discardActiveObject();
    fabricCanvas.renderAll();
    saveToHistory(fabricCanvas);
  };

  // Handle linking a reading to a marker
  const handleLinkReading = (readingId: string) => {
    if (!selectedMarker || !existingPlan?.id) return;

    linkMutation.mutate(
      {
        readingId,
        floorPlanId: existingPlan.id,
        markerId: selectedMarker.markerId,
        jobId,
      },
      {
        onSuccess: () => {
          toast.success('Reading linked to marker');
          setPopoverOpen(false);
          setLinkDialogOpen(false);
        },
        onError: () => {
          toast.error('Failed to link reading');
        },
      }
    );
  };

  // Handle unlinking a reading from a marker
  const handleUnlinkReading = () => {
    if (!selectedMarker?.linkedReadingId || !existingPlan?.id) return;

    unlinkMutation.mutate(
      {
        readingId: selectedMarker.linkedReadingId,
        floorPlanId: existingPlan.id,
        jobId,
      },
      {
        onSuccess: () => {
          toast.success('Reading unlinked from marker');
          setPopoverOpen(false);
        },
        onError: () => {
          toast.error('Failed to unlink reading');
        },
      }
    );
  };

  // Keyboard shortcuts
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        handleDelete();
      }
      if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      }
      if (e.key === 'Escape') {
        setActiveTool('select');
        setPopoverOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, handleUndo, handleRedo]);

  const linkedReading = selectedMarker?.markerId
    ? linkedReadingsMap.get(selectedMarker.markerId) || null
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] w-full h-[95vh] p-0 flex flex-col">
        <DialogHeader className="px-4 py-2 border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-4">
              <Input
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                className="w-48 h-8"
              />
              <div className="flex items-center gap-2">
                <Label className="text-sm text-muted-foreground">Floor:</Label>
                <Input
                  type="number"
                  value={floorNumber}
                  onChange={(e) => setFloorNumber(parseInt(e.target.value) || 1)}
                  className="w-16 h-8"
                  min={1}
                />
              </div>
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} disabled={isSaving}>
                <Save className="h-4 w-4 mr-1" />
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div ref={containerRef} className="flex-1 flex flex-col overflow-hidden">
          <FloorPlanToolbar
            activeTool={activeTool}
            onToolChange={setActiveTool}
            onEquipmentSelect={setSelectedEquipment}
            showGrid={showGrid}
            onToggleGrid={() => setShowGrid(!showGrid)}
            canUndo={historyIndex > 0}
            canRedo={historyIndex < history.length - 1}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            readingMode={readingMode}
            onToggleReadingMode={() => setReadingMode(!readingMode)}
            canLinkReadings={!!existingPlan?.id}
          />
          <div className="flex-1 overflow-auto bg-muted relative">
            <canvas ref={canvasRef} className="block" />
            
            {/* Invisible trigger for popover positioning */}
            {popoverOpen && selectedMarker && (
              <ReadingMarkerPopover
                open={popoverOpen}
                onOpenChange={setPopoverOpen}
                markerNumber={selectedMarker.readingNumber}
                linkedReading={linkedReading}
                onLinkClick={() => setLinkDialogOpen(true)}
                onAddNewReading={() => {
                  setPopoverOpen(false);
                  setAddReadingDialogOpen(true);
                }}
                onUnlink={handleUnlinkReading}
                onViewReading={() => {
                  // Navigate to readings tab - for now just close
                  setPopoverOpen(false);
                  toast.info('Navigate to Readings tab to view details');
                }}
              >
                <div
                  className="absolute w-1 h-1"
                  style={{
                    left: popoverPosition.x,
                    top: popoverPosition.y,
                    pointerEvents: 'none',
                  }}
                />
              </ReadingMarkerPopover>
            )}
          </div>
        </div>

        {/* Reading Link Dialog */}
        {selectedMarker && (
          <ReadingLinkDialog
            open={linkDialogOpen}
            onOpenChange={setLinkDialogOpen}
            markerNumber={selectedMarker.readingNumber}
            readings={allJobReadings}
            chambers={chambers}
            linkedReadingIds={linkedReadingIds}
            onLink={handleLinkReading}
          />
        )}

        {/* Add New Reading Dialog */}
        {selectedMarker && existingPlan?.id && (
          <FloorPlanReadingDialog
            open={addReadingDialogOpen}
            onOpenChange={setAddReadingDialogOpen}
            markerNumber={selectedMarker.readingNumber}
            chambers={chambers}
            units={units}
            temperatureUnit={temperatureUnit}
            isLoading={createAndLinkMutation.isPending}
            onSubmit={async (data) => {
              await createAndLinkMutation.mutateAsync({
                ...data,
                jobId,
                floorPlanId: existingPlan.id,
                markerId: selectedMarker.markerId,
              });
              setAddReadingDialogOpen(false);
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

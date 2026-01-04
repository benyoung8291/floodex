import { useEffect, useRef, useState, useCallback } from 'react';
import { Canvas as FabricCanvas, PencilBrush } from 'fabric';
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
} from '@/lib/floorPlanTools';
import { toast } from 'sonner';

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
  
  // Undo/Redo history
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Drawing state
  const isDrawingRef = useRef(false);
  const startPointRef = useRef<{ x: number; y: number } | null>(null);

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
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, handleUndo, handleRedo]);

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
          />
          <div className="flex-1 overflow-auto bg-muted">
            <canvas ref={canvasRef} className="block" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

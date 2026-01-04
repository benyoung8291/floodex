import { useState, useRef, useEffect, useCallback } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Canvas as FabricCanvas, FabricImage } from 'fabric';
import { JobPhoto, getPhotoUrl } from '@/hooks/useJobPhotos';
import { usePhotoAnnotation } from '@/hooks/usePhotoAnnotation';
import { AnnotationToolbar } from './AnnotationToolbar';
import {
  AnnotationTool,
  AnnotationColor,
  ANNOTATION_COLORS,
  StrokeWidth,
  configureTool,
  createRectangle,
  createCircle,
  createLine,
  createArrow,
  createText,
  createMeasurementLine,
} from '@/lib/annotationTools';
import { ArrowLeft, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface PhotoAnnotatorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  photo: JobPhoto;
}

interface HistoryState {
  states: string[];
  currentIndex: number;
}

export const PhotoAnnotator = ({ open, onOpenChange, photo }: PhotoAnnotatorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fabricCanvasRef = useRef<FabricCanvas | null>(null);
  
  const [isReady, setIsReady] = useState(false);
  const [activeTool, setActiveTool] = useState<AnnotationTool>('pen');
  const [activeColor, setActiveColor] = useState<AnnotationColor>('red');
  const [strokeWidth, setStrokeWidth] = useState<StrokeWidth>(4);
  const [history, setHistory] = useState<HistoryState>({ states: [], currentIndex: -1 });
  const [showMeasurementInput, setShowMeasurementInput] = useState(false);
  const [measurementValue, setMeasurementValue] = useState('');
  const [pendingMeasurement, setPendingMeasurement] = useState<{
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  } | null>(null);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const { saveAnnotations, loadAnnotations, isSaving } = usePhotoAnnotation();

  // Initialize canvas
  useEffect(() => {
    if (!open || !canvasRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight - 100; // Account for toolbar

    const canvas = new FabricCanvas(canvasRef.current, {
      width: containerWidth,
      height: containerHeight,
      backgroundColor: '#1a1a1a',
    });

    fabricCanvasRef.current = canvas;

    // Load the photo as background
    const photoUrl = getPhotoUrl(photo.storage_path);
    FabricImage.fromURL(photoUrl, { crossOrigin: 'anonymous' }).then((img) => {
      if (!img || !fabricCanvasRef.current) return;

      // Scale image to fit canvas while maintaining aspect ratio
      const scale = Math.min(
        containerWidth / (img.width || 1),
        containerHeight / (img.height || 1)
      );

      img.scale(scale);
      img.set({
        left: (containerWidth - (img.width || 0) * scale) / 2,
        top: (containerHeight - (img.height || 0) * scale) / 2,
        selectable: false,
        evented: false,
      });

      canvas.backgroundImage = img;
      canvas.renderAll();

      // Load existing annotations if any
      if (photo.annotation_data) {
        loadAnnotations(canvas, photo).then(() => {
          saveHistoryState();
          setIsReady(true);
        });
      } else {
        saveHistoryState();
        setIsReady(true);
      }
    });

    // Track changes
    canvas.on('object:added', () => {
      setHasUnsavedChanges(true);
      saveHistoryState();
    });
    canvas.on('object:modified', () => {
      setHasUnsavedChanges(true);
      saveHistoryState();
    });
    canvas.on('object:removed', () => {
      setHasUnsavedChanges(true);
      saveHistoryState();
    });

    return () => {
      canvas.dispose();
      fabricCanvasRef.current = null;
      setIsReady(false);
    };
  }, [open, photo.storage_path]);

  // Configure tool when it changes
  useEffect(() => {
    if (!fabricCanvasRef.current || !isReady) return;
    
    const color = ANNOTATION_COLORS[activeColor];
    configureTool(fabricCanvasRef.current, activeTool, color, strokeWidth);

    // Set up shape drawing handlers
    if (['rectangle', 'circle', 'line', 'arrow', 'measurement', 'text'].includes(activeTool)) {
      setupShapeDrawing();
    }
  }, [activeTool, activeColor, strokeWidth, isReady]);

  const saveHistoryState = useCallback(() => {
    if (!fabricCanvasRef.current) return;
    
    const json = JSON.stringify(fabricCanvasRef.current.toJSON());
    setHistory((prev) => {
      const newStates = prev.states.slice(0, prev.currentIndex + 1);
      newStates.push(json);
      // Limit history to 50 states
      if (newStates.length > 50) newStates.shift();
      return {
        states: newStates,
        currentIndex: newStates.length - 1,
      };
    });
  }, []);

  const setupShapeDrawing = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    let isDrawing = false;
    let startX = 0;
    let startY = 0;
    let tempShape: any = null;

    const color = ANNOTATION_COLORS[activeColor];

    canvas.off('mouse:down');
    canvas.off('mouse:move');
    canvas.off('mouse:up');

    canvas.on('mouse:down', (e) => {
      const pointer = e.scenePoint;
      if (!pointer) return;
      isDrawing = true;
      startX = pointer.x;
      startY = pointer.y;

      if (activeTool === 'text') {
        const text = createText(startX, startY, 'Text', color, 20);
        canvas.add(text);
        canvas.setActiveObject(text);
        text.enterEditing();
        isDrawing = false;
      }
    });

    canvas.on('mouse:move', (e) => {
      const pointer = e.scenePoint;
      if (!isDrawing || !pointer) return;

      const currentX = pointer.x;
      const currentY = pointer.y;

      // Remove temp shape
      if (tempShape) {
        canvas.remove(tempShape);
      }

      switch (activeTool) {
        case 'rectangle':
          tempShape = createRectangle(
            Math.min(startX, currentX),
            Math.min(startY, currentY),
            Math.abs(currentX - startX),
            Math.abs(currentY - startY),
            color,
            strokeWidth
          );
          break;
        case 'circle':
          const radius = Math.sqrt(
            Math.pow(currentX - startX, 2) + Math.pow(currentY - startY, 2)
          ) / 2;
          tempShape = createCircle(
            (startX + currentX) / 2 - radius,
            (startY + currentY) / 2 - radius,
            radius,
            color,
            strokeWidth
          );
          break;
        case 'line':
          tempShape = createLine([startX, startY, currentX, currentY], color, strokeWidth);
          break;
        case 'arrow':
          tempShape = createArrow(startX, startY, currentX, currentY, color, strokeWidth);
          break;
        case 'measurement':
          tempShape = createLine([startX, startY, currentX, currentY], color, strokeWidth);
          break;
      }

      if (tempShape) {
        canvas.add(tempShape);
        canvas.renderAll();
      }
    });

    canvas.on('mouse:up', (e) => {
      if (!isDrawing) return;
      isDrawing = false;

      const pointer = e.scenePoint;
      if (activeTool === 'measurement' && tempShape && pointer) {
        // Remove temp line and show input
        canvas.remove(tempShape);
        setPendingMeasurement({
          x1: startX,
          y1: startY,
          x2: pointer.x,
          y2: pointer.y,
        });
        setShowMeasurementInput(true);
      }

      tempShape = null;
    });
  }, [activeTool, activeColor, strokeWidth]);

  const handleAddMeasurement = () => {
    if (!fabricCanvasRef.current || !pendingMeasurement || !measurementValue) return;

    const color = ANNOTATION_COLORS[activeColor];
    const measurement = createMeasurementLine(
      pendingMeasurement.x1,
      pendingMeasurement.y1,
      pendingMeasurement.x2,
      pendingMeasurement.y2,
      measurementValue,
      color,
      strokeWidth
    );

    fabricCanvasRef.current.add(measurement);
    fabricCanvasRef.current.renderAll();

    setShowMeasurementInput(false);
    setMeasurementValue('');
    setPendingMeasurement(null);
  };

  const handleUndo = () => {
    if (history.currentIndex <= 0 || !fabricCanvasRef.current) return;
    
    const newIndex = history.currentIndex - 1;
    fabricCanvasRef.current.loadFromJSON(JSON.parse(history.states[newIndex]), () => {
      fabricCanvasRef.current?.renderAll();
      setHistory((prev) => ({ ...prev, currentIndex: newIndex }));
    });
  };

  const handleRedo = () => {
    if (history.currentIndex >= history.states.length - 1 || !fabricCanvasRef.current) return;
    
    const newIndex = history.currentIndex + 1;
    fabricCanvasRef.current.loadFromJSON(JSON.parse(history.states[newIndex]), () => {
      fabricCanvasRef.current?.renderAll();
      setHistory((prev) => ({ ...prev, currentIndex: newIndex }));
    });
  };

  const handleClear = () => {
    if (!fabricCanvasRef.current) return;
    
    const objects = fabricCanvasRef.current.getObjects();
    objects.forEach((obj) => fabricCanvasRef.current?.remove(obj));
    fabricCanvasRef.current.renderAll();
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    if (!fabricCanvasRef.current) return;
    
    await saveAnnotations(photo.id, fabricCanvasRef.current);
    setHasUnsavedChanges(false);
    toast.success('Annotations saved');
  };

  const handleClose = () => {
    if (hasUnsavedChanges) {
      setShowCloseConfirm(true);
    } else {
      onOpenChange(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={handleClose}>
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <h2 className="font-semibold">Annotate Photo</h2>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={handleSave} disabled={isSaving}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
                <Button variant="ghost" size="icon" onClick={handleClose}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Canvas container */}
            <div ref={containerRef} className="flex-1 relative bg-muted overflow-hidden">
              <canvas ref={canvasRef} className="absolute inset-0" />
            </div>

            {/* Toolbar */}
            <div className="p-4 border-t flex justify-center">
              <AnnotationToolbar
                activeTool={activeTool}
                onToolChange={setActiveTool}
                activeColor={activeColor}
                onColorChange={setActiveColor}
                strokeWidth={strokeWidth}
                onStrokeWidthChange={setStrokeWidth}
                onUndo={handleUndo}
                onRedo={handleRedo}
                onClear={handleClear}
                canUndo={history.currentIndex > 0}
                canRedo={history.currentIndex < history.states.length - 1}
              />
            </div>
          </div>

          {/* Measurement input modal */}
          {showMeasurementInput && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="bg-background p-4 rounded-lg shadow-lg space-y-4 w-64">
                <h3 className="font-semibold">Enter Measurement</h3>
                <Input
                  value={measurementValue}
                  onChange={(e) => setMeasurementValue(e.target.value)}
                  placeholder="e.g., 12 ft, 3.5m"
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowMeasurementInput(false);
                      setPendingMeasurement(null);
                      setMeasurementValue('');
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAddMeasurement} className="flex-1">
                    Add
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Unsaved changes confirmation */}
      <AlertDialog open={showCloseConfirm} onOpenChange={setShowCloseConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved annotations. Are you sure you want to close without saving?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Editing</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowCloseConfirm(false);
                onOpenChange(false);
              }}
            >
              Discard Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

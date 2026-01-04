import { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Undo2, Trash2, Check } from 'lucide-react';

interface SignatureCaptureProps {
  onCapture: (signatureBlob: Blob) => void;
  onClear?: () => void;
  width?: number;
  height?: number;
  penColor?: string;
  backgroundColor?: string;
  className?: string;
}

interface Point {
  x: number;
  y: number;
  pressure?: number;
}

interface Stroke {
  points: Point[];
}

export function SignatureCapture({
  onCapture,
  onClear,
  width = 400,
  height = 200,
  penColor = '#1a1a1a',
  backgroundColor = '#ffffff',
  className = '',
}: SignatureCaptureProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Point[]>([]);
  const [isEmpty, setIsEmpty] = useState(true);

  // Set up canvas with high DPI
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    redrawCanvas();
  }, [width, height]);

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);

    // Draw signature line
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(20, height - 40);
    ctx.lineTo(width - 20, height - 40);
    ctx.stroke();

    // Draw "Sign here" text if empty
    if (strokes.length === 0 && currentStroke.length === 0) {
      ctx.fillStyle = '#9ca3af';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Sign here', width / 2, height - 20);
    }

    // Draw all strokes
    ctx.strokeStyle = penColor;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    [...strokes, { points: currentStroke }].forEach((stroke) => {
      if (stroke.points.length < 2) return;

      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);

      for (let i = 1; i < stroke.points.length; i++) {
        const point = stroke.points[i];
        const pressure = point.pressure || 0.5;
        ctx.lineWidth = 1 + pressure * 3;
        ctx.lineTo(point.x, point.y);
      }
      ctx.stroke();
    });
  }, [strokes, currentStroke, width, height, penColor, backgroundColor]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  const getCoordinates = (
    e: React.TouchEvent | React.MouseEvent | TouchEvent | MouseEvent
  ): Point | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    
    if ('touches' in e) {
      if (e.touches.length === 0) return null;
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
        pressure: (touch as any).force || 0.5,
      };
    } else {
      return {
        x: (e as MouseEvent).clientX - rect.left,
        y: (e as MouseEvent).clientY - rect.top,
        pressure: 0.5,
      };
    }
  };

  const startDrawing = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    const point = getCoordinates(e);
    if (!point) return;

    setIsDrawing(true);
    setCurrentStroke([point]);
    setIsEmpty(false);
  };

  const draw = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    if (!isDrawing) return;

    const point = getCoordinates(e);
    if (!point) return;

    setCurrentStroke((prev) => [...prev, point]);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;

    if (currentStroke.length > 0) {
      setStrokes((prev) => [...prev, { points: currentStroke }]);
    }
    setCurrentStroke([]);
    setIsDrawing(false);
  };

  const handleUndo = () => {
    if (strokes.length === 0) return;
    setStrokes((prev) => prev.slice(0, -1));
    if (strokes.length === 1) {
      setIsEmpty(true);
    }
  };

  const handleClear = () => {
    setStrokes([]);
    setCurrentStroke([]);
    setIsEmpty(true);
    onClear?.();
  };

  const handleConfirm = () => {
    const canvas = canvasRef.current;
    if (!canvas || isEmpty) return;

    // Create a clean export canvas without the guide line
    const exportCanvas = document.createElement('canvas');
    const dpr = window.devicePixelRatio || 1;
    exportCanvas.width = width * dpr;
    exportCanvas.height = height * dpr;
    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return;

    ctx.scale(dpr, dpr);
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);

    // Draw strokes
    ctx.strokeStyle = penColor;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    strokes.forEach((stroke) => {
      if (stroke.points.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        const point = stroke.points[i];
        const pressure = point.pressure || 0.5;
        ctx.lineWidth = 1 + pressure * 3;
        ctx.lineTo(point.x, point.y);
      }
      ctx.stroke();
    });

    exportCanvas.toBlob((blob) => {
      if (blob) {
        onCapture(blob);
      }
    }, 'image/png');
  };

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <div className="relative border-2 border-dashed border-border rounded-lg overflow-hidden bg-background">
        <canvas
          ref={canvasRef}
          className="touch-none cursor-crosshair"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleUndo}
          disabled={strokes.length === 0}
        >
          <Undo2 className="h-4 w-4 mr-1" />
          Undo
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleClear}
          disabled={isEmpty}
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Clear
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={handleConfirm}
          disabled={isEmpty}
          className="ml-auto"
        >
          <Check className="h-4 w-4 mr-1" />
          Confirm Signature
        </Button>
      </div>
    </div>
  );
}

import { Canvas as FabricCanvas, PencilBrush, Rect, Circle, Line, IText, FabricObject, Group, Triangle, Point } from 'fabric';

export type AnnotationTool = 
  | 'select' 
  | 'pen' 
  | 'rectangle' 
  | 'circle' 
  | 'arrow' 
  | 'line' 
  | 'measurement' 
  | 'text' 
  | 'eraser';

export type AnnotationColor = 'red' | 'yellow' | 'blue' | 'green' | 'black' | 'white';

export const ANNOTATION_COLORS: Record<AnnotationColor, string> = {
  red: '#ef4444',
  yellow: '#eab308',
  blue: '#3b82f6',
  green: '#22c55e',
  black: '#000000',
  white: '#ffffff',
};

export const STROKE_WIDTHS = [2, 4, 6, 8] as const;
export type StrokeWidth = typeof STROKE_WIDTHS[number];

/**
 * Configure the canvas for a specific tool
 */
export const configureTool = (
  canvas: FabricCanvas,
  tool: AnnotationTool,
  color: string,
  strokeWidth: number
): void => {
  // Reset canvas state
  canvas.isDrawingMode = false;
  canvas.selection = true;
  
  // Remove all event listeners for custom drawing
  canvas.off('mouse:down');
  canvas.off('mouse:move');
  canvas.off('mouse:up');
  
  switch (tool) {
    case 'select':
      canvas.selection = true;
      break;
      
    case 'pen':
      canvas.isDrawingMode = true;
      if (canvas.freeDrawingBrush) {
        canvas.freeDrawingBrush.color = color;
        canvas.freeDrawingBrush.width = strokeWidth;
      } else {
        canvas.freeDrawingBrush = new PencilBrush(canvas);
        canvas.freeDrawingBrush.color = color;
        canvas.freeDrawingBrush.width = strokeWidth;
      }
      break;
      
    case 'eraser':
      canvas.selection = true;
      // Eraser mode: clicking on an object deletes it
      canvas.on('mouse:down', (e) => {
        if (e.target) {
          canvas.remove(e.target);
          canvas.renderAll();
        }
      });
      break;
      
    default:
      canvas.selection = false;
      break;
  }
};

/**
 * Create a rectangle shape
 */
export const createRectangle = (
  left: number,
  top: number,
  width: number,
  height: number,
  color: string,
  strokeWidth: number
): Rect => {
  return new Rect({
    left,
    top,
    width,
    height,
    fill: 'transparent',
    stroke: color,
    strokeWidth,
    strokeUniform: true,
  });
};

/**
 * Create a circle shape
 */
export const createCircle = (
  left: number,
  top: number,
  radius: number,
  color: string,
  strokeWidth: number
): Circle => {
  return new Circle({
    left,
    top,
    radius,
    fill: 'transparent',
    stroke: color,
    strokeWidth,
    strokeUniform: true,
  });
};

/**
 * Create a line
 */
export const createLine = (
  points: [number, number, number, number],
  color: string,
  strokeWidth: number
): Line => {
  return new Line(points, {
    stroke: color,
    strokeWidth,
    strokeUniform: true,
  });
};

/**
 * Create an arrow (line with arrowhead)
 */
export const createArrow = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
  strokeWidth: number
): Group => {
  const line = new Line([x1, y1, x2, y2], {
    stroke: color,
    strokeWidth,
    strokeUniform: true,
  });
  
  // Calculate arrow head
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const headLength = strokeWidth * 4;
  
  const triangle = new Triangle({
    left: x2,
    top: y2,
    width: headLength,
    height: headLength,
    fill: color,
    angle: (angle * 180 / Math.PI) + 90,
    originX: 'center',
    originY: 'center',
  });
  
  return new Group([line, triangle], {
    selectable: true,
  });
};

/**
 * Create a text label
 */
export const createText = (
  left: number,
  top: number,
  text: string,
  color: string,
  fontSize: number = 20
): IText => {
  return new IText(text, {
    left,
    top,
    fill: color,
    fontSize,
    fontFamily: 'Arial',
    backgroundColor: 'rgba(255,255,255,0.7)',
    padding: 4,
  });
};

/**
 * Create a measurement line with label
 */
export const createMeasurementLine = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  measurementText: string,
  color: string,
  strokeWidth: number
): Group => {
  const line = new Line([x1, y1, x2, y2], {
    stroke: color,
    strokeWidth,
    strokeUniform: true,
  });
  
  // End caps (small perpendicular lines)
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const perpAngle = angle + Math.PI / 2;
  const capLength = 10;
  
  const cap1 = new Line([
    x1 + Math.cos(perpAngle) * capLength,
    y1 + Math.sin(perpAngle) * capLength,
    x1 - Math.cos(perpAngle) * capLength,
    y1 - Math.sin(perpAngle) * capLength,
  ], {
    stroke: color,
    strokeWidth: strokeWidth / 2,
  });
  
  const cap2 = new Line([
    x2 + Math.cos(perpAngle) * capLength,
    y2 + Math.sin(perpAngle) * capLength,
    x2 - Math.cos(perpAngle) * capLength,
    y2 - Math.sin(perpAngle) * capLength,
  ], {
    stroke: color,
    strokeWidth: strokeWidth / 2,
  });
  
  // Measurement label at center
  const centerX = (x1 + x2) / 2;
  const centerY = (y1 + y2) / 2;
  
  const label = new IText(measurementText, {
    left: centerX,
    top: centerY - 15,
    fill: color,
    fontSize: 16,
    fontFamily: 'Arial',
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 4,
    originX: 'center',
    originY: 'bottom',
  });
  
  return new Group([line, cap1, cap2, label], {
    selectable: true,
  });
};

/**
 * Serialize canvas to JSON for storage
 */
export const serializeAnnotations = (canvas: FabricCanvas): string => {
  return JSON.stringify(canvas.toJSON());
};

/**
 * Load annotations from JSON
 */
export const loadAnnotations = async (
  canvas: FabricCanvas,
  json: string
): Promise<void> => {
  return new Promise((resolve) => {
    canvas.loadFromJSON(JSON.parse(json), () => {
      canvas.renderAll();
      resolve();
    });
  });
};

/**
 * Export canvas as image blob (photo + annotations merged)
 */
export const exportCanvasAsImage = (canvas: FabricCanvas): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const dataUrl = canvas.toDataURL({
      format: 'jpeg',
      quality: 0.9,
      multiplier: 1,
    });
    
    // Convert data URL to blob
    fetch(dataUrl)
      .then(res => res.blob())
      .then(resolve)
      .catch(reject);
  });
};

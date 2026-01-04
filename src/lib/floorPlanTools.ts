import { Canvas as FabricCanvas, Rect, Circle, Line, IText, Group, Path, Polygon } from 'fabric';

export type FloorPlanTool = 
  | 'select'
  | 'pan'
  | 'room'
  | 'wall'
  | 'door'
  | 'window'
  | 'affected'
  | 'equipment'
  | 'reading'
  | 'arrow'
  | 'label'
  | 'pen';

export interface EquipmentType {
  id: string;
  name: string;
  abbreviation: string;
  color: string;
}

export const EQUIPMENT_TYPES: EquipmentType[] = [
  { id: 'dehu', name: 'Dehumidifier', abbreviation: 'DH', color: '#3b82f6' },
  { id: 'air_mover', name: 'Air Mover', abbreviation: 'AM', color: '#22c55e' },
  { id: 'lgr', name: 'LGR Dehumidifier', abbreviation: 'LGR', color: '#8b5cf6' },
  { id: 'desiccant', name: 'Desiccant', abbreviation: 'DES', color: '#f59e0b' },
  { id: 'hepa', name: 'HEPA Filter', abbreviation: 'HEPA', color: '#ef4444' },
  { id: 'injectidry', name: 'Injectidry', abbreviation: 'INJ', color: '#06b6d4' },
];

export const ROOM_COLORS = {
  default: '#e5e7eb',
  kitchen: '#fef3c7',
  bathroom: '#dbeafe',
  bedroom: '#fce7f3',
  living: '#dcfce7',
  office: '#f3e8ff',
  garage: '#d1d5db',
  laundry: '#cffafe',
};

export const AFFECTED_PATTERNS = {
  water: 'rgba(59, 130, 246, 0.3)',
  mold: 'rgba(34, 197, 94, 0.3)',
  fire: 'rgba(239, 68, 68, 0.3)',
};

/**
 * Create a room rectangle with label
 */
export const createRoom = (
  canvas: FabricCanvas,
  left: number,
  top: number,
  width: number = 150,
  height: number = 100,
  roomName: string = 'Room',
  color: string = ROOM_COLORS.default
): Group => {
  const rect = new Rect({
    width,
    height,
    fill: color,
    stroke: '#374151',
    strokeWidth: 2,
    rx: 4,
    ry: 4,
  });

  const label = new IText(roomName, {
    fontSize: 14,
    fontFamily: 'Inter, sans-serif',
    fill: '#1f2937',
    originX: 'center',
    originY: 'center',
    left: width / 2,
    top: height / 2,
  });

  const group = new Group([rect, label], {
    left,
    top,
    subTargetCheck: true,
  });

  // @ts-ignore - custom property
  group.objectType = 'room';
  // @ts-ignore
  group.roomName = roomName;

  canvas.add(group);
  canvas.setActiveObject(group);
  return group;
};

/**
 * Create a wall line
 */
export const createWall = (
  canvas: FabricCanvas,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  strokeWidth: number = 8
): Line => {
  const wall = new Line([x1, y1, x2, y2], {
    stroke: '#1f2937',
    strokeWidth,
    strokeLineCap: 'round',
    selectable: true,
  });

  // @ts-ignore
  wall.objectType = 'wall';

  canvas.add(wall);
  canvas.setActiveObject(wall);
  return wall;
};

/**
 * Create a door symbol
 */
export const createDoor = (
  canvas: FabricCanvas,
  left: number,
  top: number,
  width: number = 40
): Group => {
  // Door frame line
  const frame = new Line([0, 0, width, 0], {
    stroke: '#fff',
    strokeWidth: 10,
    strokeLineCap: 'butt',
  });

  // Door swing arc
  const arcPath = `M 0 0 A ${width} ${width} 0 0 1 ${width} ${-width}`;
  const arc = new Path(arcPath, {
    stroke: '#6b7280',
    strokeWidth: 2,
    fill: 'transparent',
    strokeDashArray: [5, 5],
  });

  // Door panel
  const panel = new Line([0, 0, width, -width], {
    stroke: '#374151',
    strokeWidth: 3,
  });

  const group = new Group([frame, arc, panel], {
    left,
    top,
    angle: 0,
  });

  // @ts-ignore
  group.objectType = 'door';

  canvas.add(group);
  canvas.setActiveObject(group);
  return group;
};

/**
 * Create a window symbol
 */
export const createWindow = (
  canvas: FabricCanvas,
  left: number,
  top: number,
  width: number = 60
): Group => {
  const line1 = new Line([0, 0, width, 0], {
    stroke: '#60a5fa',
    strokeWidth: 8,
  });

  const line2 = new Line([width / 3, -4, width / 3, 4], {
    stroke: '#1f2937',
    strokeWidth: 1,
  });

  const line3 = new Line([(width * 2) / 3, -4, (width * 2) / 3, 4], {
    stroke: '#1f2937',
    strokeWidth: 1,
  });

  const group = new Group([line1, line2, line3], {
    left,
    top,
  });

  // @ts-ignore
  group.objectType = 'window';

  canvas.add(group);
  canvas.setActiveObject(group);
  return group;
};

/**
 * Create an affected area overlay
 */
export const createAffectedArea = (
  canvas: FabricCanvas,
  left: number,
  top: number,
  width: number = 100,
  height: number = 80,
  damageType: keyof typeof AFFECTED_PATTERNS = 'water'
): Rect => {
  const area = new Rect({
    left,
    top,
    width,
    height,
    fill: AFFECTED_PATTERNS[damageType],
    stroke: '#3b82f6',
    strokeWidth: 2,
    strokeDashArray: [8, 4],
    rx: 4,
    ry: 4,
  });

  // @ts-ignore
  area.objectType = 'affected';
  // @ts-ignore
  area.damageType = damageType;

  canvas.add(area);
  canvas.setActiveObject(area);
  return area;
};

/**
 * Create an equipment marker
 */
export const createEquipmentMarker = (
  canvas: FabricCanvas,
  left: number,
  top: number,
  equipment: EquipmentType
): Group => {
  const circle = new Circle({
    radius: 20,
    fill: equipment.color,
    stroke: '#fff',
    strokeWidth: 2,
  });

  const label = new IText(equipment.abbreviation, {
    fontSize: 10,
    fontFamily: 'Inter, sans-serif',
    fontWeight: 'bold',
    fill: '#fff',
    originX: 'center',
    originY: 'center',
    left: 0,
    top: 0,
  });

  const group = new Group([circle, label], {
    left,
    top,
    originX: 'center',
    originY: 'center',
  });

  // @ts-ignore
  group.objectType = 'equipment';
  // @ts-ignore
  group.equipmentType = equipment.id;

  canvas.add(group);
  canvas.setActiveObject(group);
  return group;
};

/**
 * Create a moisture reading marker with unique ID for linking
 */
export const createReadingMarker = (
  canvas: FabricCanvas,
  left: number,
  top: number,
  readingNumber: number,
  markerId?: string,
  linkedReadingId?: string | null
): Group => {
  const id = markerId || crypto.randomUUID();
  
  const diamond = new Polygon(
    [
      { x: 0, y: -18 },
      { x: 15, y: 0 },
      { x: 0, y: 18 },
      { x: -15, y: 0 },
    ],
    {
      fill: linkedReadingId ? '#22c55e' : '#f59e0b', // Green if linked, amber if not
      stroke: '#fff',
      strokeWidth: 2,
    }
  );

  const label = new IText(readingNumber.toString(), {
    fontSize: 12,
    fontFamily: 'Inter, sans-serif',
    fontWeight: 'bold',
    fill: '#fff',
    originX: 'center',
    originY: 'center',
    left: 0,
    top: 0,
  });

  const group = new Group([diamond, label], {
    left,
    top,
    originX: 'center',
    originY: 'center',
  });

  // @ts-ignore - custom properties for linking
  group.objectType = 'reading';
  // @ts-ignore
  group.readingNumber = readingNumber;
  // @ts-ignore
  group.markerId = id;
  // @ts-ignore
  group.linkedReadingId = linkedReadingId || null;

  canvas.add(group);
  canvas.setActiveObject(group);
  return group;
};

/**
 * Update reading marker visual state based on link status
 */
export const updateReadingMarkerStyle = (
  marker: Group,
  isLinked: boolean
): void => {
  const diamond = marker.getObjects()[0] as Polygon;
  if (diamond) {
    diamond.set('fill', isLinked ? '#22c55e' : '#f59e0b');
  }
};

/**
 * Get all reading markers from canvas
 */
export const getReadingMarkers = (canvas: FabricCanvas): Group[] => {
  return canvas.getObjects().filter((obj) => {
    // @ts-ignore
    return obj.objectType === 'reading';
  }) as Group[];
};

/**
 * Find reading marker by markerId
 */
export const findMarkerById = (canvas: FabricCanvas, markerId: string): Group | null => {
  const markers = getReadingMarkers(canvas);
  return markers.find((m) => {
    // @ts-ignore
    return m.markerId === markerId;
  }) || null;
};

/**
 * Create an arrow
 */
export const createArrow = (
  canvas: FabricCanvas,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number
): Group => {
  const angle = Math.atan2(toY - fromY, toX - fromX);
  const headLength = 15;

  const line = new Line([fromX, fromY, toX, toY], {
    stroke: '#3b82f6',
    strokeWidth: 3,
  });

  const head = new Polygon(
    [
      { x: 0, y: 0 },
      { x: -headLength, y: -headLength / 2 },
      { x: -headLength, y: headLength / 2 },
    ],
    {
      fill: '#3b82f6',
      left: toX,
      top: toY,
      angle: (angle * 180) / Math.PI,
      originX: 'center',
      originY: 'center',
    }
  );

  const group = new Group([line, head], {
    left: Math.min(fromX, toX),
    top: Math.min(fromY, toY),
  });

  // @ts-ignore
  group.objectType = 'arrow';

  canvas.add(group);
  canvas.setActiveObject(group);
  return group;
};

/**
 * Create a text label
 */
export const createLabel = (
  canvas: FabricCanvas,
  left: number,
  top: number,
  text: string = 'Label'
): IText => {
  const label = new IText(text, {
    left,
    top,
    fontSize: 16,
    fontFamily: 'Inter, sans-serif',
    fill: '#1f2937',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 4,
  });

  // @ts-ignore
  label.objectType = 'label';

  canvas.add(label);
  canvas.setActiveObject(label);
  label.enterEditing();
  return label;
};

/**
 * Draw grid on canvas
 */
export const drawGrid = (
  canvas: FabricCanvas,
  gridSize: number = 20
): void => {
  const width = canvas.getWidth();
  const height = canvas.getHeight();

  for (let i = 0; i < width / gridSize; i++) {
    const line = new Line([i * gridSize, 0, i * gridSize, height], {
      stroke: '#e5e7eb',
      strokeWidth: 1,
      selectable: false,
      evented: false,
    });
    // @ts-ignore
    line.objectType = 'grid';
    canvas.add(line);
    canvas.sendObjectToBack(line);
  }

  for (let i = 0; i < height / gridSize; i++) {
    const line = new Line([0, i * gridSize, width, i * gridSize], {
      stroke: '#e5e7eb',
      strokeWidth: 1,
      selectable: false,
      evented: false,
    });
    // @ts-ignore
    line.objectType = 'grid';
    canvas.add(line);
    canvas.sendObjectToBack(line);
  }
};

/**
 * Clear grid from canvas
 */
export const clearGrid = (canvas: FabricCanvas): void => {
  const objects = canvas.getObjects();
  const gridObjects = objects.filter((obj) => {
    // @ts-ignore
    return obj.objectType === 'grid';
  });
  gridObjects.forEach((obj) => canvas.remove(obj));
};

/**
 * Serialize canvas to JSON
 */
export const serializeFloorPlan = (canvas: FabricCanvas): string => {
  return JSON.stringify(canvas.toJSON());
};

/**
 * Load floor plan from JSON
 */
export const loadFloorPlan = async (
  canvas: FabricCanvas,
  json: string
): Promise<void> => {
  return new Promise((resolve) => {
    canvas.loadFromJSON(JSON.parse(json)).then(() => {
      canvas.renderAll();
      resolve();
    });
  });
};

/**
 * Export canvas as PNG blob
 */
export const exportFloorPlanAsImage = (canvas: FabricCanvas): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const dataUrl = canvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 2,
    });
    
    fetch(dataUrl)
      .then(res => res.blob())
      .then(resolve)
      .catch(reject);
  });
};

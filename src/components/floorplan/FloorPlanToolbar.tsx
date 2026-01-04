import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MousePointer2,
  Square,
  Minus,
  DoorOpen,
  Grid3X3,
  Droplets,
  Thermometer,
  ArrowRight,
  Type,
  Pencil,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Wrench,
  ChevronDown,
} from 'lucide-react';
import { FloorPlanTool, EQUIPMENT_TYPES, EquipmentType } from '@/lib/floorPlanTools';

interface FloorPlanToolbarProps {
  activeTool: FloorPlanTool;
  onToolChange: (tool: FloorPlanTool) => void;
  onEquipmentSelect: (equipment: EquipmentType) => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

const tools: { id: FloorPlanTool; icon: React.ReactNode; label: string }[] = [
  { id: 'select', icon: <MousePointer2 className="h-4 w-4" />, label: 'Select' },
  { id: 'room', icon: <Square className="h-4 w-4" />, label: 'Room' },
  { id: 'wall', icon: <Minus className="h-4 w-4 rotate-90" />, label: 'Wall' },
  { id: 'door', icon: <DoorOpen className="h-4 w-4" />, label: 'Door' },
  { id: 'window', icon: <Grid3X3 className="h-4 w-4" />, label: 'Window' },
  { id: 'affected', icon: <Droplets className="h-4 w-4" />, label: 'Affected Area' },
  { id: 'reading', icon: <Thermometer className="h-4 w-4" />, label: 'Reading Marker' },
  { id: 'arrow', icon: <ArrowRight className="h-4 w-4" />, label: 'Arrow' },
  { id: 'label', icon: <Type className="h-4 w-4" />, label: 'Text Label' },
  { id: 'pen', icon: <Pencil className="h-4 w-4" />, label: 'Freehand Draw' },
];

export const FloorPlanToolbar = ({
  activeTool,
  onToolChange,
  onEquipmentSelect,
  showGrid,
  onToggleGrid,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onZoomIn,
  onZoomOut,
}: FloorPlanToolbarProps) => {
  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex flex-wrap items-center gap-1 p-2 bg-background border-b">
        {/* Main tools */}
        <div className="flex items-center gap-1 mr-2">
          {tools.map((tool) => (
            <Tooltip key={tool.id}>
              <TooltipTrigger asChild>
                <Button
                  variant={activeTool === tool.id ? 'default' : 'ghost'}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onToolChange(tool.id)}
                >
                  {tool.icon}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>{tool.label}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-border mx-1" />

        {/* Equipment dropdown */}
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  variant={activeTool === 'equipment' ? 'default' : 'ghost'}
                  size="sm"
                  className="h-8 gap-1"
                >
                  <Wrench className="h-4 w-4" />
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Equipment</p>
            </TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="start">
            {EQUIPMENT_TYPES.map((eq) => (
              <DropdownMenuItem
                key={eq.id}
                onClick={() => {
                  onToolChange('equipment');
                  onEquipmentSelect(eq);
                }}
              >
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: eq.color }}
                />
                {eq.name} ({eq.abbreviation})
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Divider */}
        <div className="w-px h-6 bg-border mx-1" />

        {/* Grid toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={showGrid ? 'default' : 'ghost'}
              size="icon"
              className="h-8 w-8"
              onClick={onToggleGrid}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Toggle Grid</p>
          </TooltipContent>
        </Tooltip>

        {/* Divider */}
        <div className="w-px h-6 bg-border mx-1" />

        {/* Zoom controls */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onZoomOut}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Zoom Out</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onZoomIn}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Zoom In</p>
          </TooltipContent>
        </Tooltip>

        {/* Divider */}
        <div className="w-px h-6 bg-border mx-1" />

        {/* Undo/Redo */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onUndo}
              disabled={!canUndo}
            >
              <Undo2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Undo</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onRedo}
              disabled={!canRedo}
            >
              <Redo2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Redo</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
};

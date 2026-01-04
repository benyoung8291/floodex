import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CalendarIcon, Plus, X, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { WorkLog } from '@/hooks/useWorkLogs';

interface WorkLogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    attendanceDate: Date;
    logType: string;
    summary?: string;
    workCompleted?: string[];
    equipmentNotes?: string;
  }) => void;
  editingLog?: WorkLog | null;
  isLoading?: boolean;
}

const logTypeOptions = [
  { value: 'initial', label: 'Initial Assessment' },
  { value: 'attendance', label: 'Site Attendance' },
  { value: 'followup', label: 'Follow-up' },
  { value: 'final', label: 'Final Inspection' },
];

export function WorkLogDialog({
  open,
  onOpenChange,
  onSubmit,
  editingLog,
  isLoading,
}: WorkLogDialogProps) {
  const [attendanceDate, setAttendanceDate] = useState<Date>(new Date());
  const [logType, setLogType] = useState('attendance');
  const [summary, setSummary] = useState('');
  const [workItems, setWorkItems] = useState<string[]>([]);
  const [newWorkItem, setNewWorkItem] = useState('');
  const [equipmentNotes, setEquipmentNotes] = useState('');

  useEffect(() => {
    if (editingLog) {
      setAttendanceDate(new Date(editingLog.attendance_date));
      setLogType(editingLog.log_type);
      setSummary(editingLog.summary || '');
      setWorkItems(editingLog.work_completed || []);
      setEquipmentNotes(editingLog.equipment_notes || '');
    } else {
      setAttendanceDate(new Date());
      setLogType('attendance');
      setSummary('');
      setWorkItems([]);
      setEquipmentNotes('');
    }
  }, [editingLog, open]);

  const handleAddWorkItem = () => {
    if (newWorkItem.trim()) {
      setWorkItems([...workItems, newWorkItem.trim()]);
      setNewWorkItem('');
    }
  };

  const handleRemoveWorkItem = (index: number) => {
    setWorkItems(workItems.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    onSubmit({
      attendanceDate,
      logType,
      summary: summary || undefined,
      workCompleted: workItems.length > 0 ? workItems : undefined,
      equipmentNotes: equipmentNotes || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingLog ? 'Edit Work Log' : 'Add Work Log'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !attendanceDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {attendanceDate ? format(attendanceDate, 'MMM d, yyyy') : 'Select'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={attendanceDate}
                    onSelect={(date) => date && setAttendanceDate(date)}
                    disabled={(date) => date > new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={logType} onValueChange={setLogType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {logTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Summary</Label>
            <Textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Brief summary of the visit..."
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label>Work Completed</Label>
            <div className="flex gap-2">
              <Input
                value={newWorkItem}
                onChange={(e) => setNewWorkItem(e.target.value)}
                placeholder="Add work item..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddWorkItem();
                  }
                }}
              />
              <Button type="button" variant="outline" size="icon" onClick={handleAddWorkItem}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {workItems.length > 0 && (
              <ul className="space-y-1 mt-2">
                {workItems.map((item, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between gap-2 p-2 rounded bg-muted/50 text-sm"
                  >
                    <span>{item}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleRemoveWorkItem(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="space-y-2">
            <Label>Equipment Notes</Label>
            <Textarea
              value={equipmentNotes}
              onChange={(e) => setEquipmentNotes(e.target.value)}
              placeholder="Equipment installed or adjusted..."
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {editingLog ? 'Update' : 'Add'} Log
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

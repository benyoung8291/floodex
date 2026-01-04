import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Copy, 
  Link2, 
  Eye, 
  EyeOff, 
  CalendarIcon, 
  Trash2,
  ExternalLink,
  Shield,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { 
  useJobShareLinks, 
  useCreateShareLink, 
  useRevokeShareLink,
  useDeleteShareLink,
  getShareUrl,
  type JobShareLink,
} from '@/hooks/useJobShareLinks';

interface ShareJobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
  jobName: string;
}

export function ShareJobDialog({ open, onOpenChange, jobId, jobName }: ShareJobDialogProps) {
  const { data: shareLinks = [], isLoading } = useJobShareLinks(jobId);
  const createShareLink = useCreateShareLink();
  const revokeShareLink = useRevokeShareLink();
  const deleteShareLink = useDeleteShareLink();
  
  // Form state
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [usePin, setUsePin] = useState(false);
  const [pin, setPin] = useState('');
  const [useExpiration, setUseExpiration] = useState(false);
  const [expiresAt, setExpiresAt] = useState<Date>();
  
  // Permissions
  const [canViewPhotos, setCanViewPhotos] = useState(true);
  const [canViewReadings, setCanViewReadings] = useState(true);
  const [canViewDocuments, setCanViewDocuments] = useState(true);
  const [canViewFloorPlans, setCanViewFloorPlans] = useState(true);
  const [canViewEquipment, setCanViewEquipment] = useState(false);
  const [canViewWorkLogs, setCanViewWorkLogs] = useState(false);
  
  // Generated link
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);

  const handleCreateLink = async () => {
    if (usePin && (!pin || pin.length < 4)) {
      toast.error('PIN must be at least 4 digits');
      return;
    }

    try {
      const result = await createShareLink.mutateAsync({
        jobId,
        recipientName: recipientName || undefined,
        recipientEmail: recipientEmail || undefined,
        pin: usePin ? pin : undefined,
        expiresAt: useExpiration ? expiresAt : undefined,
        canViewPhotos,
        canViewReadings,
        canViewDocuments,
        canViewFloorPlans,
        canViewEquipment,
        canViewWorkLogs,
      });
      
      setGeneratedLink(getShareUrl(result.token));
      
      // Reset form
      setRecipientName('');
      setRecipientEmail('');
      setPin('');
      setUsePin(false);
      setExpiresAt(undefined);
      setUseExpiration(false);
    } catch (error) {
      console.error('Failed to create link:', error);
    }
  };

  const handleCopyLink = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      toast.success('Link copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const handleRevoke = (link: JobShareLink) => {
    revokeShareLink.mutate({ linkId: link.id, jobId });
  };

  const handleDelete = (link: JobShareLink) => {
    deleteShareLink.mutate({ linkId: link.id, jobId });
  };

  const activeLinks = shareLinks.filter(l => !l.revoked_at);
  const revokedLinks = shareLinks.filter(l => l.revoked_at);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Share Job Progress
          </DialogTitle>
          <DialogDescription>
            Create secure links to share {jobName} with customers or adjusters
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Create New Link Section */}
          <div className="space-y-4">
            <h3 className="font-medium text-sm">Create New Share Link</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="recipientName">Recipient Name (optional)</Label>
                <Input
                  id="recipientName"
                  placeholder="John Smith - Adjuster"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="recipientEmail">Email (optional)</Label>
                <Input
                  id="recipientEmail"
                  type="email"
                  placeholder="adjuster@insurance.com"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Permissions */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Permissions</Label>
              <div className="grid grid-cols-3 gap-3">
                <div className="flex items-center gap-2">
                  <Switch 
                    checked={canViewPhotos} 
                    onCheckedChange={setCanViewPhotos}
                    id="photos"
                  />
                  <Label htmlFor="photos" className="text-sm cursor-pointer">Photos</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch 
                    checked={canViewReadings} 
                    onCheckedChange={setCanViewReadings}
                    id="readings"
                  />
                  <Label htmlFor="readings" className="text-sm cursor-pointer">Readings</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch 
                    checked={canViewDocuments} 
                    onCheckedChange={setCanViewDocuments}
                    id="documents"
                  />
                  <Label htmlFor="documents" className="text-sm cursor-pointer">Documents</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch 
                    checked={canViewFloorPlans} 
                    onCheckedChange={setCanViewFloorPlans}
                    id="floorPlans"
                  />
                  <Label htmlFor="floorPlans" className="text-sm cursor-pointer">Floor Plans</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch 
                    checked={canViewEquipment} 
                    onCheckedChange={setCanViewEquipment}
                    id="equipment"
                  />
                  <Label htmlFor="equipment" className="text-sm cursor-pointer">Equipment</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch 
                    checked={canViewWorkLogs} 
                    onCheckedChange={setCanViewWorkLogs}
                    id="workLogs"
                  />
                  <Label htmlFor="workLogs" className="text-sm cursor-pointer">Work Logs</Label>
                </div>
              </div>
            </div>

            {/* Security Options */}
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Security
              </Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Switch 
                      checked={usePin} 
                      onCheckedChange={setUsePin}
                      id="usePin"
                    />
                    <Label htmlFor="usePin" className="text-sm cursor-pointer">Require PIN</Label>
                  </div>
                  {usePin && (
                    <Input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      placeholder="4-6 digit PIN"
                      value={pin}
                      onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                    />
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Switch 
                      checked={useExpiration} 
                      onCheckedChange={setUseExpiration}
                      id="useExpiration"
                    />
                    <Label htmlFor="useExpiration" className="text-sm cursor-pointer">Set Expiration</Label>
                  </div>
                  {useExpiration && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !expiresAt && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {expiresAt ? format(expiresAt, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={expiresAt}
                          onSelect={setExpiresAt}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                </div>
              </div>
            </div>

            <Button 
              onClick={handleCreateLink} 
              className="w-full"
              disabled={createShareLink.isPending}
            >
              {createShareLink.isPending ? 'Creating...' : 'Generate Share Link'}
            </Button>

            {/* Show generated link */}
            {generatedLink && (
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <Label className="text-sm font-medium text-success">Link Created!</Label>
                <div className="flex gap-2">
                  <Input value={generatedLink} readOnly className="font-mono text-sm" />
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => handleCopyLink(generatedLink)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => window.open(generatedLink, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
                {usePin && <p className="text-xs text-muted-foreground">PIN: {pin}</p>}
              </div>
            )}
          </div>

          <Separator />

          {/* Active Links */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm flex items-center gap-2">
              Active Links 
              {activeLinks.length > 0 && (
                <Badge variant="secondary">{activeLinks.length}</Badge>
              )}
            </h3>
            
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : activeLinks.length === 0 ? (
              <p className="text-sm text-muted-foreground">No active share links</p>
            ) : (
              <div className="space-y-2">
                {activeLinks.map((link) => (
                  <ShareLinkItem 
                    key={link.id} 
                    link={link} 
                    onCopy={handleCopyLink}
                    onRevoke={handleRevoke}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Revoked Links */}
          {revokedLinks.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="font-medium text-sm flex items-center gap-2 text-muted-foreground">
                  <EyeOff className="h-4 w-4" />
                  Revoked Links ({revokedLinks.length})
                </h3>
                <div className="space-y-2 opacity-60">
                  {revokedLinks.map((link) => (
                    <ShareLinkItem 
                      key={link.id} 
                      link={link} 
                      onCopy={handleCopyLink}
                      onRevoke={handleRevoke}
                      onDelete={handleDelete}
                      revoked
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface ShareLinkItemProps {
  link: JobShareLink;
  onCopy: (url: string) => void;
  onRevoke: (link: JobShareLink) => void;
  onDelete: (link: JobShareLink) => void;
  revoked?: boolean;
}

function ShareLinkItem({ link, onCopy, onRevoke, onDelete, revoked }: ShareLinkItemProps) {
  const url = getShareUrl(link.token);
  const isExpired = link.expires_at && new Date(link.expires_at) < new Date();

  return (
    <div className={cn(
      "p-3 border rounded-lg space-y-2",
      revoked && "border-dashed"
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link2 className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium text-sm">
            {link.recipient_name || 'Share Link'}
          </span>
          {link.pin_hash && (
            <Badge variant="outline" className="text-xs">
              <Shield className="h-3 w-3 mr-1" />
              PIN
            </Badge>
          )}
          {isExpired && (
            <Badge variant="destructive" className="text-xs">Expired</Badge>
          )}
          {revoked && (
            <Badge variant="secondary" className="text-xs">Revoked</Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          {!revoked && (
            <>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onCopy(url)}>
                <Copy className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onRevoke(link)}>
                <EyeOff className="h-4 w-4" />
              </Button>
            </>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => onDelete(link)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Eye className="h-3 w-3" />
          {link.view_count} views
        </span>
        <span>Created {format(new Date(link.created_at), 'MMM d, yyyy')}</span>
        {link.expires_at && (
          <span>
            Expires {format(new Date(link.expires_at), 'MMM d, yyyy')}
          </span>
        )}
      </div>
    </div>
  );
}

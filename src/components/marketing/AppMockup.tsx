import { cn } from '@/lib/utils';

interface AppMockupProps {
  variant: 'readings' | 'photos' | 'reports' | 'equipment' | 'estimates' | 'dashboard';
  className?: string;
}

export function AppMockup({ variant, className }: AppMockupProps) {
  const mockups = {
    readings: (
      <div className="w-full max-w-[280px] bg-background rounded-2xl border border-border shadow-2xl overflow-hidden">
        {/* Status bar */}
        <div className="h-6 bg-card flex items-center justify-between px-3 text-[10px] text-muted-foreground">
          <span>9:41</span>
          <div className="flex gap-1">
            <div className="w-4 h-2 bg-muted-foreground/50 rounded-sm" />
            <div className="w-4 h-2 bg-muted-foreground/50 rounded-sm" />
          </div>
        </div>
        {/* Header */}
        <div className="bg-primary/10 px-4 py-3 border-b border-border">
          <p className="text-xs text-muted-foreground">Active Chamber</p>
          <h3 className="font-semibold">Living Room - Zone A</h3>
        </div>
        {/* Readings grid */}
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-card rounded-lg p-2 text-center border border-border">
              <p className="text-[10px] text-muted-foreground">Temp</p>
              <p className="text-lg font-mono font-bold text-primary">22°C</p>
            </div>
            <div className="bg-card rounded-lg p-2 text-center border border-border">
              <p className="text-[10px] text-muted-foreground">RH</p>
              <p className="text-lg font-mono font-bold">58%</p>
            </div>
            <div className="bg-card rounded-lg p-2 text-center border border-border">
              <p className="text-[10px] text-muted-foreground">g/kg</p>
              <p className="text-lg font-mono font-bold text-success">9.8</p>
            </div>
          </div>
          {/* Trend chart mockup */}
          <div className="bg-card rounded-lg p-3 border border-border">
            <p className="text-[10px] text-muted-foreground mb-2">Drying Progress</p>
            <div className="h-20 flex items-end justify-around gap-1">
              {[85, 70, 55, 45, 38, 32, 28].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div 
                    className="w-full bg-primary/60 rounded-t transition-all" 
                    style={{ height: `${h}%` }} 
                  />
                  <span className="text-[8px] text-muted-foreground">D{i+1}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Action button */}
          <button className="w-full bg-primary text-primary-foreground rounded-lg py-2 text-sm font-medium">
            + Log Reading
          </button>
        </div>
      </div>
    ),
    photos: (
      <div className="w-full max-w-[280px] bg-background rounded-2xl border border-border shadow-2xl overflow-hidden">
        {/* Status bar */}
        <div className="h-6 bg-card flex items-center justify-between px-3 text-[10px] text-muted-foreground">
          <span>9:41</span>
          <div className="flex gap-1">
            <div className="w-4 h-2 bg-muted-foreground/50 rounded-sm" />
          </div>
        </div>
        {/* Header */}
        <div className="bg-primary/10 px-4 py-3 border-b border-border">
          <p className="text-xs text-muted-foreground">Documentation</p>
          <h3 className="font-semibold">Photo Gallery</h3>
        </div>
        {/* Photo grid */}
        <div className="p-3">
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-square bg-muted rounded-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-500/20" />
                {i === 2 && (
                  <>
                    <div className="absolute top-2 left-2 right-6 h-0.5 bg-destructive rotate-12" />
                    <div className="absolute top-4 right-2 w-4 h-4 rounded-full border-2 border-warning" />
                  </>
                )}
                <div className="absolute bottom-1 left-1 px-1 py-0.5 bg-background/80 rounded text-[8px]">
                  {['Before', 'Damage', 'During', 'Progress', 'Equip', 'After'][i-1]}
                </div>
              </div>
            ))}
          </div>
          {/* Annotation toolbar */}
          <div className="flex gap-2 p-2 bg-card rounded-lg border border-border">
            <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center text-primary text-xs">→</div>
            <div className="w-6 h-6 rounded bg-muted flex items-center justify-center text-muted-foreground text-xs">○</div>
            <div className="w-6 h-6 rounded bg-muted flex items-center justify-center text-muted-foreground text-xs">□</div>
            <div className="w-6 h-6 rounded bg-muted flex items-center justify-center text-muted-foreground text-xs">T</div>
            <div className="flex-1" />
            <div className="px-2 h-6 rounded bg-primary text-primary-foreground flex items-center justify-center text-[10px]">Save</div>
          </div>
        </div>
      </div>
    ),
    reports: (
      <div className="w-full max-w-[240px] bg-white rounded-lg shadow-2xl overflow-hidden border border-gray-200">
        {/* Report header */}
        <div className="bg-primary p-3 text-primary-foreground">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 bg-white/20 rounded" />
            <span className="font-bold text-sm">FloodEx</span>
          </div>
          <p className="text-[10px] opacity-80">Water Damage Restoration Report</p>
        </div>
        {/* Report content */}
        <div className="p-3 space-y-2 text-gray-800">
          <div>
            <p className="text-[8px] text-gray-500 uppercase">Property</p>
            <p className="text-[10px] font-medium">123 Main Street, Sydney NSW</p>
          </div>
          <div>
            <p className="text-[8px] text-gray-500 uppercase">Claim #</p>
            <p className="text-[10px] font-medium">CLM-2024-00847</p>
          </div>
          <div className="border-t border-gray-200 pt-2">
            <p className="text-[8px] text-gray-500 uppercase mb-1">Drying Summary</p>
            <div className="grid grid-cols-2 gap-1 text-[9px]">
              <div className="bg-gray-100 rounded p-1">
                <span className="text-gray-500">Start:</span> 14.2 g/kg
              </div>
              <div className="bg-gray-100 rounded p-1">
                <span className="text-gray-500">Final:</span> 7.1 g/kg
              </div>
            </div>
          </div>
          <div className="flex gap-1">
            <div className="flex-1 h-12 bg-gray-100 rounded" />
            <div className="flex-1 h-12 bg-gray-100 rounded" />
          </div>
          <div className="border-t border-gray-200 pt-2 flex justify-between items-center">
            <p className="text-[8px] text-gray-500">Generated by FloodEx</p>
            <div className="w-12 h-4 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    ),
    equipment: (
      <div className="w-full max-w-[280px] bg-background rounded-2xl border border-border shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-primary/10 px-4 py-3 border-b border-border">
          <p className="text-xs text-muted-foreground">Equipment</p>
          <h3 className="font-semibold">Assigned to Job #1847</h3>
        </div>
        {/* Equipment list */}
        <div className="p-3 space-y-2">
          {[
            { name: 'LGR Dehumidifier', id: 'DH-042', days: 4, rate: 85 },
            { name: 'Air Mover', id: 'AM-118', days: 4, rate: 25 },
            { name: 'Air Mover', id: 'AM-119', days: 4, rate: 25 },
            { name: 'Moisture Sensor', id: 'MS-007', days: 4, rate: 15 },
          ].map((eq, i) => (
            <div key={i} className="flex items-center gap-3 p-2 bg-card rounded-lg border border-border">
              <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                {eq.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{eq.name}</p>
                <p className="text-[10px] text-muted-foreground">{eq.id}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-mono">{eq.days} days</p>
                <p className="text-[10px] text-muted-foreground">${eq.rate}/day</p>
              </div>
            </div>
          ))}
          <div className="flex justify-between items-center pt-2 border-t border-border">
            <span className="text-sm text-muted-foreground">Total Equipment Cost</span>
            <span className="font-bold text-primary">$600.00</span>
          </div>
        </div>
      </div>
    ),
    estimates: (
      <div className="w-full max-w-[260px] bg-white rounded-lg shadow-2xl overflow-hidden border border-gray-200">
        {/* Estimate header */}
        <div className="bg-gradient-to-r from-primary to-primary/80 p-4 text-primary-foreground">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-[10px] opacity-80">ESTIMATE</p>
              <p className="font-bold">#EST-2024-0293</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] opacity-80">Date</p>
              <p className="text-sm">24 Jan 2024</p>
            </div>
          </div>
        </div>
        {/* Line items */}
        <div className="p-3 space-y-2 text-gray-800">
          <div className="space-y-1">
            {[
              { desc: 'Water Extraction', qty: '4 hrs', amt: '$320' },
              { desc: 'Dehumidifier Rental', qty: '5 days', amt: '$425' },
              { desc: 'Air Movers (x4)', qty: '5 days', amt: '$500' },
              { desc: 'Antimicrobial Treatment', qty: '1', amt: '$180' },
            ].map((item, i) => (
              <div key={i} className="flex justify-between text-[10px] py-1 border-b border-gray-100">
                <span>{item.desc}</span>
                <div className="flex gap-4">
                  <span className="text-gray-500 w-12 text-right">{item.qty}</span>
                  <span className="font-medium w-12 text-right">{item.amt}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="pt-2 border-t-2 border-gray-200">
            <div className="flex justify-between text-sm font-bold">
              <span>Total</span>
              <span className="text-primary">$1,425.00</span>
            </div>
          </div>
          <button className="w-full bg-primary text-white rounded py-1.5 text-xs font-medium mt-2">
            Send to Customer
          </button>
        </div>
      </div>
    ),
    dashboard: (
      <div className="w-full max-w-[320px] bg-background rounded-2xl border border-border shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-card px-4 py-3 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">F</div>
            <div>
              <p className="font-semibold text-sm">FloodEx</p>
              <p className="text-[10px] text-muted-foreground">Dashboard</p>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-muted" />
        </div>
        {/* Stats */}
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-card rounded-lg p-2 text-center border border-border">
              <p className="text-lg font-bold text-primary">8</p>
              <p className="text-[10px] text-muted-foreground">Active Jobs</p>
            </div>
            <div className="bg-card rounded-lg p-2 text-center border border-border">
              <p className="text-lg font-bold text-warning">3</p>
              <p className="text-[10px] text-muted-foreground">Drying</p>
            </div>
            <div className="bg-card rounded-lg p-2 text-center border border-border">
              <p className="text-lg font-bold text-success">12</p>
              <p className="text-[10px] text-muted-foreground">Complete</p>
            </div>
          </div>
          {/* Recent jobs */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Recent Jobs</p>
            {[
              { addr: '45 Park Ave, Melbourne', status: 'Drying', color: 'bg-warning' },
              { addr: '123 Main St, Sydney', status: 'New', color: 'bg-primary' },
              { addr: '78 Beach Rd, Brisbane', status: 'Complete', color: 'bg-success' },
            ].map((job, i) => (
              <div key={i} className="flex items-center gap-2 p-2 bg-card rounded-lg border border-border">
                <div className={`w-2 h-2 rounded-full ${job.color}`} />
                <p className="flex-1 text-xs truncate">{job.addr}</p>
                <span className="text-[10px] text-muted-foreground">{job.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  };

  return (
    <div className={cn("flex items-center justify-center", className)}>
      {mockups[variant]}
    </div>
  );
}

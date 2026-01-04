import { useMemo } from 'react';
import { format } from 'date-fns';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Tables } from '@/integrations/supabase/types';
import { gppToGramsPerKg, type UnitSystem } from '@/lib/psychrometrics';

type MoistureReading = Tables<'moisture_readings'>;

interface GPPTrendChartProps {
  readings: MoistureReading[];
  targetGpp?: number | null;
  units: UnitSystem;
}

export function GPPTrendChart({
  readings,
  targetGpp,
  units,
}: GPPTrendChartProps) {
  const chartData = useMemo(() => {
    // Filter to ambient readings only and sort by date
    const ambientReadings = readings
      .filter((r) => r.reading_type === 'ambient' && r.gpp !== null)
      .sort((a, b) => new Date(a.logged_at).getTime() - new Date(b.logged_at).getTime());

    return ambientReadings.map((reading) => ({
      time: format(new Date(reading.logged_at), 'MMM d, h:mm a'),
      value: units === 'metric' && reading.gpp 
        ? gppToGramsPerKg(reading.gpp) 
        : reading.gpp,
      rawTime: new Date(reading.logged_at).getTime(),
    }));
  }, [readings, units]);

  const displayTarget = useMemo(() => {
    if (!targetGpp) return null;
    return units === 'metric' ? gppToGramsPerKg(targetGpp) : targetGpp;
  }, [targetGpp, units]);

  const unitLabel = units === 'metric' ? 'g/kg' : 'GPP';

  if (chartData.length < 2) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Drying Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            Need at least 2 readings to show trend
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Drying Progress ({unitLabel})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 10 }} 
                className="text-muted-foreground"
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 10 }} 
                className="text-muted-foreground"
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              {displayTarget && (
                <ReferenceLine 
                  y={displayTarget} 
                  stroke="hsl(var(--success))" 
                  strokeDasharray="5 5"
                  label={{ 
                    value: `Target: ${displayTarget}`, 
                    position: 'right',
                    fontSize: 10,
                    fill: 'hsl(var(--success))'
                  }}
                />
              )}
              <Line
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

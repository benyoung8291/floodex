import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Droplets, ThermometerSun, Gauge } from 'lucide-react';

export default function Readings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Moisture Readings</h1>
        <p className="text-muted-foreground">Psychrometric data and drying progress</p>
      </div>

      <Card className="border-dashed">
        <CardContent className="py-12 text-center">
          <div className="flex justify-center gap-4 mb-4">
            <Droplets className="w-8 h-8 text-primary opacity-50" />
            <ThermometerSun className="w-8 h-8 text-warning opacity-50" />
            <Gauge className="w-8 h-8 text-success opacity-50" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Moisture Readings</h3>
          <p className="text-muted-foreground max-w-sm mx-auto">
            Select a job to log temperature, humidity, and GPP readings for each drying chamber.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

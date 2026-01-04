import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, Loader2, CheckCircle2 } from 'lucide-react';
import { geocodeAddress, reverseGeocode } from '@/lib/geocoding';
import { toast } from 'sonner';

interface LocationStepProps {
  form: UseFormReturn<any>;
}

export function LocationStep({ form }: LocationStepProps) {
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [geocodeSuccess, setGeocodeSuccess] = useState(false);

  const handleGeocode = async () => {
    const address = form.getValues('address');
    const city = form.getValues('city');
    const state = form.getValues('state');
    const zipCode = form.getValues('zipCode');

    if (!address || !city || !state || !zipCode) {
      toast.error('Please fill in all address fields first');
      return;
    }

    setIsGeocoding(true);
    setGeocodeSuccess(false);

    try {
      const result = await geocodeAddress(address, city, state, zipCode);

      if (result) {
        form.setValue('latitude', result.lat);
        form.setValue('longitude', result.lng);
        setGeocodeSuccess(true);
        toast.success('Address located successfully');
      } else {
        toast.error('Could not find the address. Please verify and try again.');
      }
    } catch (error) {
      toast.error('Error locating address');
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setIsGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        form.setValue('latitude', latitude);
        form.setValue('longitude', longitude);

        // Try to reverse geocode to fill in address
        const result = await reverseGeocode(latitude, longitude);
        if (result) {
          form.setValue('address', result.address);
          form.setValue('city', result.city);
          form.setValue('state', result.state);
          form.setValue('zipCode', result.zipCode);
        }

        setGeocodeSuccess(true);
        setIsGettingLocation(false);
        toast.success('Location captured successfully');
      },
      (error) => {
        setIsGettingLocation(false);
        toast.error('Unable to get your location');
        console.error('Geolocation error:', error);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const hasCoordinates = form.watch('latitude') && form.watch('longitude');

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-xl font-semibold text-foreground">Job Location</h2>
        <p className="text-muted-foreground mt-1">Enter the loss site address</p>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full h-12"
        onClick={handleUseCurrentLocation}
        disabled={isGettingLocation}
      >
        {isGettingLocation ? (
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        ) : (
          <Navigation className="mr-2 h-5 w-5" />
        )}
        Use Current Location
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or enter manually</span>
        </div>
      </div>

      <FormField
        control={form.control}
        name="address"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base">Street Address *</FormLabel>
            <FormControl>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  {...field}
                  placeholder="123 Main Street"
                  className="pl-11 h-12 text-base"
                  onChange={(e) => {
                    field.onChange(e);
                    setGeocodeSuccess(false);
                  }}
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base">City *</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="City"
                  className="h-12 text-base"
                  onChange={(e) => {
                    field.onChange(e);
                    setGeocodeSuccess(false);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="state"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base">State *</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="State"
                  className="h-12 text-base"
                  onChange={(e) => {
                    field.onChange(e);
                    setGeocodeSuccess(false);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="zipCode"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base">ZIP Code *</FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="12345"
                className="h-12 text-base"
                onChange={(e) => {
                  field.onChange(e);
                  setGeocodeSuccess(false);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <Button
        type="button"
        variant={geocodeSuccess ? 'default' : 'secondary'}
        className="w-full h-12"
        onClick={handleGeocode}
        disabled={isGeocoding}
      >
        {isGeocoding ? (
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        ) : geocodeSuccess ? (
          <CheckCircle2 className="mr-2 h-5 w-5" />
        ) : (
          <MapPin className="mr-2 h-5 w-5" />
        )}
        {geocodeSuccess ? 'Address Located' : 'Locate Address'}
      </Button>

      {hasCoordinates && (
        <p className="text-sm text-muted-foreground text-center">
          📍 Coordinates: {form.watch('latitude')?.toFixed(4)}, {form.watch('longitude')?.toFixed(4)}
        </p>
      )}
    </div>
  );
}

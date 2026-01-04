import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Skeleton } from '@/components/ui/skeleton';
import { Building2, Thermometer, Shield, Eye, EyeOff } from 'lucide-react';
import { useTenant, useUpdateTenant } from '@/hooks/useTenant';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const settingsSchema = z.object({
  name: z.string().min(1, 'Company name is required').max(100),
  contact_email: z.string().email('Invalid email').optional().or(z.literal('')),
  contact_phone: z.string().max(20).optional().or(z.literal('')),
  address: z.string().max(255).optional().or(z.literal('')),
  temperature_unit: z.enum(['F', 'C']),
  humidity_ratio_unit: z.enum(['GPP', 'g/kg']),
  supervisor_override_code: z.string().min(4, 'Code must be at least 4 characters').optional().or(z.literal('')),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

export default function Settings() {
  const { data: tenant, isLoading } = useTenant();
  const { mutate: updateTenant, isPending } = useUpdateTenant();
  const { isTenantAdmin } = useAuth();
  const [showOverrideCode, setShowOverrideCode] = useState(false);

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: '',
      contact_email: '',
      contact_phone: '',
      address: '',
      temperature_unit: 'F',
      humidity_ratio_unit: 'GPP',
      supervisor_override_code: '',
    },
  });

  useEffect(() => {
    if (tenant) {
      form.reset({
        name: tenant.name || '',
        contact_email: tenant.contact_email || '',
        contact_phone: tenant.contact_phone || '',
        address: tenant.address || '',
        temperature_unit: (tenant.temperature_unit as 'F' | 'C') || 'F',
        humidity_ratio_unit: (tenant.humidity_ratio_unit as 'GPP' | 'g/kg') || 'GPP',
        supervisor_override_code: tenant.supervisor_override_code || '',
      });
    }
  }, [tenant, form]);

  const onSubmit = (data: SettingsFormData) => {
    updateTenant({
      name: data.name,
      contact_email: data.contact_email || null,
      contact_phone: data.contact_phone || null,
      address: data.address || null,
      temperature_unit: data.temperature_unit,
      humidity_ratio_unit: data.humidity_ratio_unit,
      supervisor_override_code: data.supervisor_override_code || null,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your company and preferences</p>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-[200px] w-full" />
          <Skeleton className="h-[120px] w-full" />
          <Skeleton className="h-[150px] w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your company and preferences</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Company Profile Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                <CardTitle>Company Profile</CardTitle>
              </div>
              <CardDescription>
                Basic information about your company
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name *</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        disabled={!isTenantAdmin || isPending}
                        placeholder="Your company name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="contact_email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Email</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="email"
                          disabled={!isTenantAdmin || isPending}
                          placeholder="contact@company.com"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contact_phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Phone</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="tel"
                          disabled={!isTenantAdmin || isPending}
                          placeholder="(555) 123-4567"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Address</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        disabled={!isTenantAdmin || isPending}
                        placeholder="123 Main St, City, State 12345"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Preferences Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Thermometer className="h-5 w-5 text-primary" />
                <CardTitle>Preferences</CardTitle>
              </div>
              <CardDescription>
                Configure display preferences for your team
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="temperature_unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Temperature Unit</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex gap-4"
                        disabled={!isTenantAdmin || isPending}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="F" id="fahrenheit" />
                          <Label htmlFor="fahrenheit" className="font-normal cursor-pointer">
                            Fahrenheit (°F)
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="C" id="celsius" />
                          <Label htmlFor="celsius" className="font-normal cursor-pointer">
                            Celsius (°C)
                          </Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="humidity_ratio_unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Humidity Ratio Unit</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex gap-4"
                        disabled={!isTenantAdmin || isPending}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="GPP" id="gpp" />
                          <Label htmlFor="gpp" className="font-normal cursor-pointer">
                            Grains per Pound (GPP)
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="g/kg" id="gkg" />
                          <Label htmlFor="gkg" className="font-normal cursor-pointer">
                            Grams per Kilogram (g/kg)
                          </Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <p className="text-sm text-muted-foreground">
                These settings affect how readings are displayed throughout the app
              </p>
            </CardContent>
          </Card>

          {/* Security Section - Admin Only */}
          {isTenantAdmin && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <CardTitle>Security</CardTitle>
                </div>
                <CardDescription>
                  Security settings for your organization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="supervisor_override_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supervisor Override Code</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            {...field} 
                            type={showOverrideCode ? 'text' : 'password'}
                            disabled={isPending}
                            placeholder="Enter override code"
                            className="pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                            onClick={() => setShowOverrideCode(!showOverrideCode)}
                          >
                            {showOverrideCode ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormDescription>
                        Required when technicians encounter critical safety hazards that need supervisor approval to proceed
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          {/* Save Button */}
          {isTenantAdmin && (
            <div className="flex justify-end">
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
}

import { UseFormReturn } from 'react-hook-form';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { User, Phone, Mail } from 'lucide-react';

interface CustomerInfoStepProps {
  form: UseFormReturn<any>;
}

export function CustomerInfoStep({ form }: CustomerInfoStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-xl font-semibold text-foreground">Customer Information</h2>
        <p className="text-muted-foreground mt-1">Enter the customer's contact details</p>
      </div>

      <FormField
        control={form.control}
        name="customerName"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base">Customer Name *</FormLabel>
            <FormControl>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  {...field}
                  placeholder="John Smith"
                  className="pl-11 h-12 text-base"
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="customerPhone"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base">Phone Number</FormLabel>
            <FormControl>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  {...field}
                  type="tel"
                  placeholder="(555) 123-4567"
                  className="pl-11 h-12 text-base"
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="customerEmail"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base">Email Address</FormLabel>
            <FormControl>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  {...field}
                  type="email"
                  placeholder="john@example.com"
                  className="pl-11 h-12 text-base"
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

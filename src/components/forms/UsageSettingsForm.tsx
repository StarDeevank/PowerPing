"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { UsageSettings } from "@/types";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

const usageSettingsSchema = z.object({
  monthlyElectricityBillGoal: z.coerce.number().min(0, "Goal must be non-negative."),
  currency: z.enum(['₹', '$'], {
    required_error: "Currency is required.",
  }),
});

type UsageSettingsFormValues = z.infer<typeof usageSettingsSchema>;

interface UsageSettingsFormProps {
  onSubmit: (data: UsageSettings) => void;
  initialData?: UsageSettings;
}

export function UsageSettingsForm({ onSubmit, initialData }: UsageSettingsFormProps) {
  const form = useForm<UsageSettingsFormValues>({
    resolver: zodResolver(usageSettingsSchema),
    defaultValues: initialData || {
      monthlyElectricityBillGoal: 500,
      currency: '₹',
    },
  });

  const handleSubmit = (values: UsageSettingsFormValues) => {
    onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="monthlyElectricityBillGoal"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Monthly Electricity Bill Goal ({form.watch('currency')})</FormLabel>
              <FormControl>
                <div className="flex items-center space-x-2">
                   <Input 
                    type="number" 
                    placeholder="Enter your goal" 
                    value={field.value}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    className="w-1/2"
                  />
                  <Slider
                    min={0}
                    max={form.watch('currency') === '₹' ? 10000 : 500}
                    step={form.watch('currency') === '₹' ? 100 : 10}
                    value={[field.value]}
                    onValueChange={(value) => field.onChange(value[0])}
                    className="w-1/2"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="currency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Currency</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="₹">₹ (INR)</SelectItem>
                  <SelectItem value="$">$ (USD)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full bg-primary hover:bg-primary/90">Save Settings</Button>
      </form>
    </Form>
  );
}

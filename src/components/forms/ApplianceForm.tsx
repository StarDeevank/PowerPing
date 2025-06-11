
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
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Appliance } from "@/types";

const applianceTypes = [
  "Light", "Fan", "Air Conditioner", "Refrigerator", "Television", 
  "Washing Machine", "Microwave", "Oven", "Geyser/Water Heater", "Computer/Laptop", 
  "Charger", "Pump", "Speaker", "Router/Modem", "Other"
] as const;

const applianceSchema = z.object({
  deviceName: z.string().min(2, "Device name must be at least 2 characters.").max(50, "Device name too long."),
  room: z.string().min(2, "Room name must be at least 2 characters.").max(50, "Room name too long."),
  applianceType: z.string().min(1, "Appliance type is required."),
  powerRating: z.coerce.number().min(0, "Power rating must be non-negative.").optional().or(z.literal('')), // Optional, can be empty string then coerced
  estimatedDailyUsage: z.coerce.number().min(0, "Usage must be non-negative.").max(24, "Usage cannot exceed 24 hours."),
  status: z.boolean(),
});

export type ApplianceFormValues = Omit<z.infer<typeof applianceSchema>, 'powerRating'> & {
  powerRating?: number;
};


interface ApplianceFormProps {
  onSubmit: (data: ApplianceFormValues) => void;
  initialData?: Partial<Appliance>;
  submitButtonText?: string;
}

export function ApplianceForm({ onSubmit, initialData, submitButtonText = "Add Appliance" }: ApplianceFormProps) {
  const form = useForm<ApplianceFormValues>({
    resolver: zodResolver(applianceSchema),
    defaultValues: {
      deviceName: initialData?.deviceName || "",
      room: initialData?.room || "",
      applianceType: initialData?.applianceType || "",
      powerRating: initialData?.powerRating || undefined,
      estimatedDailyUsage: initialData?.estimatedDailyUsage || 0,
      status: initialData?.status || false,
    },
  });

  const handleSubmit = (values: z.infer<typeof applianceSchema>) => {
    const submissionValues: ApplianceFormValues = {
        ...values,
        powerRating: values.powerRating === '' || values.powerRating === undefined ? undefined : Number(values.powerRating)
    };
    onSubmit(submissionValues);
    if (!initialData?.id) { // Reset form only if adding new
      form.reset({ deviceName: "", room: "", applianceType: "", powerRating: undefined, estimatedDailyUsage: 0, status: false });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="deviceName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Device Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Living Room Fan" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="room"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Room</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Living Room" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="applianceType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Appliance Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select appliance type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {applianceTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="powerRating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Power Rating (Watts)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="e.g., 60 (Optional)" 
                  {...field} 
                  onChange={e => field.onChange(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  value={field.value === undefined ? '' : field.value}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="estimatedDailyUsage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estimated Daily Usage (hours)</FormLabel>
              <FormControl>
                <div className="flex items-center space-x-2">
                  <Input 
                    type="number" 
                    placeholder="e.g., 2.5" 
                    value={field.value}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    step="0.1"
                    className="w-1/3"
                  />
                  <Slider
                    min={0}
                    max={24}
                    step={0.5}
                    value={[field.value]}
                    onValueChange={(value) => field.onChange(value[0])}
                    className="flex-grow"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Status (On/Off)</FormLabel>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
          {submitButtonText}
        </Button>
      </form>
    </Form>
  );
}

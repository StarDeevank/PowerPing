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
import type { HomeConfiguration, HomeSize } from "@/types";

const homeConfigurationSchema = z.object({
  homeSize: z.enum(['1BHK', '2BHK', '3BHK', '4BHK+', ''], {
    required_error: "Home size is required.",
  }),
  numberOfRooms: z.coerce.number().min(1, "Number of rooms must be at least 1.").max(20, "Number of rooms cannot exceed 20."),
});

type HomeConfigurationFormValues = z.infer<typeof homeConfigurationSchema>;

interface HomeConfigurationFormProps {
  onSubmit: (data: HomeConfiguration) => void;
  initialData?: HomeConfiguration;
}

const homeSizeOptions: HomeSize[] = ['1BHK', '2BHK', '3BHK', '4BHK+'];

export function HomeConfigurationForm({ onSubmit, initialData }: HomeConfigurationFormProps) {
  const form = useForm<HomeConfigurationFormValues>({
    resolver: zodResolver(homeConfigurationSchema),
    defaultValues: initialData || {
      homeSize: "",
      numberOfRooms: 1,
    },
  });

  const handleSubmit = (values: HomeConfigurationFormValues) => {
    onSubmit(values as HomeConfiguration);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="homeSize"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Home Size</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select home size" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {homeSizeOptions.map((size) => (
                    <SelectItem key={size} value={size}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="numberOfRooms"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Number of Rooms</FormLabel>
              <FormControl>
                <Input type="number" placeholder="Enter number of rooms" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full bg-primary hover:bg-primary/90">Save Configuration</Button>
      </form>
    </Form>
  );
}

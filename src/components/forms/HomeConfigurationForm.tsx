
"use client";

// This form is no longer used as Home Configuration (homeSize, numberOfRooms)
// has been removed from the application for simplification.
// Keeping the file for reference in case it's needed in the future with a different scope.

/*
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
// import type { HomeConfiguration, HomeSize } from "@/types"; // Types would be simplified/removed

const homeConfigurationSchema = z.object({
  // homeSize: z.enum(['1BHK', '2BHK', '3BHK', '4BHK+', ''], {
  //   required_error: "Home size is required.",
  // }),
  // numberOfRooms: z.coerce.number().min(1, "Number of rooms must be at least 1.").max(20, "Number of rooms cannot exceed 20."),
});

// type HomeConfigurationFormValues = z.infer<typeof homeConfigurationSchema>;

interface HomeConfigurationFormProps {
  // onSubmit: (data: HomeConfiguration) => void; // Data type would change
  // initialData?: HomeConfiguration; // Data type would change
}

// const homeSizeOptions: HomeSize[] = ['1BHK', '2BHK', '3BHK', '4BHK+'];

export function HomeConfigurationForm({ onSubmit, initialData }: HomeConfigurationFormProps) {
  const form = useForm<any>({ // Replace 'any' with updated schema if re-enabled
    resolver: zodResolver(homeConfigurationSchema),
    defaultValues: initialData || {
      // homeSize: "",
      // numberOfRooms: 1,
    },
  });

  const handleSubmit = (values: any) => { // Replace 'any'
    // onSubmit(values as HomeConfiguration); // Adjust type
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Fields for homeSize and numberOfRooms would be here *}
        <p className="text-muted-foreground">Home configuration has been simplified and is no longer set here.</p>
        <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled>Save Configuration</Button>
      </form>
    </Form>
  );
}
*/

export function HomeConfigurationForm() {
  return (
    <div>
      <p className="text-muted-foreground p-4 text-center">
        Home-specific configuration (like home size and number of rooms) has been removed to simplify setup. 
        The AI will now focus on your appliance list and usage goals.
      </p>
    </div>
  );
}

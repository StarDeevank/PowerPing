
"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { format, subDays, addDays, isToday, isFuture } from 'date-fns';

interface DayNavigatorProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  minDate?: Date; // Optional minimum date
}

const DayNavigator: React.FC<DayNavigatorProps> = ({ selectedDate, onDateChange, minDate }) => {
  const handlePreviousDay = () => {
    const newDate = subDays(selectedDate, 1);
    if (minDate && newDate < minDate) {
      // Optionally disable button or handle as needed
      return;
    }
    onDateChange(newDate);
  };

  const handleNextDay = () => {
    const newDate = addDays(selectedDate, 1);
    if (isFuture(newDate) && !isToday(newDate)) { // Prevent selecting future dates
      return;
    }
    onDateChange(newDate);
  };

  const handleDateSelect = (date?: Date) => {
    if (date) {
      if (isFuture(date) && !isToday(date)) return;
      if (minDate && date < minDate) return;
      onDateChange(date);
    }
  };

  return (
    <Card className="mb-6 shadow-md">
      <CardContent className="p-4 flex items-center justify-between">
        <Button variant="outline" size="icon" onClick={handlePreviousDay} disabled={minDate && selectedDate <= minDate} aria-label="Previous Day">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-48 text-base">
              <CalendarDays className="mr-2 h-5 w-5" />
              {isToday(selectedDate) ? `Today, ${format(selectedDate, 'MMM d, yyyy')}` : format(selectedDate, 'EEEE, MMM d, yyyy')}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              initialFocus
              disabled={(date) => (isFuture(date) && !isToday(date)) || (minDate ? date < minDate : false)}
            />
          </PopoverContent>
        </Popover>
        <Button variant="outline" size="icon" onClick={handleNextDay} disabled={isToday(selectedDate)} aria-label="Next Day">
          <ChevronRight className="h-5 w-5" />
        </Button>
      </CardContent>
    </Card>
  );
};

// Need to import Card and CardContent for standalone component,
// or ensure they are imported where DayNavigator is used if props are passed down.
// For now, assuming they are available in the global scope from shadcn or similar.
// If not, add:
import { Card, CardContent } from "@/components/ui/card"; 

export default DayNavigator;

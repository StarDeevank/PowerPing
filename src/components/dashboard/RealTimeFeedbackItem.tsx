
"use client";

import { PowerOff, AlertCircle } from "lucide-react";
import ApplianceIconRenderer from "@/components/icons/ApplianceIconRenderer";
import type { Appliance } from "@/types";
import { Button } from "@/components/ui/button";

interface RealTimeFeedbackItemProps {
  appliance: Appliance;
  onToggleStatus: (id: string, status: boolean) => void;
}

const RealTimeFeedbackItem: React.FC<RealTimeFeedbackItemProps> = ({ appliance, onToggleStatus }) => {
  if (!appliance.status) {
    return null; // Only show feedback for active appliances
  }

  // Example: Simulate a reminder if an appliance has been on for a while
  // This logic would ideally be driven by more sophisticated tracking or AI.
  const isRunningLong = appliance.estimatedDailyUsage > 1 && appliance.status; // Simplified condition

  return (
    <div className="flex flex-col p-3 bg-card-foreground/5 rounded-md shadow-sm space-y-2">
      <div className="flex items-center">
        <ApplianceIconRenderer deviceName={appliance.deviceName} className="h-6 w-6 text-accent mr-3 shrink-0" />
        <div>
          <p className="text-sm font-medium">{appliance.deviceName} in {appliance.room} is ON.</p>
          <p className="text-xs text-muted-foreground">Estimated daily usage: {appliance.estimatedDailyUsage} hrs.</p>
        </div>
      </div>
      {isRunningLong && (
        <div className="border-t border-border/50 pt-2 space-y-2">
          <div className="flex items-center text-sm text-amber-400">
            <AlertCircle className="h-4 w-4 mr-2 shrink-0" />
            <p>This has been on for a while. Consider turning it off to save energy.</p>
          </div>
          <div className="flex space-x-2 justify-end">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onToggleStatus(appliance.id, false)}
              aria-label={`Turn off ${appliance.deviceName}`}
            >
              <PowerOff className="mr-1 h-3 w-3" />
              Turn Off
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => console.log(`Ignoring reminder for ${appliance.deviceName}`)} // Placeholder
              aria-label={`Ignore reminder for ${appliance.deviceName}`}
            >
              Ignore
            </Button>
            {/* Snooze button could be added here with more complex state */}
          </div>
        </div>
      )}
    </div>
  );
};

export default RealTimeFeedbackItem;


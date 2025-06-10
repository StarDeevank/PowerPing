"use client";

import { AlertCircle, Info, CheckCircle } from "lucide-react";
import ApplianceIconRenderer from "@/components/icons/ApplianceIconRenderer";
import type { Appliance } from "@/types";

interface RealTimeFeedbackItemProps {
  appliance: Appliance;
}

const RealTimeFeedbackItem: React.FC<RealTimeFeedbackItemProps> = ({ appliance }) => {
  // Basic feedback: just show if appliance is ON.
  // More complex feedback (like "running over usual X hrs") requires more state/logic.
  if (!appliance.status) {
    return null; // Only show feedback for active appliances or specific alerts
  }

  return (
    <div className="flex items-center p-3 bg-card-foreground/5 rounded-md shadow-sm">
      <ApplianceIconRenderer deviceName={appliance.deviceName} className="h-6 w-6 text-accent mr-3 shrink-0" />
      <div>
        <p className="text-sm font-medium">{appliance.deviceName} in {appliance.room} is ON.</p>
        <p className="text-xs text-muted-foreground">Estimated daily usage: {appliance.estimatedDailyUsage} hrs.</p>
      </div>
    </div>
  );
};

export default RealTimeFeedbackItem;

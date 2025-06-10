
"use client";

import type { Appliance } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import ApplianceIconRenderer from "@/components/icons/ApplianceIconRenderer";
import { Trash2, Edit3 } from "lucide-react";

interface ApplianceListItemProps {
  appliance: Appliance;
  onToggleStatus: (id: string, status: boolean) => void;
  onEdit: (appliance: Appliance) => void;
  onDelete: (id: string) => void;
  isSleepModeActive?: boolean; // Added to disable toggle in sleep mode
}

const ApplianceListItem: React.FC<ApplianceListItemProps> = ({ appliance, onToggleStatus, onEdit, onDelete, isSleepModeActive }) => {
  const handleToggle = (checked: boolean) => {
    if (isSleepModeActive && checked) {
      // Optionally show a toast or prevent toggle
      console.warn("Cannot turn on appliance during sleep mode.");
      return;
    }
    onToggleStatus(appliance.id, checked);
  };
  
  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-3">
          <ApplianceIconRenderer deviceName={appliance.deviceName} className="h-8 w-8 text-primary" />
          <CardTitle className="text-lg font-medium">{appliance.deviceName}</CardTitle>
        </div>
        <Switch
          checked={appliance.status}
          onCheckedChange={handleToggle}
          aria-label={`Toggle ${appliance.deviceName} status`}
          disabled={isSleepModeActive && appliance.status === false} // Disable turning ON during sleep mode
        />
      </CardHeader>
      <CardContent>
        <CardDescription className="text-sm text-muted-foreground">
          Room: {appliance.room}
        </CardDescription>
        <p className="text-xs text-muted-foreground">
          Est. Daily Usage: {appliance.estimatedDailyUsage} hrs
        </p>
        <div className="mt-4 flex space-x-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(appliance)} aria-label={`Edit ${appliance.deviceName}`} disabled={isSleepModeActive}>
            <Edit3 className="h-4 w-4 mr-1" /> Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={() => onDelete(appliance.id)} aria-label={`Delete ${appliance.deviceName}`} disabled={isSleepModeActive}>
            <Trash2 className="h-4 w-4 mr-1" /> Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApplianceListItem;

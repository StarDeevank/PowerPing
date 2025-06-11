
"use client";

import type { Appliance } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import ApplianceIconRenderer from "@/components/icons/ApplianceIconRenderer";
import { Trash2, Edit3, Zap } from "lucide-react"; // Added Zap for power rating

interface ApplianceListItemProps {
  appliance: Appliance;
  onToggleStatus: (id: string, status: boolean) => void;
  onEdit: (appliance: Appliance) => void;
  onDelete: (id: string) => void;
  isSleepModeActive?: boolean;
}

const ApplianceListItem: React.FC<ApplianceListItemProps> = ({ appliance, onToggleStatus, onEdit, onDelete, isSleepModeActive }) => {
  const handleToggle = (checked: boolean) => {
    if (isSleepModeActive && checked) {
      console.warn("Cannot turn on appliance during sleep mode.");
      return;
    }
    onToggleStatus(appliance.id, checked);
  };
  
  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col justify-between">
      <div>
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <div className="flex items-center space-x-3">
            <ApplianceIconRenderer deviceName={appliance.applianceType || appliance.deviceName} className="h-8 w-8 text-primary mt-1" />
            <div>
              <CardTitle className="text-lg font-medium">{appliance.deviceName}</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">{appliance.applianceType}</CardDescription>
            </div>
          </div>
          <Switch
            checked={appliance.status}
            onCheckedChange={handleToggle}
            aria-label={`Toggle ${appliance.deviceName} status`}
            disabled={isSleepModeActive && appliance.status === false}
            className="mt-1"
          />
        </CardHeader>
        <CardContent className="pb-4 pt-2">
          <p className="text-sm text-muted-foreground">
            Room: {appliance.room}
          </p>
          {appliance.powerRating && (
            <p className="text-xs text-muted-foreground flex items-center">
              <Zap className="h-3 w-3 mr-1 text-primary/70" /> {appliance.powerRating} W
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Est. Daily Usage: {appliance.estimatedDailyUsage} hrs
          </p>
        </CardContent>
      </div>
      <CardContent className="pt-0"> 
        <div className="mt-auto flex space-x-2 pt-2 border-t border-border/50">
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

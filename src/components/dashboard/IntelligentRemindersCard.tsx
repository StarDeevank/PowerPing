"use client";

import type { DisplayIntelligentReminder } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BellRing, AlertTriangle } from "lucide-react";
import ApplianceIconRenderer from "@/components/icons/ApplianceIconRenderer";
import { Skeleton } from "@/components/ui/skeleton";

interface IntelligentRemindersCardProps {
  reminders: DisplayIntelligentReminder[];
  isLoading: boolean;
}

const IntelligentRemindersCard: React.FC<IntelligentRemindersCardProps> = ({ reminders, isLoading }) => {
   if (isLoading) {
    return (
       <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <BellRing className="mr-2 h-6 w-6 text-primary" />
            Intelligent Reminders
          </CardTitle>
          <CardDescription>AI-suggested rules to optimize usage.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[...Array(3)].map((_, index) => (
            <Skeleton key={index} className="h-12 w-full rounded-md" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <BellRing className="mr-2 h-6 w-6 text-primary" />
          Intelligent Reminders
        </CardTitle>
        <CardDescription>AI-suggested rules to optimize appliance usage.</CardDescription>
      </CardHeader>
      <CardContent>
        {reminders.length > 0 ? (
          <ul className="space-y-3">
            {reminders.map((reminder) => (
              <li key={reminder.id} className="flex items-start p-3 bg-card-foreground/5 rounded-md">
                <ApplianceIconRenderer deviceName={reminder.applianceName} className="h-5 w-5 text-accent mr-3 mt-1 shrink-0" />
                <div>
                  <p className="text-sm font-medium">{reminder.applianceName}</p>
                  <p className="text-xs text-muted-foreground">{reminder.rule}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground">No reminders generated yet. Complete your setup for suggestions.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default IntelligentRemindersCard;

"use client";

import type { EnergyPredictionData } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Zap, CalendarDays } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface EnergyPredictionCardProps {
  data: EnergyPredictionData | null;
  isLoading: boolean;
}

const EnergyPredictionCard: React.FC<EnergyPredictionCardProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="mr-2 h-6 w-6 text-primary" />
            Energy Prediction
          </CardTitle>
          <CardDescription>Estimated daily and monthly usage.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
          <Skeleton className="h-8 w-1/2" />
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="mr-2 h-6 w-6 text-primary" />
            Energy Prediction
          </CardTitle>
          <CardDescription>No prediction data available. Configure your home and appliances.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Please provide home configuration and appliance details to get predictions.</p>
        </CardContent>
      </Card>
    );
  }

  const currencySymbol = data.currency || '$';

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <Zap className="mr-2 h-6 w-6 text-primary" />
          Energy Prediction
        </CardTitle>
        <CardDescription>Estimated daily and monthly energy usage and costs.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col space-y-1 rounded-lg border p-4 bg-card-foreground/5">
            <p className="text-sm font-medium text-muted-foreground flex items-center">
              <CalendarDays className="mr-2 h-4 w-4" /> Daily Usage
            </p>
            <p className="text-2xl font-bold">{data.dailyEnergyUsagePrediction.toFixed(2)} kWh</p>
            <p className="text-xs text-muted-foreground">
              Est. Cost: {currencySymbol}{data.estimatedDailyCost.toFixed(2)}
            </p>
          </div>
          <div className="flex flex-col space-y-1 rounded-lg border p-4 bg-card-foreground/5">
            <p className="text-sm font-medium text-muted-foreground flex items-center">
              <CalendarDays className="mr-2 h-4 w-4" /> Monthly Usage
            </p>
            <p className="text-2xl font-bold">{data.monthlyEnergyUsagePrediction.toFixed(2)} kWh</p>
            <p className="text-xs text-muted-foreground">
              Est. Cost: {currencySymbol}{data.estimatedMonthlyCost.toFixed(2)}
            </p>
          </div>
        </div>
        
        <div className={`flex items-center p-4 rounded-md ${data.isWithinGoal ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
          {data.isWithinGoal ? <TrendingDown className="mr-3 h-6 w-6" /> : <TrendingUp className="mr-3 h-6 w-6" />}
          <p className="text-sm font-semibold">
            {data.isWithinGoal
              ? `Your estimated monthly cost is within your goal!`
              : `Your estimated monthly cost exceeds your goal.`}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnergyPredictionCard;

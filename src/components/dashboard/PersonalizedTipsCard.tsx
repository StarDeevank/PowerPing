"use client";

import type { DisplayPersonalizedTip } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Lightbulb, Zap } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface PersonalizedTipsCardProps {
  tips: DisplayPersonalizedTip[];
  isLoading: boolean;
}

const PersonalizedTipsCard: React.FC<PersonalizedTipsCardProps> = ({ tips, isLoading }) => {
  if (isLoading) {
    return (
       <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Lightbulb className="mr-2 h-6 w-6 text-primary" />
            Personalized Energy Tips
          </CardTitle>
          <CardDescription>AI-powered suggestions to save energy.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[...Array(3)].map((_, index) => (
            <Skeleton key={index} className="h-10 w-full rounded-md" />
          ))}
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <Lightbulb className="mr-2 h-6 w-6 text-primary" />
          Personalized Energy Tips
        </CardTitle>
        <CardDescription>AI-powered suggestions tailored to your usage.</CardDescription>
      </CardHeader>
      <CardContent>
        {tips.length > 0 ? (
          <ul className="space-y-3">
            {tips.map((tip) => (
              <li key={tip.id} className="flex items-start p-3 bg-card-foreground/5 rounded-md">
                <Zap className="h-5 w-5 text-accent mr-3 mt-1 shrink-0" />
                <p className="text-sm">{tip.text}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground">No tips available. Configure your setup for personalized advice.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default PersonalizedTipsCard;


"use client";

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltipContent } from '@/components/ui/chart'; // Assuming these are available from shadcn

// Mock data for daily energy consumption for the last 7 days
const mockDailyData = [
  { day: 'Mon', consumption: 5.2 },
  { day: 'Tue', consumption: 6.1 },
  { day: 'Wed', consumption: 4.5 },
  { day: 'Thu', consumption: 5.8 },
  { day: 'Fri', consumption: 6.5 },
  { day: 'Sat', consumption: 7.0 },
  { day: 'Sun', consumption: 6.3 },
];

// Mock data for weekly energy consumption for the last 4 weeks
const mockWeeklyData = [
  { week: 'Week 1', consumption: 35 },
  { week: 'Week 2', consumption: 42 },
  { week: 'Week 3', consumption: 38 },
  { week: 'Week 4', consumption: 40 },
];

const chartConfig = {
  consumption: {
    label: "Consumption (kWh)",
    color: "hsl(var(--primary))", // Electric Blue
  },
} satisfies ChartConfig;

interface EnergyConsumptionChartProps {
  timePeriod?: 'daily' | 'weekly';
}

const EnergyConsumptionChart: React.FC<EnergyConsumptionChartProps> = ({ timePeriod = 'daily' }) => {
  const data = timePeriod === 'daily' ? mockDailyData : mockWeeklyData;
  const dataKey = timePeriod === 'daily' ? 'day' : 'week';

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Energy Consumption</CardTitle>
        <CardDescription>
          Your {timePeriod} energy usage overview.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart 
            data={data}
            margin={{
                top: 5,
                right: 10, // Adjusted for better fit
                left: -10, // Adjusted for better fit
                bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey={dataKey}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `${value} kWh`}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            />
            <Tooltip
              cursor={{ fill: 'hsl(var(--accent) / 0.2)', radius: 'var(--radius)' }}
              content={<ChartTooltipContent indicator="dot" />}
              wrapperStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)'}}
              labelStyle={{color: 'hsl(var(--popover-foreground))'}}
              itemStyle={{color: 'hsl(var(--popover-foreground))'}}
            />
            <Bar dataKey="consumption" fill="var(--color-consumption)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default EnergyConsumptionChart;

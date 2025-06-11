
"use client";

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import type { DailyRecords } from '@/types';
import { format, subDays, parseISO } from 'date-fns';

const chartConfig = {
  consumption: {
    label: "Consumption (kWh)",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

interface EnergyConsumptionChartProps {
  dailyRecords: DailyRecords;
  endDate: Date; // Renamed from selectedDate, always represents 'today' or the end of the period
  daysToShow?: number;
}

const EnergyConsumptionChart: React.FC<EnergyConsumptionChartProps> = ({ dailyRecords, endDate, daysToShow = 7 }) => {
  const chartData = React.useMemo(() => {
    const data = [];
    for (let i = 0; i < daysToShow; i++) {
      const dateToFetch = subDays(endDate, i);
      const dateKey = format(dateToFetch, 'yyyy-MM-dd');
      const record = dailyRecords[dateKey];
      data.push({
        day: format(dateToFetch, 'MMM d'), 
        shortDay: format(dateToFetch, 'EEE'), 
        consumption: record ? record.totalKWh : 0, 
      });
    }
    return data.reverse(); 
  }, [dailyRecords, endDate, daysToShow]);

  const noDataAvailable = chartData.every(d => d.consumption === 0);

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Energy Consumption History</CardTitle>
        <CardDescription>
          Your daily energy usage for the last {daysToShow} recorded days (ending today).
        </CardDescription>
      </CardHeader>
      <CardContent>
        {noDataAvailable ? (
           <div className="flex items-center justify-center h-[300px]">
             <p className="text-muted-foreground">No consumption data recorded for this period.</p>
           </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <BarChart
              data={chartData}
              margin={{
                top: 5,
                right: 10,
                left: -10,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => `${value.toFixed(1)} kWh`}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                domain={[0, 'dataMax + 1']} 
              />
              <Tooltip
                cursor={{ fill: 'hsl(var(--accent) / 0.2)', radius: 'var(--radius)' }}
                content={<ChartTooltipContent indicator="dot" formatter={(value) => `${Number(value).toFixed(2)} kWh`}/>}
                wrapperStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)'}}
                labelStyle={{color: 'hsl(var(--popover-foreground))'}}
                itemStyle={{color: 'hsl(var(--popover-foreground))'}}
              />
              <Bar dataKey="consumption" fill="var(--color-consumption)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default EnergyConsumptionChart;

    
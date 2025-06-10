
"use client";

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

interface LiveWattageDataPoint {
  time: number; // A sequence number or timestamp
  wattage: number;
}

interface LiveWattageChartProps {
  data: LiveWattageDataPoint[];
}

const chartConfig = {
  wattage: {
    label: "Wattage (W)",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

const LiveWattageChart: React.FC<LiveWattageChartProps> = ({ data }) => {
  return (
    <Card className="shadow-lg col-span-1 md:col-span-3">
      <CardHeader>
        <CardTitle>Live Wattage Trend</CardTitle>
        <CardDescription>
          Real-time power consumption over the last few readings.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 10,
              left: -10,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="time"
              type="number"
              domain={['dataMin', 'dataMax']}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              tickFormatter={(value) => `${value}`} // Show sequence number
            />
            <YAxis
              dataKey="wattage"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `${value}W`}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              domain={['auto', 'auto']}
            />
            <Tooltip
              cursor={{ fill: 'hsl(var(--accent) / 0.2)', radius: 'var(--radius)' }}
              content={<ChartTooltipContent indicator="line" />}
              wrapperStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)'}}
              labelStyle={{color: 'hsl(var(--popover-foreground))'}}
              itemStyle={{color: 'hsl(var(--popover-foreground))'}}
            />
            <Line
              type="monotone"
              dataKey="wattage"
              stroke="var(--color-wattage)"
              strokeWidth={2}
              dot={false}
              isAnimationActive={true}
              animationDuration={300}
            />
          </LineChart>
        </ChartContainer>
         {data.length === 0 && (
          <p className="text-center text-muted-foreground mt-4">Waiting for data...</p>
        )}
      </CardContent>
    </Card>
  );
};

export default LiveWattageChart;


"use client";

import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { RealTimeDataPoint } from '@/types';
import { Pause, Play } from 'lucide-react';
import { ChartConfig, ChartContainer, ChartTooltipContent } from '@/components/ui/chart';


const MAX_DATA_POINTS = 30; // Number of data points to show on the chart at once

const chartConfig = {
  value: {
    label: "Value",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export default function RealTimeGraph() {
  const [data, setData] = useState<RealTimeDataPoint[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const dataCounterRef = useRef(0);

  useEffect(() => {
    if (isPaused) {
      return;
    }

    const interval = setInterval(() => {
      setData(prevData => {
        const newDataPoint: RealTimeDataPoint = {
          time: dataCounterRef.current++,
          value: Math.floor(Math.random() * 100) + 50, // Simulate data between 50-150
        };
        const updatedData = [...prevData, newDataPoint];
        if (updatedData.length > MAX_DATA_POINTS) {
          return updatedData.slice(updatedData.length - MAX_DATA_POINTS);
        }
        return updatedData;
      });
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, [isPaused]);

  const handleTogglePause = () => {
    setIsPaused(!isPaused);
  };

  return (
    <Card className="shadow-lg w-full">
      <CardHeader>
        <CardTitle>Real-Time Data Stream</CardTitle>
        <CardDescription>Live updating graph showcasing simulated data.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Button onClick={handleTogglePause} variant="outline" size="sm">
            {isPaused ? <Play className="mr-2 h-4 w-4" /> : <Pause className="mr-2 h-4 w-4" />}
            {isPaused ? 'Resume' : 'Pause'}
          </Button>
        </div>
        <div className="h-[300px] w-full">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <LineChart
              data={data}
              margin={{
                top: 5,
                right: 20,
                left: -10, // Adjust to make Y-axis labels more visible
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="time" 
                type="number" 
                domain={['dataMin', 'dataMax']}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis 
                domain={['auto', 'auto']} 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                stroke="hsl(var(--muted-foreground))"
              />
              <Tooltip
                cursor={{ stroke: 'hsl(var(--border))', strokeWidth: 1 }}
                content={<ChartTooltipContent indicator="line" />}
              />
              <Legend verticalAlign="top" wrapperStyle={{fontSize: "12px"}} />
              <Line
                type="monotone"
                dataKey="value"
                stroke={chartConfig.value.color}
                strokeWidth={2}
                dot={false}
                isAnimationActive={true}
                animationDuration={300} // Smooth transition for new points
              />
            </LineChart>
          </ChartContainer>
        </div>
        {data.length === 0 && !isPaused && (
          <p className="text-center text-muted-foreground mt-4">Generating data...</p>
        )}
      </CardContent>
    </Card>
  );
}

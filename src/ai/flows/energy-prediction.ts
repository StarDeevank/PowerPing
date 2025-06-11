
'use server';

/**
 * @fileOverview Predicts daily and monthly energy usage based on appliance usage and monthly electricity bill goal.
 *
 * - predictEnergyUsage - A function that predicts energy usage.
 * - EnergyPredictionInput - The input type for the predictEnergyUsage function.
 * - EnergyPredictionOutput - The return type for the predictEnergyUsage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EnergyPredictionInputSchema = z.object({
  appliances: z
    .array(
      z.object({
        deviceName: z.string().describe('Name of the appliance.'),
        room: z.string().describe('Room where the appliance is located.'),
        // applianceType: z.string().describe('Category/type of the appliance (e.g., Light, Fan, AC).'), // Removed
        powerRating: z.number().optional().describe('Power rating of the appliance in Watts (if known).'),
        estimatedDailyUsage: z.number().describe('Estimated daily usage in hours.'),
        status: z.boolean().describe('Whether the appliance is currently on or off.'),
      })
    )
    .describe('List of appliances in the home.'),
  monthlyElectricityBillGoal: z.number().describe('Monthly electricity bill goal in ₹ or $.'),
  currency: z.string().describe('Currency of the monthly electricity bill goal (₹ or $).'),
});
export type EnergyPredictionInput = z.infer<typeof EnergyPredictionInputSchema>;

const EnergyPredictionOutputSchema = z.object({
  dailyEnergyUsagePrediction: z.number().describe('Predicted daily energy usage in kWh.'),
  monthlyEnergyUsagePrediction: z.number().describe('Predicted monthly energy usage in kWh.'),
  estimatedDailyCost: z.number().describe('Estimated daily cost of energy usage in chosen currency.'),
  estimatedMonthlyCost: z.number().describe('Estimated monthly cost of energy usage in chosen currency.'),
  isWithinGoal: z
    .boolean()
    .describe('Whether the predicted monthly cost is within the user specified monthly goal.'),
});
export type EnergyPredictionOutput = z.infer<typeof EnergyPredictionOutputSchema>;

export async function predictEnergyUsage(input: EnergyPredictionInput): Promise<EnergyPredictionOutput> {
  return predictEnergyUsageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'energyPredictionPrompt',
  input: {schema: EnergyPredictionInputSchema},
  output: {schema: EnergyPredictionOutputSchema},
  prompt: `You are an energy consumption expert. Analyze the following data to predict daily and monthly energy usage and costs.

Appliances:
{{#each appliances}}
- Device: {{{deviceName}}}
  Room: {{{room}}}
  {{#if powerRating}}Power Rating: {{{powerRating}}} Watts (Use this value for calculation if provided.){{else}}Power Rating: Not specified (Estimate based on device name and typical consumption patterns. Be conservative if unsure.){{/if}}
  Usage: {{{estimatedDailyUsage}}} hours
  Status: {{#if status}}On{{else}}Off{{/if}}
{{/each}}

Monthly Electricity Bill Goal: {{{currency}}} {{{monthlyElectricityBillGoal}}}

Based on this information, provide:
- dailyEnergyUsagePrediction (kWh)
- monthlyEnergyUsagePrediction (kWh)
- estimatedDailyCost ({{{currency}}})
- estimatedMonthlyCost ({{{currency}}})
- isWithinGoal (true/false, based on whether the estimated monthly cost is within the monthlyElectricityBillGoal)

Instructions for estimation:
1.  If 'powerRating' IS provided by the user, prioritize that value for calculating energy consumption (Power in kW * Hours).
2.  If 'powerRating' is NOT provided, infer the type of appliance from its 'deviceName' (e.g., "Living Room Fan", "Bedroom AC", "Study Lamp").
3.  Based on the inferred type and typical power consumption for such appliances, estimate a power rating in Watts. Use common household appliance wattages (e.g., Fan: 50-75W, LED Light: 5-15W, AC: 1000-2000W, Refrigerator: 100-200W, TV: 50-150W). If the deviceName is ambiguous, use a conservative estimate or state if estimation is difficult.
4.  Assume an average electricity cost of {{{currency}}}7/kWh for INR (₹) and {{{currency}}}0.15/kWh for USD ($).
5.  Calculate daily energy usage (kWh) for each appliance and sum them up.
6.  Calculate monthly energy usage (kWh) by multiplying daily usage by 30.
7.  Calculate daily and monthly costs based on the total kWh and the assumed electricity cost.
Ensure that the output is accurate and follows the specified units and currency.
`,
});

const predictEnergyUsageFlow = ai.defineFlow(
  {
    name: 'predictEnergyUsageFlow',
    inputSchema: EnergyPredictionInputSchema,
    outputSchema: EnergyPredictionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

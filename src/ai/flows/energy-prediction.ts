
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
  // homeSize: z.string().describe('Size of the home (e.g., 1BHK, 2BHK).'), // Removed
  // numberOfRooms: z.number().describe('Number of rooms in the home.'), // Removed
  appliances: z
    .array(
      z.object({
        deviceName: z.string().describe('Name of the appliance.'),
        room: z.string().describe('Room where the appliance is located.'),
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

Appliances: {{#each appliances}}- Device: {{{deviceName}}}, Room: {{{room}}}, Usage: {{{estimatedDailyUsage}}} hours, Status: {{#if status}}On{{else}}Off{{/if}}\n{{/each}}
Monthly Electricity Bill Goal: {{{currency}}} {{{monthlyElectricityBillGoal}}}

Based on this information, provide:
- dailyEnergyUsagePrediction (kWh)
- monthlyEnergyUsagePrediction (kWh)
- estimatedDailyCost ({{{currency}}})
- estimatedMonthlyCost ({{{currency}}})
- isWithinGoal (true/false, based on whether the estimated monthly cost is within the monthlyElectricityBillGoal)

Ensure that the output is accurate and follows the specified units and currency. Consider typical power ratings for common household appliances when making predictions.
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



'use server';

/**
 * @fileOverview Personalized energy-saving tips AI agent.
 *
 * - generatePersonalizedTips - A function that generates personalized energy-saving tips.
 * - PersonalizedTipsInput - The input type for the generatePersonalizedTips function.
 * - PersonalizedTipsOutput - The return type for the generatePersonalizedTips function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedTipsInputSchema = z.object({
  // homeSize: z
  //   .string()
  //   .describe('The size of the home (e.g., 1BHK, 2BHK, 3BHK).'), // Removed
  // numberOfRooms: z.number().describe('The number of rooms in the home.'), // Removed
  appliances: z
    .array(
      z.object({
        deviceName: z.string().describe('The name of the appliance.'),
        room: z.string().describe('The room where the appliance is located.'),
        estimatedDailyUsage: z
          .number()
          .describe('The estimated daily usage of the appliance in hours.'),
        status: z.boolean().describe('The status of the appliance (on or off).'),
      })
    )
    .describe('A list of appliances in the home.'),
  monthlyElectricityBillGoal: z
    .number()
    .describe('The user s monthly electricity bill goal in their local currency.'),
});
export type PersonalizedTipsInput = z.infer<typeof PersonalizedTipsInputSchema>;

const PersonalizedTipsOutputSchema = z.object({
  tips: z
    .array(z.string())
    .describe('A list of personalized energy-saving tips.'),
});
export type PersonalizedTipsOutput = z.infer<typeof PersonalizedTipsOutputSchema>;

export async function generatePersonalizedTips(
  input: PersonalizedTipsInput
): Promise<PersonalizedTipsOutput> {
  return personalizedTipsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedTipsPrompt',
  input: {schema: PersonalizedTipsInputSchema},
  output: {schema: PersonalizedTipsOutputSchema},
  prompt: `You are an AI assistant that provides personalized energy-saving tips based on the user's appliance usage patterns and energy goals.

  Appliances:
  {{#each appliances}}
  - Device Name: {{{deviceName}}}, Room: {{{room}}}, Estimated Daily Usage: {{{estimatedDailyUsage}}} hours, Status: {{#if status}}On{{else}}Off{{/if}}
  {{/each}}
  Monthly Electricity Bill Goal: {{{monthlyElectricityBillGoal}}}

  Generate a list of personalized energy-saving tips. These tips should be specific to the user's situation and actionable.
  Crucially, tailor your tips to the specific types of appliances listed (using the "Device Name"). For example, if a 'Geyser' or 'Water Heater' is listed with high usage, suggest tips relevant to water heating efficiency. If an 'Air Conditioner' or 'AC' is listed, provide advice for AC efficiency, like cleaning filters or using a programmable thermostat. If 'Lights' or 'Lamps' are mentioned, suggest using LED bulbs or turning them off in unused rooms. Avoid generic advice; make each tip relevant to one or more of the user's actual appliances and their usage patterns.

  Tips:
  `,
});

const personalizedTipsFlow = ai.defineFlow(
  {
    name: 'personalizedTipsFlow',
    inputSchema: PersonalizedTipsInputSchema,
    outputSchema: PersonalizedTipsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);


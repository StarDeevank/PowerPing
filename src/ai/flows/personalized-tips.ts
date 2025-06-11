
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
  appliances: z
    .array(
      z.object({
        deviceName: z.string().describe('The name of the appliance.'),
        room: z.string().describe('The room where the appliance is located.'),
        // applianceType: z.string().describe('Category/type of the appliance (e.g., Light, Fan, AC).'), // Removed
        powerRating: z.number().optional().describe('Power rating of the appliance in Watts (if known).'),
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
- Device Name: {{{deviceName}}}
  Room: {{{room}}}
  {{#if powerRating}}Power Rating: {{{powerRating}}} Watts{{/if}}
  Estimated Daily Usage: {{{estimatedDailyUsage}}} hours
  Status: {{#if status}}On{{else}}Off{{/if}}
{{/each}}

Monthly Electricity Bill Goal: {{{monthlyElectricityBillGoal}}}

Generate a list of personalized energy-saving tips. These tips should be specific to the user's situation and actionable.
Crucially, tailor your tips to the specific appliance by inferring its type from the 'deviceName'. For example, if 'deviceName' includes "Air Conditioner" or "AC", provide advice for AC efficiency, like cleaning filters or using a programmable thermostat. If 'deviceName' suggests a "Geyser" or "Water Heater" and it has high usage, suggest tips relevant to water heating efficiency. If 'deviceName' includes "Light" or "Lamp", suggest using LED bulbs or turning them off in unused rooms. If a 'powerRating' is provided, you can incorporate it into the tip (e.g., "Your {{{powerRating}}}W AC...").
Avoid generic advice; make each tip relevant to one or more of the user's actual appliances by understanding the device from its name and usage patterns.
If a device name is ambiguous (e.g., "My Gadget"), provide a more general tip related to its usage hours or power rating if available.

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

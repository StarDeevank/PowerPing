
// src/ai/flows/intelligent-reminders.ts
'use server';

/**
 * @fileOverview A flow for generating intelligent reminder rules based on home configuration and usage settings.
 *
 * - generateReminderRules - A function that generates reminder rules for appliances.
 * - GenerateReminderRulesInput - The input type for the generateReminderRules function.
 * - GenerateReminderRulesOutput - The return type for the generateReminderRules function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateReminderRulesInputSchema = z.object({
  appliances: z
    .array(
      z.object({
        deviceName: z.string().describe('Name of the appliance (e.g., Geyser, AC, Fan).'),
        room: z.string().describe('Room where the appliance is located (e.g., Bedroom, Living Room).'),
        applianceType: z.string().describe('Category/type of the appliance (e.g., Light, Fan, AC).'),
        powerRating: z.number().optional().describe('Power rating of the appliance in Watts (if known).'),
        estimatedDailyUsage: z
          .number()
          .positive()
          .describe('Estimated daily usage of the appliance in hours.'),
      })
    )
    .describe('List of appliances in the home and their usage.'),
  monthlyElectricityBillGoal: z
    .number()
    .positive()
    .describe('The user defined monthly electricity bill goal.'),
});

export type GenerateReminderRulesInput = z.infer<typeof GenerateReminderRulesInputSchema>;

const GenerateReminderRulesOutputSchema = z.object({
  reminderRules: z
    .array(
      z.object({
        applianceName: z.string().describe('Name of the appliance for the reminder.'),
        rule: z.string().describe('The reminder rule (e.g., Turn off geyser after 30 minutes).'),
      })
    )
    .describe('List of reminder rules for appliances.'),
});

export type GenerateReminderRulesOutput = z.infer<typeof GenerateReminderRulesOutputSchema>;

export async function generateReminderRules(input: GenerateReminderRulesInput): Promise<GenerateReminderRulesOutput> {
  return generateReminderRulesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateReminderRulesPrompt',
  input: {schema: GenerateReminderRulesInputSchema},
  output: {schema: GenerateReminderRulesOutputSchema},
  prompt: `You are an AI assistant that helps users save energy by generating intelligent reminder rules for their appliances.

  Based on the following appliance usage and energy goals, generate a list of reminder rules. These rules should help the user achieve their monthly electricity bill goal and be specific and actionable.
  Tailor the reminder rules to the specific 'applianceType' and 'deviceName'. For example, a reminder for a 'Fan' (applianceType: {{applianceType}}, deviceName: {{deviceName}}) (e.g., "Turn off fan in {{room}} if unused") might be different from a reminder for an 'Oven' (e.g., "Don't forget to turn off the {{deviceName}} in the {{room}} after use.").
  Consider common energy wasting scenarios for each 'applianceType' and create rules to address them. For instance, suggest turning off lights in unoccupied rooms, or not leaving entertainment devices (like TVs or Game Consoles) on standby for extended periods. If 'powerRating' is available, you can use it to emphasize high-consumption devices.

  Appliances:
  {{#each appliances}}
  - Device: {{deviceName}} (Type: {{applianceType}})
    Room: {{room}}
    {{#if powerRating}}Power Rating: {{powerRating}} Watts{{/if}}
    Estimated Daily Usage: {{estimatedDailyUsage}} hours
  {{/each}}

  Monthly Electricity Bill Goal: {{monthlyElectricityBillGoal}}

  Output the reminder rules in the format specified in the output schema.
  Ensure each rule clearly mentions the appliance it pertains to (using deviceName or applianceType as appropriate).
  `,
});

const generateReminderRulesFlow = ai.defineFlow(
  {
    name: 'generateReminderRulesFlow',
    inputSchema: GenerateReminderRulesInputSchema,
    outputSchema: GenerateReminderRulesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

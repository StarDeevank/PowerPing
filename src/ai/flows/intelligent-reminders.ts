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
  homeSize: z.enum(['1BHK', '2BHK', '3BHK', '4BHK+']).describe('Size of the home (e.g., 1BHK, 2BHK).'),
  numberOfRooms: z.number().int().positive().describe('Number of rooms in the home.'),
  appliances: z
    .array(
      z.object({
        deviceName: z.string().describe('Name of the appliance (e.g., Geyser, AC, Fan).'),
        room: z.string().describe('Room where the appliance is located (e.g., Bedroom, Living Room).'),
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
  prompt: `You are an AI assistant that helps users save energy by generating reminder rules for their appliances.

  Based on the following home configuration and usage settings, generate a list of reminder rules that will help the user achieve their monthly electricity bill goal. The rules should be specific and actionable.

  Home Size: {{homeSize}}
  Number of Rooms: {{numberOfRooms}}
  Appliances: {{#each appliances}}{deviceName} in {room} (Estimated Daily Usage: {{estimatedDailyUsage}} hours){{#unless @last}}, {{/unless}}{{/each}}
  Monthly Electricity Bill Goal: {{monthlyElectricityBillGoal}}

  Consider common energy wasting scenarios and create rules to address them.

  Output the reminder rules in the format specified in the output schema.
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

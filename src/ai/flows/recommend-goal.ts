// RecommendGoal flow implementation.
'use server';
/**
 * @fileOverview A goal recommendation AI agent.
 *
 * - recommendGoal - A function that recommends a goal amount based on a prompt.
 * - RecommendGoalInput - The input type for the recommendGoal function.
 * - RecommendGoalOutput - The return type for the recommendGoal function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecommendGoalInputSchema = z.object({
  prompt: z.string().describe('The prompt describing what the user is saving for.'),
});
export type RecommendGoalInput = z.infer<typeof RecommendGoalInputSchema>;

const RecommendGoalOutputSchema = z.object({
  recommendedGoal: z
    .number()
    .describe(
      'The recommended goal amount based on the prompt, should be one of: 10000, 25000, 50000, 75000.'
    ),
});
export type RecommendGoalOutput = z.infer<typeof RecommendGoalOutputSchema>;

export async function recommendGoal(input: RecommendGoalInput): Promise<RecommendGoalOutput> {
  return recommendGoalFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recommendGoalPrompt',
  input: {schema: RecommendGoalInputSchema},
  output: {schema: RecommendGoalOutputSchema},
  prompt: `You are a financial advisor that helps users set savings goals.

Based on the user's prompt, recommend a savings goal amount. The goal amount must be one of the following: 10000, 25000, 50000, 75000.

Prompt: {{{prompt}}}`,
});

const recommendGoalFlow = ai.defineFlow(
  {
    name: 'recommendGoalFlow',
    inputSchema: RecommendGoalInputSchema,
    outputSchema: RecommendGoalOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

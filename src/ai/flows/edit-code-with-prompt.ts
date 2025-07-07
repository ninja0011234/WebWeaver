'use server';
/**
 * @fileOverview Edits an existing React component and its CSS based on a text prompt.
 *
 * - editCodeWithPrompt - A function that takes existing code and a prompt, and returns modified code.
 * - EditCodeWithPromptInput - The input type for the editCodeWithprompt function.
 * - EditCodeWithPromptOutput - The return type for the editCodeWithPrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EditCodeWithPromptInputSchema = z.object({
  existingComponent: z.string().describe('The existing React component code (JSX).'),
  existingCss: z.string().describe('The existing CSS code for the component.'),
  prompt: z.string().describe('A text prompt describing the changes to make to the code.'),
});
export type EditCodeWithPromptInput = z.infer<typeof EditCodeWithPromptInputSchema>;

const EditCodeWithPromptOutputSchema = z.object({
  modifiedComponent: z.string().describe('The modified React component code (JSX).'),
  modifiedCss: z.string().describe('The modified CSS code.'),
});
export type EditCodeWithPromptOutput = z.infer<typeof EditCodeWithPromptOutputSchema>;

export async function editCodeWithPrompt(input: EditCodeWithPromptInput): Promise<EditCodeWithPromptOutput> {
  return editCodeWithPromptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'editCodeWithPromptPrompt',
  input: {schema: EditCodeWithPromptInputSchema},
  output: {schema: EditCodeWithPromptOutputSchema},
  prompt: `You are a web development expert specializing in React. You will modify the existing React component and CSS based on the user's instructions.

Existing React Component:
{{{existingComponent}}}

Existing CSS:
{{{existingCss}}}

Instructions:
{{{prompt}}}

Return the complete, modified code for both the React component and the CSS, even if one of them is unchanged. The main component must be a functional component named 'App'. Do not include 'import React from "react";' or 'ReactDOM.render'. The output should only be the component code itself.
`,
});

const editCodeWithPromptFlow = ai.defineFlow(
  {
    name: 'editCodeWithPromptFlow',
    inputSchema: EditCodeWithPromptInputSchema,
    outputSchema: EditCodeWithPromptOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);

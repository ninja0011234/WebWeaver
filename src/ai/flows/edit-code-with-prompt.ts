// src/ai/flows/edit-code-with-prompt.ts
'use server';
/**
 * @fileOverview Edits existing code of a web application based on a text prompt.
 *
 * - editCodeWithPrompt - A function that takes existing code and a prompt, and returns modified code.
 * - EditCodeWithPromptInput - The input type for the editCodeWithPrompt function.
 * - EditCodeWithPromptOutput - The return type for the editCodeWithPrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EditCodeWithPromptInputSchema = z.object({
  existingCode: z.string().describe('The existing HTML, CSS, and JavaScript code of the web application.'),
  prompt: z.string().describe('A text prompt describing the changes to make to the code.'),
});
export type EditCodeWithPromptInput = z.infer<typeof EditCodeWithPromptInputSchema>;

const EditCodeWithPromptOutputSchema = z.object({
  modifiedCode: z.string().describe('The modified HTML, CSS, and JavaScript code of the web application.'),
});
export type EditCodeWithPromptOutput = z.infer<typeof EditCodeWithPromptOutputSchema>;

export async function editCodeWithPrompt(input: EditCodeWithPromptInput): Promise<EditCodeWithPromptOutput> {
  return editCodeWithPromptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'editCodeWithPromptPrompt',
  input: {schema: EditCodeWithPromptInputSchema},
  output: {schema: EditCodeWithPromptOutputSchema},
  prompt: `You are a web development expert. You will modify the existing code based on the user's instructions.

Existing Code:
{{{existingCode}}}

Instructions:
{{{prompt}}}

Modified Code:`, 
});

const editCodeWithPromptFlow = ai.defineFlow(
  {
    name: 'editCodeWithPromptFlow',
    inputSchema: EditCodeWithPromptInputSchema,
    outputSchema: EditCodeWithPromptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

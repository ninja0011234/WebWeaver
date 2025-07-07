'use server';
/**
 * @fileOverview Generates a React component and CSS code from a text prompt.
 *
 * - generateCodeFromPrompt - A function that generates code from a prompt.
 * - GenerateCodeFromPromptInput - The input type for the generateCodeFromPrompt function.
 * - GenerateCodeFromPromptOutput - The return type for the generateCodeFromPrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCodeFromPromptInputSchema = z.object({
  prompt: z.string().describe('A text prompt describing the web application component.'),
});
export type GenerateCodeFromPromptInput = z.infer<typeof GenerateCodeFromPromptInputSchema>;

const GenerateCodeFromPromptOutputSchema = z.object({
  reactComponent: z.string().describe('The generated React component code (JSX). The main component must be named `App`. Do not include `import React from "react";`.'),
  css: z.string().describe('The generated CSS code for the component.'),
});
export type GenerateCodeFromPromptOutput = z.infer<typeof GenerateCodeFromPromptOutputSchema>;

export async function generateCodeFromPrompt(
  input: GenerateCodeFromPromptInput
): Promise<GenerateCodeFromPromptOutput> {
  return generateCodeFromPromptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCodeFromPromptPrompt',
  input: {schema: GenerateCodeFromPromptInputSchema},
  output: {schema: GenerateCodeFromPromptOutputSchema},
  prompt: `You are an expert React developer who can generate a single React functional component and CSS based on a text prompt.

  - The main component must be a functional component named 'App' and should use React hooks.
  - Do NOT include 'import React from "react";' or 'ReactDOM.render'. The output should only be the component code itself.
  - Provide the React component code and the CSS code as separate strings in the output.

  Text Prompt: {{{prompt}}}`,
});

const generateCodeFromPromptFlow = ai.defineFlow(
  {
    name: 'generateCodeFromPromptFlow',
    inputSchema: GenerateCodeFromPromptInputSchema,
    outputSchema: GenerateCodeFromPromptOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);

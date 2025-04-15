'use server';
/**
 * @fileOverview An ingredient identification AI agent.
 *
 * - identifyIngredients - A function that handles the ingredient identification process.
 * - IdentifyIngredientsInput - The input type for the identifyIngredients function.
 * - IdentifyIngredientsOutput - The return type for the identifyIngredients function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const IdentifyIngredientsInputSchema = z.object({
  photoUrl: z.string().describe('The URL of the ingredients photo.'),
});
export type IdentifyIngredientsInput = z.infer<typeof IdentifyIngredientsInputSchema>;

const IdentifiedIngredientSchema = z.object({
  name: z.string().describe('The name of the identified ingredient.'),
  quantity: z.string().describe('The approximate quantity of the ingredient.'),
});

const IdentifyIngredientsOutputSchema = z.array(IdentifiedIngredientSchema);
export type IdentifyIngredientsOutput = z.infer<typeof IdentifyIngredientsOutputSchema>;

export async function identifyIngredients(input: IdentifyIngredientsInput): Promise<IdentifyIngredientsOutput> {
  return identifyIngredientsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'identifyIngredientsPrompt',
  input: {
    schema: z.object({
      photoUrl: z.string().describe('The URL of the ingredients photo.'),
    }),
  },
  output: {
    schema: z.array(z.object({
      name: z.string().describe('The name of the identified ingredient.'),
      quantity: z.string().describe('The approximate quantity of the ingredient.'),
    })),
  },
  prompt: `You are an expert chef.  You will analyze the photo and identify the ingredients and their approximate quantities.

Photo: {{media url=photoUrl}}

Respond with a JSON array of objects with the ingredient name, and approximate quantity.
`,
});

const identifyIngredientsFlow = ai.defineFlow<
  typeof IdentifyIngredientsInputSchema,
  typeof IdentifyIngredientsOutputSchema
>({
  name: 'identifyIngredientsFlow',
  inputSchema: IdentifyIngredientsInputSchema,
  outputSchema: IdentifyIngredientsOutputSchema,
}, async input => {
  const {output} = await prompt(input);
  return output!;
});

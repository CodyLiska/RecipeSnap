// @ts-nocheck
'use server';
/**
 * @fileOverview Recipe suggestion flow. It takes a list of ingredients and suggests recipes.
 *
 * - suggestRecipes - A function that handles the recipe suggestion process.
 * - SuggestRecipesInput - The input type for the suggestRecipes function.
 * - SuggestRecipesOutput - The return type for the suggestRecipes function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const SuggestRecipesInputSchema = z.object({
  ingredients: z
    .array(
      z.object({
        name: z.string().describe('The name of the ingredient.'),
        quantity: z.string().optional().describe('The quantity of the ingredient.'),
      })
    )
    .describe('The list of ingredients identified from the image.'),
});
export type SuggestRecipesInput = z.infer<typeof SuggestRecipesInputSchema>;

const SuggestRecipesOutputSchema = z.array(
  z.object({
    name: z.string().describe('The name of the recipe.'),
    description: z.string().describe('A short description of the recipe.'),
    url: z.string().url().describe('The URL of the recipe.'),
    missingIngredients: z.array(z.string()).describe('The list of missing ingredients.'),
  })
);
export type SuggestRecipesOutput = z.infer<typeof SuggestRecipesOutputSchema>;

export async function suggestRecipes(input: SuggestRecipesInput): Promise<SuggestRecipesOutput> {
  return suggestRecipesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestRecipesPrompt',
  input: {
    schema: z.object({
      ingredients: z
        .array(
          z.object({
            name: z.string().describe('The name of the ingredient.'),
            quantity: z.string().optional().describe('The quantity of the ingredient.'),
          })
        )
        .describe('The list of ingredients identified from the image.'),
    }),
  },
  output: {
    schema: z.array(
      z.object({
        name: z.string().describe('The name of the recipe.'),
        description: z.string().describe('A short description of the recipe.'),
        url: z.string().url().describe('The URL of the recipe.'),
        missingIngredients: z.array(z.string()).describe('The list of missing ingredients.'),
      })
    ),
  },
  prompt: `You are a recipe suggestion AI. Given a list of ingredients, you will suggest recipes that can be made with those ingredients.
Prioritize recipes with fewer missing ingredients.

Ingredients:
{{#each ingredients}}
- {{name}} {{quantity}}
{{/each}}

Recipes:`,
});

const suggestRecipesFlow = ai.defineFlow<
  typeof SuggestRecipesInputSchema,
  typeof SuggestRecipesOutputSchema
>({
  name: 'suggestRecipesFlow',
  inputSchema: SuggestRecipesInputSchema,
  outputSchema: SuggestRecipesOutputSchema,
},
async input => {
  const {output} = await prompt(input);
  return output!;
});

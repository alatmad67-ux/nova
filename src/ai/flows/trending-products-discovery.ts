'use server';
/**
 * @fileOverview A Genkit flow for identifying trending products in Iraq based on seasonal and regional data.
 *
 * - trendingProductsDiscovery - A function that suggests trending products.
 * - TrendingProductsDiscoveryInput - The input type for the trendingProductsDiscovery function.
 * - TrendingProductsDiscoveryOutput - The return type for the trendingProductsDiscovery function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Input Schema
const TrendingProductsDiscoveryInputSchema = z.object({
  season: z
    .string()
    .describe('The current season or cultural event (e.g., "Summer", "Winter", "Eid al-Fitr").'),
  region: z
    .string()
    .describe(
      'The specific region in Iraq to analyze trends for (e.g., "Baghdad", "Basra", "Kurdistan").'
    ),
  currentDate: z
    .string()
    .describe('The current date in YYYY-MM-DD format, used for temporal context.'),
});
export type TrendingProductsDiscoveryInput = z.infer<
  typeof TrendingProductsDiscoveryInputSchema
>;

// Output Schema
const TrendingProductSchema = z.object({
  name: z.string().describe('The name of the trending product.'),
  description: z
    .string()
    .describe('A brief description of why this product is trending.'),
  reasonForTrending: z
    .string()
    .describe(
      'A concise explanation of the current trend (e.g., "popular for Eid gifts", "high demand due to hot weather").'
    ),
  categories: z
    .array(z.string())
    .describe('A list of relevant categories for the product (e.g., "Electronics", "Fashion", "Home Goods").'),
});

const TrendingProductsDiscoveryOutputSchema = z.object({
  trendingProducts: z
    .array(TrendingProductSchema)
    .describe('A list of products currently trending in the specified region and season.'),
});
export type TrendingProductsDiscoveryOutput = z.infer<
  typeof TrendingProductsDiscoveryOutputSchema
>;

// Wrapper function
export async function trendingProductsDiscovery(
  input: TrendingProductsDiscoveryInput
): Promise<TrendingProductsDiscoveryOutput> {
  return trendingProductsDiscoveryFlow(input);
}

// Prompt definition
const trendingProductsDiscoveryPrompt = ai.definePrompt({
  name: 'trendingProductsDiscoveryPrompt',
  input: { schema: TrendingProductsDiscoveryInputSchema },
  output: { schema: TrendingProductsDiscoveryOutputSchema },
  prompt: `You are an expert market analyst specializing in consumer trends within Iraq.
Your task is to identify and suggest a list of currently popular and trending products in Iraq.

Consider the following contextual information:
- Current Season/Event: {{{season}}}
- Region of Focus: {{{region}}}
- Current Date: {{{currentDate}}}

Based on this information, provide a list of 3-5 trending products that would be highly sought after by shoppers in the specified region and season. For each product, include its name, a brief description, the primary reason it is trending, and relevant categories.

The output must be a JSON object conforming to the specified schema.`,
});

// Flow definition
const trendingProductsDiscoveryFlow = ai.defineFlow(
  {
    name: 'trendingProductsDiscoveryFlow',
    inputSchema: TrendingProductsDiscoveryInputSchema,
    outputSchema: TrendingProductsDiscoveryOutputSchema,
  },
  async (input) => {
    const { output } = await trendingProductsDiscoveryPrompt(input);
    return output!;
  }
);

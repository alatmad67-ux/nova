'use server';
/**
 * @fileOverview An AI agent for intelligent product search that understands Iraqi dialect.
 *
 * - intelligentProductSearch - A function that handles the intelligent product search process.
 * - IntelligentProductSearchInput - The input type for the intelligentProductSearch function.
 * - IntelligentProductSearchOutput - The return type for the intelligentProductSearch function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IntelligentProductSearchInputSchema = z.object({
  query: z.string().describe('The user\'s search query, potentially in Iraqi dialect.'),
});
export type IntelligentProductSearchInput = z.infer<typeof IntelligentProductSearchInputSchema>;

const IntelligentProductSearchOutputSchema = z.object({
  keywords: z.array(z.string()).describe('A list of standardized keywords extracted from the query, suitable for product database search. These should be in English and normalized (e.g., "mobile phone" instead of "موبايل").'),
  intent: z.string().describe('The user\'s primary intent from the query (e.g., "buy", "browse", "compare price", "find details").'),
  originalLanguageKeywords: z.array(z.string()).describe('A list of the original keywords from the query in the language they were provided, for reference.')
});
export type IntelligentProductSearchOutput = z.infer<typeof IntelligentProductSearchOutputSchema>;

export async function intelligentProductSearch(input: IntelligentProductSearchInput): Promise<IntelligentProductSearchOutput> {
  return intelligentProductSearchFlow(input);
}

const intelligentProductSearchPrompt = ai.definePrompt({
  name: 'intelligentProductSearchPrompt',
  input: {schema: IntelligentProductSearchInputSchema},
  output: {schema: IntelligentProductSearchOutputSchema},
  prompt: `You are an intelligent product search assistant for Nahrain Shop, an e-commerce platform in Iraq. Your main goal is to accurately interpret user search queries, especially those in Iraqi dialect, and extract standardized keywords and the user's intent.\n\nThe output keywords should be standardized, English terms suitable for a product database search (e.g., "mobile phone", "men's clothing", "PlayStation 5").\nThe intent should be a concise phrase describing the user's goal (e.g., "buy", "browse", "compare price", "find details").\nAlso, extract the main keywords in their original language for reference.\n\nHere are some examples to guide you:\n- Query: "اريد موبايل زين ورخيص" (I want a good and cheap mobile)\n  - keywords: ["mobile phone", "affordable"]\n  - intent: "buy"\n  - originalLanguageKeywords: ["موبايل", "زين", "رخيص"]\n- Query: "وين الكه ملابس رجالية حلوة" (Where can I find nice men's clothes)\n  - keywords: ["men's clothing", "stylish"]\n  - intent: "browse"\n  - originalLanguageKeywords: ["ملابس رجالية", "حلوة"]\n- Query: "سعر بلاي ستيشن 5" (PlayStation 5 price)\n  - keywords: ["PlayStation 5", "price"]\n  - intent: "compare price"\n  - originalLanguageKeywords: ["بلاي ستيشن 5", "سعر"]\n- Query: "اكسسوارات نسائية فخمة" (Luxurious women's accessories)\n  - keywords: ["women's accessories", "luxury"]\n  - intent: "browse"\n  - originalLanguageKeywords: ["اكسسوارات نسائية", "فخمة"]\n- Query: "شاحن سامسونج اصلي" (Original Samsung charger)\n  - keywords: ["Samsung charger", "original"]\n  - intent: "buy"\n  - originalLanguageKeywords: ["شاحن", "سامسونج", "اصلي"]\n\nNow, process the following user query:\nUser Query: {{{query}}}`,
});

const intelligentProductSearchFlow = ai.defineFlow(
  {
    name: 'intelligentProductSearchFlow',
    inputSchema: IntelligentProductSearchInputSchema,
    outputSchema: IntelligentProductSearchOutputSchema,
  },
  async (input) => {
    const {output} = await intelligentProductSearchPrompt(input);
    return output!;
  }
);

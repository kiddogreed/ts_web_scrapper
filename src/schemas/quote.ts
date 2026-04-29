import { z } from 'zod';

/**
 * Teaching Note:
 * Using Zod for schema validation ensures that every quote extracted matches the expected structure.
 * This is critical for AI-driven workflows because it guarantees data integrity, prevents silent type errors,
 * and provides clear, actionable feedback if the website structure changes. This is the foundation for resilient,
 * production-grade scraping and is a "Gold Standard" for training AI models to trust and reason about the data pipeline.
 */

// Zod schema for a single quote
export const QuoteSchema = z.object({
  text: z.string().min(1, 'Quote text must not be empty'),
  author: z.string().min(1, 'Author must not be empty'),
  tags: z.array(z.string()),
});

// TypeScript type inferred from the Zod schema
export type Quote = z.infer<typeof QuoteSchema>;

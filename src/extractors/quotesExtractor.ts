// Import PlaywrightCrawler and Dataset for browser automation and data storage
import { PlaywrightCrawler, Dataset } from '@crawlee/playwright';
// Import the Zod schema and type for validation
import { QuoteSchema, Quote } from '../schemas/quote';
// Import CSV export utility
import { exportQuotesToCsv } from '../utils/exportToCsv';
import { chromium } from 'playwright';

/**
 * Teaching Note:
 * Using PlaywrightCrawler from Crawlee allows us to handle dynamic JavaScript-rendered content reliably.
 * Waiting for the .quote selector ensures we only extract data when the page is fully loaded, which is essential for resilience.
 * Setting browser headers and using Chromium in headless mode helps mimic real user behavior, reducing the risk of blocks and improving data quality.
 * All extracted data is validated against the Zod schema, ensuring only "Gold Standard" data enters our pipeline—critical for AI training and production reliability.
 */

/**
 * Main extractor function for quotes.toscrape.com/js/
 * @param startUrl - The URL to start crawling from
 * @param csvOutputPath - Path to save the CSV output
 * @param maxItems - Maximum number of quotes to scrape (safety limit)
 */
export async function runQuotesExtractor(startUrl: string, csvOutputPath = 'quotes.csv', maxItems = 100) {
  let itemCount = 0; // Track number of valid quotes scraped
  let stopCrawl = false; // Flag to stop crawling when limit is reached
  // Configure the PlaywrightCrawler
  const crawler = new PlaywrightCrawler({
    // Stealth: Set browser headers to mimic a real user
    // Launch browser in headless mode with stealth headers
    launchContext: {
      launchOptions: {
        headless: true,
        args: ['--no-sandbox'],
      },
    },
    // Set browser headers to mimic a real user (stealth)
    preNavigationHooks: [async ({ page }) => {
      await page.setExtraHTTPHeaders({
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      });
    }],
    /**
     * Handles each crawled page:
     * - Waits for .quote elements (dynamic content)
     * - Extracts quote text, author, and tags
     * - Validates and stores only valid quotes
     * - Stops when maxItems is reached
     * - Follows pagination links if limit not reached
     */
    async requestHandler({ page, request, enqueueLinks, log, crawler }) {
      // Wait for dynamic content to load
      await page.waitForSelector('.quote', { timeout: 10000 });
      // Extract all quotes on the page
      const quotesRaw = await page.$$eval('.quote', (nodes) =>
        nodes.map((el) => ({
          text: el.querySelector('.text')?.textContent?.trim() || '',
          author: el.querySelector('.author')?.textContent?.trim() || '',
          tags: Array.from(el.querySelectorAll('.tags .tag')).map((tag) => tag.textContent?.trim() || ''),
        }))
      );
      // Validate and store only valid quotes, up to maxItems
      for (const quote of quotesRaw) {
        if (itemCount >= maxItems) {
          stopCrawl = true;
          break;
        }
        const result = QuoteSchema.safeParse(quote);
        if (result.success) {
          await Dataset.pushData(result.data as Quote); // Store valid quote
          itemCount++;
        } else {
          log.warning('Invalid quote skipped', { quote, errors: result.error.errors });
        }
      }
      // If limit not reached, enqueue next page; otherwise, stop crawling
      if (!stopCrawl) {
        await enqueueLinks({ selector: '.pager .next a', label: 'NEXT' });
      } else {
        log.info(`Item limit (${maxItems}) reached, stopping crawl.`);
        await crawler.autoscaledPool?.abort();
      }
    },
    // Safety: limit total requests (pages)
    maxRequestsPerCrawl: 100,
  });

  // Start the crawl from the given URL
  await crawler.run([startUrl]);

  // After crawling, export all collected quotes to CSV
  const allQuotes = await Dataset.getData<Quote>();
  await exportQuotesToCsv(allQuotes.items, csvOutputPath);
  // Optionally, log the output location
  // console.log(`Quotes exported to ${csvOutputPath}`);
}

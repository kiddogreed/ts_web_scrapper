
#!/usr/bin/env node
// Entry point for the CLI web scraper
import { runQuotesExtractor } from './extractors/quotesExtractor';

/**
 * CLI entry point for the web scraper.
 * - Parses command-line arguments for target URL and maxItem limit.
 * - Defaults to quotes.toscrape.com/js/ and 100 items if not specified.
 * - Calls the modular extractor and handles errors.
 */

// Parse CLI arguments (ignoring node and script path)
const args = process.argv.slice(2);

// Print usage and exit
const usage = () => {
  console.log('Usage: ts_web_scraper <target-link-to-scrape> [--maxItem N]');
  process.exit(1);
};

// Set defaults
let targetUrl = 'https://quotes.toscrape.com/js/';
let maxItems = 100;

// If arguments are provided, parse them
if (args.length > 0) {
  // First argument is the target URL if it looks like a URL
  if (args[0].startsWith('http')) {
    targetUrl = args[0];
    args.shift();
  }
  // Look for --maxItem N
  const maxIdx = args.findIndex(arg => arg === '--maxItem');
  if (maxIdx !== -1 && args[maxIdx + 1]) {
    const parsed = parseInt(args[maxIdx + 1], 10);
    if (!isNaN(parsed) && parsed > 0) {
      maxItems = parsed;
    }
  }
}

// Main async function
(async () => {
  try {
    // Run the extractor with the parsed arguments
    await runQuotesExtractor(targetUrl, 'quotes.csv', maxItems);
    console.log(`Scraping complete. Output: quotes.csv (limit: ${maxItems})`);
  } catch (err) {
    // Log and exit on error
    console.error('Scraping failed:', err);
    process.exit(1);
  }
})();

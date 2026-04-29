
# TypeScript Web Scraper: Step-by-Step Replication Guide

This guide will help you rebuild the TypeScript web scraper CLI from scratch. Each step is atomic and clearly separated. Use this as a hands-on practice and reference.

---

## Quick Checklist

1. [ ] Create project folder and initialize npm
2. [ ] Install dependencies
3. [ ] Initialize TypeScript and configure tsconfig.json
4. [ ] Create folder structure
5. [ ] Add Zod schema for quotes
6. [ ] Add CSV export utility
7. [ ] Add quotes extractor
8. [ ] Add CLI entry point
9. [ ] Configure package.json for CLI
10. [ ] Build and link CLI
11. [ ] Run the scraper

---

## 1. Create Project Folder and Initialize npm

```bash
mkdir ts_web_scraper
cd ts_web_scraper
npm init -y
```

## 2. Install Dependencies

```bash
# Main dependencies
npm install @crawlee/playwright playwright zod
# Dev dependencies
npm install --save-dev typescript ts-node
```

## 3. Initialize TypeScript

```bash
npx tsc --init
```
Edit `tsconfig.json` and set:
- `strict: true`
- `outDir: "dist"`
- `rootDir: "src"`

## 4. Create Folder Structure

```bash
mkdir -p src/extractors src/schemas src/utils
```

## 5. Add Zod Schema for Quotes

Create `src/schemas/quote.ts`:

```ts
import { z } from 'zod';

// Zod schema for a quote
export const QuoteSchema = z.object({
  text: z.string().min(1),
  author: z.string().min(1),
  tags: z.array(z.string()),
});

export type Quote = z.infer<typeof QuoteSchema>;
```

## 6. Add CSV Export Utility

Create `src/utils/exportToCsv.ts`:


```ts
import { Quote } from '../schemas/quote';
import { promises as fs } from 'fs';

export async function exportQuotesToCsv(quotes: Quote[], outputPath: string) {
  const header = 'text,author,tags';
  const rows = quotes.map(q => {
    const text = '"' + (q.text.replace(/"/g, '""')) + '"';
    const author = '"' + (q.author.replace(/"/g, '""')) + '"';
    const tags = '"' + (q.tags.join(',').replace(/"/g, '""')) + '"';
    return [text, author, tags].join(',');
  });
  const csv = [header, ...rows].join('\n');
  await fs.writeFile(outputPath, csv, 'utf-8');
}
```

## 7. Add Quotes Extractor

Create `src/extractors/quotesExtractor.ts`:

```ts
import { PlaywrightCrawler, Dataset } from '@crawlee/playwright';
import { QuoteSchema, Quote } from '../schemas/quote';
import { exportQuotesToCsv } from '../utils/exportToCsv';

/**
 * Runs the quotes extractor crawler.
 * @param startUrl The URL to start scraping from
 * @param csvOutputPath Output CSV file path
 * @param maxItems Maximum number of quotes to scrape
 */
export async function runQuotesExtractor(startUrl: string, csvOutputPath = 'quotes.csv', maxItems = 100) {
  let itemCount = 0;
  let stopCrawl = false;
  const crawler = new PlaywrightCrawler({
    launchContext: {
      launchOptions: { headless: true, args: ['--no-sandbox'] },
    },
    // Set custom headers for better scraping reliability
    preNavigationHooks: [async ({ page }) => {
      await page.setExtraHTTPHeaders({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      });
    }],
    // Main handler for each crawled page
    async requestHandler({ page, enqueueLinks, log, crawler }) {
      // Wait for quotes to load
      await page.waitForSelector('.quote', { timeout: 10000 });
      // Extract raw quote data from the page
      const quotesRaw = await page.$$eval('.quote', nodes =>
        nodes.map(el => ({
          text: el.querySelector('.text')?.textContent?.trim() || '',
          author: el.querySelector('.author')?.textContent?.trim() || '',
          tags: Array.from(el.querySelectorAll('.tags .tag')).map(tag => tag.textContent?.trim() || ''),
        }))
      );
      for (const quote of quotesRaw) {
        if (itemCount >= maxItems) {
          stopCrawl = true;
          break;
        }
        // Validate quote using Zod schema
        const result = QuoteSchema.safeParse(quote);
        if (result.success) {
          await Dataset.pushData(result.data as Quote);
          itemCount++;
        } else {
          log.warning('Invalid quote skipped', { quote, errors: result.error.errors });
        }
      }
      // Enqueue next page if not done
      if (!stopCrawl) {
        await enqueueLinks({ selector: '.pager .next a', label: 'NEXT' });
      } else {
        log.info(`Item limit (${maxItems}) reached, stopping crawl.`);
        await crawler.autoscaledPool?.abort();
      }
    },
    maxRequestsPerCrawl: 100,
  });
  // Start the crawl
  await crawler.run([startUrl]);
  // Retrieve all scraped quotes and export to CSV
  const allQuotes = await Dataset.getData<Quote>();
  await exportQuotesToCsv(allQuotes.items, csvOutputPath);
}
```
}


## 8. Add CLI Entry Point

Create `src/index.ts`:

```ts
#!/usr/bin/env node
import { runQuotesExtractor } from './extractors/quotesExtractor';

const args = process.argv.slice(2);
const usage = () => {
  console.log('Usage: ts_web_scraper <target-link-to-scrape> [--maxItem N]');
  process.exit(1);
};

let targetUrl = 'https://quotes.toscrape.com/js/';
let maxItems = 100;

if (args.length > 0) {
  if (args[0].startsWith('http')) {
    targetUrl = args[0];
    args.shift();
  }
  const maxIdx = args.findIndex(arg => arg === '--maxItem');
  if (maxIdx !== -1 && args[maxIdx + 1]) {
    const parsed = parseInt(args[maxIdx + 1], 10);
    if (!isNaN(parsed) && parsed > 0) {
      maxItems = parsed;
    }
  }
}

(async () => {
  try {
    await runQuotesExtractor(targetUrl, 'quotes.csv', maxItems);
    console.log(`Scraping complete. Output: quotes.csv (limit: ${maxItems})`);
  } catch (err) {
    console.error('Scraping failed:', err);
    process.exit(1);
  }
})();
```
    console.error('Scraping failed:', err);
    process.exit(1);
  }
})();
```


## 9. Configure package.json for CLI

Add this to your `package.json`:

```json
"bin": {
  "ts_web_scraper": "dist/index.js"
}
```


npm link

## 10. Build and Link CLI

```bash
npm run build
npm link
```

## 11. Run the Scraper

```bash
ts_web_scraper https://quotes.toscrape.com/js/ --maxItem 50
```

---

## Troubleshooting & Tips

- If you get errors, check that all file paths and imports are correct.
- Make sure you run `npm run build` before using the CLI.
- You can change the output file or max items by editing the CLI arguments.
- Read code comments for extra context.

You now have a fully functional, production-grade TypeScript web scraper CLI, rebuilt from scratch!

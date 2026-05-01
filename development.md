# Development Guide: TypeScript Web Scraper with Crawlee & Playwright

This document explains how to build the web scraper in this project, the rationale for tool and library selection, and a comparison with Python/BeautifulSoup-based scrapers.

---

## 1. Project Overview
This project is a web scraper built in TypeScript using the [Crawlee](https://crawlee.dev/) framework with the Playwright browser automation library. It extracts quotes from a website, validates them, and exports the results to a CSV file.

---

## 2. Step-by-Step Development

### Step 1: Initialize the Project
- Run `npm init -y` to create a new Node.js project.
- Install TypeScript and set up `tsconfig.json` for type safety and modern JavaScript features.

### Step 2: Install Dependencies
- **Crawlee**: High-level web scraping framework supporting Playwright, Puppeteer, and Cheerio.
- **Playwright**: Modern browser automation library supporting Chromium, Firefox, and WebKit.
- **Zod**: TypeScript-first schema validation for runtime data validation.
- **Other**: Install types and utility libraries as needed.

```bash
npm install @crawlee/playwright playwright zod
npm install --save-dev typescript @types/node
```

### Step 3: Project Structure
- Organize code into `src/` with subfolders for extractors, schemas, and utilities.
- Example:
  - `src/extractors/quotesExtractor.ts`: Main scraping logic
  - `src/schemas/quote.ts`: Zod schema for quote validation
  - `src/utils/exportToCsv.ts`: Helper to export data to CSV

### Step 4: Implement the Scraper
- Use `PlaywrightCrawler` from Crawlee for robust, headless browser scraping.
- Set custom User-Agent to mimic real browsers.
- Extract data using DOM selectors.
- Validate data with Zod before saving.
- Export results to CSV for easy analysis.

### Step 5: Run the Scraper
- Use `ts-node` or compile with `tsc` and run with Node.js.
- Example:
  ```bash
  npx ts-node src/extractors/quotesExtractor.ts
  ```

---

## 3. Tool & Library Selection Rationale

### Crawlee vs. Alternatives
- **Crawlee**: Unified API for browser and HTTP scraping, built-in queueing, autoscaling, and anti-blocking features.
- **Alternatives**: Puppeteer (lower-level, less scraping-specific), Cheerio (no browser, limited to static HTML), Selenium (older, less TypeScript-friendly).
- **Advantage**: Crawlee is purpose-built for scraping, supports modern anti-bot evasion, and integrates seamlessly with Playwright.

### Playwright vs. Puppeteer
- **Playwright**: Supports multiple browsers, better handling of modern web features, more robust automation.
- **Puppeteer**: Chromium-only, less feature-rich.
- **Advantage**: Playwright is more flexible and future-proof.

### Zod for Validation
- **Zod**: TypeScript-first, runtime validation, easy to define and maintain schemas.
- **Alternatives**: Joi, Yup (less TypeScript-native).
- **Advantage**: Zod ensures data integrity and leverages TypeScript types.

---

## 4. TypeScript Scraper vs. Python + BeautifulSoup

| Feature                | TypeScript (Crawlee + Playwright) | Python (BeautifulSoup)         |
|------------------------|------------------------------------|-------------------------------|
| **Language**           | TypeScript/JavaScript              | Python                        |
| **Browser Automation** | Playwright (full browser)          | Usually requests + static HTML|
| **Dynamic Content**    | Excellent (JS rendering)           | Poor (needs Selenium/Playwright)|
| **Type Safety**        | Strong (TypeScript)                | Weak (dynamic typing)         |
| **Ecosystem**          | Modern JS/TS, npm                  | Mature, pip                   |
| **Anti-bot Evasion**   | Built-in (Crawlee)                 | Manual (with Selenium, etc.)  |
| **Speed**              | Fast, scalable                     | Fast for static, slow for dynamic|
| **Learning Curve**     | Moderate (JS/TS, async/await)      | Easy (for static HTML)        |

**Summary:**
- **TypeScript + Crawlee/Playwright** is ideal for scraping modern, JavaScript-heavy sites, with strong type safety and scalable architecture.
- **Python + BeautifulSoup** is great for simple, static HTML scraping, but struggles with dynamic content and lacks type safety.

---

## 5. Conclusion
This project demonstrates how to build a robust, scalable web scraper using TypeScript, Crawlee, and Playwright. The chosen stack excels at handling dynamic, JavaScript-heavy websites and provides strong type safety, modern async patterns, and built-in anti-bot features. Compared to traditional Python/BeautifulSoup approaches, this solution is more suitable for complex, interactive sites but comes with increased complexity and resource requirements.

**Key Takeaways:**
- Crawlee and Playwright offer a powerful, modern foundation for web scraping in the JavaScript/TypeScript ecosystem.
- Zod ensures that only valid, well-structured data is collected and exported.
- The current implementation is tailored for scraping quotes; adapting it to other data or sites requires significant code changes.

**Next Steps:**
- Use this project as a template for similar scraping tasks.
- For new targets, update selectors, schemas, and extraction logic as described in Section 7.
- Always test thoroughly and respect website terms of service and robots.txt when scraping.


---

## 6. Project Complexity & Limitations

### Complexity Factors
- **Browser Automation:** Uses Playwright for full browser rendering, which increases resource usage and complexity compared to static HTML scrapers.
- **Asynchronous Operations:** Relies heavily on async/await patterns for concurrency and performance.
- **Data Validation:** Integrates runtime schema validation (Zod) for robust data integrity.
- **Autoscaling & Anti-bot:** Crawlee manages request queues, autoscaling, and anti-bot features, which add robustness but also configuration complexity.
- **Error Handling:** Must handle navigation errors, missing selectors, and invalid data gracefully.

### Limitations
- **Domain Specific:** This scraper is specifically designed to extract quotes (text, author, tags) from a particular website structure.
- **Not Generic:** The selectors, schema, and logic are tightly coupled to the quotes website. It will not work for other data or sites without significant modification.
- **Resource Intensive:** Browser-based scraping is slower and uses more memory/CPU than static HTML approaches.

---

## 7. Adapting the Scraper for Other Targets

If you want to scrape different data or target a different website, you **must modify most of the code**:

1. **Update Selectors:**
  - Change the DOM selectors in the extractor (e.g., `.quote`, `.text`, `.author`, `.tags`) to match the new site's structure.
2. **Redefine Schema:**
  - Update or create a new Zod schema in `src/schemas/` to validate the new data fields.
3. **Change Data Extraction Logic:**
  - Adjust the logic inside the request handler to extract the desired fields from the page.
4. **Modify Export Logic:**
  - Update the CSV export utility if the data structure changes.
5. **Test Thoroughly:**
  - Run the scraper and validate the output for correctness and completeness.

**Note:**
- Crawlee and Playwright are flexible, but every new target site or data type will require custom selectors, schemas, and extraction logic.
- For complex or highly dynamic sites, you may need to add more advanced navigation, authentication, or anti-bot evasion techniques.

---

## 8. Summary
This project is a focused, robust solution for scraping quotes from a specific site. For other scraping tasks, treat this as a template and be prepared to rewrite the extraction, validation, and export logic to fit your new requirements.

---

## 9. Add CLI Entry Point

To make the scraper usable from the command line, add a CLI entry point:


### Create `src/index.ts`:

```typescript
#!/usr/bin/env node
import { extractQuotes } from './extractors/quotesExtractor';

// ...rest of the code as previously shown...
```

> **Important:** The shebang (`#!/usr/bin/env node`) must be the only thing on the first line of `src/index.ts` (no comments or extra text). Otherwise, the CLI will not run correctly in bash.

---

### Troubleshooting CLI Execution

- If you get `command not found`, make sure you have run `npm link` and that your npm global bin directory is in your PATH.
- If you get an error like `Cannot find module 'C:\'`, check that the first line of your compiled `dist/index.js` is exactly `#!/usr/bin/env node` with no comment or extra text.
- After fixing the shebang, always re-run `npm run build` and `npm link`.

---

## 10. Configure `package.json` for CLI

Add this to your `package.json`:

```json
"bin": {
  "ts_web_scraper": "dist/index.js"
}
```

Then run:

```bash
npm link
```

---

## 11. Build and Link CLI

```bash
npm run build
npm link
```

---

## 12. Run the Scraper

```bash
ts_web_scraper https://quotes.toscrape.com/js/ --maxItem 50
```

---

## 13. Edge Case Handling for Different Scenarios

Robust web scrapers must handle a variety of edge cases to ensure reliability and data quality. Here are recommended strategies and examples for handling different scenarios in this project:

### 1. Network and Navigation Errors
- **Timeouts:** Set reasonable navigation and request timeouts. Retry failed requests with exponential backoff.
  - *Suggested Solution:* Use Crawlee's built-in retry and timeout options. Wrap navigation in try/catch and implement a retry counter.
    - Example:
      ```typescript
      for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
          await crawler.run();
          break;
        } catch (err) {
          if (attempt === MAX_RETRIES - 1) throw err;
          await delay(2 ** attempt * 1000); // Exponential backoff
        }
      }
      ```
- **Connection Issues:** Catch and log network errors. Optionally, skip or re-queue failed URLs.
  - *Suggested Solution:* Use Crawlee's error hooks to log errors and re-queue requests. Optionally, maintain a list of failed URLs for later review.
    - Example:
      ```typescript
      crawler.on('requestFailed', ({ request }) => {
        failedUrls.push(request.url);
        log.error(`Failed: ${request.url}`);
      });
      ```
- **Blocked Requests:** Detect and handle HTTP 403/429 (rate limiting or blocking). Implement delays or rotate proxies/user agents if needed.
  - *Suggested Solution:* Monitor response status codes. On 403/429, add a delay (e.g., with setTimeout or Crawlee's autoscaling) and rotate user agents or proxies if available.
    - Example:
      ```typescript
      if (response.status() === 429) {
        await delay(10000); // Wait 10 seconds
        // Optionally rotate proxy or user agent
      }
      ```

### 2. Missing or Malformed Data
- **Missing Selectors:** Check if DOM elements exist before extracting. Log and skip items with missing required fields.
  - *Suggested Solution:* Use optional chaining (e.g., `element?.textContent`) and add checks before accessing properties. Log missing fields and continue.
    - Example:
      ```typescript
      const text = element?.textContent;
      if (!text) {
        log.warn('Missing text field');
        return;
      }
      ```
- **Invalid Data:** Use Zod schema validation. If validation fails, log the error and optionally save invalid items to a separate file for review.
  - *Suggested Solution:* Wrap Zod validation in try/catch. On failure, log the error and push the invalid item to a separate array or file for later inspection.
    - Example:
      ```typescript
      try {
        quoteSchema.parse(data);
      } catch (err) {
        log.error('Validation failed', err);
        invalidItems.push(data);
      }
      ```

### 3. Duplicate Data
- **Duplicate Quotes:** Track already-seen items (e.g., by text or ID) in memory or storage. Skip duplicates to avoid redundant output.
  - *Suggested Solution:* Use a Set or Map to track unique identifiers (e.g., quote text). Before saving, check if the item already exists.
    - Example:
      ```typescript
      if (seenQuotes.has(quote.text)) return;
      seenQuotes.add(quote.text);
      quotes.push(quote);
      ```

### 4. Pagination and Infinite Scroll
- **End of Pagination:** Detect when no more pages are available (e.g., missing "Next" button). Stop gracefully.
  - *Suggested Solution:* Check for the presence of the "Next" button or pagination link. If not found, break the loop or end the crawl.
    - Example:
      ```typescript
      const nextBtn = await page.$('.next');
      if (!nextBtn) break;
      ```
- **Infinite Scroll:** Implement scroll logic with limits to avoid infinite loops or excessive requests.
  - *Suggested Solution:* Set a maximum number of scrolls/pages. Use a counter and stop when the limit is reached, even if more data may be available.
    - Example:
      ```typescript
      let scrolls = 0;
      while (scrolls < MAX_SCROLLS) {
        await page.evaluate(() => window.scrollBy(0, window.innerHeight));
        scrolls++;
      }
      ```

### 5. Anti-bot and Captcha Challenges
- **Detection:** Monitor for unexpected navigation, popups, or content changes indicating a captcha or block.
  - *Suggested Solution:* Check for known captcha elements or unexpected redirects. Log and optionally notify the user or halt scraping.
    - Example:
      ```typescript
      if (await page.$('input[name="captcha"]')) {
        log.warn('Captcha detected');
        // Optionally pause or skip
      }
      ```
- **Response:** Pause, alert the user, or attempt to solve/skip the challenge if possible.
  - *Suggested Solution:* Integrate a captcha-solving service if needed, or skip the page and log the event for manual review.
    - Example:
      ```typescript
      // Pseudocode for skipping
      if (captchaDetected) {
        log.info('Skipping page due to captcha');
        return;
      }
      ```

### 6. Export/Write Errors
- **File System Issues:** Catch and log errors when writing CSV/JSON files (e.g., permission denied, disk full). Retry or abort as appropriate.
  - *Suggested Solution:* Wrap file write operations in try/catch. On error, log the issue and alert the user. Optionally, retry or write to a fallback location.
    - Example:
      ```typescript
      try {
        await fs.promises.writeFile('output.csv', csvData);
      } catch (err) {
        log.error('File write failed', err);
        // Optionally retry or write to backup
      }
      ```

### 7. CLI Argument Validation
- **Input Validation:** Check CLI arguments for required values and valid formats. Show helpful error messages for invalid input.
  - *Suggested Solution:* Use a CLI argument parser (e.g., yargs or commander). Define required arguments and types, and provide clear error messages for invalid input.
    - Example:
      ```typescript
      import yargs from 'yargs';
      const argv = yargs.option('maxItem', { type: 'number', demandOption: true }).argv;
      if (isNaN(argv.maxItem)) {
        throw new Error('maxItem must be a number');
      }
      ```

---

**Tip:**
Implement edge case handling in both the extractor logic and utility functions. Always log errors with enough context to debug issues later. Add tests for edge cases if possible.

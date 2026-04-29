# AI Project Notes

This file is for persistent memory and context for any AI language model working on this project. It should be updated with key architectural decisions, schema definitions, crawling strategies, and any non-obvious logic or constraints. This ensures continuity and context even if the model or agent changes.

**Purpose:**
To provide a comprehensive, evolving knowledge base for the project, supporting seamless handoff between AI agents, human developers, and reviewers. This file documents not just what was built, but why, and how each part supports production-grade, resilient, and extensible scraping workflows.

## Project Overview
- **Goal:** Modular, production-grade web scraper for https://quotes.toscrape.com/js/ (a JavaScript-rendered site, requiring a headless browser for extraction)
- **CLI Usage:**
	- Run via: `npm run dev -- <target-link-to-scrape> --maxItem N`
	- Example: `npm run dev -- https://quotes.toscrape.com/js/ --maxItem 50`
	- Both arguments are optional: defaults are https://quotes.toscrape.com/js/ and 100 items.
	- For true CLI usage, install globally with `npm link` (or `npm install -g`).
	- Then run: `ts_web_scraper <target-link-to-scrape> --maxItem N` from any directory.
	- The command is available globally because of the bin entry in package.json and the shebang (#!/usr/bin/env node) at the top of index.ts.
	- The shebang tells the OS to use Node.js to run the script, making it behave like a native shell command.
- **Stack:**
	- TypeScript (strict mode for maximum type safety and maintainability)
	- Playwright (for headless browser automation and dynamic content rendering)
	- Crawlee (for robust crawling, retries, and queue management)
- **Folder Structure:**
	- src/extractors: Extraction logic, one file per target or strategy
	- src/schemas: Zod schemas and TypeScript types for all structured data
	- src/utils: Reusable helpers (e.g., CSV export)

## Key Decisions
- Use Playwright for dynamic JS rendering (required for sites where content is loaded via JavaScript)
- Use Crawlee for crawl management, retries, and queueing (ensures resilience and scalability)
- All data extraction must be type-safe and validated (Zod + TypeScript: prevents silent data errors, supports schema evolution)
- Modular design: Each responsibility (extraction, validation, export) is isolated for testability and extensibility
- Teaching notes embedded throughout code and documentation to support AI and human learning
- Safety: Default item limit (100) to prevent infinite scraping and accidental overload. Crawl stops automatically when the limit is reached.
- Centralized control: MAX_ITEMS constant defined in src/index.ts for easy adjustment of the crawl limit.

## Data Schema: Quote
**Location:** src/schemas/quote.ts

**Fields:**
- text: string (required, non-empty) — The quote content
- author: string (required, non-empty) — The author of the quote
- tags: string[] — Array of tags for categorization

**Validation:**
- Zod schema enforces structure and non-empty fields at runtime
- TypeScript type ensures compile-time safety

**Rationale:**
Strict schema validation is essential for reliable downstream processing, analytics, and AI training. Any deviation from the schema is logged and skipped, preventing data pollution.
## Core Extractor: quotesExtractor.ts
**Location:** src/extractors/quotesExtractor.ts

**Responsibilities:**
- Launches a Playwright-powered browser for each crawl, simulating a real user
- Waits for the .quote selector to ensure all dynamic content is loaded before extraction
- Extracts quote text, author, and tags from each quote block
- Sets browser headers (User-Agent, Accept-Language) to reduce bot detection risk
- Validates each extracted record against the Zod schema; only valid data is stored
- Handles pagination by enqueueing the next page if available

- Enforces a configurable maxItems limit (default 100) for safety. Stops crawling and logs a message when the limit is reached.

**Error Handling:**
- Invalid records are logged and skipped, never polluting the dataset
- Timeout and navigation errors are handled by Crawlee's retry logic

**Extensibility:**
- Additional fields or extraction logic can be added with minimal changes
- Modular structure supports plugging in new extractors for other sites

**Teaching Notes:**
- PlaywrightCrawler is essential for scraping modern, JS-heavy sites. Waiting for selectors ensures we only extract when content is ready, which is critical for reliability. Mimicking real browser headers helps avoid anti-bot measures. Validating every record with Zod guarantees only high-quality, trusted data enters the pipeline—this is vital for AI training and robust production systems.
- Using Zod for schema validation ensures every extracted quote matches the expected structure. This is critical for AI-driven workflows because it guarantees data integrity, prevents silent type errors, and provides clear, actionable feedback if the website structure changes. This is the foundation for resilient, production-grade scraping and is a "Gold Standard" for training AI models to trust and reason about the data pipeline.

## Entry Point: index.ts


## Utility: exportToCsv.ts
**Location:** src/utils/exportToCsv.ts

**Responsibilities:**
- Converts an array of Quote objects to a CSV string with proper escaping and quoting
- Writes the CSV to disk after crawling completes

**Rationale:**
Exporting to CSV is a common requirement for data pipelines and analytics. This utility ensures that data is exported in a widely compatible format. Handling escaping and quoting is critical for data integrity, especially when fields may contain commas or quotes. This step makes the data portable and easy to use in spreadsheets, BI tools, or further processing.
## Output File: quotes.csv

**Location:** Project root (quotes.csv)

**Contents:**
- All validated and extracted quotes in CSV format, one row per quote

**Lifecycle:**
- Generated automatically after each crawl for easy downstream use (analytics, sharing, import to spreadsheets, etc.)

**Teaching Note:**
Persisting extracted data in a standard format like CSV enables seamless integration with data analysis tools, spreadsheets, and other systems. This step closes the loop from web extraction to actionable, portable data, which is essential for production pipelines and AI workflows.

## Next Steps
- Update this file as the project evolves with schemas, extraction logic, and any lessons learned.
	- Document any new extractors, schema changes, or output formats
	- Add troubleshooting notes and lessons learned from production runs
	- Keep teaching notes up to date for future AI and human collaborators

**Location:** src/index.ts

**Responsibilities:**
- Parses CLI arguments for target URL and --maxItem (default 100)
- Minimal logic: wires up the modular extractor and provides a single entry point for CLI or script execution
- Handles errors robustly and logs pipeline status for monitoring
- Delegates all extraction and export logic to dedicated modules

**Rationale:**
Keeping the entry point minimal and delegating logic to extractors supports testability, maintainability, and clear separation of concerns—key for production and AI-driven workflows. Robust error handling ensures reliability and clear diagnostics for both humans and AI agents.

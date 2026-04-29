# TypeScript Web Scraper

This project is a CLI tool for scraping quotes from https://quotes.toscrape.com/js/ using TypeScript, Playwright, and Crawlee. It extracts quotes, validates them, and exports the results to a CSV file.

## Features
- Scrapes quotes, authors, and tags from the target site
- Validates data using Zod schemas
- Exports results to CSV
- CLI interface with configurable options

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Build the project:**
   ```bash
   npm run build
   ```
3. **Link the CLI (optional for global use):**
   ```bash
   npm link
   ```
4. **Run the scraper:**
   ```bash
   ts_web_scraper https://quotes.toscrape.com/js/ --maxItem 50
   ```

## Project Structure
- `src/` - Source code
- `src/extractors/` - Scraper logic
- `src/schemas/` - Zod schemas
- `src/utils/` - Utility functions
- `storage/` - Output and intermediate data

## CLI Usage
```
ts_web_scraper <target-link-to-scrape> [--maxItem N]
```
- `target-link-to-scrape`: The URL to start scraping from (default: https://quotes.toscrape.com/js/)
- `--maxItem N`: Maximum number of quotes to scrape (default: 100)

## Development
- TypeScript for type safety
- Playwright for browser automation
- Crawlee for crawling and scraping
- Zod for schema validation

## License
MIT

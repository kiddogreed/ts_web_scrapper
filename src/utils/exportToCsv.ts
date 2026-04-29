import { Quote } from '../schemas/quote';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * Exports an array of Quote objects to a CSV file.
 * Handles proper escaping and quoting for CSV compatibility.
 * @param quotes - Array of Quote objects to export
 * @param outputPath - Path to save the CSV file
 */
export async function exportQuotesToCsv(quotes: Quote[], outputPath: string) {
  // Define the CSV header
  const header = 'text,author,tags';
  // Convert each quote to a CSV row, escaping quotes and joining tags
  const rows = quotes.map(q => {
    // Escape double quotes by doubling them, wrap each field in quotes
    const text = '"' + (q.text.replace(/"/g, '""')) + '"';
    const author = '"' + (q.author.replace(/"/g, '""')) + '"';
    const tags = '"' + (q.tags.join(',').replace(/"/g, '""')) + '"';
    return [text, author, tags].join(',');
  });
  // Combine header and rows into a single CSV string
  const csv = [header, ...rows].join('\n');
  // Write the CSV string to the specified file
  await fs.writeFile(outputPath, csv, 'utf-8');
}

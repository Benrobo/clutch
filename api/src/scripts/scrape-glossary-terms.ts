import * as cheerio from "cheerio";
import fs from "fs/promises";
import path from "path";
import { sleep } from "../lib/utils.js";

interface GlossaryTerm {
  id: string;
  title: string;
  url: string;
}

async function scrapeGlossaryTerms(): Promise<GlossaryTerm[]> {
  try {
    const url = "https://www.mlb.com/glossary";
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);
    const terms: GlossaryTerm[] = [];

    // Find all links within p-related-links__list
    $(".p-related-links__list .p-related-links__item a").each((_, element) => {
      const link = $(element);
      const href = link.attr("href") || "";
      const fullTitle = link.text().trim();
      
      // Extract the ID from the URL
      const id = href.split("/").pop() || "";
      
      // Remove abbreviation in parentheses from title
      const title = fullTitle.replace(/\s*\([^)]*\)\s*$/, "").trim();

      terms.push({
        id,
        title,
        url: href,
      });
    });

    // Sort terms alphabetically by title
    return terms.sort((a, b) => a.title.localeCompare(b.title));
  } catch (error) {
    console.error(
      "Error scraping terms:",
      error instanceof Error ? error.message : String(error)
    );
    return [];
  }
}

async function main(): Promise<void> {
  try {
    console.log("Scraping glossary terms...");
    const terms = await scrapeGlossaryTerms();
    
    if (terms.length === 0) {
      throw new Error("No terms were scraped. Please check the scraping logic.");
    }

    console.log(`Found ${terms.length} terms`);

    // Write the terms to a file
    await fs.writeFile(
      path.join(process.cwd(), "./glossary-terms.json"),
      JSON.stringify(terms, null, 2),
      "utf8"
    );

    console.log("Glossary terms have been saved to glossary-terms.json");
  } catch (error) {
    console.error(
      "Error:",
      error instanceof Error ? error.message : String(error)
    );
    process.exit(1);
  }
}

// Execute the script
main();

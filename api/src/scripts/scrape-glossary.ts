import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs/promises";
import { sleep } from "../lib/utils.js";
import path from "path";
import fetch from "node-fetch";

interface GlossaryTerm {
  id: string;
  title: string;
  url: string;
}

interface EnhancedGlossaryTerm extends GlossaryTerm {
  definition: string;
}

// Read the simplified glossary terms
async function readGlossaryTerms(): Promise<GlossaryTerm[]> {
  const data = await fs.readFile(
    path.join(process.cwd(), "./glossary-terms.json"),
    "utf8"
  );
  return JSON.parse(data);
}

// Scrape definition for a single term
async function scrapeDefinition(
  url: string,
  id: string
): Promise<string | null> {
  try {
    const fullUrl = `https://www.mlb.com${url}`;
    const req = await fetch(fullUrl);
    const resp = await req.text();
    const $ = cheerio.load(resp);

    // Find the content div using data-slug attribute
    const contentDiv = $(`[data-slug="glossary-${id}"]`);

    // Extract definition paragraphs (all p elements after h3:contains("Definition"))
    let definition = "";
    const definitionHeader = contentDiv.find('h3:contains("Definition")');
    if (definitionHeader.length) {
      let currentElement = definitionHeader.next();
      while (currentElement.length && currentElement.prop("tagName") === "P") {
        definition += currentElement.text() + "\n";
        currentElement = currentElement.next();
      }
    }

    return definition.trim() || null;
  } catch (error) {
    console.log(error);
    console.error(
      `Error scraping ${url}:`,
      error instanceof Error ? error.message : String(error)
    );
    return null;
  }
}

async function main(): Promise<void> {
  try {
    const terms = await readGlossaryTerms();
    const enhancedTerms: EnhancedGlossaryTerm[] = [];

    for (const term of terms) {
      console.log(`Processing: ${term.title}`);
      const definition = await scrapeDefinition(term.url, term.id);

      enhancedTerms.push({
        ...term,
        definition: definition || "Definition not available",
      });

      await sleep(1000);
    }

    console.log({ enhancedTerms });

    await fs.writeFile(
      path.join(process.cwd(), "./glossary-v2.json"),
      JSON.stringify(enhancedTerms, null, 2),
      "utf8"
    );

    console.log("Glossary v2 has been created successfully!");
  } catch (error) {
    console.error(
      "Error:",
      error instanceof Error ? error.message : String(error)
    );
  }
}

main();

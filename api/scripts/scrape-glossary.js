const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs').promises;
const path = require('path');

// Read the simplified glossary terms
async function readGlossaryTerms() {
  const data = await fs.readFile(path.join(__dirname, '../glossary-simplified.json'), 'utf8');
  return JSON.parse(data);
}

// Scrape definition for a single term
async function scrapeDefinition(url) {
  try {
    const fullUrl = `https://www.mlb.com${url}`;
    const response = await axios.get(fullUrl);
    const $ = cheerio.load(response.data);
    
    // Find the content div with the specified class
    const contentDiv = $('.p-wysiwyg');
    
    // Extract definition paragraphs (all p elements after h3:contains("Definition"))
    let definition = '';
    const definitionHeader = contentDiv.find('h3:contains("Definition")');
    if (definitionHeader.length) {
      let currentElement = definitionHeader.next();
      while (currentElement.length && currentElement.prop('tagName') === 'P') {
        definition += currentElement.text() + ' ';
        currentElement = currentElement.next();
      }
    }
    
    return definition.trim();
  } catch (error) {
    console.error(`Error scraping ${url}:`, error.message);
    return null;
  }
}

// Main function to process all terms
async function main() {
  try {
    // Read terms
    const terms = await readGlossaryTerms();
    const enhancedTerms = [];
    
    // Process terms with a delay between requests
    for (const term of terms) {
      console.log(`Processing: ${term.title}`);
      const definition = await scrapeDefinition(term.url);
      
      enhancedTerms.push({
        ...term,
        definition: definition || 'Definition not available'
      });
      
      // Add a small delay between requests to be nice to the server
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Write the enhanced glossary to a new file
    await fs.writeFile(
      path.join(__dirname, '../glossary-v2.json'),
      JSON.stringify(enhancedTerms, null, 2),
      'utf8'
    );
    
    console.log('Glossary v2 has been created successfully!');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();

import searchWeb, {
  searchWebWithKeywords,
} from "../services/RAG/tools/searchWeb.js";
import { ExaSearchResult } from "../config/exa-js-client.js";
import prisma from "../prisma/index.js";
import retry from "async-retry";
import fs from "fs/promises";
import { sleep } from "../lib/utils.js";
import WebCrawler from "../helpers/web-crawler.js";

const crawler = new WebCrawler();

async function generateContentSource() {
  const highlightContents = await prisma.highlights_content.findMany({
    select: {
      id: true,
      body: true,
      sources: true,
    },
  });

  const regex = /\[.*?\]\((.*?)\)/;

  const parsedContent: Map<
    string,
    {
      id: string;
      index: number;
      link: string;
      content: string;
      sources?: { url: string; title: string }[];
    }[]
  > = new Map();

  const parsedContentWithSources: Map<
    string,
    {
      id: string;
      index: number;
      sources?: { url: string; title: string | null }[];
    }[]
  > = new Map();

  const OUTPUT_FILE = "./content-sources-with-metadata.json";

  // Initialize or read the JSON file
  try {
    const fileContent = await fs.readFile(OUTPUT_FILE, "utf-8");
    if (!fileContent.trim()) {
      await fs.writeFile(OUTPUT_FILE, "[]");
    } else {
      try {
        JSON.parse(fileContent);
      } catch {
        await fs.writeFile(OUTPUT_FILE, "[]");
      }
    }
  } catch {
    await fs.writeFile(OUTPUT_FILE, "[]");
  }

  // parse highlight contents
  for (const hlCont of highlightContents) {
    if (hlCont?.sources || ((hlCont?.sources as any[]) ?? [])?.length > 0) {
      console.log(`Skipping ${hlCont?.id} as it already has sources`);
      continue;
    } else {
      const splitContents = hlCont?.body
        ?.split("\n\n")
        .filter((c) => c.length > 0)
        .flat();
      for (let i = 0; i < splitContents.length; i++) {
        const content = splitContents[i];
        if (content?.length >= 400 && !content?.startsWith(">")) {
          const matchedLink = content.match(regex);
          if (matchedLink && matchedLink.length > 0) {
            const link = matchedLink[1];
            const index = i;

            if (parsedContent.has(hlCont?.id)) {
              parsedContent.get(hlCont?.id)?.push({
                id: hlCont?.id,
                index,
                link,
                content: content.split(". ").slice(0, 2).join(". "),
              });
            } else {
              parsedContent.set(hlCont?.id, [
                {
                  id: hlCont?.id,
                  index,
                  link,
                  content: content.split(". ").slice(0, 2).join(". "),
                },
              ]);
            }
          }
        } else {
          console.log(`Skipping content  < 400 with invalid character`);
        }
      }
    }
  }

  // get external sources
  console.log("Getting external sources...");
  for (const parsedCont of parsedContent.values()) {
    for (const cont of parsedCont) {
      const externalSources = await getExternalSources(cont?.link);
      if (externalSources) {
        // Limit external sources to 3 (plus the original link makes 4 total)
        const limitedSources = externalSources.slice(0, 3);

        if (parsedContentWithSources.has(cont?.id)) {
          parsedContentWithSources.get(cont?.id)?.push({
            id: cont?.id,
            index: cont?.index,
            sources: limitedSources,
          });
        } else {
          parsedContentWithSources.set(cont?.id, [
            {
              id: cont?.id,
              index: cont?.index,
              sources: [
                {
                  url: cont?.link,
                  title: null,
                },
                ...limitedSources,
              ],
            },
          ]);
        }
      }
    }
  }

  console.log(`\n\n Getting sources metadata...`);
  for (const parsedCont of parsedContentWithSources.values()) {
    for (const cont of parsedCont) {
      if (!cont?.id || !cont?.sources?.length) continue;

      let contentMetadata: {
        id: string;
        index: number;
        sources: Array<{
          url: string;
          title: string | null;
          favicon: string;
        }>;
      } = {
        id: cont.id,
        index: cont.index,
        sources: [],
      };

      for (const source of cont.sources) {
        const metadata = await getSourceMetadata(source.url);
        if (!metadata?.favicon) continue;

        console.log("Got metadata for URL:", source.url);

        contentMetadata.sources.push({
          url: source.url,
          title: source.title,
          favicon: metadata.favicon,
        });

        if (contentMetadata.sources.length >= 4) {
          console.log(`Reached 4 sources for content ${cont.id}, stopping`);
          break;
        }
      }

      if (contentMetadata.sources.length > 0) {
        // Read current file content
        const currentContent = JSON.parse(
          await fs.readFile(OUTPUT_FILE, "utf-8")
        );

        // Add new content
        currentContent.push(contentMetadata);

        // Write back to file
        await fs.writeFile(
          OUTPUT_FILE,
          JSON.stringify(currentContent, null, 2)
        );
        console.log(`Updated file with metadata for content ${cont.id}`);
      }
    }
  }

  console.log(`Updated file completed`);
  console.log("\n\nUpdating database");
  await updateDatabase(OUTPUT_FILE);

  console.log("Finished processing all content");
  process.exit(0);
}

generateContentSource();

async function getExternalSources(link: string) {
  //   await sleep(1000);
  try {
    const results = await retry(
      async () => {
        console.log(`Searching web for [${link}]...`);
        const results = await searchWebWithKeywords(link);

        if (!results || results?.length === 0) {
          throw new Error(`No results found for ${link}`);
        }

        return results.slice(0, 6).map((result) => ({
          url: result.url,
          title: result.title,
        }));
      },
      {
        retries: 1,
        onRetry(e, attempt) {
          console.log(`Error searching web (attempt ${attempt}):`, e);
        },
      }
    );
    return results;
  } catch (e: any) {
    return [];
  }
}

async function getSourceMetadata(url: string) {
  try {
    return await retry(
      async () => {
        const metadata = await crawler.getWebsiteMetadata(url);
        if (!metadata) {
          throw new Error(`Failed to get metadata for ${url}`);
        }
        return {
          favicon: metadata.favicon,
          title:
            metadata.title.length > 50
              ? metadata.title.slice(0, 50)
              : metadata.title,
        };
      },
      {
        retries: 1,
        onRetry(e, attempt) {
          console.log(
            `Error searching web (attempt ${attempt}):`,
            (e as any)?.message
          );
        },
      }
    );
  } catch (e: any) {
    console.error(`Failed to get metadata for ${url}:`, e?.message);
    return null;
  }
}

async function updateDatabase(OUTPUT_FILE: string) {
  const sources = JSON.parse(await fs.readFile(OUTPUT_FILE, "utf-8")) as {
    id: string;
    index: number;
    sources: Array<{
      url: string;
      title: string | null;
      favicon: string;
    }>;
  }[];

  // Group sources by ID
  const groupedSources = sources.reduce((acc, src) => {
    if (!acc[src.id]) {
      acc[src.id] = [];
    }
    acc[src.id].push(src);
    return acc;
  }, {} as Record<string, typeof sources>);

  // Update database for each ID
  for (const [id, entries] of Object.entries(groupedSources)) {
    // check if source exists
    const exists = await prisma.highlights_content.findUnique({
      where: {
        id: id,
      },
    });
    if (!exists) {
      continue;
    }
    // Sort entries by index to maintain order
    const sortedEntries = entries.sort((a, b) => a.index - b.index);
    await prisma.highlights_content.update({
      where: {
        id: id,
      },
      data: {
        sources: sortedEntries,
      },
    });
    console.log(
      `Updated database with ${sortedEntries.length} entries for content ${id}`
    );
  }
}

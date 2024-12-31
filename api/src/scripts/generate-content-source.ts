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
    },
  });

  const sources: {
    index: number;
    sources: {
      url: string;
      favicon: string;
      title: string;
    }[];
  }[] = [];

  const regex = /\[.*?\]\((.*?)\)/;
  const searchedResults: ExaSearchResult[] = [];

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

  const parsedContentSourcesWithMetadata: Map<
    string,
    {
      id: string;
      index: number;
      sources?: { url: string; title: string | null; favicon: string | null }[];
    }[]
  > = new Map();

  // parse highlight contents
  for (const hlCont of highlightContents) {
    const splitContents = hlCont?.body
      ?.split("\n")
      .filter((c) => c?.length > 0)
      .flat();
    for (let i = 0; i < splitContents.length; i++) {
      const content = splitContents[i];
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
    }
  }

  // get external sources
  console.log("Getting external sources...");
  for (const parsedCont of parsedContent.values()) {
    for (const cont of parsedCont) {
      const externalSources = await getExternalSources(cont?.link);
      if (externalSources) {
        if (parsedContentWithSources.has(cont?.id)) {
          parsedContentWithSources.get(cont?.id)?.push({
            id: cont?.id,
            index: cont?.index,
            sources: externalSources,
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
                ...externalSources,
              ],
            },
          ]);
        }
      }
    }
  }

  // get sources metadata
  console.log(`\n\n Getting sources metadata...`);
  for (const parsedCont of parsedContentWithSources.values()) {
    for (const cont of parsedCont) {
      for (const source of cont?.sources || []) {
        const metadata = await getSourceMetadata(source.url);
        if (metadata?.favicon) {
          console.log({ metadata });
          if (parsedContentSourcesWithMetadata.has(cont?.id)) {
            const existingContent = parsedContentSourcesWithMetadata.get(
              cont?.id
            );
            if (existingContent?.[0]?.sources) {
              existingContent[0].sources.push({
                url: source.url,
                title: source.title,
                favicon: metadata.favicon,
              });
            }
          } else {
            parsedContentSourcesWithMetadata.set(cont?.id, [
              {
                id: cont?.id,
                index: cont?.index,
                sources: [
                  {
                    url: source.url,
                    title: source.title,
                    favicon: metadata.favicon,
                  },
                ],
              },
            ]);
          }
        }
      }
    }
  }

  //   fs.writeFile(
  //     "./content-with-sources.json",
  //     JSON.stringify(Array.from(parsedContentWithSources.values()), null, 2)
  //   );
  fs.writeFile(
    "./content-sources-with-metadata.json",
    JSON.stringify(
      Array.from(parsedContentSourcesWithMetadata.values()),
      null,
      2
    )
  );

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
          console.log(`Error searching web (attempt ${attempt}):`, e);
        },
      }
    );
  } catch (e: any) {
    console.error(`Failed to get metadata for ${url}:`, e);
    return null;
  }
}

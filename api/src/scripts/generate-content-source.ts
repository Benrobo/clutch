import { ExaSearchResult } from "../config/exa-js-client";
import prisma from "../prisma/index.js";

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
    { id: string; index: number; link: string; content: string }[]
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
            content,
          });
        } else {
          parsedContent.set(hlCont?.id, [
            {
              id: hlCont?.id,
              index,
              link,
              content,
            },
          ]);
        }
      }
    }
  }

  // get external sources
  console.log(parsedContent);
}

generateContentSource();

async function getExternalSources(
  parsedContent: Map<
    string,
    { id: string; index: number; link: string; content: string }[]
  >
) {}

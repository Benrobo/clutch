import Gemini from "../helpers/gemini.helper.js";
import prisma from "../prisma/index.js";
import retry from "async-retry";
import { sleep } from "../lib/utils.js";

const formatContentPrompt = `Format the following text into markdown while preserving the exact paragraph structure. Rules:
1. Keep the exact same number of paragraphs as the original text (paragraphs are separated by double newlines "\n\n")
2. Do not split paragraphs into smaller ones
3. Only add markdown syntax for links, bold, and italic text
4. Preserve all original spacing between paragraphs
5. Do not add any additional line breaks within paragraphs
6. Do not add any headers or lists
7. Links should be formatted as [text](url)

Text to format:`;

const gemini = new Gemini();

async function formatContent() {
  try {
    const contents = await prisma.highlights_content.findMany({
      select: {
        id: true,
        body: true,
      },
    });

    console.log(`Found ${contents.length} contents to format`);

    for (const content of contents) {
      await retry(
        async () => {
          const paragraphs = content.body.split("\n\n").length;
          console.log(
            `Processing content ${content.id} with ${paragraphs} paragraphs`
          );

          const response = await gemini.callAI({
            user_prompt: formatContentPrompt + "\n\n" + content.body,
            enable_call_history: false,
          });

          if (!response.data) {
            throw new Error("No response from Gemini");
          }

          const formattedContent = response.data;
          const formattedParagraphs = formattedContent.split("\n\n").length;

          if (paragraphs !== formattedParagraphs) {
            console.log(
              `Warning: Paragraph count mismatch. Original: ${paragraphs}, Formatted: ${formattedParagraphs}`
            );
            throw new Error(
              `Warning: Paragraph count mismatch. Original: ${paragraphs}, Formatted: ${formattedParagraphs}`
            );
          }

          await prisma.highlights_content.update({
            where: {
              id: content.id,
            },
            data: {
              body: formattedContent,
            },
          });

          console.log(`Updated content ${content.id}`);
          await sleep(1000); // Rate limiting
        },
        {
          retries: 3,
          minTimeout: 1000,
          maxTimeout: 3000,
          onRetry(e, attempt) {
            console.log(`Error occured, retrying...`);
            console.log(e);
          },
        }
      );
    }

    console.log("Finished formatting all content");
  } catch (error) {
    console.error("Error formatting content:", error);
  }
}

formatContent();

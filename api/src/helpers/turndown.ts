import TurndownService from "turndown";

const turndownService = new TurndownService();

export const htmlToMarkdown = (html: string) => {
  return turndownService.turndown(html);
};

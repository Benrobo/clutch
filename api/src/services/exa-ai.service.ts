import exa from "../config/exa-ai.js";

interface FindCompaniesParams {
  type: "neural" | "auto" | "keyword";
  query: string;
  category?: "company";
  summary?: string;
}

export default class ExaAiService {
  public async findCompanies({
    type = "neural",
    query,
    category,
    summary = "be short and concise.",
  }: FindCompaniesParams) {
    const response = await exa.searchAndContents(query, {
      type,
      useAutoprompt: true,
      category,
      summary: {
        query: summary,
      },
      numResults: 15,
      excludeDomains: [
        "youtube.com",
        "twitter.com",
        "facebook.com",
        "medium.com",
        "startups.com",
        "slideshare.net",
        "smashmagazine.com",
      ],
    });
    return response.results.map((result) => ({
      id: result.id,
      url: result.url,
      title: result.title,
      score: result.score,
      summary: result.summary,
    }));
  }

  public async searchWeb(
    query: string,
    options?: {
      category?: string;
      includeText?: string[];
      excludeText?: string[];
      extras?: {
        imageLinks?: number;
        links?: number;
      };
    }
  ) {
    const result = await exa.searchAndContents(query, {
      type: "neural",
      useAutoprompt: true,
      numResults: 8,
      summary: {},
      ...(options?.category && { category: options.category }),
      ...(options?.includeText && { includeText: options.includeText }),
      ...(options?.excludeText && { excludeText: options.excludeText }),
      ...(options?.extras && { extras: options.extras }),
    });
    return result.results.map((result) => ({
      id: result.id,
      url: result.url,
      title: result.title,
      author: result?.author,
      score: result.score,
      summary: result.summary,
    }));
  }
}

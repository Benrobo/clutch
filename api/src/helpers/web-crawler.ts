import axios from "axios";
import * as cheerio from "cheerio";
import { getCleanedUrl, extractCleanDomain } from "../lib/utils.js";
import UserAgent from "user-agents";

export type CrawledWebsiteMetadata = {
  title: string;
  description?: string;
  keywords?: string;
  favicon: string;
  ogImage: string;
  url: string;
  domain: string;
  siteName: string;
  childUrls: string[];
};

const EXCLUDED_URL_PATTERNS = [
  // Authentication and user-related paths
  /\/(auth|login|logout|signup|signin|register|password|reset)/i,
  // Admin and account management
  /\/(admin|dashboard|account|profile|settings)/i,
  // Common utility pages
  /\/(cart|checkout|payment|subscribe|unsubscribe)/i,
  // Legal and policy pages
  /\/(privacy|terms|tos|legal|gdpr|cookie)/i,
  // Technical and system pages
  /\/(api|cdn|static|assets|media|uploads|dist|build)/i,
  // Social and interaction pages
  /\/(share|like|comment|follow|social)/i,
  // Common file extensions to skip
  /\.(jpg|jpeg|png|gif|svg|css|js|json|xml|pdf|doc|docx|zip|rar)$/i,
  // Email links
  /^mailto:/i,
];

export default class WebCrawler {
  private readonly headers: Record<string, string>;

  constructor() {
    // Initialize with more browser-like headers
    const userAgents = [
      // Desktop browsers
      new UserAgent({ deviceCategory: "desktop" }).toString(),
      new UserAgent({
        deviceCategory: "desktop",
        platform: "MacIntel",
      }).toString(),
      new UserAgent({
        deviceCategory: "desktop",
        platform: "Win32",
      }).toString(),
      // Mobile browsers (optional)
      new UserAgent({ deviceCategory: "mobile" }).toString(),
    ];
    this.headers = {
      "User-Agent": userAgents[Math.floor(Math.random() * userAgents.length)],
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
      "Accept-Encoding": "gzip, deflate, br",
      Connection: "keep-alive",
      "Upgrade-Insecure-Requests": "1",
      "Sec-Fetch-Dest": "document",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-Site": "cross-site",
      "Sec-Fetch-User": "?1",
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
      DNT: "1",
      "sec-ch-ua":
        '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"macOS"',
    };
  }

  async getRelativeLinks(url: string, sliced: number = 8): Promise<string[]> {
    try {
      const domain = extractCleanDomain(url);
      const response = await axios.get(url, {
        headers: {
          ...this.headers,
          Host: domain,
          Origin: `https://${domain}`,
          Referer: url,
        },
      });

      const $ = cheerio.load(response.data);
      const links = new Set<string>();

      // Find all anchor tags and collect their href attributes
      $("a[href]").each((_, element) => {
        const href = $(element).attr("href");
        if (
          href &&
          !href.startsWith("http") &&
          !href.startsWith("//") &&
          !href.startsWith("#")
        ) {
          // Clean the URL and remove any query parameters or hash fragments
          const cleanHref = href.split("?")[0].split("#")[0];
          if (cleanHref) {
            // Check if the URL matches any excluded pattern
            const shouldExclude = EXCLUDED_URL_PATTERNS.some((pattern) =>
              pattern.test(cleanHref)
            );

            if (!shouldExclude) {
              links.add(
                cleanHref.startsWith("https")
                  ? cleanHref
                  : `https://${domain}${cleanHref}`
              );
            }
          }
        }
      });

      const relLinks = Array.from(links).slice(0, sliced);

      if (relLinks.length === 0) {
        relLinks.push(url);
      }

      return relLinks;
    } catch (error) {
      console.error(`Error fetching relative links from ${url}:`, error);
      return [];
    }
  }

  async getWebsiteMetadata(
    url: string
  ): Promise<CrawledWebsiteMetadata | null> {
    try {
      const domain = extractCleanDomain(url);
      const requestHeaders = {
        ...this.headers,
        Host: domain,
        Origin: `https://${domain}`,
        Referer: "https://www.google.com/search",
      };

      const [response, relativeLinks] = await Promise.all([
        axios.get(url, {
          headers: requestHeaders,
          timeout: 15000,
          maxRedirects: 5,
          validateStatus: (status) => status < 500,
        }),
        this.getRelativeLinks(url),
      ]);

      const $ = cheerio.load(response.data);
      const cleanDomain = extractCleanDomain(url);
      const baseUrl = `https://${cleanDomain}`;

      // Enhanced metadata extraction
      const getMetaContent = (selectors: string[]): string | undefined => {
        for (const selector of selectors) {
          const content = $(selector).attr("content");
          if (content) return content;
        }
        return undefined;
      };

      const getFirstValidLink = (...selectors: string[]): string => {
        // First check for apple-touch-icon
        const appleIcon = $('link[rel="apple-touch-icon"]').attr("href");
        if (appleIcon) return appleIcon;

        let bestLink = "";
        let maxDimension = 0;

        for (const selector of selectors) {
          const links = $(`link[rel='${selector}']`).toArray();

          for (const link of links) {
            const href = $(link).attr("href");
            if (!href) continue;

            // Extract dimensions from filename if they exist
            const dimensionMatch = href.match(/(\d+)x\d+/);
            if (dimensionMatch) {
              const dimension = parseInt(dimensionMatch[1]);
              if (dimension > maxDimension) {
                maxDimension = dimension;
                bestLink = href;
              }
            }
          }
        }

        return bestLink || "";
      };

      const ensureAbsoluteUrl = (url?: string, domain?: string): string => {
        if (!url || !domain) return "";
        if (url.startsWith("data:")) return url;
        if (url.startsWith("//")) return `https:${url}`;
        return url.startsWith("http")
          ? url
          : `${domain}${url.startsWith("/") ? url : "/" + url}`;
      };

      // Get title with fallbacks
      const title =
        $("meta[property='og:title']").attr("content") ||
        $("meta[name='twitter:title']").attr("content") ||
        $("title").text() ||
        domain;

      // Get description with fallbacks
      const description = getMetaContent([
        "meta[property='og:description']",
        "meta[name='description']",
        "meta[name='twitter:description']",
        "meta[itemprop='description']",
      ]);

      // Get keywords
      const keywords = getMetaContent([
        "meta[name='keywords']",
        "meta[property='article:tag']",
      ]);

      // Get favicon with enhanced fallbacks
      const favicon = ensureAbsoluteUrl(
        getFirstValidLink(
          "icon",
          "shortcut icon",
          "apple-touch-icon",
          "apple-touch-icon-precomposed",
          "fluid-icon"
        ),
        baseUrl
      );

      // Get og:image with fallbacks
      const ogImage = ensureAbsoluteUrl(
        getMetaContent([
          "meta[property='og:image']",
          "meta[name='twitter:image']",
          "meta[itemprop='image']",
          "link[rel='icon']",
          "link[rel='shortcut icon']",
          "link[rel='apple-touch-icon']",
          "link[rel='apple-touch-icon-precomposed']",
          "link[rel='fluid-icon']",
        ]),
        baseUrl
      );

      // Get site name with fallbacks
      const siteName =
        $("meta[property='og:site_name']").attr("content") ||
        domain.split(".")[0];

      const websiteMetadata: CrawledWebsiteMetadata = {
        title,
        description,
        keywords,
        favicon,
        ogImage,
        url: getCleanedUrl(url),
        domain: cleanDomain,
        siteName,
        childUrls: relativeLinks,
      };

      return websiteMetadata;
    } catch (error) {
      console.error("Error crawling website:", error);
      return null;
    }
  }
}

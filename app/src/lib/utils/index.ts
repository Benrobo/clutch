import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { cubicOut } from "svelte/easing";
import type { TransitionConfig } from "svelte/transition";
import type { AxiosResponse } from "axios";
import type { BaseResponse } from "@/types";
import zod from "zod";
import env from "@/config/env";
import { logout } from "@/http/requests";
import { MLB_PLAYER_POSITIONS } from "@/constant/mlb";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type FlyAndScaleParams = {
  y?: number;
  x?: number;
  start?: number;
  duration?: number;
};

export const flyAndScale = (
  node: Element,
  params: FlyAndScaleParams = { y: -8, x: 0, start: 0.95, duration: 150 }
): TransitionConfig => {
  const style = getComputedStyle(node);
  const transform = style.transform === "none" ? "" : style.transform;

  const scaleConversion = (
    valueA: number,
    scaleA: [number, number],
    scaleB: [number, number]
  ) => {
    const [minA, maxA] = scaleA;
    const [minB, maxB] = scaleB;

    const percentage = (valueA - minA) / (maxA - minA);
    const valueB = percentage * (maxB - minB) + minB;

    return valueB;
  };

  const styleToString = (
    style: Record<string, number | string | undefined>
  ): string => {
    return Object.keys(style).reduce((str, key) => {
      if (style[key] === undefined) return str;
      return str + key + ":" + style[key] + ";";
    }, "");
  };

  return {
    duration: params.duration ?? 200,
    delay: 0,
    css: (t) => {
      const y = scaleConversion(t, [0, 1], [params.y ?? 5, 0]);
      const x = scaleConversion(t, [0, 1], [params.x ?? 0, 0]);
      const scale = scaleConversion(t, [0, 1], [params.start ?? 0.95, 1]);

      return styleToString({
        transform:
          transform +
          "translate3d(" +
          x +
          "px, " +
          y +
          "px, 0) scale(" +
          scale +
          ")",
        opacity: t,
      });
    },
    easing: cubicOut,
  };
};

export const lowerCase = (str: string) => {
  if (typeof str === "undefined" || str === null || str === undefined)
    return str;
  return str?.trim()?.toLowerCase();
};

export const isPagePath = (path: string, pathToCheck: string) => {
  if (pathToCheck === "dashboard") {
    return path.includes("/app/dashboard");
  }
  if (pathToCheck === "settings") {
    return path.includes("/app/settings");
  }
  if (pathToCheck === "research") {
    return path.startsWith("/app/research/");
  }
  if (pathToCheck === "research-main") {
    return path === "/app/research";
  }
  return false;
};

export const formatNumber = (num: number) => {
  const kFormater = new Intl.NumberFormat("en-US", {
    notation: "compact",
  });
  return kFormater.format(num);
};

export const extractAxiosResponseData = <T>(
  res: any | null,
  type: "success" | "error"
) => {
  if (type === "error") {
    return res?.response?.data as BaseResponse<T>;
  }
  return res as BaseResponse<T>;
};

export const isValidUrl = (url: string) => {
  const urlRegex =
    /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u00a1-\uffff][a-z0-9\u00a1-\uffff_-]{0,62})?[a-z0-9\u00a1-\uffff]\.)+(?:[a-z\u00a1-\uffff]{2,}\.?))(?::\d{2,5})?(?:[/?#]\S*)?$/i;
  return zod.string().regex(urlRegex).safeParse(url).success;
};

export const getCleanedUrl = (url: string) => {
  try {
    const urlObj = new URL(url);
    return urlObj.href.endsWith("/")
      ? urlObj.href.replace(/\/$/, "")
      : urlObj.href;
  } catch (e) {
    return url;
  }
};

export const extractCleanDomain = (url: string) => {
  const cleanedUrl = getCleanedUrl(url);
  const domain = cleanedUrl.split("/")[2];
  return domain.replace("www.", "");
};

export const cleanDomain = (domain: string) => {
  const stripDomain = domain.split(".");
  const withoutSubdomain =
    stripDomain.length > 2
      ? stripDomain.slice(1).join(".")
      : stripDomain.join(".");

  return withoutSubdomain;
};

export const formatUrl = (url: string): string => {
  // Remove any leading/trailing whitespace
  let formattedUrl = url.trim();

  // Check if the URL starts with http:// or https://
  if (
    !formattedUrl.startsWith("http://") &&
    !formattedUrl.startsWith("https://")
  ) {
    formattedUrl = `https://${formattedUrl}`;
  }

  // Remove trailing slash if present
  if (formattedUrl.endsWith("/")) {
    formattedUrl = formattedUrl.slice(0, -1);
  }

  return formattedUrl;
};

export const makeFirstCharacterUppercase = (str: string) => {
  return str.charAt(0).toUpperCase() + lowerCase(str.slice(1));
};

export const numberToCurrency = (num: number, currency?: string) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency ?? "USD",
  }).format(num);
};

export const logoutClient = async () => {
  await logout();
  window.location.href = "/auth";
};

export const splitIntoParagraphs = (text: string): string[] => {
  if (!text) return [];

  // Clean up the text
  const cleanText = text
    .replace(/^\\"|"\\$/g, "") // Remove escaped quotes at start/end
    .replace(/^"""|"""$/g, "") // Remove triple quotes at start/end
    .replace(/\\"/g, '"') // Replace escaped quotes with regular quotes
    .replace(/\\\\/g, "\\") // Replace double backslashes
    .replace(/^\\|\\$/g, "") // Remove single backslashes at start/end
    .trim();

  // Split by newline sequences and clean each paragraph
  const paragraphs = cleanText
    .split(/\\n\\n/)
    .map(
      (para) => para.trim().replace(/^"+|"+$/g, "") // Remove any remaining quotes at start/end of each paragraph
    )
    .filter((para) => para.length > 0);

  return paragraphs;
};

export const capitalizeFirstLetter = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};


export const getTeamLogoWithBg = (teamId?: number | null) => {
	return `https://midfield.mlbstatic.com/v1/team/${teamId}/spots/500`;
};

export 	const calculateReadingTime = (text: string, wpm = 200) => {
  const words = text.split(/\s+/).length;
  const minutes = words / wpm;
  const seconds = Math.ceil(minutes * 60);
  return {
    min: Math.floor(minutes),
    sec: seconds
  };
}

export const shuffleArray = <T>(array: T[]) => {
  let currentIndex = array.length;

  // While there remain elements to shuffle...
  while (currentIndex !== 0) {
    // Pick a remaining element...
    const randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
};


export const getPosition = (position: string) => {
  return MLB_PLAYER_POSITIONS.find((pos) => pos.abbrev === position)?.shortName;
};
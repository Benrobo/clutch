import { MLB_PLAYER_POSITIONS } from "../constant/mlb.js";

export function checkDurationConstraints(
  duration: string,
  constraints: {
    type: "hours" | "minutes" | "seconds";
    min: number;
    max: number;
  }
) {
  const [hours, minutes, seconds] = duration.split(":").map(Number);
  const totalSeconds = hours * 3600 + minutes * 60 + seconds;

  // Convert duration to the target unit for comparison
  let durationInTargetUnit: number;
  switch (constraints.type) {
    case "hours":
      durationInTargetUnit = totalSeconds / 3600;
      break;
    case "minutes":
      durationInTargetUnit = totalSeconds / 60;
      break;
    case "seconds":
      durationInTargetUnit = totalSeconds;
      break;
    default:
      return false;
  }

  // Check if duration falls within the specified range
  return (
    durationInTargetUnit >= constraints.min &&
    durationInTargetUnit <= constraints.max
  );
}

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const lowerCase = (str: string) => {
  return str.toLowerCase();
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

export function extractCleanDomain(url: string): string {
  if (!url) return "";
  const cleanedUrl = getCleanedUrl(url);
  const domain = cleanedUrl.split("/")[2];
  return domain.replace("www.", "");
}

export const generateRandomHexColor = (): string => {
  // Generate a random number between 0x0 and 0xFFFFFF
  const randomColor = Math.floor(Math.random() * 0xffffff);

  // Convert to hex and pad with zeros if needed
  return "#" + randomColor.toString(16).padStart(6, "0");
};

export const extractAxiosResponseData = <T>(
  res: any | null,
  type: "success" | "error"
) => {
  if (type === "error") {
    return res?.response as T;
  }
  return res as T;
};

export const capitalizeFirstLetterOfEachWord = (str: string) => {
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const validateImageUrl = async (url: string) => {
  try {
    const req = await fetch(url);
    if (!req.ok) {
      return false;
    }
    return true;
  } catch (e) {
    console.log(`Error validating image URL:`, e);
    return false;
  }
};

export const calculateReadingTime = (text: string, wpm = 200) => {
  const words = text.split(/\s+/).length;
  const minutes = words / wpm;
  const seconds = Math.ceil(minutes * 60);
  return {
    min: Math.floor(minutes),
    sec: seconds,
  };
};

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

export const getPositionType = (abbrev: string) => {
  const position = MLB_PLAYER_POSITIONS.find((p) => p.abbrev === abbrev);
  return position?.type ? position.type.toLowerCase() : null;
};

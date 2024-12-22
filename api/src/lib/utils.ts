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

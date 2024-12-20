export function checkDurationLessThanConstraints(
  duration: string,
  constraints: "hours" | "minutes" | "seconds" = "minutes",
  value: number = 5
) {
  const [hours, minutes, seconds] = duration.split(":");
  switch (constraints) {
    case "hours":
      return parseInt(hours) <= value;
    case "minutes":
      return parseInt(minutes) <= value;
    case "seconds":
      return parseInt(seconds) <= value;
  }
}

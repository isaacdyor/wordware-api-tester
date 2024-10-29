import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const timeAgo = (date: string | Date): string => {
  const now = dayjs();
  const inputDate = dayjs(date);

  const diffInDays = now.diff(inputDate, "day");

  if (diffInDays === 0) {
    return inputDate.fromNow(); // Today: "2 hours ago", "5 minutes ago", etc.
  } else if (diffInDays === 1) {
    return "Yesterday";
  } else if (diffInDays < 7) {
    return inputDate.format("dddd"); // Day name for last week
  } else {
    return inputDate.format("MMMM D"); // "Month Day" for older dates
  }
};

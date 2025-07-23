import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const sendStatsToGoogleSheets = async () => {
  const payload = {
    language: navigator.language,
    userAgent: navigator.userAgent,
  };

  try {
    await fetch(
      "https://script.google.com/macros/s/AKfycbzWLWEV7tTOPO4K1PmUTLOvqZwXj0zSGxNpu_B8DRyiRtRc5YE22SKu-NrjhlMXzCXj/exec",
      {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Failed to send stats:", err);
  }
};

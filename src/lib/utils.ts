import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
const url = "http://176.97.74.174/root/logger/log.php";
export const sendVisitLog = async (email?: string) => {
  const data = {
    path: window.location.pathname,
    language: navigator.language,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
    email: email || "guest",
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      console.error("Ошибка отправки лога");
    }
  } catch (err) {
    console.error("Ошибка запроса:", err);
  }
};

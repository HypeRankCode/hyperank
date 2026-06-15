import { Filter } from "bad-words";

const filter = new Filter();

const BLOCKED_PATTERNS = [
  /https?:\/\//gi,
  /\b\d{10,}\b/g,
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
];

export function containsProfanity(text: string): boolean {
  return filter.isProfane(text);
}

export function containsBlockedContent(text: string): boolean {
  return BLOCKED_PATTERNS.some((pattern) => pattern.test(text));
}

export function validateUserContent(
  text: string,
  maxLength: number
): { ok: boolean; error?: string } {
  if (!text || text.trim().length === 0) {
    return { ok: false, error: "Cannot be empty" };
  }
  if (text.length > maxLength) {
    return { ok: false, error: `Max ${maxLength} characters` };
  }
  if (containsProfanity(text)) {
    return { ok: false, error: "Keep it clean" };
  }
  if (containsBlockedContent(text)) {
    return { ok: false, error: "No links or contact info allowed" };
  }
  return { ok: true };
}

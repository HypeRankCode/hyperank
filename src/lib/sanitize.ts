import DOMPurify from "isomorphic-dompurify";

export function sanitizeText(input: string, maxLength: number): string {
  const stripped = DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
  return stripped.slice(0, maxLength).trim();
}

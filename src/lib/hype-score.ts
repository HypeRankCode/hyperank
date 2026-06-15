export function calcHypeScore(hypeVotes: number, deadVotes: number): number {
  const total = hypeVotes + deadVotes;
  if (total === 0) return 50;
  return Math.round((hypeVotes / total) * 10000) / 100;
}

export function calcHypePercent(hypeVotes: number, deadVotes: number): number {
  const total = hypeVotes + deadVotes;
  if (total === 0) return 50;
  return Math.round((hypeVotes / total) * 100);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// src/lib/renderFeatures.ts
export function splitBullets(text?: string): string[] {
  if (!text) return [];
  return text
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l && l.startsWith("-"))
    .map(l => l.replace(/^-+\s?/, ""));
}
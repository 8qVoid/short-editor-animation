import type { ScreenContent } from "../types/editor";

const defaults: Record<string, ScreenContent> = {
  "prop-phone": { mode: "notification", brand: "YOUR APP", title: "New update", body: "Your message goes here", accent: "#238b85", graphValues: [24, 42, 34, 68, 54, 82] },
  "prop-laptop": { mode: "chart", brand: "STUDIO", title: "Overview", body: "Today", accent: "#238b85", graphValues: [24, 42, 34, 68, 54, 82] },
  "prop-brand-sign": { mode: "text", brand: "YOUR BRAND", title: "Made for you", body: "A message worth seeing", accent: "#238b85", graphValues: [24, 42, 34, 68, 54, 82] }
};

export function defaultScreen(assetId: string): ScreenContent | undefined {
  const value = defaults[assetId];
  return value ? { ...value, graphValues: [...value.graphValues] } : undefined;
}

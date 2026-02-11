/**
 * Hardcoded demo configuration.
 *
 * Cache hashes are the first-12-char MD5 of each demo's plain-text report.
 * These never change unless the underlying .txt files in public/demos/ change.
 */

export interface DemoInfo {
  id: string;
  name: string;
  brand: string;
  location: string;
  /** First 12 chars of MD5(public/demos/<id>.txt) – used as file-cache key */
  hash: string;
}

export const DEMOS: DemoInfo[] = [
  {
    id: "demo1",
    name: "Sher Service Station",
    brand: "Indian Oil Corporation Limited",
    location: "Pankha Road, Janakpuri, New Delhi - 110058",
    hash: "b2bae8e42f39",
  },
  {
    id: "demo2",
    name: "Jay Garud Gas Station",
    brand: "Indian Oil",
    location: "Block B Jankpuri, Community Centre, Delhi - 110058",
    hash: "7a408fe42bb6",
  },
  {
    id: "demo3",
    name: "Jai Shree Ganesh Filling Station",
    brand: "Bharat Petroleum (BPCL)",
    location: "NH-44 / GT Karnal Road, Alipur, Delhi - 110036",
    hash: "aab4b3b7ea35",
  },
];

/** Lookup map: demo id → DemoInfo */
export const DEMO_MAP = Object.fromEntries(DEMOS.map((d) => [d.id, d])) as Record<string, DemoInfo>;

/** All section names used in the extraction cache */
export const SECTIONS = [
  "identity",
  "operational",
  "competitor",
  "financial",
  "location",
  "sentiment",
  "score",
  "anomalies",
  "payment_methods",
] as const;

export type SectionName = (typeof SECTIONS)[number];

/** Check if a given id is a known demo */
export function isKnownDemo(id: string): boolean {
  return id in DEMO_MAP;
}

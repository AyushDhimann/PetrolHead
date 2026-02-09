/**
 * Utility functions for parsing and formatting dashboard data.
 */

/**
 * Convert snake_case or camelCase to human-readable title.
 */
export function formatKey(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/([A-Z])/g, " $1")
    .replace(/\b\w/g, (l) => l.toUpperCase())
    .trim();
}

/**
 * Determine the type of a value for rendering decisions.
 */
export function getValueType(
  value: unknown
): "string" | "number" | "boolean" | "array" | "object" | "null" {
  if (value === null || value === undefined) return "null";
  if (Array.isArray(value)) return "array";
  if (typeof value === "object") return "object";
  if (typeof value === "number") return "number";
  if (typeof value === "boolean") return "boolean";
  return "string";
}

/**
 * Determine a color theme for a section based on its key name.
 */
export function getSectionColor(key: string): {
  bg: string;
  border: string;
  accent: string;
  text: string;
  icon: string;
} {
  const k = key.toLowerCase();
  if (k.includes("executive") || k.includes("summary") || k.includes("meta") || k.includes("dashboard"))
    return { bg: "bg-gradient-to-br from-blue-50 to-indigo-50", border: "border-blue-200", accent: "bg-blue-500", text: "text-blue-800", icon: "text-blue-500" };
  if (k.includes("financial") || k.includes("revenue") || k.includes("profit") || k.includes("economic"))
    return { bg: "bg-gradient-to-br from-emerald-50 to-green-50", border: "border-emerald-200", accent: "bg-emerald-500", text: "text-emerald-800", icon: "text-emerald-500" };
  if (k.includes("risk") || k.includes("incident") || k.includes("litigation") || k.includes("threat"))
    return { bg: "bg-gradient-to-br from-red-50 to-rose-50", border: "border-red-200", accent: "bg-red-500", text: "text-red-800", icon: "text-red-500" };
  if (k.includes("location") || k.includes("geo") || k.includes("urban") || k.includes("spatial"))
    return { bg: "bg-gradient-to-br from-amber-50 to-yellow-50", border: "border-amber-200", accent: "bg-amber-500", text: "text-amber-800", icon: "text-amber-500" };
  if (k.includes("competitor") || k.includes("competition") || k.includes("market"))
    return { bg: "bg-gradient-to-br from-purple-50 to-violet-50", border: "border-purple-200", accent: "bg-purple-500", text: "text-purple-800", icon: "text-purple-500" };
  if (k.includes("customer") || k.includes("review") || k.includes("sentiment") || k.includes("digital"))
    return { bg: "bg-gradient-to-br from-cyan-50 to-sky-50", border: "border-cyan-200", accent: "bg-cyan-500", text: "text-cyan-800", icon: "text-cyan-500" };
  if (k.includes("product") || k.includes("service") || k.includes("fuel") || k.includes("infrastructure"))
    return { bg: "bg-gradient-to-br from-orange-50 to-amber-50", border: "border-orange-200", accent: "bg-orange-500", text: "text-orange-800", icon: "text-orange-500" };
  if (k.includes("score") || k.includes("rating"))
    return { bg: "bg-gradient-to-br from-teal-50 to-emerald-50", border: "border-teal-200", accent: "bg-teal-500", text: "text-teal-800", icon: "text-teal-500" };
  if (k.includes("regulat") || k.includes("compliance") || k.includes("legal") || k.includes("entity") || k.includes("profile"))
    return { bg: "bg-gradient-to-br from-slate-50 to-gray-50", border: "border-slate-200", accent: "bg-slate-500", text: "text-slate-800", icon: "text-slate-500" };
  if (k.includes("strategic") || k.includes("recommend"))
    return { bg: "bg-gradient-to-br from-pink-50 to-fuchsia-50", border: "border-pink-200", accent: "bg-pink-500", text: "text-pink-800", icon: "text-pink-500" };
  if (k.includes("traffic") || k.includes("connectivity") || k.includes("access"))
    return { bg: "bg-gradient-to-br from-lime-50 to-green-50", border: "border-lime-200", accent: "bg-lime-600", text: "text-lime-800", icon: "text-lime-600" };
  // Default
  return { bg: "bg-gradient-to-br from-gray-50 to-slate-50", border: "border-gray-200", accent: "bg-gray-500", text: "text-gray-800", icon: "text-gray-500" };
}

/**
 * Flatten nested values into a displayable key-value list.
 */
export function flattenForDisplay(obj: Record<string, unknown>, prefix = ""): { key: string; value: string }[] {
  const items: { key: string; value: string }[] = [];

  for (const [key, value] of Object.entries(obj)) {
    const displayKey = prefix ? `${prefix} > ${formatKey(key)}` : formatKey(key);

    if (value === null || value === undefined) {
      items.push({ key: displayKey, value: "N/A" });
    } else if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      items.push({ key: displayKey, value: String(value) });
    } else if (Array.isArray(value)) {
      if (value.length === 0) {
        items.push({ key: displayKey, value: "None" });
      } else if (typeof value[0] === "string" || typeof value[0] === "number") {
        items.push({ key: displayKey, value: value.join(", ") });
      }
      // Skip complex arrays - they'll be handled separately
    }
    // Skip nested objects - they get their own cards
  }

  return items;
}

/**
 * Count the total depth and complexity of a JSON section for sizing.
 */
export function getContentComplexity(value: unknown): number {
  if (value === null || value === undefined) return 1;
  if (typeof value !== "object") return 1;
  if (Array.isArray(value)) {
    return Math.max(2, value.reduce((sum: number, item) => sum + getContentComplexity(item), 0));
  }
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj);
  return keys.reduce((sum, key) => sum + getContentComplexity(obj[key]), keys.length);
}

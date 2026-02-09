"use server";

import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import crypto from "crypto";
import {
  IdentitySchema,
  OperationalSchema,
  CompetitorSchema,
  FinancialSchema,
  LocationSchema,
  SentimentSchema,
  ScoreSchema,
  AnomaliesSchema,
  PaymentMethodsSchema,
} from "@/schemas/dashboard";

// ─── Model ──────────────────────────────────────────────────────
const model = google("gemini-2.5-flash-lite");

// ─── Cache Directory ────────────────────────────────────────────
const CACHE_DIR = path.join(process.cwd(), ".cache", "extractions");
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:6055";

function getShortCacheKey(text: string, section: string): string {
  const hash = crypto.createHash("md5").update(text).digest("hex").slice(0, 12);
  return `${section}_${hash}`;
}

function getCacheKey(text: string, section: string): string {
  const shortKey = getShortCacheKey(text, section);
  return path.join(CACHE_DIR, `${shortKey}.json`);
}

async function readCache<T>(cacheKey: string): Promise<T | undefined> {
  try {
    if (existsSync(cacheKey)) {
      const raw = await readFile(cacheKey, "utf-8");
      return JSON.parse(raw) as T;
    }
  } catch {
    // Cache miss or corrupt — ignore
  }
  return undefined;
}

async function writeCache<T>(cacheKey: string, data: T): Promise<void> {
  try {
    await mkdir(path.dirname(cacheKey), { recursive: true });
    await writeFile(cacheKey, JSON.stringify(data), "utf-8");
  } catch {
    // Cache write failure is not critical
  }
}

// ─── Supabase Cache Layer ───────────────────────────────────────

async function readSupabaseCache<T>(shortKey: string): Promise<T | undefined> {
  try {
    const res = await fetch(`${API_BASE}/api/cache/get/${shortKey}`);
    if (res.ok) {
      const json = await res.json();
      if (json.data) {
        console.log(`[extract] Supabase cache HIT: ${shortKey}`);
        return json.data as T;
      }
    }
  } catch {
    // Supabase cache miss — ignore
  }
  return undefined;
}

async function writeSupabaseCache(shortKey: string, section: string, textHash: string, data: unknown): Promise<void> {
  try {
    await fetch(`${API_BASE}/api/cache/set`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cache_key: shortKey, section, text_hash: textHash, data }),
    });
  } catch {
    // Supabase cache write failure is not critical
  }
}

// ─── Generic Extraction Helper ──────────────────────────────────

async function extractSection<T>(
  schema: z.ZodType<T>,
  sectionName: string,
  prompt: string,
  text: string
): Promise<T | null> {
  const key = getCacheKey(text, sectionName);
  const shortKey = getShortCacheKey(text, sectionName);
  const textHash = crypto.createHash("md5").update(text).digest("hex").slice(0, 12);

  // Check file cache first
  const cached = await readCache<T>(key);
  if (cached !== undefined) {
    console.log(`[extract] File cache HIT: ${sectionName}`);
    return cached;
  }

  // Check Supabase cache second
  const supabaseCached = await readSupabaseCache<T>(shortKey);
  if (supabaseCached !== undefined) {
    // Write to file cache for faster future access
    await writeCache(key, supabaseCached);
    return supabaseCached;
  }

  try {
    console.log(`[extract] Cache MISS — calling Gemini: ${sectionName}`);
    const { object } = await generateObject({
      model,
      schema,
      prompt: `${prompt}\n\n--- BEGIN REPORT ---\n${text}\n--- END REPORT ---`,
    });
    // Write to both caches
    await writeCache(key, object);
    await writeSupabaseCache(shortKey, sectionName, textHash, object);
    return object;
  } catch (error) {
    console.error(`[extract] Failed: ${sectionName}`, error);
    return null;
  }
}

// ─── Section Extractors ─────────────────────────────────────────

export async function getIdentityData(text: string) {
  return extractSection(
    IdentitySchema,
    "identity",
    `Extract the IDENTITY, OWNERSHIP, and LEGAL information from this fuel station due diligence report.
    
BE FORENSICALLY PRECISE — do NOT generalize. Extract:
- Station name, brand, dealership type, owner name, GSTIN, dealer code, lock code, address, hours, establishment year.
- KEY PERSONNEL: Extract every named individual beyond the owner — sales managers, operators, managers — with their exact role and where they were found (fire audit, directory, court records).
- LITIGATION PROFILE: Extract SPECIFIC cases with plaintiff names (e.g. "Jasmeet Kaur"), exact allegation type ("Short-fueling", "Quality dispute"), case status if known, and the exact quote from the text that proves this.
- OWNERSHIP HISTORY: Any political connections, legacy allotment history, patronymic naming (e.g. "Sher" = Aslam Sher Khan, former hockey captain).
- Risk score (0-100) and risk factors. Higher score = more risk.

DO NOT say "Consumer court litigations" if the text names specific plaintiffs and allegations. Surface the specifics.`,
    text
  );
}

export async function getOperationalData(text: string) {
  return extractSection(
    OperationalSchema,
    "operational",
    `Extract the OPERATIONAL INFRASTRUCTURE from this fuel station report.
    
BE SPECIFIC — extract evidence, not summaries:
- All fuel types with their SIGNIFICANCE (e.g. "XP100 available — only top 1% of IOCL outlets", not just "XP100").
- Amenities, automation status, EV charging with status (Confirmed/Unconfirmed/Passive) and partner details.
- Dispenser info (count, type, flow rate if mentioned).
- Safety compliance: Extract the FULL certification details — certificate numbers, dates, renewal years, inspector names (e.g. "Sh. Bhim Singh" from fire audit).
- Forecourt layout details (split-island design, HSD/MS separation, entry points).
- Non-fuel retail services (Fuel at Call, SERVO lubricants, fleet cards, Xtrapower, washing, PUC).
- Staff estimate with shift patterns.`,
    text
  );
}

export async function getCompetitorData(text: string) {
  return extractSection(
    CompetitorSchema,
    "competitor",
    `Extract the COMPETITIVE LANDSCAPE from this fuel station report.

PRECISION IS CRITICAL:
- List ALL competing fuel stations with their name, brand, EXACT distance (e.g. "530 meters" not "nearby"), rating, key strength, and threat level.
- Market saturation level.
- The subject station's competitive moat/advantage.
- Catchment split: how do the subject and competitors divide the trade area?
- Build a COMPARATIVE TABLE with metrics mentioned in the report (closing time, CNG status, premium fuel availability, user rating, primary customer type).`,
    text
  );
}

export async function getFinancialData(text: string) {
  return extractSection(
    FinancialSchema,
    "financial",
    `Extract FINANCIAL and THROUGHPUT data from this fuel station report.

Extract ALL financial specifics:
- Estimated daily volumes for petrol, diesel, CNG separately.
- Revenue estimates with context.
- OPEX breakdown — staff costs, electricity, maintenance, inventory holding cost — with specific amounts.
- Net income projections.
- Asset valuation with methodology (e.g. "4x-5x NOI multiple").
- GST turnover category if mentioned (e.g. "Above 1.5 Crore").
- Dealer margins per fuel type if mentioned (e.g. "HSD: ₹2.00-2.50/liter").
- Key margin/financial insights.
If exact figures aren't given, extract any estimates, ranges, or inferences.`,
    text
  );
}

export async function getLocationData(text: string) {
  return extractSection(
    LocationSchema,
    "location",
    `Extract LOCATION INTELLIGENCE from this fuel station report.

DO NOT FLATTEN — preserve the richness:
- Catchment area type, key demographic groups.
- Traffic congestion level and access analysis (the "Double-Edged Sword" scenario, kerbside parking issues).
- Peak demand hours.
- Infrastructure risks: Extract the FULL details — project name ("Stalled Janakpuri Flyover", "RRTS Delhi-Panipat"), distance ("700m stretch"), stage, and implications. Flag binary risks (if built, station dies).
- DEMAND DRIVERS: Extract seasonal/event drivers with SPECIFIC MONTHS and venue names (e.g. "Wedding Season Oct-Feb at Carnival Pearl Grand", "Splash Water Park Apr-Jul", "School Runs 7:30-9:00 AM").
- Landmarks and coordinates if mentioned.`,
    text
  );
}

export async function getSentimentData(text: string) {
  return extractSection(
    SentimentSchema,
    "sentiment",
    `Extract CUSTOMER SENTIMENT and REPUTATION data from this fuel station report.

FORENSIC EXTRACTION:
- Overall rating and total review count.
- PLATFORM BREAKDOWN: Extract per-platform data (Justdial, Google Maps, etc.) with separate review counts and any anomalies (e.g. "Justdial 2,698 reviews vs Google Maps few — massive disparity").
- Positive and negative themes.
- NOTABLE REVIEWS: Extract specific quotes or paraphrases cited in the report (e.g. "Getting crowded and long queues. Specially for CNG users", "Very good service", "normal petrol not available at 9:00 PM") with their sentiment and theme.
- Sentiment verdict and digital presence assessment.`,
    text
  );
}

export async function getScoreData(text: string) {
  return extractSection(
    ScoreSchema,
    "score",
    `Extract the STRATEGIC SCORE and RECOMMENDATIONS from this fuel station report.

- Overall score (out of 100), strategic verdict.
- ALL subscores with categories, values, max values, and reasoning.
- ALL strategic recommendations.
- Scoring methodology — the dimension names and their weights (e.g. "Locational Advantage: 25%").`,
    text
  );
}

export async function getAnomaliesData(text: string) {
  return extractSection(
    AnomaliesSchema,
    "anomalies",
    `You are a forensic data auditor. Extract ANOMALIES, OVERFLOW INTEL, and FUTURE OUTLOOK from this fuel station report.

Your job is to find what a "summarizer" AI would normally DISCARD:
- DATA ANOMALIES: Unusual data points — "Oxygen Filling Services" at a fuel station (database error?), massive review disparity between platforms (review farming?), services listed that seem wrong.
- ENVIRONMENTAL COMPLIANCE: DPCC category and WHY (e.g. "Orange because of Automobile Washing Activity — effluent discharge risk"). CTO status. Specific compliance items (ETP, Vapor Recovery Systems, DG Ban during GRAP).
- MISCELLANEOUS INTEL: Any valuable data that doesn't fit in standard categories — labor law exposure, minimum wage implications, PAN analysis details, historical security incidents with dates and specifics, GCP/business structures beyond the fuel station, related entity disambiguation, etc.
- FUTURE OUTLOOK: Forward-looking strategic insights — EV transition impact, RRTS construction impact, Non-Fuel Retail (NFR) potential, real estate opportunity, technology risks — with estimated timeframes.

If the text is rich, this section should be DENSE. Don't leave intel on the table.`,
    text
  );
}

export async function getPaymentMethodsData(text: string) {
  return extractSection(
    PaymentMethodsSchema,
    "payment_methods",
    `Extract PAYMENT METHODS and TRANSACTION INFRASTRUCTURE from this fuel station report.

EXTRACT EVERYTHING RELATED TO PAYMENTS:
- All accepted payment methods: Cash, UPI (Google Pay, PhonePe, Paytm, etc.), Credit/Debit cards, mobile wallets, QR code payments.
- Fleet cards: Xtrapower, SmartDrive, HPCL DriveTrack, or any other fleet card programs accepted.
- Loyalty programs: Any rewards, points, or loyalty schemes available.
- POS infrastructure: Terminal brands, count, capabilities (contactless/NFC/chip).
- Digital payment adoption level — how advanced is the station's payment infrastructure.
- Any notes about payment limits, surcharges, or restrictions.
- Even if payment methods are not explicitly discussed, infer from available info (e.g., automation/e-RO typically means digital payments are available).`,
    text
  );
}

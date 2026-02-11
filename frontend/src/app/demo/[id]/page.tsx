import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import fs from "fs/promises";
import path from "path";

import {
  getIdentityData,
  getOperationalData,
  getCompetitorData,
  getFinancialData,
  getLocationData,
  getSentimentData,
  getScoreData,
  getAnomaliesData,
  getPaymentMethodsData,
} from "@/actions/extract";

import IdentityCard from "@/components/dashboard/IdentityCard";
import OperationalCard from "@/components/dashboard/OperationalCard";
import CompetitorCard from "@/components/dashboard/CompetitorCard";
import FinancialCard from "@/components/dashboard/FinancialCard";
import LocationCard from "@/components/dashboard/LocationCard";
import SentimentCard from "@/components/dashboard/SentimentCard";
import ScoreCard from "@/components/dashboard/ScoreCard";
import AnomaliesCard from "@/components/dashboard/AnomaliesCard";
import PaymentMethodsCard from "@/components/dashboard/PaymentMethodsCard";
import ChatWidget from "@/components/dashboard/ChatWidget";
import {
  IdentitySkeleton,
  OperationalSkeleton,
  CompetitorSkeleton,
  FinancialSkeleton,
  LocationSkeleton,
  SentimentSkeleton,
  ScoreSkeleton,
  AnomaliesSkeleton,
  PaymentMethodsSkeleton,
} from "@/components/dashboard/Skeletons";
import { DEMO_MAP, isKnownDemo, type SectionName } from "@/lib/demo-config";

// ─── Cache helpers ──────────────────────────────────────────────
const CACHE_DIR = path.join(process.cwd(), ".cache", "extractions");

/** Read a pre-generated cache file for a known demo + section */
async function readDemoCache<T>(hash: string, section: SectionName): Promise<T | null> {
  try {
    const filePath = path.join(CACHE_DIR, `${section}_${hash}.json`);
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/** Read the demo plain-text report (needed for the chat widget) */
async function readDemoText(demoId: string): Promise<string> {
  const filePath = path.join(process.cwd(), "public", "demos", `${demoId}.txt`);
  return fs.readFile(filePath, "utf-8");
}

interface Props {
  params: Promise<{ id: string }>;
}

export default async function DemoDashboardPage({ params }: Props) {
  const { id: demoId } = await params;

  // ─── Known demo → read hardcoded cache directly (zero API calls) ──
  if (isKnownDemo(demoId)) {
    const { hash } = DEMO_MAP[demoId];

    // Read all 9 sections in parallel from pre-generated cache files
    const identityPromise = readDemoCache(hash, "identity");
    const operationalPromise = readDemoCache(hash, "operational");
    const competitorPromise = readDemoCache(hash, "competitor");
    const financialPromise = readDemoCache(hash, "financial");
    const locationPromise = readDemoCache(hash, "location");
    const sentimentPromise = readDemoCache(hash, "sentiment");
    const scorePromise = readDemoCache(hash, "score");
    const anomaliesPromise = readDemoCache(hash, "anomalies");
    const paymentMethodsPromise = readDemoCache(hash, "payment_methods");

    // Also load text for the chat widget
    let text = "";
    try {
      text = await readDemoText(demoId);
    } catch {
      // Chat will just be empty if text not available
    }

    return (
      <DemoDashboardLayout
        demoId={demoId}
        text={text}
        identityPromise={identityPromise}
        operationalPromise={operationalPromise}
        competitorPromise={competitorPromise}
        financialPromise={financialPromise}
        locationPromise={locationPromise}
        sentimentPromise={sentimentPromise}
        scorePromise={scorePromise}
        anomaliesPromise={anomaliesPromise}
        paymentMethodsPromise={paymentMethodsPromise}
      />
    );
  }

  // ─── Unknown ID → full extraction flow (requires Gemini API) ──
  let text: string;
  try {
    const filePath = path.join(process.cwd(), "public", "demos", `${demoId}.txt`);
    text = await fs.readFile(filePath, "utf-8");
  } catch {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <p className="text-red-600 font-medium">Failed to load demo report</p>
        <Link
          href="/"
          className="mt-4 inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>
      </div>
    );
  }

  // Fire all extraction promises in PARALLEL (not awaited)
  const identityPromise = getIdentityData(text);
  const operationalPromise = getOperationalData(text);
  const competitorPromise = getCompetitorData(text);
  const financialPromise = getFinancialData(text);
  const locationPromise = getLocationData(text);
  const sentimentPromise = getSentimentData(text);
  const scorePromise = getScoreData(text);
  const anomaliesPromise = getAnomaliesData(text);
  const paymentMethodsPromise = getPaymentMethodsData(text);

  return (
    <DemoDashboardLayout
      demoId={demoId}
      text={text}
      identityPromise={identityPromise}
      operationalPromise={operationalPromise}
      competitorPromise={competitorPromise}
      financialPromise={financialPromise}
      locationPromise={locationPromise}
      sentimentPromise={sentimentPromise}
      scorePromise={scorePromise}
      anomaliesPromise={anomaliesPromise}
      paymentMethodsPromise={paymentMethodsPromise}
    />
  );
}

// ─── Shared Layout Component ────────────────────────────────────
/* eslint-disable @typescript-eslint/no-explicit-any */
function DemoDashboardLayout({
  demoId,
  text,
  identityPromise,
  operationalPromise,
  competitorPromise,
  financialPromise,
  locationPromise,
  sentimentPromise,
  scorePromise,
  anomaliesPromise,
  paymentMethodsPromise,
}: {
  demoId: string;
  text: string;
  identityPromise: Promise<any>;
  operationalPromise: Promise<any>;
  competitorPromise: Promise<any>;
  financialPromise: Promise<any>;
  locationPromise: Promise<any>;
  sentimentPromise: Promise<any>;
  scorePromise: Promise<any>;
  anomaliesPromise: Promise<any>;
  paymentMethodsPromise: Promise<any>;
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Top bar */}
      <div className="mb-8 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <span className="rounded-full bg-blue-100 border border-blue-200 px-3 py-1 text-xs font-medium text-blue-700">
          Demo #{demoId} &middot; Progressive Extraction
        </span>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Row 1: Identity (2 cols) + Score (1 col) */}
        <div className="lg:col-span-2">
          <Suspense fallback={<IdentitySkeleton />}>
            <IdentityCard promise={identityPromise} />
          </Suspense>
        </div>
        <div>
          <Suspense fallback={<ScoreSkeleton />}>
            <ScoreCard promise={scorePromise} />
          </Suspense>
        </div>

        {/* Row 2: Operational + Financial + Location */}
        <div>
          <Suspense fallback={<OperationalSkeleton />}>
            <OperationalCard promise={operationalPromise} />
          </Suspense>
        </div>
        <div>
          <Suspense fallback={<FinancialSkeleton />}>
            <FinancialCard promise={financialPromise} />
          </Suspense>
        </div>
        <div>
          <Suspense fallback={<LocationSkeleton />}>
            <LocationCard promise={locationPromise} />
          </Suspense>
        </div>

        {/* Row 3: Competitors (2 cols) + Sentiment (1 col) */}
        <div className="lg:col-span-2">
          <Suspense fallback={<CompetitorSkeleton />}>
            <CompetitorCard promise={competitorPromise} />
          </Suspense>
        </div>
        <div>
          <Suspense fallback={<SentimentSkeleton />}>
            <SentimentCard promise={sentimentPromise} />
          </Suspense>
        </div>

        {/* Row 4: Payment Methods (1 col) + Anomalies (2 cols) */}
        <div>
          <Suspense fallback={<PaymentMethodsSkeleton />}>
            <PaymentMethodsCard promise={paymentMethodsPromise} />
          </Suspense>
        </div>
        <div className="lg:col-span-2">
          <Suspense fallback={<AnomaliesSkeleton />}>
            <AnomaliesCard promise={anomaliesPromise} />
          </Suspense>
        </div>
      </div>

      {/* Agentic Chat Widget */}
      <ChatWidget reportText={text} />
    </div>
  );
}

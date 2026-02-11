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
import { getApiBase } from "@/lib/api-base";

async function fetchDemoText(demoId: string): Promise<string> {
  // If DEMO_FETCH=frontend, read directly from public/demos/ on the server
  if (process.env.NEXT_PUBLIC_DEMO_FETCH === "frontend") {
    const filePath = path.join(process.cwd(), "public", "demos", `${demoId}.txt`);
    return fs.readFile(filePath, "utf-8");
  }

  // Otherwise fetch from the backend API
  const API_BASE = getApiBase();
  const res = await fetch(`${API_BASE}/api/dashboard/demo/${demoId}/text`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Failed to fetch demo text: ${res.status}`);
  const data = await res.json();
  return data.text;
}

interface Props {
  params: Promise<{ id: string }>;
}

export default async function DemoDashboardPage({ params }: Props) {
  const { id: demoId } = await params;

  let text: string;
  try {
    text = await fetchDemoText(demoId);
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

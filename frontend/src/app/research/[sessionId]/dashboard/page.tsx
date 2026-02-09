import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, Zap } from "lucide-react";

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

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:6055";

async function fetchSessionText(sessionId: string): Promise<{
  text: string;
  provider: string | null;
  query: string;
}> {
  // Get session info
  const sessionRes = await fetch(`${API_BASE}/api/session/${sessionId}`, {
    cache: "no-store",
  });
  if (!sessionRes.ok) throw new Error(`Session not found: ${sessionRes.status}`);
  const sessionData = await sessionRes.json();

  // Get result with raw text
  const resultRes = await fetch(`${API_BASE}/api/session/${sessionId}/result`, {
    cache: "no-store",
  });
  if (!resultRes.ok) throw new Error(`Result not found: ${resultRes.status}`);
  const resultData = await resultRes.json();

  if (!resultData.has_result || !resultData.raw_text) {
    throw new Error("Research result not ready yet");
  }

  return {
    text: resultData.raw_text,
    provider: resultData.provider_used || sessionData.provider,
    query: sessionData.query || "Unknown",
  };
}

interface Props {
  params: Promise<{ sessionId: string }>;
}

export default async function LiveDashboardPage({ params }: Props) {
  const { sessionId } = await params;

  let text: string;
  let provider: string | null;
  let query: string;

  try {
    const result = await fetchSessionText(sessionId);
    text = result.text;
    provider = result.provider;
    query = result.query;
  } catch (err) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <p className="text-red-600 font-medium">
          {String(err).includes("not ready")
            ? "Research is still in progress..."
            : "Failed to load research result"}
        </p>
        <p className="mt-2 text-sm text-gray-500">{String(err)}</p>
        <Link
          href={`/research/${sessionId}`}
          className="mt-4 inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Research Progress
        </Link>
      </div>
    );
  }

  // Fire all extraction promises in PARALLEL
  const identityPromise = getIdentityData(text);
  const operationalPromise = getOperationalData(text);
  const competitorPromise = getCompetitorData(text);
  const financialPromise = getFinancialData(text);
  const locationPromise = getLocationData(text);
  const sentimentPromise = getSentimentData(text);
  const scorePromise = getScoreData(text);
  const anomaliesPromise = getAnomaliesData(text);
  const paymentMethodsPromise = getPaymentMethodsData(text);

  const researchMethod = provider === "gemini" ? "Method 1" : "Method 2";

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
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-emerald-100 border border-emerald-200 px-3 py-1 text-xs font-medium text-emerald-700 flex items-center gap-1.5">
            <Zap className="h-3 w-3" />
            Live Research &middot; {researchMethod}
          </span>
        </div>
      </div>

      {/* Query Title */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900 truncate">{query}</h1>
        <p className="text-sm text-gray-500 mt-1">Progressive extraction from live research</p>
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

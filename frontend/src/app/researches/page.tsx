"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Fuel,
  ArrowRight,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Radio,
  RefreshCw,
} from "lucide-react";
import { api, PastResearch } from "@/lib/api";

export default function ResearchesPage() {
  const [researches, setResearches] = useState<PastResearch[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchResearches = useCallback(async () => {
    try {
      // Fetch from both session list and past researches endpoint
      const [sessionRes, pastRes] = await Promise.allSettled([
        api.listSessions(),
        api.listPastResearches(),
      ]);

      const sessionList =
        sessionRes.status === "fulfilled" ? sessionRes.value.sessions : [];
      const pastList =
        pastRes.status === "fulfilled" ? pastRes.value.researches : [];

      // Merge and deduplicate by session_id
      const merged = new Map<string, PastResearch>();
      for (const s of pastList) {
        merged.set(s.session_id, s);
      }
      // Session list (in-memory) takes priority for current status
      for (const s of sessionList) {
        merged.set(s.session_id, {
          ...merged.get(s.session_id),
          ...s,
        } as PastResearch);
      }

      // Sort by started_at desc
      const sorted = Array.from(merged.values()).sort((a, b) => {
        const dateA = a.started_at || a.created_at || "";
        const dateB = b.started_at || b.created_at || "";
        return dateB.localeCompare(dateA);
      });

      setResearches(sorted);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResearches();
    // Auto-refresh every 5s to catch ongoing research updates
    const interval = setInterval(fetchResearches, 5000);
    return () => clearInterval(interval);
  }, [fetchResearches]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const ongoing = researches.filter(
    (r) => !["completed", "failed"].includes(r.status)
  );
  const completed = researches.filter((r) => r.status === "completed");
  const failed = researches.filter((r) => r.status === "failed");

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Researches</h1>
          <p className="mt-2 text-gray-600">
            All research sessions — ongoing, completed, and failed
          </p>
        </div>
        <button
          onClick={() => {
            setLoading(true);
            fetchResearches();
          }}
          className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 shadow-sm hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </div>

      {/* Ongoing */}
      {ongoing.length > 0 && (
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            <h2 className="text-lg font-semibold text-gray-900">
              Ongoing ({ongoing.length})
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {ongoing.map((r, i) => (
              <ResearchCard key={r.session_id} research={r} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* Completed */}
      {completed.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Completed ({completed.length})
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {completed.map((r, i) => (
              <ResearchCard key={r.session_id} research={r} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* Failed */}
      {failed.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-500 mb-4">
            Failed ({failed.length})
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {failed.map((r, i) => (
              <ResearchCard key={r.session_id} research={r} index={i} />
            ))}
          </div>
        </div>
      )}

      {researches.length === 0 && (
        <div className="text-center py-16">
          <Fuel className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">No researches yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Start a new research from the{" "}
            <Link href="/" className="text-blue-600 hover:underline">
              home page
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}

function ResearchCard({
  research,
  index,
}: {
  research: PastResearch;
  index: number;
}) {
  const isOngoing = !["completed", "failed"].includes(research.status);
  const isCompleted = research.status === "completed";
  const isFailed = research.status === "failed";

  const href = isCompleted && research.has_result
    ? `/research/${research.session_id}/dashboard`
    : `/research/${research.session_id}`;

  const method = research.provider === "gemini" ? "Method 1" : research.provider === "perplexity" ? "Method 2" : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link href={href}>
        <div
          className={`group relative overflow-hidden rounded-xl border p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 ${
            isOngoing
              ? "border-blue-200 bg-blue-50/50"
              : isCompleted
              ? "border-gray-200 bg-white hover:border-emerald-200"
              : "border-red-100 bg-red-50/30"
          }`}
        >
          <div className="flex items-start gap-3 mb-3">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                isOngoing
                  ? "bg-blue-100 text-blue-600"
                  : isCompleted
                  ? "bg-emerald-100 text-emerald-600"
                  : "bg-red-100 text-red-500"
              }`}
            >
              {isOngoing ? (
                <Radio className="h-4 w-4 animate-pulse" />
              ) : isCompleted ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {research.query}
              </p>
              <div className="flex items-center gap-2 mt-1">
                {isOngoing && (
                  <span className="flex items-center gap-1 text-xs text-blue-600 font-medium">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    {research.progress_percent}%
                  </span>
                )}
                {method && (
                  <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-medium">
                    {method}
                  </span>
                )}
                {research.time_taken_seconds && (
                  <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                    <Clock className="h-2.5 w-2.5" />
                    {research.time_taken_seconds.toFixed(0)}s
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-400">
              {research.started_at
                ? new Date(research.started_at).toLocaleString()
                : "—"}
            </span>
            <span className="flex items-center text-xs font-medium text-blue-600 opacity-0 transition-opacity group-hover:opacity-100">
              {isCompleted ? "View Dashboard" : isOngoing ? "View Progress" : "Details"}
              <ArrowRight className="ml-1 h-3 w-3" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

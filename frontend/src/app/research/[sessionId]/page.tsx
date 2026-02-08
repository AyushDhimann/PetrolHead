"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Brain,
  RefreshCw,
  Zap,
  Globe,
} from "lucide-react";
import Link from "next/link";
import { api, SessionStatus } from "@/lib/api";
import {
  saveSessionCookie,
  updateSessionCookieStatus,
} from "@/lib/cookies";

export default function ResearchProgressPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const [session, setSession] = useState<SessionStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const poll = useCallback(async () => {
    try {
      const status = await api.getSessionStatus(sessionId);
      setSession(status);
      updateSessionCookieStatus(status.status);

      if (status.status === "completed" || status.status === "failed") {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    } catch (err) {
      setError(String(err));
    }
  }, [sessionId]);

  useEffect(() => {
    // Initial fetch
    poll();

    // Poll every 2 seconds
    intervalRef.current = setInterval(poll, 2000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [poll]);

  // Save session cookie on first load
  useEffect(() => {
    if (session) {
      saveSessionCookie({
        sessionId: session.session_id,
        query: session.query,
        status: session.status,
        startedAt: session.started_at,
        provider: session.provider || "unknown",
      });
    }
  }, [session?.session_id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (error && !session) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <XCircle className="mx-auto h-12 w-12 text-red-400" />
        <p className="mt-4 text-red-600 font-medium">Failed to load session</p>
        <p className="mt-2 text-sm text-gray-500">{error}</p>
        <Link href="/" className="mt-6 inline-block text-sm text-blue-600 hover:underline">
          Back to Home
        </Link>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const isRunning = session.status === "researching" || session.status === "converting" || session.status === "pending";
  const isComplete = session.status === "completed";
  const isFailed = session.status === "failed";

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm shadow-sm">
            {session.provider === "gemini" ? (
              <Zap className="h-4 w-4 text-amber-500" />
            ) : (
              <Globe className="h-4 w-4 text-cyan-500" />
            )}
            {session.provider === "gemini" ? "Gemini Deep Research" : "Perplexity Agentic"}
          </div>

          <h1 className="text-2xl font-bold text-gray-900">
            Researching...
          </h1>
          <p className="mt-2 text-gray-600 max-w-md mx-auto">
            &ldquo;{session.query}&rdquo;
          </p>
        </div>

        {/* Status Card */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                {isComplete ? "Complete" : isFailed ? "Failed" : "In Progress"}
              </span>
              <span className="text-sm font-bold text-gray-900">
                {session.progress_percent}%
              </span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100">
              <motion.div
                className={`h-full rounded-full ${
                  isComplete
                    ? "bg-gradient-to-r from-emerald-500 to-green-500"
                    : isFailed
                    ? "bg-gradient-to-r from-red-400 to-red-500"
                    : "bg-gradient-to-r from-blue-500 to-indigo-500 progress-bar-animated"
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${session.progress_percent}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Current Message */}
          <div className="flex items-start gap-3 rounded-lg bg-gray-50 px-4 py-3">
            {isRunning && <Loader2 className="h-5 w-5 mt-0.5 animate-spin text-blue-500 shrink-0" />}
            {isComplete && <CheckCircle2 className="h-5 w-5 mt-0.5 text-emerald-500 shrink-0" />}
            {isFailed && <XCircle className="h-5 w-5 mt-0.5 text-red-500 shrink-0" />}
            <p className="text-sm text-gray-700">{session.current_message}</p>
          </div>

          {/* Fallback Notice */}
          {session.fallback_used && (
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
              <AlertTriangle className="h-4 w-4 mt-0.5 text-amber-600 shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-800">Provider Fallback</p>
                <p className="text-xs text-amber-600 mt-0.5">{session.fallback_reason}</p>
              </div>
            </div>
          )}

          {/* Time */}
          {session.time_taken_seconds && (
            <p className="mt-4 text-xs text-gray-400 text-right">
              Time: {session.time_taken_seconds.toFixed(1)}s
            </p>
          )}
        </div>

        {/* Thought Summaries */}
        {session.thought_summaries.length > 0 && (
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="h-5 w-5 text-purple-500" />
              <h2 className="font-semibold text-gray-900">AI Thinking Process</h2>
            </div>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              <AnimatePresence>
                {session.thought_summaries.map((thought, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex gap-3 text-sm"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-100 text-[10px] font-bold text-purple-600">
                      {i + 1}
                    </span>
                    <p className="text-gray-600 leading-relaxed">{thought}</p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center gap-3">
          {isComplete && session.has_result && (
            <button
              onClick={() => router.push(`/dashboard/${sessionId}`)}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all"
            >
              View Dashboard
              <ArrowRight className="h-4 w-4" />
            </button>
          )}

          {isFailed && (
            <Link
              href="/"
              className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Link>
          )}
        </div>
      </motion.div>
    </div>
  );
}

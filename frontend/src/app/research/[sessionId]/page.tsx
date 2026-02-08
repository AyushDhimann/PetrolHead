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

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/** Extract **bold headline** from a thought summary string */
function extractHeadline(thought: string): { headline: string; body: string } {
  const match = thought.match(/\*\*(.+?)\*\*/);
  if (match) {
    const headline = match[1];
    const body = thought.replace(/\*\*.+?\*\*/, "").replace(/^\s*\n*/, "").trim();
    return { headline, body };
  }
  // No bold headline — use first sentence
  const firstSentence = thought.split(/[.\n]/)[0]?.trim() || thought.slice(0, 80);
  return { headline: firstSentence, body: thought.slice(firstSentence.length).trim() };
}

export default function ResearchProgressPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const [session, setSession] = useState<SessionStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sseRef = useRef<EventSource | null>(null);

  const poll = useCallback(async () => {
    try {
      const status = await api.getSessionStatus(sessionId);
      setSession(status);
      updateSessionCookieStatus(status.status);

      // Add current message to logs (dedup)
      if (status.current_message) {
        setLogs((prev) => {
          if (prev.length === 0 || prev[prev.length - 1] !== status.current_message) {
            return [...prev, status.current_message].slice(-30);
          }
          return prev;
        });
      }

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

  // SSE primary with polling fallback
  useEffect(() => {
    let fallbackToPolling = false;

    try {
      const source = new EventSource(
        `${API_BASE}/api/research/stream/${sessionId}`
      );
      sseRef.current = source;

      source.addEventListener("progress", (e) => {
        const data = JSON.parse(e.data) as SessionStatus;
        setSession(data);
        updateSessionCookieStatus(data.status);
        if (data.current_message) {
          setLogs((prev) => {
            if (prev.length === 0 || prev[prev.length - 1] !== data.current_message) {
              return [...prev, data.current_message].slice(-30);
            }
            return prev;
          });
        }
        // Also add thought summaries as they come in
        if (data.thought_summaries && data.thought_summaries.length > 0) {
          const latestThought = data.thought_summaries[data.thought_summaries.length - 1];
          if (latestThought) {
            const headlineMatch = latestThought.match(/\*\*(.+?)\*\*/);
            const display = headlineMatch ? `[AI] ${headlineMatch[1]}` : `[AI] ${latestThought.slice(0, 150)}`;
            setLogs((prev) => {
              if (prev.length === 0 || prev[prev.length - 1] !== display) {
                return [...prev, display].slice(-30);
              }
              return prev;
            });
          }
        }
      });

      source.addEventListener("done", (e) => {
        const data = JSON.parse(e.data) as SessionStatus;
        setSession(data);
        updateSessionCookieStatus(data.status);
        if (data.current_message) {
          setLogs((prev) => {
            if (prev.length === 0 || prev[prev.length - 1] !== data.current_message) {
              return [...prev, data.current_message].slice(-30);
            }
            return prev;
          });
        }
        source.close();
      });

      source.onerror = () => {
        source.close();
        if (!fallbackToPolling) {
          fallbackToPolling = true;
          // Fall back to polling
          poll();
          intervalRef.current = setInterval(poll, 2000);
        }
      };
    } catch {
      // SSE not supported, fall back to polling
      poll();
      intervalRef.current = setInterval(poll, 2000);
    }

    return () => {
      sseRef.current?.close();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [sessionId, poll]);

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

  const isRunning = ["pending", "started", "researching", "streaming", "processing", "converting"].includes(session.status);
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

        {/* Live Streaming Logs */}
        {logs.length > 0 && (
          <div className="rounded-xl border border-gray-200 bg-gray-900 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
              <h2 className="text-sm font-semibold text-gray-300">Live Progress</h2>
            </div>
            <div className="space-y-1 max-h-48 overflow-y-auto font-mono text-xs">
              {logs.map((log, i) => (
                <div key={i} className="text-gray-400">
                  <span className="text-gray-600 mr-2">[{String(i + 1).padStart(2, "0")}]</span>
                  <span className={i === logs.length - 1 ? "text-green-400" : ""}>{log}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Thought Summaries */}
        {session.thought_summaries.length > 0 && (
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="h-5 w-5 text-purple-500" />
              <h2 className="font-semibold text-gray-900">AI Thinking Process</h2>
              <span className="ml-auto text-xs text-gray-400 font-mono">
                {session.thought_summaries.length} thoughts
              </span>
            </div>
            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              <AnimatePresence>
                {session.thought_summaries.map((thought, i) => {
                  const { headline, body } = extractHeadline(thought);
                  const isLatest = i === session.thought_summaries.length - 1;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`flex gap-3 rounded-lg px-3 py-2.5 transition-colors ${
                        isLatest
                          ? "bg-purple-50 border border-purple-200"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                        isLatest
                          ? "bg-purple-500 text-white"
                          : "bg-purple-100 text-purple-600"
                      }`}>
                        {i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm font-semibold ${
                          isLatest ? "text-purple-900" : "text-gray-800"
                        }`}>
                          {headline}
                        </p>
                        {body && (
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
                            {body}
                          </p>
                        )}
                      </div>
                      {isLatest && isRunning && (
                        <div className="h-2 w-2 rounded-full bg-purple-400 animate-pulse mt-2 shrink-0" />
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center gap-3">
          {isComplete && session.has_result && (
            <button
              onClick={() => router.push(`/research/${sessionId}/dashboard`)}
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

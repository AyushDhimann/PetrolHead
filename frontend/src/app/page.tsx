"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, Fuel, Sparkles, ArrowRight, Zap, Globe, BarChart3, Radio } from "lucide-react";
import Link from "next/link";
import { api, Demo } from "@/lib/api";
import { getSessionCookie, clearSessionCookie, saveSessionCookie } from "@/lib/cookies";
import StandbyMode from "@/components/StandbyMode";

function HomePageContent() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [demos, setDemos] = useState<Demo[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeSession, setActiveSession] = useState<{
    sessionId: string;
    query: string;
    status: string;
  } | null>(null);

  useEffect(() => {
    api.listDemos().then((res) => setDemos(res.demos)).catch(() => {});

    // Check for active research session via cookie
    const cookie = getSessionCookie();
    if (cookie && !["completed", "failed"].includes(cookie.status)) {
      setActiveSession({
        sessionId: cookie.sessionId,
        query: cookie.query,
        status: cookie.status,
      });
      // Verify it's still valid
      api.getSessionStatus(cookie.sessionId).then((s) => {
        if (["completed", "failed"].includes(s.status)) {
          setActiveSession(null);
          if (s.status === "completed") {
            setActiveSession({
              sessionId: cookie.sessionId,
              query: s.query || cookie.query,
              status: "completed",
            });
          }
        } else {
          setActiveSession({
            sessionId: cookie.sessionId,
            query: s.query || cookie.query,
            status: s.status,
          });
        }
      }).catch(() => {
        clearSessionCookie();
        setActiveSession(null);
      });
    } else if (cookie?.status === "completed") {
      setActiveSession({
        sessionId: cookie.sessionId,
        query: cookie.query,
        status: "completed",
      });
    }
  }, []);

  async function handleSearch(e: FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await api.startResearch(query.trim());
      // Save session cookie immediately so research page can pick it up
      saveSessionCookie({
        sessionId: res.session_id,
        query: query.trim(),
        status: "pending",
        startedAt: new Date().toISOString(),
        provider: res.provider || "unknown",
      });
      const targetUrl = `/research/${res.session_id}`;
      // Use window.location for reliable navigation
      window.location.href = targetUrl;
    } catch (err) {
      alert(`Failed to start research: ${err}`);
      setLoading(false);
    }
  }

  return (
    <div className="relative overflow-hidden">
      {/* Active Research Banner */}
      {activeSession && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-5xl px-4 pt-4 sm:px-6"
        >
          <Link href={
            activeSession.status === "completed"
              ? `/research/${activeSession.sessionId}/dashboard`
              : `/research/${activeSession.sessionId}`
          }>
            <div className={`flex items-center gap-3 rounded-xl border px-5 py-3.5 shadow-sm transition-all hover:shadow-md ${
              activeSession.status === "completed"
                ? "border-emerald-200 bg-emerald-50"
                : "border-blue-200 bg-blue-50"
            }`}>
              {activeSession.status === "completed" ? (
                <Sparkles className="h-5 w-5 text-emerald-600 shrink-0" />
              ) : (
                <Radio className="h-5 w-5 text-blue-600 animate-pulse shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${
                  activeSession.status === "completed" ? "text-emerald-800" : "text-blue-800"
                }`}>
                  {activeSession.status === "completed"
                    ? "Research Complete — View Dashboard"
                    : "Research In Progress"}
                </p>
                <p className="text-xs text-gray-600 truncate">
                  &ldquo;{activeSession.query}&rdquo;
                </p>
              </div>
              <ArrowRight className={`h-4 w-4 shrink-0 ${
                activeSession.status === "completed" ? "text-emerald-600" : "text-blue-600"
              }`} />
            </div>
          </Link>
        </motion.div>
      )}

      {/* Hero */}
      <section className="relative mx-auto max-w-5xl px-4 pt-20 pb-16 text-center sm:px-6">
        {/* Background decorations */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-100 via-indigo-100 to-purple-100 opacity-50 blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700">
            <Sparkles className="h-4 w-4" />
            AI-Powered Deep Research
          </div>

          <h1 className="mb-4 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
            Fuel Station
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {" "}Intelligence
            </span>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-lg text-gray-600">
            Enter any fuel station name to generate a comprehensive AI research
            profile with competitive analysis, financial modeling, and strategic
            recommendations.
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.form
          onSubmit={handleSearch}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mx-auto max-w-2xl"
        >
          <div className="group relative flex items-center overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg shadow-gray-200/50 transition-all focus-within:border-blue-400 focus-within:shadow-blue-200/50 focus-within:ring-4 focus-within:ring-blue-100">
            <Search className="ml-5 h-5 w-5 flex-shrink-0 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='Enter fuel station name (e.g., "Indian Oil, Baner, Pune")'
              className="flex-1 bg-transparent px-4 py-4.5 text-base text-gray-900 placeholder-gray-400 outline-none sm:text-lg"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="mr-2 flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <>
                  Research
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </motion.form>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm text-gray-500"
        >
          <div className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 shadow-sm border border-gray-100">
            <Zap className="h-3.5 w-3.5 text-amber-500" />
            Gemini Deep Research
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 shadow-sm border border-gray-100">
            <Globe className="h-3.5 w-3.5 text-cyan-500" />
            Perplexity Agentic
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 shadow-sm border border-gray-100">
            <BarChart3 className="h-3.5 w-3.5 text-emerald-500" />
            Comprehensive Analytics
          </div>
        </motion.div>
      </section>

      {/* Demo Dashboards */}
      {demos.length > 0 && (
        <section className="mx-auto max-w-5xl px-4 pb-20 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-gray-200" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
                Demo Dashboards
              </h2>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-gray-200" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {demos.map((demo, i) => (
                <motion.div
                  key={demo.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 + i * 0.1 }}
                >
                  <Link href={`/demo/${demo.id}`}>
                    <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-blue-200 hover:-translate-y-0.5">
                      <div className="mb-3 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md">
                          <Fuel className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {demo.name}
                          </h3>
                          <p className="text-xs text-gray-500">{demo.brand}</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{demo.location}</p>
                      <div className="mt-3 flex items-center text-xs font-medium text-blue-600 opacity-0 transition-opacity group-hover:opacity-100">
                        View Dashboard <ArrowRight className="ml-1 h-3 w-3" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>
      )}
    </div>
  );
}

export default function HomePage() {
  // Check if standby mode is enabled
  const isStandbyMode = process.env.NEXT_PUBLIC_STANDBY_MODE === "true";

  // If standby mode is on, show standby page
  if (isStandbyMode) {
    return <StandbyMode />;
  }

  return <HomePageContent />;
}

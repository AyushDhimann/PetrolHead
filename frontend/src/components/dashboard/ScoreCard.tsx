"use client";

import { use } from "react";
import { Trophy, Target, ChevronRight, Scale } from "lucide-react";
import type { Score } from "@/schemas/dashboard";

interface Props {
  promise: Promise<Score | null>;
}

export default function ScoreCard({ promise }: Props) {
  const data = use(promise);
  if (!data)
    return (
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 text-center">
        <p className="text-sm text-gray-400">Failed to load score data</p>
      </div>
    );

  const scoreColor =
    data.overallScore >= 80 ? { ring: "text-emerald-500", bg: "bg-emerald-50", text: "text-emerald-700" }
    : data.overallScore >= 60 ? { ring: "text-blue-500", bg: "bg-blue-50", text: "text-blue-700" }
    : data.overallScore >= 40 ? { ring: "text-amber-500", bg: "bg-amber-50", text: "text-amber-700" }
    : { ring: "text-red-500", bg: "bg-red-50", text: "text-red-700" };

  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (data.overallScore / 100) * circumference;

  return (
    <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-white to-indigo-50/40 p-6 shadow-sm h-full">
      <div className="flex items-center gap-2 mb-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
          <Trophy className="h-4 w-4" />
        </div>
        <h3 className="font-bold text-gray-900">Strategic Score</h3>
      </div>

      {/* Score Ring */}
      <div className="flex flex-col items-center mb-5">
        <div className="relative h-28 w-28">
          <svg className="h-28 w-28 -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r={radius} fill="none" stroke="currentColor" strokeWidth="6" className="text-gray-100" />
            <circle cx="50" cy="50" r={radius} fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round"
              strokeDasharray={circumference} strokeDashoffset={offset} className={scoreColor.ring}
              style={{ transition: "stroke-dashoffset 1s ease-out" }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-gray-900">{data.overallScore}</span>
            <span className="text-xs text-gray-500">/ 100</span>
          </div>
        </div>
        <p className={`mt-3 rounded-full px-3 py-1 text-xs font-semibold ${scoreColor.bg} ${scoreColor.text}`}>{data.verdict}</p>
      </div>

      {/* Scoring Methodology */}
      {data.scoringMethodology.length > 0 && (
        <div className="mb-4 rounded-lg bg-indigo-50 border border-indigo-100 p-3">
          <p className="text-xs font-semibold text-indigo-600 mb-1.5 flex items-center gap-1">
            <Scale className="h-3 w-3" /> Methodology
          </p>
          <div className="flex flex-wrap gap-1.5">
            {data.scoringMethodology.map((m, i) => (
              <span key={i} className="text-[10px] bg-white border border-indigo-200 text-indigo-700 rounded-full px-2 py-0.5">
                {m.dimension}: <b>{m.weight}</b>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Subscores */}
      {data.subscores.length > 0 && (
        <div className="mb-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Score Breakdown</p>
          <div className="space-y-3">
            {data.subscores.map((sub, i) => {
              const pct = sub.maxScore > 0 ? (sub.score / sub.maxScore) * 100 : 0;
              const barColor = pct >= 70 ? "bg-emerald-400" : pct >= 50 ? "bg-blue-400" : pct >= 30 ? "bg-amber-400" : "bg-red-400";
              return (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600 font-medium">{sub.category}</span>
                    <span className="text-gray-800 font-bold">{sub.score}/{sub.maxScore}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                    <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%`, transition: "width 0.7s ease-out" }} />
                  </div>
                  {sub.reasoning && <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">{sub.reasoning}</p>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {data.recommendations.length > 0 && (
        <div className="pt-4 border-t border-indigo-100">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Target className="h-3 w-3" /> Recommendations
          </p>
          <div className="space-y-1.5">
            {data.recommendations.map((rec, i) => (
              <p key={i} className="text-xs text-gray-700 flex items-start gap-1.5">
                <ChevronRight className="h-3 w-3 text-indigo-400 mt-0.5 shrink-0" />{rec}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

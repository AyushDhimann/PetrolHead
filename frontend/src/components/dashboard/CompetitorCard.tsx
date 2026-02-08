"use client";

import { use } from "react";
import { Swords, Star, ChevronRight, AlertTriangle, BarChart3 } from "lucide-react";
import type { Competitors } from "@/schemas/dashboard";

interface Props {
  promise: Promise<Competitors | null>;
}

export default function CompetitorCard({ promise }: Props) {
  const data = use(promise);
  if (!data)
    return (
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 text-center">
        <p className="text-sm text-gray-400">Failed to load competitor data</p>
      </div>
    );

  const saturationColor =
    data.marketSaturation === "Hyper-Competitive" ? "bg-red-100 text-red-700"
    : data.marketSaturation === "High" ? "bg-amber-100 text-amber-700"
    : data.marketSaturation === "Medium" ? "bg-yellow-100 text-yellow-700"
    : "bg-green-100 text-green-700";

  const threatColor = (t: string) =>
    t === "Critical" ? "text-red-600 bg-red-50" : t === "High" ? "text-amber-600 bg-amber-50"
    : t === "Medium" ? "text-yellow-600 bg-yellow-50" : "text-green-600 bg-green-50";

  return (
    <div className="rounded-2xl border border-purple-100 bg-gradient-to-br from-white to-purple-50/40 p-6 shadow-sm h-full">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
            <Swords className="h-4 w-4" />
          </div>
          <h3 className="font-bold text-gray-900">Competitors</h3>
        </div>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${saturationColor}`}>
          {data.marketSaturation}
        </span>
      </div>

      {/* Competitor List */}
      <div className="space-y-2 mb-5">
        {data.competitors.map((c, i) => (
          <div key={i} className="rounded-xl bg-white border border-purple-50 p-3 hover:border-purple-200 transition-colors">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-500 text-xs font-bold">{i + 1}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{c.name}</p>
                <p className="text-xs text-gray-500">{c.brand} &middot; <span className="font-medium">{c.distance}</span></p>
              </div>
              <div className="flex flex-col items-end shrink-0 gap-1">
                {c.rating !== null && (
                  <div className="flex items-center gap-0.5 text-sm font-bold text-amber-600">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />{c.rating}
                  </div>
                )}
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${threatColor(c.threatLevel)}`}>{c.threatLevel}</span>
              </div>
            </div>
            <p className="text-[11px] text-gray-500 mt-1.5 pl-12">{c.keyStrength}</p>
          </div>
        ))}
      </div>

      {/* Catchment Split */}
      {data.catchmentSplit && (
        <div className="mb-4 rounded-lg bg-purple-50/60 border border-purple-100 p-3">
          <p className="text-xs font-semibold text-purple-600 mb-1">Catchment Split</p>
          <p className="text-xs text-purple-900">{data.catchmentSplit}</p>
        </div>
      )}

      {/* Comparative Table */}
      {data.comparativeTable.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
            <BarChart3 className="h-3 w-3" /> Comparative Metrics
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-purple-100">
                  <th className="text-left text-gray-500 py-1.5 font-semibold">Metric</th>
                  <th className="text-left text-purple-700 py-1.5 font-bold">Subject</th>
                  {data.comparativeTable[0]?.competitorValues.map((cv, i) => (
                    <th key={i} className="text-left text-gray-500 py-1.5 font-semibold">{cv.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.comparativeTable.map((row, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="text-gray-600 py-1.5">{row.metric}</td>
                    <td className="text-gray-900 font-medium py-1.5">{row.subjectValue}</td>
                    {row.competitorValues.map((cv, j) => (
                      <td key={j} className="text-gray-600 py-1.5">{cv.value}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Moat */}
      <div className="rounded-xl bg-purple-50 border border-purple-100 p-3">
        <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-1 flex items-center gap-1">
          <ChevronRight className="h-3 w-3" /> Our Moat
        </p>
        <p className="text-sm text-purple-900">{data.competitiveAdvantage}</p>
      </div>
    </div>
  );
}

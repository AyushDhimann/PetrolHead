"use client";

import { use } from "react";
import { AlertOctagon, Leaf, HelpCircle, Telescope, AlertTriangle, Info, Tag } from "lucide-react";
import type { Anomalies } from "@/schemas/dashboard";

interface Props {
  promise: Promise<Anomalies | null>;
}

export default function AnomaliesCard({ promise }: Props) {
  const data = use(promise);
  if (!data)
    return (
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 text-center">
        <p className="text-sm text-gray-400">Failed to load anomalies data</p>
      </div>
    );

  const hasDataAnomalies = data.dataAnomalies.length > 0;
  const hasCompliance = data.environmentalCompliance.complianceItems.length > 0 || data.environmentalCompliance.category;
  const hasMisc = data.miscIntel.length > 0;
  const hasOutlook = data.futureOutlook.length > 0;

  return (
    <div className="rounded-2xl border border-orange-100 bg-gradient-to-br from-white to-orange-50/30 p-6 shadow-sm h-full">
      <div className="flex items-center gap-2 mb-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
          <AlertOctagon className="h-4 w-4" />
        </div>
        <h3 className="font-bold text-gray-900">Anomalies & Leftover Intel</h3>
        <span className="ml-auto text-[10px] bg-orange-100 text-orange-700 rounded-full px-2 py-0.5 font-semibold">Deep Scan</span>
      </div>

      {/* Data Anomalies */}
      {hasDataAnomalies && (
        <div className="mb-5">
          <p className="text-xs font-semibold text-orange-600 uppercase tracking-wider mb-2 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" /> Data Anomalies
          </p>
          <div className="space-y-2">
            {data.dataAnomalies.map((a, i) => {
              const confColor =
                a.confidence === "High" ? "bg-red-100 text-red-700"
                : "bg-amber-100 text-amber-700";
              return (
                <div key={i} className="rounded-lg bg-orange-50 border border-orange-100 p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-orange-800">{a.dataPoint}</span>
                    <span className={`text-[10px] font-semibold rounded-full px-2 py-0.5 ${confColor}`}>{a.confidence}</span>
                  </div>
                  <p className="text-xs text-orange-700/80 mb-1.5">{a.implication}</p>
                  {a.sourceQuote && (
                    <p className="text-[10px] italic text-orange-600/70 border-l-2 border-orange-200 pl-2">&ldquo;{a.sourceQuote}&rdquo;</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Environmental Compliance */}
      {hasCompliance && (
        <div className="mb-5">
          <p className="text-xs font-semibold text-teal-600 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Leaf className="h-3 w-3" /> Environmental Compliance
          </p>
          <div className="rounded-lg bg-teal-50 border border-teal-100 p-3">
            {data.environmentalCompliance.category && (
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-teal-800">Category: {data.environmentalCompliance.category}</span>
              </div>
            )}
            {data.environmentalCompliance.triggerReason && (
              <p className="text-xs text-teal-700 mb-1"><span className="font-semibold">Trigger:</span> {data.environmentalCompliance.triggerReason}</p>
            )}
            {data.environmentalCompliance.consentStatus && (
              <p className="text-xs text-teal-700 mb-2"><span className="font-semibold">Status:</span> {data.environmentalCompliance.consentStatus}</p>
            )}
            {data.environmentalCompliance.complianceItems.length > 0 && (
              <div className="space-y-1">
                {data.environmentalCompliance.complianceItems.map((c, i) => (
                  <p key={i} className="text-xs text-teal-700 bg-white rounded px-2 py-1 border border-teal-100">• {c}</p>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Misc Intel */}
      {hasMisc && (
        <div className="mb-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Info className="h-3 w-3" /> Miscellaneous Intelligence
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {data.miscIntel.map((m, i) => (
              <div key={i} className="rounded-lg bg-gray-50 border border-gray-100 p-2.5 text-xs">
                <div className="flex items-center gap-1 mb-0.5">
                  <Tag className="h-2.5 w-2.5 text-gray-400" />
                  <span className="text-[10px] text-gray-400 font-semibold uppercase">{m.category}</span>
                </div>
                <p className="text-gray-600 font-medium">{m.label}</p>
                <p className="text-gray-800 font-semibold">{m.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Future Outlook */}
      {hasOutlook && (
        <div>
          <p className="text-xs font-semibold text-violet-600 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Telescope className="h-3 w-3" /> Future Outlook
          </p>
          <div className="space-y-2">
            {data.futureOutlook.map((f, i) => {
              const outlookColor =
                f.outlook.toLowerCase().includes("positive") || f.outlook.toLowerCase().includes("growth") ? "border-emerald-200 bg-emerald-50"
                : f.outlook.toLowerCase().includes("risk") || f.outlook.toLowerCase().includes("negative") ? "border-red-200 bg-red-50"
                : "border-violet-200 bg-violet-50";
              return (
                <div key={i} className={`rounded-lg border p-3 text-xs ${outlookColor}`}>
                  <span className="font-bold text-gray-800">{f.topic}</span>
                  {f.timeframe && <span className="text-gray-500 ml-2">({f.timeframe})</span>}
                  <p className="text-gray-700 mt-0.5">{f.outlook}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { use } from "react";
import { MapPin, AlertTriangle, Clock, Landmark, Navigation, CalendarDays, ArrowUpDown } from "lucide-react";
import type { Location } from "@/schemas/dashboard";

interface Props {
  promise: Promise<Location | null>;
}

export default function LocationCard({ promise }: Props) {
  const data = use(promise);
  if (!data)
    return (
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 text-center">
        <p className="text-sm text-gray-400">Failed to load location data</p>
      </div>
    );

  const frictionColor =
    data.trafficFriction === "Severe" ? "bg-red-100 text-red-700 border-red-200"
    : data.trafficFriction === "High" ? "bg-amber-100 text-amber-700 border-amber-200"
    : data.trafficFriction === "Moderate" ? "bg-yellow-100 text-yellow-700 border-yellow-200"
    : "bg-green-100 text-green-700 border-green-200";

  return (
    <div className="rounded-2xl border border-cyan-100 bg-gradient-to-br from-white to-cyan-50/40 p-6 shadow-sm h-full">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-100 text-cyan-600">
            <MapPin className="h-4 w-4" />
          </div>
          <h3 className="font-bold text-gray-900">Location Intel</h3>
        </div>
        <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${frictionColor}`}>
          {data.trafficFriction} Traffic
        </span>
      </div>

      {/* Catchment */}
      <div className="mb-4">
        <p className="text-sm font-medium text-gray-800 mb-2">
          <Navigation className="h-3.5 w-3.5 inline mr-1 text-cyan-500" />{data.catchmentType}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {data.demographics.map((d, i) => (
            <span key={i} className="inline-block rounded-md bg-cyan-50 border border-cyan-100 px-2 py-0.5 text-xs text-cyan-700">{d}</span>
          ))}
        </div>
      </div>

      {/* Access Analysis */}
      {data.accessAnalysis && (
        <div className="mb-4 rounded-lg bg-cyan-50 border border-cyan-100 p-3">
          <p className="text-xs font-semibold text-cyan-700 mb-1 flex items-center gap-1">
            <ArrowUpDown className="h-3 w-3" /> Access Analysis
          </p>
          <p className="text-xs text-cyan-900 leading-relaxed">{data.accessAnalysis}</p>
        </div>
      )}

      {/* Peak Hours */}
      {data.peakHours.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Clock className="h-3 w-3" /> Peak Demand Hours
          </p>
          <div className="flex flex-wrap gap-1.5">
            {data.peakHours.map((h, i) => (
              <span key={i} className="inline-block rounded-md bg-orange-50 border border-orange-100 px-2.5 py-1 text-xs text-orange-700 font-medium">{h}</span>
            ))}
          </div>
        </div>
      )}

      {/* Demand Drivers */}
      {data.demandDrivers.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
            <CalendarDays className="h-3 w-3" /> Seasonal Demand Drivers
          </p>
          <div className="space-y-2">
            {data.demandDrivers.map((dd, i) => (
              <div key={i} className="rounded-lg bg-violet-50 border border-violet-100 p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-violet-800">{dd.driver}</span>
                  <span className="text-[10px] text-violet-600 bg-violet-100 px-2 py-0.5 rounded-full font-semibold">{dd.impactType}</span>
                </div>
                {dd.peakMonths.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-1">
                    {dd.peakMonths.map((m, j) => (
                      <span key={j} className="text-[10px] bg-white border border-violet-200 text-violet-700 rounded px-1.5 py-0.5 font-medium">{m}</span>
                    ))}
                  </div>
                )}
                <p className="text-[11px] text-violet-700/80">{dd.details}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Infrastructure Risks */}
      {data.infrastructureRisks.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-2 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" /> Infrastructure Risks
          </p>
          <div className="space-y-2">
            {data.infrastructureRisks.map((r, i) => (
              <div key={i} className={`rounded-lg p-3 text-xs ${r.isBinaryRisk ? "bg-red-100 border-2 border-red-300" : "bg-red-50 border border-red-100"}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-red-800">{r.risk}</span>
                  {r.isBinaryRisk && <span className="text-[9px] bg-red-200 text-red-800 px-1.5 py-0.5 rounded-full font-bold">BINARY RISK</span>}
                </div>
                <p className="text-red-700/80">{r.details}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Landmarks */}
      {data.landmarks.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Landmark className="h-3 w-3" /> Nearby Landmarks
          </p>
          <div className="flex flex-wrap gap-1.5">
            {data.landmarks.map((l, i) => (
              <span key={i} className="inline-block rounded-md bg-gray-50 border border-gray-200 px-2 py-0.5 text-xs text-gray-600">{l}</span>
            ))}
          </div>
        </div>
      )}

      {data.coordinates?.latitude && data.coordinates?.longitude && (
        <p className="mt-3 text-xs text-gray-400 font-mono">{data.coordinates.latitude}, {data.coordinates.longitude}</p>
      )}
    </div>
  );
}

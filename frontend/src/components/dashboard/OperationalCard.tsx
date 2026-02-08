"use client";

import { use } from "react";
import { Fuel, Zap, ShieldCheck, Wrench, Check, X, Store, Layout } from "lucide-react";
import type { Operational } from "@/schemas/dashboard";

interface Props {
  promise: Promise<Operational | null>;
}

export default function OperationalCard({ promise }: Props) {
  const data = use(promise);
  if (!data)
    return (
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 text-center">
        <p className="text-sm text-gray-400">Failed to load operations data</p>
      </div>
    );

  return (
    <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-white to-emerald-50/40 p-6 shadow-sm h-full">
      <div className="flex items-center gap-2 mb-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
          <Fuel className="h-4 w-4" />
        </div>
        <h3 className="font-bold text-gray-900">Fuel & Operations</h3>
      </div>

      {/* Fuel Types */}
      <div className="mb-5">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Fuel Types</p>
        <div className="space-y-1.5">
          {data.fuelTypes.map((ft, i) => (
            <div key={i} className={`flex items-start gap-2 rounded-lg px-3 py-2 text-xs border ${
              ft.isPremium ? "bg-amber-50 border-amber-200" : ft.category === "cng" ? "bg-green-50 border-green-200"
              : ft.category === "ev" ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-200"
            }`}>
              <div className="flex items-center gap-1.5">
                {ft.isPremium && <Zap className="h-3 w-3 text-amber-500" />}
                <span className="font-semibold text-gray-800">{ft.name}</span>
              </div>
              {ft.significance && (
                <span className="text-gray-500 ml-auto text-[10px] leading-tight max-w-[60%] text-right">{ft.significance}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Status Indicators */}
      <div className="grid grid-cols-2 gap-2 mb-5">
        <StatusPill label="Automation" active={data.isAutomated} />
        <StatusPill label="EV Charging" active={data.hasEVCharging} />
      </div>
      {data.evChargingDetails && (
        <p className="text-[11px] text-gray-500 mb-4 -mt-3 ml-1">{data.evChargingDetails}</p>
      )}

      {/* Amenities */}
      <div className="mb-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Amenities</p>
        <div className="flex flex-wrap gap-1.5">
          {data.amenities.map((a, i) => (
            <span key={i} className="inline-block rounded-md bg-emerald-50 border border-emerald-100 px-2 py-0.5 text-xs text-emerald-700">{a}</span>
          ))}
        </div>
      </div>

      {/* Non-Fuel Retail */}
      {data.nonFuelRetail.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Store className="h-3 w-3" /> Non-Fuel Retail
          </p>
          <div className="flex flex-wrap gap-1.5">
            {data.nonFuelRetail.map((s, i) => (
              <span key={i} className="inline-block rounded-md bg-blue-50 border border-blue-100 px-2 py-0.5 text-xs text-blue-700">{s}</span>
            ))}
          </div>
        </div>
      )}

      {/* Safety & Compliance */}
      {data.safetyCompliance.length > 0 && (
        <div className="pt-4 border-t border-emerald-100 mb-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
            <ShieldCheck className="h-3 w-3" /> Safety & Compliance
          </p>
          <div className="space-y-1.5">
            {data.safetyCompliance.map((s, i) => (
              <div key={i} className="text-xs text-gray-600 flex items-start gap-1.5">
                <Check className="h-3 w-3 text-emerald-500 mt-0.5 shrink-0" />
                <div>
                  <span className="font-medium text-gray-800">{s.certification}</span>
                  {s.details && <span className="text-gray-500 ml-1">— {s.details}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Forecourt & Dispensers */}
      <div className="space-y-2">
        {data.forecourt && (
          <div className="rounded-lg bg-emerald-50 border border-emerald-100 p-3">
            <p className="text-xs text-emerald-800 flex items-start gap-1.5">
              <Layout className="h-3 w-3 mt-0.5 shrink-0" />
              <span>{data.forecourt}</span>
            </p>
          </div>
        )}
        {data.dispenserInfo && (
          <p className="text-xs text-gray-600 flex items-center gap-1.5">
            <Wrench className="h-3 w-3 text-gray-400" /> {data.dispenserInfo}
          </p>
        )}
        {data.staffEstimate && (
          <p className="text-xs text-gray-600 flex items-center gap-1.5">
            <Wrench className="h-3 w-3 text-gray-400" /> Staff: {data.staffEstimate}
          </p>
        )}
      </div>
    </div>
  );
}

function StatusPill({ label, active }: { label: string; active: boolean }) {
  return (
    <div className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium ${
      active ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-gray-50 text-gray-400 border border-gray-200"
    }`}>
      {active ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
      {label}
    </div>
  );
}

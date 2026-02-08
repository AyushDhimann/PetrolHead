"use client";

import { use } from "react";
import { TrendingUp, DollarSign, BarChart3, PiggyBank, Receipt } from "lucide-react";
import type { Financial } from "@/schemas/dashboard";

interface Props {
  promise: Promise<Financial | null>;
}

export default function FinancialCard({ promise }: Props) {
  const data = use(promise);
  if (!data)
    return (
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 text-center">
        <p className="text-sm text-gray-400">Failed to load financial data</p>
      </div>
    );

  const throughput = data.estimatedMonthlyThroughput;

  return (
    <div className="rounded-2xl border border-amber-100 bg-gradient-to-br from-white to-amber-50/40 p-6 shadow-sm h-full">
      <div className="flex items-center gap-2 mb-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
          <TrendingUp className="h-4 w-4" />
        </div>
        <h3 className="font-bold text-gray-900">Financial Profile</h3>
      </div>

      {/* Throughput */}
      <div className="mb-5">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Estimated Throughput</p>
        <div className="space-y-3">
          {throughput.petrolLiters && <ThroughputBar label="Petrol" value={throughput.petrolLiters} color="bg-blue-400" bgColor="bg-blue-100" />}
          {throughput.dieselLiters && <ThroughputBar label="Diesel" value={throughput.dieselLiters} color="bg-yellow-500" bgColor="bg-yellow-100" />}
          {throughput.cngKg && <ThroughputBar label="CNG" value={throughput.cngKg} color="bg-green-500" bgColor="bg-green-100" />}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {data.revenueEstimate && <MetricCard icon={<DollarSign className="h-3.5 w-3.5" />} label="Revenue Est." value={data.revenueEstimate} color="text-emerald-600" bg="bg-emerald-50 border-emerald-100" />}
        {data.opexEstimate && <MetricCard icon={<BarChart3 className="h-3.5 w-3.5" />} label="OPEX Est." value={data.opexEstimate} color="text-red-500" bg="bg-red-50 border-red-100" />}
        {data.netIncome && <MetricCard icon={<TrendingUp className="h-3.5 w-3.5" />} label="Net Income" value={data.netIncome} color="text-emerald-600" bg="bg-emerald-50 border-emerald-100" />}
        {data.assetValuation && <MetricCard icon={<PiggyBank className="h-3.5 w-3.5" />} label="Valuation" value={data.assetValuation} color="text-amber-600" bg="bg-amber-50 border-amber-100" />}
      </div>

      {/* GST Turnover */}
      {data.gstTurnoverCategory && (
        <div className="mb-4 rounded-lg bg-amber-50 border border-amber-100 p-2.5 flex items-center gap-2">
          <Receipt className="h-3.5 w-3.5 text-amber-600" />
          <span className="text-xs text-amber-800 font-medium">GST Turnover: {data.gstTurnoverCategory}</span>
        </div>
      )}

      {/* OPEX Breakdown */}
      {data.opexBreakdown.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">OPEX Breakdown</p>
          <div className="space-y-1">
            {data.opexBreakdown.map((item, i) => (
              <div key={i} className="flex justify-between items-center text-xs px-2 py-1.5 rounded bg-gray-50 border border-gray-100">
                <span className="text-gray-600">{item.item}</span>
                <span className="font-semibold text-gray-800">{item.amount}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dealer Margins */}
      {data.dealerMargins.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Dealer Margins</p>
          <div className="flex flex-wrap gap-2">
            {data.dealerMargins.map((m, i) => (
              <div key={i} className="rounded-lg bg-amber-50 border border-amber-100 px-3 py-1.5 text-xs">
                <span className="text-gray-600">{m.fuelType}: </span>
                <span className="font-bold text-amber-700">{m.margin}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Margin Notes */}
      {data.marginNotes.length > 0 && (
        <div className="pt-4 border-t border-amber-100">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Key Insights</p>
          <div className="space-y-1.5">
            {data.marginNotes.map((note, i) => (
              <p key={i} className="text-xs text-gray-600 leading-relaxed">• {note}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ThroughputBar({ label, value, color, bgColor }: { label: string; value: string; color: string; bgColor: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-600 font-medium">{label}</span>
        <span className="text-gray-800 font-semibold">{value}</span>
      </div>
      <div className={`h-2.5 w-full rounded-full ${bgColor} overflow-hidden`}>
        <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(50 + Math.random() * 50, 95)}%` }} />
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value, color, bg }: { icon: React.ReactNode; label: string; value: string; color: string; bg: string }) {
  return (
    <div className={`rounded-lg border p-3 ${bg}`}>
      <div className={`flex items-center gap-1 mb-1 ${color}`}>{icon}<span className="text-[10px] font-semibold uppercase">{label}</span></div>
      <p className="text-sm font-bold text-gray-900">{value}</p>
    </div>
  );
}

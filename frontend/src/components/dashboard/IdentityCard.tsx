"use client";

import { use } from "react";
import { Building2, Shield, ShieldAlert, Clock, MapPin, Hash, User, Gavel, Users, History } from "lucide-react";
import type { Identity } from "@/schemas/dashboard";

interface Props {
  promise: Promise<Identity | null>;
}

export default function IdentityCard({ promise }: Props) {
  const data = use(promise);
  if (!data) return <FailedCard label="Identity" />;

  const riskColor =
    data.riskScore > 60 ? "bg-red-100 text-red-700 border-red-200"
    : data.riskScore > 30 ? "bg-amber-100 text-amber-700 border-amber-200"
    : "bg-emerald-100 text-emerald-700 border-emerald-200";

  const riskLabel =
    data.riskScore > 60 ? "High Risk" : data.riskScore > 30 ? "Moderate" : "Low Risk";

  const hasLitigation = data.litigationProfile.specificCases.length > 0;

  return (
    <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-white to-blue-50/40 p-6 shadow-sm h-full">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg leading-tight">{data.stationName}</h3>
            <p className="text-sm text-blue-600 font-medium">{data.brand}</p>
          </div>
        </div>
        <div className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${riskColor}`}>
          {data.riskScore > 60 ? <ShieldAlert className="h-3.5 w-3.5" /> : <Shield className="h-3.5 w-3.5" />}
          {riskLabel} ({data.riskScore})
        </div>
      </div>

      {/* Info Grid */}
      <div className="space-y-2">
        <InfoRow icon={<User className="h-3.5 w-3.5" />} label="Owner" value={data.ownerName || "—"} />
        <InfoRow icon={<Hash className="h-3.5 w-3.5" />} label="Dealer Code" value={data.dealerCode || "—"} />
        {data.lockCode && <InfoRow icon={<Hash className="h-3.5 w-3.5" />} label="Lock Code" value={data.lockCode} />}
        <InfoRow icon={<Hash className="h-3.5 w-3.5" />} label="GSTIN" value={data.gstin || "—"} mono />
        <InfoRow icon={<Clock className="h-3.5 w-3.5" />} label="Hours" value={data.operatingHours} />
        <InfoRow icon={<MapPin className="h-3.5 w-3.5" />} label="Address" value={data.address} />
        <InfoRow icon={<Building2 className="h-3.5 w-3.5" />} label="Type" value={data.dealershipType} />
        {data.establishedYear && <InfoRow icon={<Clock className="h-3.5 w-3.5" />} label="Est." value={data.establishedYear} />}
      </div>

      {/* Key Personnel */}
      {data.keyPersonnel.length > 0 && (
        <div className="mt-4 pt-4 border-t border-blue-100">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Users className="h-3 w-3" /> Key Personnel
          </p>
          <div className="space-y-1.5">
            {data.keyPersonnel.map((p, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span className="font-semibold text-gray-800">{p.name}</span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-600">{p.role}</span>
                <span className="text-gray-300 ml-auto text-[10px]">via {p.source}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ownership History */}
      {data.ownershipHistory && (
        <div className="mt-4 pt-4 border-t border-blue-100">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
            <History className="h-3 w-3" /> Ownership Legacy
          </p>
          <p className="text-xs text-gray-700 leading-relaxed bg-blue-50/50 rounded-lg p-3 border border-blue-100">
            {data.ownershipHistory}
          </p>
        </div>
      )}

      {/* Litigation Profile */}
      {hasLitigation && (
        <div className="mt-4 pt-4 border-t border-red-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-red-600 uppercase tracking-wider flex items-center gap-1">
              <Gavel className="h-3 w-3" /> Litigation Profile
            </p>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              data.litigationProfile.riskLevel === "Critical" ? "bg-red-100 text-red-700"
              : data.litigationProfile.riskLevel === "High" ? "bg-red-50 text-red-600"
              : "bg-amber-50 text-amber-700"
            }`}>{data.litigationProfile.riskLevel}</span>
          </div>
          <div className="space-y-2">
            {data.litigationProfile.specificCases.map((c, i) => (
              <div key={i} className="rounded-lg bg-red-50/70 border border-red-100 p-3 text-xs">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-red-800">{c.plaintiff}</span>
                  <span className="text-red-300">→</span>
                  <span className="font-semibold text-red-700">{c.allegation}</span>
                  {c.status && <span className="ml-auto text-[10px] text-gray-500 bg-white px-1.5 py-0.5 rounded">{c.status}</span>}
                </div>
                <p className="text-red-600/80 italic text-[11px] leading-relaxed">&ldquo;{c.sourceQuote}&rdquo;</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Risk Factors */}
      {data.riskFactors.length > 0 && (
        <div className="mt-4 pt-4 border-t border-blue-100">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Risk Factors</p>
          <div className="flex flex-wrap gap-1.5">
            {data.riskFactors.map((rf, i) => (
              <span key={i} className="inline-block rounded-md bg-red-50 border border-red-100 px-2 py-0.5 text-xs text-red-700">{rf}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ icon, label, value, mono }: { icon: React.ReactNode; label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start gap-2 text-sm">
      <span className="mt-0.5 text-blue-400">{icon}</span>
      <span className="text-gray-500 w-24 shrink-0">{label}</span>
      <span className={`text-gray-800 font-medium ${mono ? "font-mono text-xs mt-0.5" : ""}`}>{value}</span>
    </div>
  );
}

function FailedCard({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 text-center">
      <p className="text-sm text-gray-400">Failed to load {label}</p>
    </div>
  );
}

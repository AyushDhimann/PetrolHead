"use client";

import { use } from "react";
import { CreditCard, Wallet, BadgePercent, CircleDollarSign, Check, X, Smartphone } from "lucide-react";
import type { PaymentMethods } from "@/schemas/dashboard";

interface Props {
  promise: Promise<PaymentMethods | null>;
}

export default function PaymentMethodsCard({ promise }: Props) {
  const data = use(promise);
  if (!data)
    return (
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 text-center">
        <p className="text-sm text-gray-400">Failed to load payment data</p>
      </div>
    );

  const adoptionColor =
    data.digitalPaymentAdoption === "High" ? "bg-emerald-100 text-emerald-700 border-emerald-200"
    : data.digitalPaymentAdoption === "Medium" ? "bg-amber-100 text-amber-700 border-amber-200"
    : data.digitalPaymentAdoption === "Low" ? "bg-red-100 text-red-700 border-red-200"
    : "bg-gray-100 text-gray-700 border-gray-200";

  return (
    <div className="rounded-2xl border border-violet-100 bg-gradient-to-br from-white to-violet-50/40 p-6 shadow-sm h-full">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
            <CreditCard className="h-4 w-4" />
          </div>
          <h3 className="font-bold text-gray-900">Payment Methods</h3>
        </div>
        <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${adoptionColor}`}>
          {data.digitalPaymentAdoption} Digital Adoption
        </span>
      </div>

      {/* Accepted Methods */}
      <div className="mb-5">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
          <Wallet className="h-3 w-3" /> Accepted Methods
        </p>
        <div className="grid grid-cols-2 gap-1.5">
          {data.acceptedMethods.map((m, i) => (
            <div key={i} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs border ${
              m.isAvailable ? "bg-emerald-50 border-emerald-200" : "bg-gray-50 border-gray-200"
            }`}>
              {m.isAvailable ? (
                <Check className="h-3 w-3 text-emerald-500 shrink-0" />
              ) : (
                <X className="h-3 w-3 text-gray-400 shrink-0" />
              )}
              <div className="min-w-0">
                <span className={`font-medium ${m.isAvailable ? "text-gray-800" : "text-gray-400"}`}>
                  {m.method}
                </span>
                {m.details && (
                  <p className="text-[10px] text-gray-500 truncate">{m.details}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fleet Cards */}
      {data.fleetCards.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
            <CircleDollarSign className="h-3 w-3" /> Fleet Cards
          </p>
          <div className="space-y-1.5">
            {data.fleetCards.map((fc, i) => (
              <div key={i} className="rounded-lg bg-violet-50 border border-violet-100 px-3 py-2 text-xs">
                <span className="font-bold text-violet-800">{fc.name}</span>
                {fc.provider && <span className="text-violet-600 ml-1">by {fc.provider}</span>}
                {fc.details && <p className="text-violet-700/80 mt-0.5">{fc.details}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loyalty Programs */}
      {data.loyaltyPrograms.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
            <BadgePercent className="h-3 w-3" /> Loyalty Programs
          </p>
          <div className="space-y-1.5">
            {data.loyaltyPrograms.map((lp, i) => (
              <div key={i} className="rounded-lg bg-amber-50 border border-amber-100 px-3 py-2 text-xs">
                <span className="font-bold text-amber-800">{lp.name}</span>
                {lp.details && <p className="text-amber-700/80 mt-0.5">{lp.details}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* POS Infrastructure */}
      {data.posInfrastructure && (
        <div className="mb-4 rounded-lg bg-violet-50 border border-violet-100 p-3">
          <p className="text-xs font-semibold text-violet-700 mb-1 flex items-center gap-1">
            <Smartphone className="h-3 w-3" /> POS Infrastructure
          </p>
          <p className="text-xs text-violet-900">{data.posInfrastructure}</p>
        </div>
      )}

      {/* Payment Notes */}
      {data.paymentNotes.length > 0 && (
        <div className="pt-3 border-t border-violet-100">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Notes</p>
          <div className="space-y-1">
            {data.paymentNotes.map((note, i) => (
              <p key={i} className="text-xs text-gray-600">• {note}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

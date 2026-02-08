"use client";

/**
 * Skeleton loaders for all dashboard widgets.
 */

function Pulse({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-gray-200 ${className}`} />;
}

export function IdentitySkeleton() {
  return (
    <div className="rounded-2xl border border-blue-100 bg-white p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Pulse className="h-11 w-11 rounded-xl !bg-blue-100" />
        <div className="flex-1 space-y-2">
          <Pulse className="h-5 w-52 !bg-blue-50" />
          <Pulse className="h-3 w-36 !bg-blue-50" />
        </div>
        <Pulse className="h-7 w-28 rounded-full !bg-blue-50" />
      </div>
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex gap-3">
          <Pulse className="h-3 w-24 !bg-gray-100" />
          <Pulse className="h-3 w-44 !bg-gray-100" />
        </div>
      ))}
      <Pulse className="h-20 w-full !bg-blue-50 rounded-xl" />
    </div>
  );
}

export function OperationalSkeleton() {
  return (
    <div className="rounded-2xl border border-emerald-100 bg-white p-6 space-y-4">
      <Pulse className="h-5 w-44 !bg-emerald-50" />
      <div className="flex flex-wrap gap-2">
        {[...Array(5)].map((_, i) => (
          <Pulse key={i} className="h-7 w-24 rounded-full !bg-emerald-50" />
        ))}
      </div>
      <div className="space-y-2">
        {[...Array(4)].map((_, i) => (
          <Pulse key={i} className="h-3 w-full !bg-gray-100" />
        ))}
      </div>
      <Pulse className="h-16 w-full rounded-xl !bg-emerald-50" />
    </div>
  );
}

export function CompetitorSkeleton() {
  return (
    <div className="rounded-2xl border border-purple-100 bg-white p-6 space-y-4">
      <div className="flex items-center justify-between">
        <Pulse className="h-5 w-36 !bg-purple-50" />
        <Pulse className="h-6 w-28 rounded-full !bg-purple-50" />
      </div>
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
          <Pulse className="h-9 w-9 rounded-lg !bg-purple-100" />
          <div className="flex-1 space-y-1.5">
            <Pulse className="h-3 w-40" />
            <Pulse className="h-2.5 w-28 !bg-gray-100" />
          </div>
          <Pulse className="h-5 w-10 !bg-purple-100" />
        </div>
      ))}
      <Pulse className="h-28 w-full rounded-xl !bg-purple-50" />
    </div>
  );
}

export function FinancialSkeleton() {
  return (
    <div className="rounded-2xl border border-amber-100 bg-white p-6 space-y-4">
      <Pulse className="h-5 w-44 !bg-amber-50" />
      {[...Array(3)].map((_, i) => (
        <div key={i} className="space-y-1">
          <div className="flex justify-between">
            <Pulse className="h-3 w-16 !bg-gray-100" />
            <Pulse className="h-3 w-24 !bg-gray-100" />
          </div>
          <Pulse className="h-2.5 w-full rounded-full !bg-amber-50" />
        </div>
      ))}
      <div className="grid grid-cols-2 gap-2">
        {[...Array(4)].map((_, i) => (
          <Pulse key={i} className="h-12 rounded-lg !bg-amber-50" />
        ))}
      </div>
    </div>
  );
}

export function LocationSkeleton() {
  return (
    <div className="rounded-2xl border border-cyan-100 bg-white p-6 space-y-4">
      <Pulse className="h-5 w-36 !bg-cyan-50" />
      <div className="flex flex-wrap gap-2">
        {[...Array(4)].map((_, i) => (
          <Pulse key={i} className="h-6 w-28 rounded-full !bg-cyan-50" />
        ))}
      </div>
      <Pulse className="h-20 w-full rounded-xl !bg-orange-50" />
      <Pulse className="h-16 w-full rounded-xl !bg-red-50" />
    </div>
  );
}

export function SentimentSkeleton() {
  return (
    <div className="rounded-2xl border border-rose-100 bg-white p-6 space-y-4">
      <Pulse className="h-5 w-44 !bg-rose-50" />
      <div className="flex items-center gap-4">
        <Pulse className="h-16 w-16 rounded-xl !bg-amber-50" />
        <div className="space-y-2 flex-1">
          <Pulse className="h-3 w-28 !bg-gray-100" />
          <Pulse className="h-6 w-20 rounded-full !bg-rose-50" />
        </div>
      </div>
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <Pulse key={i} className="h-8 w-full rounded-md !bg-emerald-50" />
        ))}
      </div>
    </div>
  );
}

export function ScoreSkeleton() {
  return (
    <div className="rounded-2xl border border-indigo-100 bg-white p-6 space-y-4">
      <Pulse className="h-5 w-36 !bg-indigo-50" />
      <div className="flex justify-center">
        <Pulse className="h-28 w-28 rounded-full !bg-indigo-50" />
      </div>
      <Pulse className="h-6 w-48 mx-auto rounded-full !bg-gray-100" />
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="space-y-1">
            <div className="flex justify-between">
              <Pulse className="h-3 w-32 !bg-gray-100" />
              <Pulse className="h-3 w-12 !bg-gray-100" />
            </div>
            <Pulse className="h-2 w-full rounded-full !bg-gray-100" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function AnomaliesSkeleton() {
  return (
    <div className="rounded-2xl border border-orange-100 bg-white p-6 space-y-4">
      <Pulse className="h-5 w-44 !bg-orange-50" />
      {[...Array(3)].map((_, i) => (
        <Pulse key={i} className="h-14 w-full rounded-xl !bg-orange-50" />
      ))}
      <Pulse className="h-20 w-full rounded-xl !bg-gray-50" />
    </div>
  );
}

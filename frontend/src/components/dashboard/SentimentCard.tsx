"use client";

import { use } from "react";
import { MessageCircle, ThumbsUp, ThumbsDown, Star, Globe, Monitor, Quote } from "lucide-react";
import type { Sentiment } from "@/schemas/dashboard";

interface Props {
  promise: Promise<Sentiment | null>;
}

export default function SentimentCard({ promise }: Props) {
  const data = use(promise);
  if (!data)
    return (
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 text-center">
        <p className="text-sm text-gray-400">Failed to load sentiment data</p>
      </div>
    );

  const verdictColor =
    data.sentimentVerdict === "Excellent" ? "bg-emerald-100 text-emerald-700"
    : data.sentimentVerdict === "Good" ? "bg-blue-100 text-blue-700"
    : data.sentimentVerdict === "Mixed" ? "bg-amber-100 text-amber-700"
    : "bg-red-100 text-red-700";

  return (
    <div className="rounded-2xl border border-rose-100 bg-gradient-to-br from-white to-rose-50/40 p-6 shadow-sm h-full">
      <div className="flex items-center gap-2 mb-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
          <MessageCircle className="h-4 w-4" />
        </div>
        <h3 className="font-bold text-gray-900">Customer Sentiment</h3>
      </div>

      {/* Rating Header */}
      <div className="flex items-center gap-4 mb-5">
        {data.overallRating !== null && (
          <div className="flex flex-col items-center rounded-xl bg-amber-50 border border-amber-100 px-4 py-3">
            <div className="flex items-center gap-1">
              <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
              <span className="text-2xl font-bold text-gray-900">{data.overallRating}</span>
            </div>
            <span className="text-xs text-gray-500 mt-0.5">out of 5.0</span>
          </div>
        )}
        <div>
          {data.totalReviews && <p className="text-sm text-gray-600"><span className="font-semibold text-gray-900">{data.totalReviews}</span> reviews</p>}
          <span className={`inline-block mt-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${verdictColor}`}>{data.sentimentVerdict}</span>
        </div>
      </div>

      {/* Platform Breakdown */}
      {data.platformBreakdown.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Monitor className="h-3 w-3" /> Platform Breakdown
          </p>
          <div className="space-y-1.5">
            {data.platformBreakdown.map((p, i) => (
              <div key={i} className="flex items-center gap-2 rounded-lg bg-gray-50 border border-gray-100 px-3 py-2 text-xs">
                <span className="font-semibold text-gray-800 min-w-[80px]">{p.platform}</span>
                {p.rating && <span className="flex items-center gap-0.5 text-amber-600"><Star className="h-3 w-3 fill-amber-400" />{p.rating}</span>}
                {p.reviewCount && <span className="text-gray-500">{p.reviewCount} reviews</span>}
                {p.note && <span className="text-[10px] text-orange-600 ml-auto max-w-[40%] text-right leading-tight">{p.note}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Positive Themes */}
      {data.positiveThemes.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-2 flex items-center gap-1">
            <ThumbsUp className="h-3 w-3" /> Positive
          </p>
          <div className="space-y-1">
            {data.positiveThemes.map((t, i) => (
              <p key={i} className="text-xs text-gray-700 bg-emerald-50 rounded-md px-2.5 py-1 border border-emerald-100">{t}</p>
            ))}
          </div>
        </div>
      )}

      {/* Negative Themes */}
      {data.negativeThemes.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-red-500 uppercase tracking-wider mb-2 flex items-center gap-1">
            <ThumbsDown className="h-3 w-3" /> Concerns
          </p>
          <div className="space-y-1">
            {data.negativeThemes.map((t, i) => (
              <p key={i} className="text-xs text-gray-700 bg-red-50 rounded-md px-2.5 py-1 border border-red-100">{t}</p>
            ))}
          </div>
        </div>
      )}

      {/* Notable Reviews */}
      {data.notableReviews.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Quote className="h-3 w-3" /> Notable Reviews
          </p>
          <div className="space-y-1.5">
            {data.notableReviews.map((r, i) => (
              <div key={i} className={`rounded-lg px-3 py-2 text-xs border ${
                r.sentiment === "positive" ? "bg-emerald-50 border-emerald-100"
                : r.sentiment === "negative" ? "bg-red-50 border-red-100"
                : "bg-gray-50 border-gray-100"
              }`}>
                <p className="italic text-gray-700">&ldquo;{r.quote}&rdquo;</p>
                <p className="text-[10px] text-gray-500 mt-0.5">{r.theme}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Digital Presence */}
      <div className="pt-3 border-t border-rose-100">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
          <Globe className="h-3 w-3" /> Digital Presence
        </p>
        <p className="text-xs text-gray-600 leading-relaxed">{data.digitalPresence}</p>
      </div>
    </div>
  );
}

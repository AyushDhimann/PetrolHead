"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Fuel, ArrowRight, Loader2 } from "lucide-react";
import { api, Demo } from "@/lib/api";

export default function DemosPage() {
  const [demos, setDemos] = useState<Demo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .listDemos()
      .then((res) => {
        setDemos(res.demos);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Demo Dashboards</h1>
        <p className="mt-2 text-gray-600">
          Pre-generated fuel station profiles from AI deep research
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {demos.map((demo, i) => (
          <motion.div
            key={demo.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
          >
            <Link href={`/demo/${demo.id}`}>
              <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:border-blue-200 hover:-translate-y-1">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
                    <Fuel className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-gray-900 truncate">{demo.name}</h3>
                    <p className="text-xs font-medium text-blue-600">{demo.brand}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4">{demo.location}</p>
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                    Ready
                  </span>
                  <span className="flex items-center text-sm font-medium text-blue-600 opacity-0 transition-opacity group-hover:opacity-100">
                    Open <ArrowRight className="ml-1 h-4 w-4" />
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {demos.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-500">No demo dashboards available.</p>
          <p className="text-sm text-gray-400 mt-1">Make sure the backend is running.</p>
        </div>
      )}
    </div>
  );
}

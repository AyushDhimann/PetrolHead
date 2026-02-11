"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Github, Mail, Copy, Check, Fuel, ArrowRight } from "lucide-react";
import Link from "next/link";

const DEMOS = [
  {
    id: "demo1",
    name: "Sher Service Station",
    brand: "Indian Oil Corporation Limited",
    location: "Pankha Road, Janakpuri, New Delhi",
  },
  {
    id: "demo2",
    name: "Jay Garud Gas Station",
    brand: "Indian Oil",
    location: "Block B Janakpuri, Delhi",
  },
  {
    id: "demo3",
    name: "Jai Shree Ganesh Filling Station",
    brand: "Bharat Petroleum (BPCL)",
    location: "GT Karnal Road, Alipur, Delhi",
  },
];

export default function StandbyMode() {
  const [copied, setCopied] = useState(false);
  const email = "contact.ayush.dhiman@gmail.com";

  const copyEmail = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/60 overflow-hidden">
      {/* Full-screen grid layout */}
      <div className="h-full w-full grid grid-cols-1 lg:grid-cols-2">
        {/* LEFT COLUMN — message + contact */}
        <div className="flex flex-col justify-center px-6 sm:px-10 lg:px-16 py-6 lg:py-8">
          {/* Logo + Title */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-3 mb-6 lg:mb-8"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold text-lg shadow-lg">
              P
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
                PetrolHead
              </h1>
              <p className="text-xs sm:text-sm text-gray-500">
                Fuel Station Intelligence Platform
              </p>
            </div>
          </motion.div>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="text-sm sm:text-base text-gray-600 leading-relaxed mb-5 lg:mb-6 max-w-lg"
          >
            AI-powered deep research &amp; forensic intelligence dashboard for fuel
            station competitive analysis — powered by Gemini Deep Research,
            Perplexity, Vercel AI SDK and Zod schemas.
          </motion.p>

          {/* Status banner */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="bg-amber-50/80 border border-amber-200/80 rounded-lg px-4 py-3 mb-5 lg:mb-6 max-w-lg"
          >
            <p className="text-sm font-semibold text-amber-900 mb-1">
              Service on Standby
            </p>
            <p className="text-xs sm:text-sm text-amber-800/80 leading-relaxed">
              Running deep research with Gemini &amp; Perplexity APIs costs real
              money, so I&apos;ve paused the live service for now. You can still
              explore the demo dashboards, or contact me for access.
            </p>
          </motion.div>

          {/* Email box */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="mb-5 lg:mb-6 max-w-lg"
          >
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
              Contact Ayush Dhiman
            </p>
            <div className="flex items-center bg-white border border-gray-200 rounded-lg shadow-sm">
              <a
                href={`mailto:${email}`}
                className="flex items-center gap-2 px-3 py-2.5 text-blue-600 hover:text-blue-700 font-medium transition-colors flex-1 min-w-0"
              >
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm truncate">{email}</span>
              </a>
              <button
                onClick={copyEmail}
                className="flex items-center justify-center h-9 w-9 mr-1 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors flex-shrink-0"
                title="Copy email"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
          </motion.div>

          {/* Bottom links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
            className="flex flex-wrap items-center gap-3"
          >
            <a
              href="https://github.com/AyushDhimann/PetrolHead"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow"
            >
              <Github className="h-4 w-4" />
              GitHub Repo
            </a>
            <span className="text-xs text-gray-400 hidden sm:inline">
              Next.js · FastAPI · Zod · Vercel AI SDK · Gemini · Perplexity
            </span>
          </motion.div>
        </div>

        {/* RIGHT COLUMN — demo dashboards */}
        <div className="flex flex-col justify-center px-6 sm:px-10 lg:px-12 py-6 lg:py-8 lg:border-l border-t lg:border-t-0 border-gray-200/60 bg-white/40">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                Demo Dashboards
              </h2>
              <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
                Live
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mb-4 lg:mb-5">
              Pre-generated fuel station intelligence reports — click to explore:
            </p>
          </motion.div>

          <div className="grid gap-3 lg:gap-4">
            {DEMOS.map((demo, i) => (
              <motion.div
                key={demo.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 + i * 0.1 }}
              >
                <Link href={`/demo/${demo.id}`}>
                  <div className="group flex items-center gap-3 sm:gap-4 bg-white border border-gray-200 rounded-xl p-3 sm:p-4 hover:border-blue-300 hover:shadow-lg transition-all cursor-pointer">
                    <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md flex-shrink-0">
                      <Fuel className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors text-sm sm:text-base truncate">
                        {demo.name}
                      </p>
                      <p className="text-xs font-medium text-blue-600/80">
                        {demo.brand}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5 truncate">
                        {demo.location}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-blue-500 transition-colors flex-shrink-0" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Small footer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-[11px] text-gray-400 mt-4 lg:mt-6 text-center"
          >
            &copy; {new Date().getFullYear()} Ayush Dhiman
          </motion.p>
        </div>
      </div>
    </div>
  );
}

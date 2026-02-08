import { z } from "zod";

// ─── 1. Identity & Ownership ───────────────────────────────────

export const IdentitySchema = z.object({
  stationName: z.string().describe("Full official name of the fuel station"),
  brand: z.string().describe("Parent oil company brand (e.g., IndianOil, BPCL, HP)"),
  dealershipType: z.string().describe("Type of dealership model (DODO, COCO, CODO, or Proprietorship)"),
  ownerName: z.string().nullable().describe("Name of the proprietor or operator on paper"),
  gstin: z.string().nullable().describe("GST Identification Number if mentioned"),
  dealerCode: z.string().nullable().describe("RO Code or Dealer Code (e.g. DL-0102)"),
  lockCode: z.string().nullable().describe("Lock Number / Lock Code for supply chain tracking"),
  establishedYear: z.string().nullable().describe("Year the station was established or registered"),
  address: z.string().describe("Full address of the station"),
  operatingHours: z.string().describe("Operating hours (e.g. 06:00 AM – 11:00 PM or 24 Hours)"),
  riskScore: z.number().min(0).max(100).describe("Risk score 0-100 based on litigation, political exposure, compliance. Higher = more risk."),
  riskFactors: z.array(z.string()).describe("List of identified risk factors"),
  keyPersonnel: z.array(z.object({
    name: z.string().describe("Person's full name"),
    role: z.string().describe("Role or designation (Sales Manager, Operator, Manager)"),
    source: z.string().describe("Where this was discovered (fire audit, directory, GST)"),
  })).describe("Named individuals found in the report beyond the owner — managers, sales managers, operators, etc."),
  litigationProfile: z.object({
    riskLevel: z.enum(["None", "Low", "High", "Critical"]),
    specificCases: z.array(z.object({
      plaintiff: z.string().describe("Who sued or filed the complaint, e.g. 'Jasmeet Kaur'"),
      allegation: z.string().describe("What was the claim — 'Short-fueling', 'Adulteration', 'Billing dispute'"),
      status: z.string().nullable().describe("Outcome if known — 'Resolved', 'Pending', 'Dismissed'"),
      sourceQuote: z.string().describe("The exact sentence or phrase from the text proving this"),
    })),
  }).describe("Forensic litigation data — specific cases, plaintiffs, and allegations"),
  ownershipHistory: z.string().nullable().describe("Any historical or political ownership context, legacy allotment, or patronymic background"),
});

export type Identity = z.infer<typeof IdentitySchema>;

// ─── 2. Operational Infrastructure ─────────────────────────────

export const OperationalSchema = z.object({
  fuelTypes: z.array(z.object({
    name: z.string().describe("Fuel type name"),
    category: z.enum(["petrol", "diesel", "cng", "ev", "other"]).describe("Fuel category"),
    isPremium: z.boolean().describe("Whether this is a premium product"),
    significance: z.string().nullable().describe("Why this fuel matters — e.g. 'Only top 1% of IOCL outlets stock XP100'"),
  })).describe("All fuel types available at the station"),
  amenities: z.array(z.string()).describe("List of amenities (PUC center, air, nitrogen, toilets, water, parking, etc.)"),
  isAutomated: z.boolean().describe("Whether the station has automation / e-RO system"),
  hasEVCharging: z.boolean().describe("Whether EV charging is available or confirmed"),
  evChargingDetails: z.string().nullable().describe("Details about EV infrastructure — partner, charger type, status (Confirmed/Unconfirmed/Passive)"),
  dispenserInfo: z.string().nullable().describe("Information about dispensers (count, type, capacity)"),
  safetyCompliance: z.array(z.object({
    certification: z.string().describe("Name of the certification"),
    details: z.string().nullable().describe("Details — date, reference number, renewal year, inspector name"),
  })).describe("Safety certifications with rich detail — fire safety, PESO, DPCC"),
  staffEstimate: z.string().nullable().describe("Estimated number of staff or shift information"),
  forecourt: z.string().nullable().describe("Physical layout details — split-island design, HSD nozzle flow, entry/exit setup"),
  nonFuelRetail: z.array(z.string()).describe("Non-fuel retail services — Fuel at Call, Lubricants (SERVO), fleet cards, washing, etc."),
});

export type Operational = z.infer<typeof OperationalSchema>;

// ─── 3. Competitive Landscape ──────────────────────────────────

export const CompetitorSchema = z.object({
  competitors: z.array(z.object({
    name: z.string().describe("Competitor station name"),
    brand: z.string().describe("Competitor brand (IOCL, BPCL, HP, etc.)"),
    distance: z.string().describe("EXACT distance (e.g. '530 meters', '1.5 km') — not vague"),
    rating: z.number().nullable().describe("Star rating if mentioned (out of 5)"),
    keyStrength: z.string().describe("Main competitive advantage or threat"),
    threatLevel: z.enum(["Critical", "High", "Medium", "Low"]).describe("How serious is this competitor"),
  })).describe("List of nearby competing fuel stations with precise distances"),
  marketSaturation: z.enum(["Low", "Medium", "High", "Hyper-Competitive"]).describe("Overall competitive density in the area"),
  competitiveAdvantage: z.string().describe("The subject station's main competitive advantage or moat"),
  catchmentSplit: z.string().nullable().describe("How the station divides trade vs competitors"),
  comparativeTable: z.array(z.object({
    metric: z.string(),
    subjectValue: z.string(),
    competitorValues: z.array(z.object({ name: z.string(), value: z.string() })),
  })).describe("Side-by-side comparison table — metrics like closing time, CNG status, premium fuel, user rating"),
});

export type Competitors = z.infer<typeof CompetitorSchema>;

// ─── 4. Financial & Throughput ─────────────────────────────────

export const FinancialSchema = z.object({
  estimatedMonthlyThroughput: z.object({
    petrolLiters: z.string().nullable().describe("Estimated daily petrol volume (e.g. 3000-5000 L/day)"),
    dieselLiters: z.string().nullable().describe("Estimated daily diesel volume"),
    cngKg: z.string().nullable().describe("Estimated daily CNG volume in Kg"),
  }),
  revenueEstimate: z.string().nullable().describe("Estimated monthly or annual revenue"),
  opexEstimate: z.string().nullable().describe("Estimated monthly operational expenditure"),
  opexBreakdown: z.array(z.object({
    item: z.string().describe("Cost item — 'Staff', 'Electricity', 'Maintenance'"),
    amount: z.string().describe("Estimated amount — '₹4.0 Lakhs/month'"),
  })).describe("Detailed OPEX breakdown if available"),
  netIncome: z.string().nullable().describe("Estimated net operating income"),
  assetValuation: z.string().nullable().describe("Estimated business valuation if mentioned"),
  marginNotes: z.array(z.string()).describe("Key notes about profit margins, costs, or financial insights"),
  gstTurnoverCategory: z.string().nullable().describe("GST turnover classification — e.g. 'Above 1.5 Crore'"),
  dealerMargins: z.array(z.object({
    fuelType: z.string(),
    margin: z.string().describe("Per unit margin, e.g. '₹2.00-2.50/liter'"),
  })).describe("Dealer commission/margin per fuel type if mentioned"),
});

export type Financial = z.infer<typeof FinancialSchema>;

// ─── 5. Location Intelligence ──────────────────────────────────

export const LocationSchema = z.object({
  catchmentType: z.string().describe("Type of catchment area (e.g., Affluent Residential, Highway, Mixed)"),
  demographics: z.array(z.string()).describe("Key demographic groups in the catchment"),
  trafficFriction: z.enum(["Low", "Moderate", "High", "Severe"]).describe("Level of traffic congestion"),
  peakHours: z.array(z.string()).describe("Peak traffic/demand hours identified"),
  infrastructureRisks: z.array(z.object({
    risk: z.string().describe("The specific risk"),
    details: z.string().describe("Full context — project name, distance, stage, implications"),
    isBinaryRisk: z.boolean().describe("Is this a binary catalyst? (If built, station dies → true)"),
  })).describe("Infrastructure risks with full specifics"),
  landmarks: z.array(z.string()).describe("Nearby key landmarks for context"),
  coordinates: z.object({
    latitude: z.string().nullable(),
    longitude: z.string().nullable(),
  }).nullable().describe("GPS coordinates if mentioned"),
  demandDrivers: z.array(z.object({
    driver: z.string().describe("The cause — 'Wedding Season', 'School Runs', 'Splash Water Park'"),
    peakMonths: z.array(z.string()).describe("Specific months, e.g. ['Oct', 'Nov', 'Dec', 'Jan', 'Feb']"),
    impactType: z.string().describe("Type of impact — 'Volume Spike', 'Diesel DG Sets', 'CNG Rush'"),
    details: z.string().describe("More context — venue names, exact seasonal dates"),
  })).describe("Seasonal and event-driven demand drivers with specific months and venues"),
  accessAnalysis: z.string().nullable().describe("Ingress/egress difficulty, Double-Edged Sword scenario, kerbside issues"),
});

export type Location = z.infer<typeof LocationSchema>;

// ─── 6. Customer Sentiment ─────────────────────────────────────

export const SentimentSchema = z.object({
  overallRating: z.number().nullable().describe("Aggregated star rating (out of 5.0)"),
  totalReviews: z.string().nullable().describe("Total number of reviews/ratings"),
  positiveThemes: z.array(z.string()).describe("Key positive themes from customer reviews"),
  negativeThemes: z.array(z.string()).describe("Key negative themes or complaints"),
  sentimentVerdict: z.enum(["Excellent", "Good", "Mixed", "Poor"]).describe("Overall sentiment assessment"),
  digitalPresence: z.string().describe("Assessment of the station's online/digital presence"),
  platformBreakdown: z.array(z.object({
    platform: z.string().describe("Platform name — 'Justdial', 'Google Maps'"),
    reviewCount: z.string().nullable().describe("Number of reviews on this platform"),
    rating: z.number().nullable().describe("Rating on this platform"),
    note: z.string().nullable().describe("Any anomaly note"),
  })).describe("Per-platform review breakdown — catches disparities"),
  notableReviews: z.array(z.object({
    quote: z.string().describe("Direct quote or paraphrase from review"),
    sentiment: z.enum(["positive", "negative", "neutral"]),
    theme: z.string().describe("What issue this illustrates"),
  })).describe("Specific notable reviews cited in the report"),
});

export type Sentiment = z.infer<typeof SentimentSchema>;

// ─── 7. Strategic Score ────────────────────────────────────────

export const ScoreSchema = z.object({
  overallScore: z.number().min(0).max(100).describe("Overall intelligence/health score out of 100"),
  verdict: z.string().describe("One-line strategic verdict"),
  subscores: z.array(z.object({
    category: z.string().describe("Category name"),
    score: z.number().describe("Score value"),
    maxScore: z.number().describe("Maximum possible score"),
    reasoning: z.string().describe("Brief reasoning for the score"),
  })).describe("Breakdown of individual scoring categories"),
  recommendations: z.array(z.string()).describe("Key strategic recommendations from the report"),
  scoringMethodology: z.array(z.object({
    dimension: z.string(),
    weight: z.string().describe("Weight, e.g. '25%'"),
  })).describe("The scoring methodology / dimension weights if described"),
});

export type Score = z.infer<typeof ScoreSchema>;

// ─── 8. Data Anomalies & Overflow ──────────────────────────────

export const AnomaliesSchema = z.object({
  dataAnomalies: z.array(z.object({
    dataPoint: z.string().describe("The strange data — 'Oxygen Filling Services', 'Justdial vs Google Maps Disparity'"),
    implication: z.string().describe("Why this is weird — 'Likely database error', 'Suspicious review farming'"),
    confidence: z.enum(["High", "Low"]),
    sourceQuote: z.string().nullable().describe("Where in the text this was found"),
  })).describe("Unusual data points the AI would normally clean up but should surface"),
  environmentalCompliance: z.object({
    category: z.string().nullable().describe("DPCC category — 'Green', 'Orange', 'Red'"),
    triggerReason: z.string().nullable().describe("What triggered this category — 'Washing Activity generates effluent'"),
    consentStatus: z.string().nullable().describe("CTO status and date"),
    complianceItems: z.array(z.string()).describe("Specific compliance items — 'ETP required', 'Vapor Recovery Systems'"),
  }).describe("Environmental compliance details"),
  miscIntel: z.array(z.object({
    label: z.string().describe("Short label for the data point"),
    value: z.string().describe("The information"),
    category: z.string().describe("Category bucket — 'Regulatory', 'Historical', 'Infrastructure', 'Financial', 'Staffing'"),
  })).describe("Any other valuable information from the report that doesn't fit the other schemas"),
  futureOutlook: z.array(z.object({
    topic: z.string().describe("Topic — 'EV Transition', 'RRTS Impact', 'NFR Potential'"),
    outlook: z.string().describe("The forward-looking analysis"),
    timeframe: z.string().nullable().describe("When — '5-10 years', '12-24 months'"),
  })).describe("Forward-looking strategic insights and future outlook"),
});

export type Anomalies = z.infer<typeof AnomaliesSchema>;

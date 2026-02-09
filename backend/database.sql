-- ===================================================================
-- PETROLHEAD — Research Sessions Database Schema
-- ===================================================================

-- 1. Research Sessions
CREATE TABLE research_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT UNIQUE NOT NULL,
  query TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  provider TEXT,
  fallback_used BOOLEAN DEFAULT FALSE,
  fallback_reason TEXT,
  progress_percent INTEGER DEFAULT 0,
  current_message TEXT DEFAULT 'Initializing...',
  thought_summaries JSONB DEFAULT '[]'::jsonb,
  has_result BOOLEAN DEFAULT FALSE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  time_taken_seconds FLOAT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Research Results (raw text + converted JSON)
CREATE TABLE research_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT UNIQUE NOT NULL REFERENCES research_sessions(session_id) ON DELETE CASCADE,
  raw_text TEXT,
  json_data JSONB,
  provider_used TEXT,
  fallback_used BOOLEAN DEFAULT FALSE,
  fallback_reason TEXT,
  time_taken_seconds FLOAT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Research Logs (streaming progress entries)
CREATE TABLE research_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL REFERENCES research_sessions(session_id) ON DELETE CASCADE,
  log_type TEXT NOT NULL,          -- 'progress', 'thought', 'error', 'status_change'
  message TEXT,
  progress_percent INTEGER DEFAULT 0,
  provider TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Extraction Cache (Gemini structured extraction cache — avoids re-running extraction)
CREATE TABLE extraction_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key TEXT UNIQUE NOT NULL,    -- MD5-based key: "{section}_{hash12}"
  section TEXT NOT NULL,             -- 'identity', 'operational', 'financial', etc.
  text_hash TEXT NOT NULL,           -- MD5 hash of the source report text
  extracted_data JSONB NOT NULL,     -- The extracted structured JSON
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days'
);

-- Indexes
CREATE INDEX idx_sessions_status ON research_sessions(status);
CREATE INDEX idx_sessions_created ON research_sessions(created_at DESC);
CREATE INDEX idx_results_session ON research_results(session_id);
CREATE INDEX idx_logs_session ON research_logs(session_id, created_at);
CREATE INDEX idx_cache_key ON extraction_cache(cache_key);
CREATE INDEX idx_cache_section ON extraction_cache(section);
CREATE INDEX idx_cache_expires ON extraction_cache(expires_at);

-- Auto-update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sessions_updated
  BEFORE UPDATE ON research_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Disable RLS for now (staging)
ALTER TABLE research_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE extraction_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for staging" ON research_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for staging" ON research_results FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for staging" ON research_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for staging" ON extraction_cache FOR ALL USING (true) WITH CHECK (true);
-- ============================================================================
-- INKLOOM AI BRAND GOVERNANCE PLATFORM — SUPABASE SCHEMA & SEED SCRIPT
-- ============================================================================
-- Run this complete script in your Supabase SQL Editor:
-- Dashboard -> SQL Editor -> New Query -> Paste & Run.
-- ============================================================================

-- 1. ENABLE EXTENSIONS
-- Enables pgvector for Gemini vector embeddings & semantic RAG retrieval
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 2. TABLE: golden_facts (Ground Truth Knowledge Base for RAG)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.golden_facts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category VARCHAR(64) NOT NULL,            -- e.g. 'pricing', 'slogans', 'specs', 'security'
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    citation VARCHAR(255) NOT NULL,           -- e.g. 'Pricing Matrix v2.4, Item 1'
    embedding vector(768),                    -- Compatible with Google Gemini text-embedding-004
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for sub-millisecond semantic vector search
CREATE INDEX IF NOT EXISTS idx_golden_facts_embedding 
ON public.golden_facts 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 10);

-- RPC Function for Anshul's RAG Service to query similar facts
CREATE OR REPLACE FUNCTION match_golden_facts(
    query_embedding vector(768),
    match_threshold float DEFAULT 0.65,
    match_count int DEFAULT 4
)
RETURNS TABLE (
    id UUID,
    category VARCHAR,
    title VARCHAR,
    content TEXT,
    citation VARCHAR,
    similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        gf.id,
        gf.category,
        gf.title,
        gf.content,
        gf.citation,
        1 - (gf.embedding <=> query_embedding) AS similarity
    FROM public.golden_facts gf
    WHERE gf.is_active = true
      AND gf.embedding IS NOT NULL
      AND 1 - (gf.embedding <=> query_embedding) > match_threshold
    ORDER BY gf.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- ============================================================================
-- 3. TABLE: brand_policies (Deterministic Rules & Tone Guidelines)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.brand_policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(128) NOT NULL,
    rule_type VARCHAR(64) NOT NULL,          -- e.g. 'banned_term', 'tone_rule', 'legal_disclaimer'
    pattern TEXT NOT NULL,                   -- Regex or keyword trigger (e.g. 'magic AI|100% bug free')
    severity VARCHAR(32) NOT NULL DEFAULT 'warning', -- 'info', 'warning', 'high'
    suggested_fix TEXT,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 4. TABLE: review_queue (Escalated CMS Drafts & Content Exceptions)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.review_queue (
    id VARCHAR(64) PRIMARY KEY,              -- e.g. 'REV-101'
    cms VARCHAR(128) NOT NULL,               -- e.g. 'WordPress Blog', 'Webflow Draft'
    author VARCHAR(128) NOT NULL,
    submitted_at VARCHAR(128) NOT NULL,
    excerpt TEXT NOT NULL,
    violation TEXT NOT NULL,
    citation TEXT NOT NULL,
    status VARCHAR(32) DEFAULT 'pending',    -- 'pending', 'approved', 'rejected'
    page_url TEXT,
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 5. TABLE: brand_palettes (Approved Brand Swatches for OpenCV Matrix Checks)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.brand_palettes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(64) NOT NULL,
    hex_code VARCHAR(16) NOT NULL,
    rgb_value VARCHAR(32) NOT NULL,
    tolerance FLOAT DEFAULT 38.0,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 6. SEED INITIAL BASELINE DATA
-- ============================================================================

-- A. Seed Golden Facts (Enterprise Pricing, Slogans, Policies)
INSERT INTO public.golden_facts (category, title, content, citation)
VALUES
(
    'pricing',
    'Starter Tier Pricing (2026)',
    'The Professional Starter Tier is $49/month billed monthly, or $39/month billed annually. The legacy $29/mo starter tier was deprecated in Q3 2024. References to $29/mo are strictly prohibited.',
    'Golden Facts: Pricing Matrix v2.4, Item 1'
),
(
    'pricing',
    'Free Community Edition',
    'The Community Tier is Free forever for up to 3 content editors, including standard OpenCV color verification.',
    'Golden Facts: Pricing Matrix v2.4, Item 2'
),
(
    'pricing',
    'Enterprise SLA Tier',
    'Enterprise Tier pricing starts at $499/mo and includes SOC2 Type II isolation, custom SSO, and a dedicated 99.9% uptime SLA.',
    'Golden Facts: Pricing Matrix v2.4, Item 3'
),
(
    'slogans',
    'Approved Taglines',
    'Primary slogan: "Velocity with Precision". Secondary slogan: "Explainable Brand Governance for Modern Creators". Banned: "The cheapest AI on earth", "Magic AI".',
    'Brand Identity System 2026, Section 2.1'
),
(
    'security',
    'Data Privacy & Model Training',
    'Inkloom AI processes draft copy transiently in RAM. Zero customer content is used for LLM retraining.',
    'Trust & Privacy Whitepaper v3'
)
ON CONFLICT DO NOTHING;

-- B. Seed Brand Policies
INSERT INTO public.brand_policies (name, rule_type, pattern, severity, suggested_fix, description)
VALUES
(
    'Banned Superlative: Magic AI',
    'banned_term',
    'magic AI',
    'high',
    'state-of-the-art AI',
    'Marketing must not describe our automated technology as "magic".'
),
(
    'Absolute Claim: 100% Bug Free',
    'legal_disclaimer',
    '100% bug free',
    'high',
    'enterprise-grade reliability',
    'Absolute guarantees are legally dangerous and violate enterprise truth policy.'
),
(
    'Informal Slang',
    'tone_rule',
    'insane|crazy good',
    'warning',
    'exceptional',
    'Maintain a confident, modern enterprise voice.'
)
ON CONFLICT DO NOTHING;

-- C. Seed Review Queue Initial Items
INSERT INTO public.review_queue (id, cms, author, submitted_at, excerpt, violation, citation, status)
VALUES
(
    'REV-101',
    'WordPress Blog',
    'Marcus Vance',
    'Today at 10:15 AM',
    'Upgrade to our starter tier for only $29/mo to unlock unlimited workflow automation.',
    'Outdated pricing claim ($29/mo cited instead of $49/mo)',
    'Golden Facts: Pricing Matrix v2.4, Item 1',
    'pending'
),
(
    'REV-102',
    'LinkedIn Campaign',
    'Elena Rostova',
    'Today at 09:30 AM',
    'Guaranteed 100% bug free brand governance with zero human overhead.',
    'High-risk absolute guarantee ("100% bug free")',
    'Brand Style Guide: Banned Terminology 2026',
    'pending'
),
(
    'REV-103',
    'Webflow Landing Page',
    'David Zhao',
    'Yesterday at 4:45 PM',
    'Powered by magic AI that writes flawless marketing copy every time.',
    'Disallowed superlative ("magic AI")',
    'Brand Guidelines: Voice & Tone Section 4',
    'pending'
)
ON CONFLICT (id) DO NOTHING;

-- D. Seed Brand Palettes
INSERT INTO public.brand_palettes (name, hex_code, rgb_value, tolerance, is_primary)
VALUES
('Inkloom Indigo', '#4F46E5', '79, 70, 229', 38.0, true),
('Cyan Accent', '#06B6D4', '6, 182, 212', 45.0, false),
('Slate Dark', '#0F172A', '15, 23, 42', 25.0, false),
('Success Emerald', '#10B981', '16, 185, 129', 30.0, false)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 7. ENABLE ROW LEVEL SECURITY (RLS) & PUBLIC READ/WRITE POLICIES
-- ============================================================================
ALTER TABLE public.golden_facts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_palettes ENABLE ROW LEVEL SECURITY;

-- Allow public read & write access with Anon Key (Ideal for Hackathon MVP)
CREATE POLICY "Allow anon read golden_facts" ON public.golden_facts FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon write golden_facts" ON public.golden_facts FOR ALL TO anon USING (true);

CREATE POLICY "Allow anon read brand_policies" ON public.brand_policies FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon write brand_policies" ON public.brand_policies FOR ALL TO anon USING (true);

CREATE POLICY "Allow anon read review_queue" ON public.review_queue FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon write review_queue" ON public.review_queue FOR ALL TO anon USING (true);

CREATE POLICY "Allow anon read brand_palettes" ON public.brand_palettes FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon write brand_palettes" ON public.brand_palettes FOR ALL TO anon USING (true);

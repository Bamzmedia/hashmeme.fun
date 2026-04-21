-- HEDERA REWARD TRACKER SCHEMA
-- Execute this in your Supabase SQL Editor

-- 1. Create the Leaderboard Table
CREATE TABLE IF NOT EXISTS public.rewards_leaderboard (
    account_id TEXT PRIMARY KEY,           -- Hedera Account ID (e.g., 0.0.12345)
    total_swapped NUMERIC DEFAULT 0,       -- Total token volume swapped
    total_points BIGINT DEFAULT 0,         -- Calculated points based on volume
    tx_count INTEGER DEFAULT 0,            -- Number of successful transactions
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create an index for the leaderboard ranking
CREATE INDEX IF NOT EXISTS idx_leaderboard_points ON public.rewards_leaderboard (total_points DESC);

-- 3. Function to UPSERT scores (atomically add volume)
CREATE OR REPLACE FUNCTION public.add_reward_points(
    p_account_id TEXT,
    p_amount NUMERIC,
    p_points BIGINT
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.rewards_leaderboard (account_id, total_swapped, total_points, tx_count, last_seen)
    VALUES (p_account_id, p_amount, p_points, 1, NOW())
    ON CONFLICT (account_id)
    DO UPDATE SET
        total_swapped = public.rewards_leaderboard.total_swapped + p_amount,
        total_points = public.rewards_leaderboard.total_points + p_points,
        tx_count = public.rewards_leaderboard.tx_count + 1,
        last_seen = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.rewards_leaderboard ENABLE ROW LEVEL SECURITY;

-- 5. Create a policy to allow public reads (for the UI leaderboard)
CREATE POLICY "Public Read Access" 
ON public.rewards_leaderboard FOR SELECT 
TO public 
USING (true);

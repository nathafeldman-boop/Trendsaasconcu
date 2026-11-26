-- An admin looked at a flagged video (another account, fast views) and
-- approved it: its warnings stop showing.
alter table public.creator_videos add column if not exists verified_at timestamptz;

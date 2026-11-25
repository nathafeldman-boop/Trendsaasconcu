-- Creators can also post on Instagram: an optional handle, and each video
-- records its platform. Instagram views are entered by an admin (from a
-- screenshot the creator sends): the refresh only reads TikTok.
alter table public.creators add column if not exists instagram_handle text;
alter table public.creator_videos add column if not exists platform text not null default 'tiktok' check (platform in ('tiktok', 'instagram'));

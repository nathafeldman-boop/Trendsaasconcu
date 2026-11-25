-- The same video posted on TikTok and on Instagram is one post: the
-- Instagram row points at the TikTok row (or the other way round) through
-- pair_id, and only the platform with the most views is paid.
alter table public.creator_videos add column if not exists pair_id uuid references public.creator_videos (id) on delete set null;
create index if not exists creator_videos_pair_id_idx on public.creator_videos (pair_id) where pair_id is not null;

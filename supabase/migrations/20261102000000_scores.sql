begin;
create table public.scores (
 id uuid primary key default gen_random_uuid(),
 created_at timestamptz not null default now(),
 nickname text not null check (char_length(btrim(nickname)) between 1 and 20),
 song_id text not null check (char_length(song_id) between 1 and 120),
 difficulty text not null check (difficulty in ('easy','normal','hard','harder')),
 play_side text not null check (play_side in ('echo','nova')),
 rate numeric not null check (rate between 0.5 and 16),
 practice boolean not null,
 nightmare boolean not null,
 score integer not null check (score between -10000000 and 100000000),
 accuracy numeric not null check (accuracy between 0 and 100),
 max_combo integer not null check (max_combo between 0 and 1000000),
 misses integer not null check (misses between 0 and 1000000)
);
alter table public.scores enable row level security;
revoke all on public.scores from anon, authenticated;
grant select on public.scores to anon, authenticated;
grant insert (nickname,song_id,difficulty,play_side,rate,practice,nightmare,score,accuracy,max_combo,misses) on public.scores to anon, authenticated;
create policy scores_public_read on public.scores for select to anon, authenticated using (true);
create policy scores_public_submit on public.scores for insert to anon, authenticated with check (true);
create index scores_ranking on public.scores(song_id,difficulty,play_side,rate,practice,nightmare,score desc,accuracy desc,created_at asc);
comment on table public.scores is 'Casual unverified leaderboard. Public read/append only; no client update/delete. Not suitable for competitive or prize-based rankings. Add authenticated server validation and rate limiting before such use.';
commit;

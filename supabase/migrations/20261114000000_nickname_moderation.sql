-- Run once in the project SQL editor using an administrator connection.
-- Reject future INSERT/UPDATE and remove existing matching nicknames atomically.
begin;
create or replace function public.ranking_name_allowed(value text)
returns boolean language sql immutable strict set search_path = pg_catalog as $$
 select not (clean ~ '씨발|시발|씨빨|시빨|씹새|씹년|개새끼|개세끼|병신|븅신|좆|좃|지랄|니엄마|느금마|느그엄마|애미뒤|애비뒤|엄마없|고아새끼|ᄉᄇ|ᄊᄇ|ᄇᄉ' or clean ~ '^(fuck(you|er|ing)?|shit|bitch|nigg(er|a))$')
 from (select regexp_replace(lower(normalize(value, NFKC)), '[^[:alnum:]]', '', 'g') as clean) n;
$$;
-- Review exact rows affected before removal.
select id, nickname from public.scores where not public.ranking_name_allowed(nickname);
delete from public.scores where not public.ranking_name_allowed(nickname);
alter table public.scores add constraint scores_nickname_appropriate check (public.ranking_name_allowed(nickname));
commit;

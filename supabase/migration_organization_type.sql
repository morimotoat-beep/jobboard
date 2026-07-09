-- =============================================================
-- 機関種別（organization_type）カラムの追加（既存DBへの差分migration）
-- Supabase ダッシュボード → SQL Editor に貼り付けて実行する
-- =============================================================

-- 1) カラム追加：まず DEFAULT 'university' 付きで追加（既存行は自動で 'university' に）
alter table public.listings
  add column if not exists organization_type text not null default 'university'
  check (organization_type in ('university', 'research_institute', 'company'));

-- 2) 念のため既存行を明示的に 'university' に揃える（NULLだった場合の保険）
update public.listings
  set organization_type = 'university'
  where organization_type is null;

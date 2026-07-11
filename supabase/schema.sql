-- =============================================================
-- 研究者求人サイト listings テーブル（指示書§4）
-- Supabase ダッシュボード → SQL Editor に貼り付けて実行する
-- =============================================================

create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),

  -- 自由文（投稿言語のまま保存）
  title text not null check (char_length(title) between 1 and 200),
  summary text not null check (char_length(summary) between 1 and 4000),

  -- 自動翻訳（v1.1 §3：投稿確定時に1回だけ翻訳して保存。日⇔英を優先、中韓は後日）
  title_ja text,
  title_en text,
  title_zh text,
  title_ko text,
  summary_ja text,
  summary_en text,
  summary_zh text,
  summary_ko text,

  -- 旧・粗い大分類コード（JREC-IN 導入前）。研究分野の入力は
  -- research_fields（細目306）へ一本化したため任意化。新規投稿は送らない。
  -- 列は当面残す（main が参照しなくなった後の別マイグレーションで drop 予定）。
  field text check (field in (
    'field_math', 'field_physics', 'field_chemistry', 'field_biology',
    'field_earth', 'field_medicine', 'field_pharmacy', 'field_agriculture',
    'field_engineering', 'field_informatics', 'field_environment',
    'field_interdisciplinary'
  )),
  -- 企業求人は職種なしのため nullable（アカデミア求人は必須。CHECK は NULL を通過）
  job_type text check (job_type in (
    'job_professor', 'job_assoc_prof', 'job_lecturer', 'job_assistant_prof',
    'job_fixed_faculty', 'job_postdoc', 'job_technical', 'job_grad_student'
  )),
  -- 雇用形態：アカデミア群＋企業群（機関種別で出し分け。ラベルは messages/*.json）
  employment_type text not null check (employment_type in (
    'emp_fixed', 'emp_permanent', 'emp_tenure_track',
    'emp_regular', 'emp_contract', 'emp_dispatch', 'emp_gyomu', 'emp_other'
  )),
  -- 機関種別（募集元の種類）
  organization_type text not null default 'university' check (organization_type in (
    'university', 'research_institute', 'company'
  )),

  -- 勤務地：国は ISO 3166-1 alpha-2（例 JP / US）、都道府県は日本のみ任意
  country text not null check (country ~ '^[A-Z]{2}$'),
  prefecture text,

  deadline date not null,
  external_url text not null check (external_url ~* '^https?://'),

  -- 言語バッジ表示用
  post_language text not null check (post_language in ('ja', 'en', 'zh', 'ko')),

  -- 投稿者情報（一般非公開。RLSで保護し、サーバー側からのみ参照）
  poster_email text not null,

  status text not null default 'draft' check (status in (
    'draft', 'published', 'expired', 'link_flagged', 'hidden'
  )),

  -- 確認・編集・削除リンク用トークン
  edit_token uuid not null unique default gen_random_uuid(),

  report_count integer not null default 0,

  -- リンク切れチェック用（§7：連続失敗日数。3日連続で link_flagged）
  link_check_failures integer not null default 0,
  last_link_checked_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 一覧表示・フィルター用インデックス
create index if not exists listings_status_deadline_idx on public.listings (status, deadline);
create index if not exists listings_field_idx on public.listings (field);
create index if not exists listings_job_type_idx on public.listings (job_type);
create index if not exists listings_country_idx on public.listings (country);

-- updated_at の自動更新
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists listings_set_updated_at on public.listings;
create trigger listings_set_updated_at
  before update on public.listings
  for each row
  execute function public.set_updated_at();

-- =============================================================
-- RLS：全ロックダウン方式
-- ポリシーを一切作らない＝anon キーでは読み書き不可。
-- アプリのデータアクセスはすべて Next.js サーバー側の
-- service role キー経由で行う（poster_email / edit_token の漏洩防止）。
-- =============================================================
alter table public.listings enable row level security;

-- サーバー（service role）からのアクセス権限を明示的に付与
-- ※プロジェクトによっては新規テーブルへのデフォルト権限が無いため必須
grant usage on schema public to service_role;
grant select, insert, update, delete on public.listings to service_role;

-- =============================================================
-- 研究分野マスター（JREC-IN 準拠：大分類11 / 細目306、日英中韓）
-- 詳細な差分は supabase/migrations/20260711000000_research_fields.sql を参照。
-- listings と違い、マスター2表は分野名ラベルを公開表示するため anon SELECT を許可する。
-- =============================================================
create table if not exists public.research_categories (
  id         text primary key,
  sort_order int  not null,
  name_ja text not null,
  name_en text not null,
  name_zh text not null,
  name_ko text not null
);

create table if not exists public.research_fields (
  id          text primary key,
  category_id text not null references public.research_categories(id) on delete cascade,
  sort_order  int  not null,
  name_ja text not null,
  name_en text not null,
  name_zh text not null,
  name_ko text not null
);
create index if not exists idx_research_fields_category
  on public.research_fields(category_id);

create table if not exists public.listing_research_fields (
  listing_id uuid not null references public.listings(id) on delete cascade,
  field_id   text not null references public.research_fields(id) on delete restrict,
  primary key (listing_id, field_id)
);
create index if not exists idx_listing_research_fields_field
  on public.listing_research_fields(field_id);

alter table public.research_categories     enable row level security;
alter table public.research_fields         enable row level security;
alter table public.listing_research_fields enable row level security;

grant select on public.research_categories     to anon, authenticated;
grant select on public.research_fields         to anon, authenticated;
grant select on public.listing_research_fields to anon, authenticated;

drop policy if exists research_categories_public_read on public.research_categories;
create policy research_categories_public_read
  on public.research_categories for select to anon, authenticated using (true);

drop policy if exists research_fields_public_read on public.research_fields;
create policy research_fields_public_read
  on public.research_fields for select to anon, authenticated using (true);

drop policy if exists listing_research_fields_public_read on public.listing_research_fields;
create policy listing_research_fields_public_read
  on public.listing_research_fields for select to anon, authenticated
  using (
    exists (
      select 1 from public.listings l
      where l.id = listing_research_fields.listing_id
        and l.status = 'published'
        and l.deadline >= (now() at time zone 'utc')::date
    )
  );

grant select, insert, update, delete on public.research_categories     to service_role;
grant select, insert, update, delete on public.research_fields         to service_role;
grant select, insert, update, delete on public.listing_research_fields to service_role;

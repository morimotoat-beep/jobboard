-- =============================================================
-- JREC-IN 準拠の研究分野マスター（大分類11 / 細目306、日英中韓）
-- 求人(listings)と細目の多対多。すべて冪等（再実行可能）。
--
-- RLS 方針:
--   research_categories / research_fields … anon に SELECT を許可
--     （公開サイトのフォーム・求人カードで分野名ラベルを表示するため）。
--     書き込みは service_role のみ。
--   listing_research_fields … 求人の公開範囲に合わせて anon が読める
--     （公開中かつ締切前の求人に紐づく行のみ）。書き込みは service_role のみ。
-- =============================================================

-- 大分類
create table if not exists public.research_categories (
  id         text primary key,          -- 例: 'life-science'
  sort_order int  not null,
  name_ja text not null,
  name_en text not null,
  name_zh text not null,
  name_ko text not null
);

-- 細目
create table if not exists public.research_fields (
  id          text primary key,         -- 例: 'life-science-001'
  category_id text not null references public.research_categories(id) on delete cascade,
  sort_order  int  not null,
  name_ja text not null,
  name_en text not null,
  name_zh text not null,
  name_ko text not null
);
create index if not exists idx_research_fields_category
  on public.research_fields(category_id);

-- 求人と細目の多対多（求人側は field_id の配列だけ持つ）
-- ※このプロジェクトの求人テーブルは `listings`（指示の jobs に相当）
create table if not exists public.listing_research_fields (
  listing_id uuid not null references public.listings(id) on delete cascade,
  field_id   text not null references public.research_fields(id) on delete restrict,
  primary key (listing_id, field_id)
);
create index if not exists idx_listing_research_fields_field
  on public.listing_research_fields(field_id);

-- =============================================================
-- RLS
-- =============================================================
alter table public.research_categories     enable row level security;
alter table public.research_fields         enable row level security;
alter table public.listing_research_fields enable row level security;

-- マスター2表：anon / authenticated に公開読み取りを許可
grant select on public.research_categories to anon, authenticated;
grant select on public.research_fields     to anon, authenticated;

drop policy if exists research_categories_public_read on public.research_categories;
create policy research_categories_public_read
  on public.research_categories for select
  to anon, authenticated
  using (true);

drop policy if exists research_fields_public_read on public.research_fields;
create policy research_fields_public_read
  on public.research_fields for select
  to anon, authenticated
  using (true);

-- 中間表：公開中かつ締切前の求人に紐づく行のみ anon / authenticated が読める
grant select on public.listing_research_fields to anon, authenticated;

drop policy if exists listing_research_fields_public_read on public.listing_research_fields;
create policy listing_research_fields_public_read
  on public.listing_research_fields for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.listings l
      where l.id = listing_research_fields.listing_id
        and l.status = 'published'
        and l.deadline >= (now() at time zone 'utc')::date
    )
  );

-- 書き込みは service role（Next.js サーバー）からのみ
grant select, insert, update, delete on public.research_categories     to service_role;
grant select, insert, update, delete on public.research_fields         to service_role;
grant select, insert, update, delete on public.listing_research_fields to service_role;

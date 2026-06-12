-- =============================================================
-- v1.1 §3：翻訳カラムの追加（既存DBへの差分migration）
-- Supabase ダッシュボード → SQL Editor に貼り付けて実行する
-- =============================================================

alter table public.listings
  add column if not exists title_ja text,
  add column if not exists title_en text,
  add column if not exists title_zh text,
  add column if not exists title_ko text,
  add column if not exists summary_ja text,
  add column if not exists summary_en text,
  add column if not exists summary_zh text,
  add column if not exists summary_ko text;

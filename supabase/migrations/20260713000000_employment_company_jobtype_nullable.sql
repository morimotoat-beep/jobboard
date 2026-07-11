-- =============================================================
-- 機関種別カスケード対応:
--  1) employment_type の CHECK に企業向け5コードを追加
--     （emp_regular / emp_contract / emp_dispatch / emp_gyomu / emp_other）
--  2) 企業求人は職種なしのため job_type を nullable 化
--
-- 既存の employment_type CHECK 制約は名前が環境依存（インライン定義の
-- 自動命名）なので、定義文で検索して確実に落としてから貼り直す。冪等。
-- =============================================================

do $$
declare c text;
begin
  select conname into c
    from pg_constraint
   where conrelid = 'public.listings'::regclass
     and contype = 'c'
     and pg_get_constraintdef(oid) ilike '%employment_type%';
  if c is not null then
    execute format('alter table public.listings drop constraint %I', c);
  end if;
end $$;

alter table public.listings
  add constraint listings_employment_type_check
  check (employment_type in (
    'emp_fixed', 'emp_permanent', 'emp_tenure_track',
    'emp_regular', 'emp_contract', 'emp_dispatch', 'emp_gyomu', 'emp_other'
  ));

-- 企業求人（職種なし）のため job_type を任意化。CHECK は残す（NULL は通過）。
alter table public.listings alter column job_type drop not null;

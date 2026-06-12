# アカデミアノート Jobs（jobs.academianote.site）

研究者向け求人サイト。日本語と世界の研究者をつなぐ求人ボード＋リンク集。

- 仕様：`研究者求人サイト_構築指示書_v1.md` ＋ `研究者求人サイト_方針更新_v1.1.md`
- スタック：Next.js (App Router) / Supabase / next-intl (ja・en・zh・ko) / Resend / DeepL / Vercel

## セットアップ

```bash
npm install
copy .env.local.example .env.local   # 各キーを記入
npm run dev
```

### データベース（Supabase）

1. Supabase で新規プロジェクト作成（Tokyo リージョン推奨）
2. SQL Editor で `supabase/schema.sql` を実行（新規の場合はこれだけでOK）
3. 既存DBに翻訳カラムを追加する場合のみ `supabase/migration_translations.sql` を実行
4. 接続確認：`node --env-file=.env.local scripts/check-db.mjs`

### 環境変数（.env.local / Vercel）

| 変数 | 用途 |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 接続 |
| `SUPABASE_SERVICE_ROLE_KEY` | サーバー側DBアクセス（RLSは全ロックダウン） |
| `RESEND_API_KEY` / `MAIL_FROM` | メール送信（未設定時はコンソール出力にフォールバック） |
| `DEEPL_API_KEY` | 日⇔英の自動翻訳（未設定時は原文のみで動作） |
| `NEXT_PUBLIC_SITE_URL` | メール内リンクの生成（本番：https://jobs.academianote.site） |
| `CRON_SECRET` | Vercel Cron の認証 |
| `ADMIN_PASSWORD` | 管理画面 `/admin` のログイン |

## 主要な仕組み

- **投稿フロー**：投稿 → 確認メール → メール内の管理リンク（`/manage/{edit_token}`）から公開・編集・削除
- **自動メンテナンス**：`/api/cron/maintenance` を Vercel Cron が毎日 0:00 UTC（9:00 JST）に実行。締切超過→`expired`、404/410 が3日連続→`link_flagged`＋投稿者へ通知。リンク回復で自動再公開
- **自動翻訳**：投稿・編集時に DeepL で日⇔英を1回だけ翻訳し `title_xx` / `summary_xx` に保存
- **管理画面**：`/admin`（日本語のみ・パスワードログイン・通報順表示）
- **個人情報方針**：求職者の個人情報は一切収集しない（収集するのは投稿者のメールアドレスのみ）

## 動作確認用スクリプト

```bash
node --env-file=.env.local scripts/check-db.mjs        # DB接続確認
node --env-file=.env.local scripts/seed-sample.mjs     # サンプル求人4件を投入
node --env-file=.env.local scripts/seed-sample.mjs --clean  # サンプルを一括削除
```

# Supabase 設定ガイド

このプロジェクトでは Supabase を使用します。以下の手順で設定してください。

## 1. Supabase プロジェクトの作成
1. [Supabase](https://supabase.com) にアクセスし、無料アカウントを作成
2. 新しいプロジェクトを作成

## 2. 環境変数の設定
プロジェクトルートに `.env.local` ファイルを作成し、以下の内容を記述してください：

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

これらの値は Supabase ダッシュボードの `Settings > API` から取得できます。

## 3. データベースのセットアップ
`supabase/migrations/001_initial_schema.sql` を Supabase の SQL Editor で実行してください。

-- 1. テーブル作成 (存在しない場合のみ)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  youtube_channel_id TEXT,
  theme_color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  streamer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  start_at TIMESTAMP WITH TIME ZONE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('VIDEO', 'LIVE_STREAM', 'LIVE_ARCHIVE', 'OTHER')),
  status TEXT NOT NULL CHECK (status IN ('UPCOMING', 'LIVE', 'ENDED')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. インデックス作成 (存在しない場合のエラー回避のためIF NOT EXISTS的な処理は難しいので、失敗しても続行するようにDOブロック等は使わずにシンプルに記述。重複エラーが出たら無視してください)
CREATE INDEX IF NOT EXISTS items_streamer_id_idx ON public.items(streamer_id);
CREATE INDEX IF NOT EXISTS items_start_at_idx ON public.items(start_at DESC);
CREATE INDEX IF NOT EXISTS items_status_idx ON public.items(status);

-- 3. RLSの有効化
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

-- 4. プロフィール用RLSポリシー (既存のものを削除してから再作成)
DROP POLICY IF EXISTS "プロフィールは誰でも閲覧可能" ON public.profiles;
CREATE POLICY "プロフィールは誰でも閲覧可能" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "プロフィールは本人のみ更新可能" ON public.profiles;
CREATE POLICY "プロフィールは本人のみ更新可能" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "プロフィールは本人のみ挿入可能" ON public.profiles;
CREATE POLICY "プロフィールは本人のみ挿入可能" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- 5. アイテム用RLSポリシー (緩和版)
DROP POLICY IF EXISTS "アイテムは誰でも閲覧可能" ON public.items;
CREATE POLICY "アイテムは誰でも閲覧可能" ON public.items FOR SELECT USING (true);

DROP POLICY IF EXISTS "アイテムは本人のみ挿入可能" ON public.items;
-- 【重要】ここで緩和されたポリシーを適用
CREATE POLICY "アイテムは本人のみ挿入可能"
  ON public.items
  FOR INSERT
  WITH CHECK (auth.uid() = streamer_id);

DROP POLICY IF EXISTS "アイテムは本人のみ更新可能" ON public.items;
CREATE POLICY "アイテムは本人のみ更新可能"
  ON public.items
  FOR UPDATE
  USING (auth.uid() = streamer_id);

DROP POLICY IF EXISTS "アイテムは本人のみ削除可能" ON public.items;
CREATE POLICY "アイテムは本人のみ削除可能"
  ON public.items
  FOR DELETE
  USING (auth.uid() = streamer_id);

-- 6. update_updated_at_column 関数の作成 (更新日時自動更新用)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- トリガーの作成 (存在チェックをしてから作成)
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_items_updated_at ON public.items;
CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON public.items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. ユーザー登録時のプロフィール自動作成トリガー (handle_new_user)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, created_at, updated_at)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING; -- すでに存在する場合は何もしない
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- トリガー再設定
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ★ 既存ユーザーのプロフィール作成（すでに登録済みのユーザー用）
INSERT INTO public.profiles (id, display_name)
SELECT id, split_part(email, '@', 1)
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT DO NOTHING;

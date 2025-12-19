-- プロフィールテーブル (配信者情報)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  youtube_channel_id TEXT,
  theme_color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- アイテムテーブル (動画・配信・スケジュール)
CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  streamer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  start_at TIMESTAMP WITH TIME ZONE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('VIDEO', 'LIVE_STREAM', 'LIVE_ARCHIVE', 'OTHER')),
  status TEXT NOT NULL CHECK (status IN ('UPCOMING', 'LIVE', 'ENDED')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス (パフォーマンス最適化)
CREATE INDEX items_streamer_id_idx ON items(streamer_id);
CREATE INDEX items_start_at_idx ON items(start_at DESC);
CREATE INDEX items_status_idx ON items(status);

-- Row Level Security (RLS) ポリシー
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- プロフィール: 誰でも閲覧可、本人のみ更新可
CREATE POLICY "プロフィールは誰でも閲覧可能"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "プロフィールは本人のみ更新可能"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "プロフィールは本人のみ挿入可能"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- アイテム: 誰でも閲覧可、本人のみ追加・更新・削除可
CREATE POLICY "アイテムは誰でも閲覧可能"
  ON items FOR SELECT
  USING (true);

CREATE POLICY "アイテムは本人のみ挿入可能"
  ON items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = items.streamer_id
      AND profiles.id = auth.uid()
    )
  );

CREATE POLICY "アイテムは本人のみ更新可能"
  ON items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = items.streamer_id
      AND profiles.id = auth.uid()
    )
  );

CREATE POLICY "アイテムは本人のみ削除可能"
  ON items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = items.streamer_id
      AND profiles.id = auth.uid()
    )
  );

-- 自動更新トリガー (updated_at)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_items_updated_at
  BEFORE UPDATE ON items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

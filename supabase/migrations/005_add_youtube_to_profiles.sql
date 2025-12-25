-- profiles テーブルに YouTube 関連のカラムを追加
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS youtube_channel_id TEXT,
ADD COLUMN IF NOT EXISTS youtube_handle TEXT,
ADD COLUMN IF NOT EXISTS youtube_custom_url TEXT,
ADD COLUMN IF NOT EXISTS youtube_title TEXT,
ADD COLUMN IF NOT EXISTS youtube_description TEXT,
ADD COLUMN IF NOT EXISTS youtube_thumbnails JSONB;

-- コメントの追加
COMMENT ON COLUMN public.profiles.youtube_channel_id IS 'YouTube チャンネルのユニーク ID (UC...)';
COMMENT ON COLUMN public.profiles.youtube_handle IS 'YouTube のハンドル名 (@...)';
COMMENT ON COLUMN public.profiles.youtube_custom_url IS 'YouTube のカスタム URL';
COMMENT ON COLUMN public.profiles.youtube_title IS 'YouTube チャンネルのタイトル';
COMMENT ON COLUMN public.profiles.youtube_description IS 'YouTube チャンネルの説明文';
COMMENT ON COLUMN public.profiles.youtube_thumbnails IS 'YouTube チャンネルのサムネイル情報のキャッシュ (JSON形式)';

-- 新規ユーザー登録時にプロフィールを自動作成するトリガー

-- プロフィール作成関数
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, created_at, updated_at)
  VALUES (
    new.id,
    -- メタデータのfull_nameがあればそれを使用、なければメールアドレスの@より前を使用
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    NOW(),
    NOW()
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- トリガーの作成
-- 既存のトリガーがあれば削除してから作成（再実行可能にするため）
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

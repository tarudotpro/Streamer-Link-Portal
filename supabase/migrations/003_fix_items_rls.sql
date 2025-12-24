-- アイテム追加時のRLSポリシーを緩和する修正
-- 現状はprofilesテーブルの存在を必須としているが、これを解除して
-- 単純に「認証ユーザーID = streamer_id」であれば許可するように変更する

-- 既存のポリシーを削除
DROP POLICY IF EXISTS "アイテムは本人のみ挿入可能" ON public.items;

-- 新しいポリシーを作成
CREATE POLICY "アイテムは本人のみ挿入可能"
  ON public.items
  FOR INSERT
  WITH CHECK (auth.uid() = streamer_id);

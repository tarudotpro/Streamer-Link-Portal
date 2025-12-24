'use server'

import { createClient } from '@/utils/supabase/server'
import { fetchOGP } from '@/utils/ogp'
import { revalidatePath } from 'next/cache'

/**
 * アイテムを追加
 */
export async function addItem(streamerId: string, url: string) {
    try {
        const supabase = await createClient()

        // 認証チェック
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user || user.id !== streamerId) {
            console.error('認証エラー: user.id mismatch', user?.id, streamerId)
            return { error: '認証エラー' }
        }

        // プロフィール存在確認 & なければ作成
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', user.id)
            .single()

        if (profileError || !profile) {
            console.log('プロフィール未作成のため作成します:', user.id)
            const { error: insertError } = await supabase
                .from('profiles')
                .insert({
                    id: user.id,
                    display_name: (user.email || 'user').split('@')[0]
                })

            if (insertError) {
                console.error('プロフィール自動作成失敗:', insertError)
                return { error: 'プロフィールの自動作成に失敗しました: ' + insertError.message }
            }
        }

        console.log('Inserting item for user:', user.id, 'StreamerId:', streamerId)

        // OGPデータを取得
        const ogpData = await fetchOGP(url)

        // アイテムをDBに保存
        const { error } = await supabase.from('items').insert({
            streamer_id: streamerId,
            title: ogpData.title,
            url: ogpData.url,
            thumbnail_url: ogpData.image,
            start_at: new Date().toISOString(), // デフォルトは現在時刻
            type: 'OTHER',
            status: 'ENDED',
        })

        if (error) {
            console.error('DB挿入エラー:', error)
            return { error: `DBエラー: ${error.message} (Code: ${error.code}) Details: ${error.details}` }
        }

        // キャッシュを再検証
        revalidatePath('/admin')

        return { success: true }
    } catch (error: any) {
        console.error('アイテム追加エラー詳細:', error)
        console.error('Stack:', error.stack)

        if (error.message === 'OGPデータの取得に失敗しました') {
            return { error: 'URLから情報を取得できませんでした。正しいURLか確認してください。' }
        }

        return { error: 'アイテムの追加に失敗しました: ' + (error.message || '不明なエラー') }
    }
}

/**
 * アイテムを削除
 */
export async function deleteItem(itemId: string) {
    try {
        const supabase = await createClient()

        // 認証チェック
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
            return { error: '認証エラー' }
        }

        // 削除（RLSポリシーにより本人のアイテムのみ削除可能）
        const { error } = await supabase.from('items').delete().eq('id', itemId)

        if (error) {
            console.error('削除エラー:', error)
            return { error: 'データベースエラー' }
        }

        // キャッシュを再検証
        revalidatePath('/admin')

        return { success: true }
    } catch (error) {
        console.error('アイテム削除エラー:', error)
        return { error: 'アイテムの削除に失敗しました' }
    }
}

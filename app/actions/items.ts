'use server'

import { createClient } from '@/utils/supabase/server'
import { fetchOGP } from '@/utils/ogp'
import { revalidatePath } from 'next/cache'

/**
 * アイテムを追加
 */
export async function addItem(streamerId: string, url: string) {
    try {
        const supabase = createClient()

        // 認証チェック
        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user || user.id !== streamerId) {
            return { error: '認証エラー' }
        }

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
            return { error: 'データベースエラー' }
        }

        // キャッシュを再検証
        revalidatePath('/admin')

        return { success: true }
    } catch (error) {
        console.error('アイテム追加エラー:', error)
        return { error: 'アイテムの追加に失敗しました' }
    }
}

/**
 * アイテムを削除
 */
export async function deleteItem(itemId: string) {
    try {
        const supabase = createClient()

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

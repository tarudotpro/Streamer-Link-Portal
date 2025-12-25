'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { getYouTubeChannelInfo } from '@/utils/youtube'

export async function updateProfile(formData: FormData) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('認証が必要です')
    }

    const displayName = formData.get('displayName') as string
    const youtubeChannelId = formData.get('youtubeChannelId') as string

    // YouTube データの取得 (URL または ID が提供されている場合)
    let youtubeData: any = {}
    if (youtubeChannelId) {
        const channelInfo = await getYouTubeChannelInfo(youtubeChannelId)
        if (channelInfo) {
            youtubeData = {
                youtube_channel_id: channelInfo.id, // 解決された ID を保存
                youtube_title: channelInfo.title,
                youtube_description: channelInfo.description,
                youtube_custom_url: channelInfo.customUrl,
                youtube_thumbnails: channelInfo.thumbnails,
            }
        }
    }

    const { error } = await supabase
        .from('profiles')
        .update({
            display_name: displayName,
            youtube_channel_id: youtubeChannelId,
            ...youtubeData,
            updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

    if (error) {
        console.error('Profile update error:', error)
        return { error: 'プロフィールの更新に失敗しました' }
    }

    revalidatePath('/admin')
    return { success: true }
}

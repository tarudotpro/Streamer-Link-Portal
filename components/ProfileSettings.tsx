'use client'

import { useState } from 'react'
import { updateProfile } from '@/app/actions/profile'

interface ProfileSettingsProps {
    profile: {
        display_name: string | null
        youtube_channel_id: string | null
    }
}

export default function ProfileSettings({ profile }: ProfileSettingsProps) {
    const [isPending, setIsPending] = useState(false)
    const [message, setMessage] = useState('')

    async function handleSubmit(formData: FormData) {
        setIsPending(true)
        setMessage('')

        try {
            const result = await updateProfile(formData)
            if (result.error) {
                setMessage(`❌ ${result.error}`)
            } else {
                setMessage('✅ プロフィールを更新しました')
            }
        } catch (error) {
            setMessage('❌ エラーが発生しました')
        } finally {
            setIsPending(false)
        }
    }

    return (
        <form action={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-purple-200 mb-1">
                    表示名
                </label>
                <input
                    type="text"
                    name="displayName"
                    defaultValue={profile.display_name || ''}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="チャンネル名や名前"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-purple-200 mb-1">
                    YouTube チャンネル URL または ID
                </label>
                <input
                    type="text"
                    name="youtubeChannelId"
                    defaultValue={profile.youtube_channel_id || ''}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="https://www.youtube.com/@handle"
                />
                <p className="mt-1 text-xs text-purple-300/60">
                    チャンネルの URL（@ハンドル名付きなど）を入力してください。自動的に ID を抽出します。
                </p>
            </div>

            <div className="flex items-center gap-4">
                <button
                    type="submit"
                    disabled={isPending}
                    className="bg-purple-600 hover:bg-purple-500 disabled:bg-purple-800 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                >
                    {isPending ? '保存中...' : 'プロフィールを保存'}
                </button>
                {message && (
                    <span className="text-sm font-medium text-white">{message}</span>
                )}
            </div>
        </form>
    )
}

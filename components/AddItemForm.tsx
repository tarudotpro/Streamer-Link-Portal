'use client'

import { useState } from 'react'
import { Plus, Loader2 } from 'lucide-react'
import { addItem } from '@/app/actions/items'

interface AddItemFormProps {
    streamerId: string
}

export default function AddItemForm({ streamerId }: AddItemFormProps) {
    const [url, setUrl] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const result = await addItem(streamerId, url)
            if (result.error) {
                setError(result.error)
            } else {
                setUrl('')
                // 成功時はページがリロードされる
            }
        } catch (err) {
            setError('予期しないエラーが発生しました')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="url" className="block text-sm font-medium text-white mb-2">
                    URL
                </label>
                <input
                    type="url"
                    id="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
            </div>

            {error && (
                <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
                    {error}
                </div>
            )}

            <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        取得中...
                    </>
                ) : (
                    <>
                        <Plus className="w-5 h-5" />
                        追加
                    </>
                )}
            </button>
        </form>
    )
}

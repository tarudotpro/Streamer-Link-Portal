import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import PublicItemCard from '@/components/PublicItemCard'
import ChannelHeader from '@/components/ChannelHeader'

interface PageProps {
    params: Promise<{ username: string }>
}

// ISR: 60秒ごとに再検証
export const revalidate = 60

export default async function PublicPage({ params }: PageProps) {
    const { username } = await params
    const supabase = await createClient()

    // ユーザー名からプロフィールを取得
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('display_name', username)
        .single()

    if (!profile) {
        notFound()
    }

    // アイテム一覧を取得
    const { data: items } = await supabase
        .from('items')
        .select('*')
        .eq('streamer_id', profile.id)
        .order('start_at', { ascending: false })

    // ステータスごとに分類
    const now = new Date()
    const upcoming = items?.filter(
        (item) => item.status === 'UPCOMING' || new Date(item.start_at) > now
    ) || []
    const live = items?.filter((item) => item.status === 'LIVE') || []
    const archive = items?.filter(
        (item) => item.status === 'ENDED' && new Date(item.start_at) <= now
    ) || []

    return (
        <div
            className="min-h-screen"
            style={{
                background: `linear-gradient(to bottom right, ${profile.theme_color}22, #0f172a)`,
            }}
        >
            <div className="container mx-auto px-4 py-12">
                {/* YouTube チャンネルヘッダー */}
                <ChannelHeader profile={profile} />

                {/* LIVE */}
                {live.length > 0 && (
                    <section className="mb-12">
                        <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                            <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                            配信中
                        </h2>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {live.map((item) => (
                                <PublicItemCard key={item.id} item={item} />
                            ))}
                        </div>
                    </section>
                )}

                {/* Upcoming */}
                {upcoming.length > 0 && (
                    <section className="mb-12">
                        <h2 className="text-3xl font-bold text-white mb-6">📅 予定</h2>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {upcoming.map((item) => (
                                <PublicItemCard key={item.id} item={item} />
                            ))}
                        </div>
                    </section>
                )}

                {/* Archive */}
                {archive.length > 0 && (
                    <section className="mb-12">
                        <h2 className="text-3xl font-bold text-white mb-6">✅ アーカイブ</h2>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {archive.map((item) => (
                                <PublicItemCard key={item.id} item={item} />
                            ))}
                        </div>
                    </section>
                )}

                {items?.length === 0 && (
                    <p className="text-center text-white/60 py-12">
                        まだコンテンツがありません
                    </p>
                )}
            </div>
        </div>
    )
}

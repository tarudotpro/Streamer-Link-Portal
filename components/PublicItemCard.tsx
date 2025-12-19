import { Database } from '@/types/database'
import { ExternalLink } from 'lucide-react'

type Item = Database['public']['Tables']['items']['Row']

interface PublicItemCardProps {
    item: Item
}

export default function PublicItemCard({ item }: PublicItemCardProps) {
    const statusBadge = {
        LIVE: { text: '🔴 LIVE', color: 'bg-red-500' },
        UPCOMING: { text: '📅 予約', color: 'bg-blue-500' },
        ENDED: { text: '✅ 終了', color: 'bg-gray-500' },
    }[item.status]

    return (
        <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group block bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden border border-white/20 hover:border-white/40 transition-all hover:scale-105"
        >
            {/* サムネイル */}
            {item.thumbnail_url && (
                <div className="relative aspect-video bg-gray-800">
                    <img
                        src={item.thumbnail_url}
                        alt={item.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 right-3">
                        <span className={`px-3 py-1 rounded-full text-white text-sm font-semibold ${statusBadge.color}`}>
                            {statusBadge.text}
                        </span>
                    </div>
                </div>
            )}

            {/* コンテンツ */}
            <div className="p-5">
                <h3 className="text-white font-bold text-lg mb-2 line-clamp-2 group-hover:text-purple-300 transition-colors">
                    {item.title}
                </h3>
                <p className="text-white/60 text-sm mb-3">
                    {new Date(item.start_at).toLocaleString('ja-JP', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                    })}
                </p>
                <div className="flex items-center gap-2 text-purple-300 text-sm font-medium">
                    <ExternalLink className="w-4 h-4" />
                    <span>視聴する</span>
                </div>
            </div>
        </a>
    )
}

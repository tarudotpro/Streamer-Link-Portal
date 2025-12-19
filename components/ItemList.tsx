'use client'

import { Database } from '@/types/database'
import { ExternalLink, Trash2 } from 'lucide-react'
import { deleteItem } from '@/app/actions/items'

type Item = Database['public']['Tables']['items']['Row']

interface ItemListProps {
    items: Item[]
}

export default function ItemList({ items }: ItemListProps) {
    const handleDelete = async (id: string) => {
        if (!confirm('このアイテムを削除しますか？')) return
        await deleteItem(id)
    }

    if (items.length === 0) {
        return (
            <p className="text-white/60 text-center py-8">
                まだアイテムが登録されていません
            </p>
        )
    }

    return (
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {items.map((item) => (
                <div
                    key={item.id}
                    className="flex items-start gap-3 p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
                >
                    {item.thumbnail_url && (
                        <img
                            src={item.thumbnail_url}
                            alt={item.title}
                            className="w-24 h-16 object-cover rounded"
                        />
                    )}
                    <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium truncate">{item.title}</h3>
                        <p className="text-white/60 text-sm">
                            {new Date(item.start_at).toLocaleString('ja-JP')}
                        </p>
                        <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full bg-purple-500/20 text-purple-300">
                            {item.status}
                        </span>
                    </div>
                    <div className="flex gap-2">
                        <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-white/60 hover:text-white transition-colors"
                        >
                            <ExternalLink className="w-4 h-4" />
                        </a>
                        <button
                            onClick={() => handleDelete(item.id)}
                            className="p-2 text-red-400 hover:text-red-300 transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    )
}

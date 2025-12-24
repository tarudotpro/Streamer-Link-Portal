import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import AddItemForm from '@/components/AddItemForm'
import ItemList from '@/components/ItemList'

export default async function AdminPage() {
    const supabase = await createClient()

    // 認証チェック
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // プロフィール取得
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    // アイテム一覧取得
    const { data: items } = await supabase
        .from('items')
        .select('*')
        .eq('streamer_id', user.id)
        .order('start_at', { ascending: false })

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            <div className="container mx-auto px-4 py-8">
                <header className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">
                        管理ダッシュボード
                    </h1>
                    <p className="text-purple-200">
                        ようこそ、{profile?.display_name || user.email}さん
                    </p>
                </header>

                <div className="grid gap-8 lg:grid-cols-2">
                    {/* 左側: アイテム追加フォーム */}
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                        <h2 className="text-2xl font-bold text-white mb-4">
                            新しいアイテムを追加
                        </h2>
                        <AddItemForm streamerId={user.id} />
                    </div>

                    {/* 右側: アイテム一覧 */}
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                        <h2 className="text-2xl font-bold text-white mb-4">
                            登録済みアイテム
                        </h2>
                        <ItemList items={items || []} />
                    </div>
                </div>
            </div>
        </div>
    )
}

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import LoginForm from '@/components/LoginForm'

export default async function LoginPage() {
    const supabase = createClient()

    // すでにログイン済みの場合は管理画面へリダイレクト
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (user) {
        redirect('/admin')
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                    <h1 className="text-3xl font-bold text-white mb-2 text-center">
                        Streamer Link Portal
                    </h1>
                    <p className="text-purple-200 text-center mb-8">
                        配信者向け管理画面
                    </p>
                    <LoginForm />
                </div>
            </div>
        </div>
    )
}

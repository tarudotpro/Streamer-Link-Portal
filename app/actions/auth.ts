'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

/**
 * メールアドレスとパスワードでログイン
 */
export async function signInWithEmail(email: string, password: string) {
    const supabase = createClient()

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return { error: 'ログインに失敗しました' }
    }

    redirect('/admin')
}

/**
 * Googleでログイン
 */
export async function signInWithGoogle() {
    const supabase = createClient()

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
        },
    })

    if (error) {
        return { error: 'ログインに失敗しました' }
    }

    if (data.url) {
        redirect(data.url)
    }
}

/**
 * ログアウト
 */
export async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    redirect('/login')
}

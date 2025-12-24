'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

/**
 * メールアドレスとパスワードでログイン
 */
export async function signInWithEmail(email: string, password: string) {
    const supabase = await createClient()

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
 * メールアドレスとパスワードで新規登録
 */
export async function signUpWithEmail(email: string, password: string) {
    const supabase = await createClient()

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            // 環境変数の設定ミスを防ぐため、一時的にローカルURLを直接指定します
            emailRedirectTo: 'http://localhost:3000/auth/callback',
        },
    })

    if (error) {
        return { error: '登録に失敗しました: ' + error.message }
    }

    // メール確認が必要な設定の場合もあるが、今回は成功メッセージを返す
    return { success: true }
}

/**
 * Googleでログイン
 */
export async function signInWithGoogle() {
    const supabase = await createClient()

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
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
}

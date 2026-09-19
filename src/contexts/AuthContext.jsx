import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  // セッションの復元が完了するまで true（未ログイン扱いで誤ってリダイレクトしないため）
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 起動時に保存済みのセッションを取得する
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    // ログイン・ログアウト・トークン更新を監視する
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession)
      }
    )

    return () => listener.subscription.unsubscribe()
  }, [])

  const value = {
    session,
    user: session?.user ?? null,
    loading,
    signUp: (email, password) => supabase.auth.signUp({ email, password }),
    signIn: (email, password) =>
      supabase.auth.signInWithPassword({ email, password }),
    signOut: () => supabase.auth.signOut(),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// 認証情報を取得するカスタムフック
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth は AuthProvider の内側で使用してください')
  }
  return context
}

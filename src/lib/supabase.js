import { createClient } from '@supabase/supabase-js'

// .env から接続情報を読み込む（Viteでは VITE_ プレフィックスが必要）
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Supabaseの接続情報が未設定です。.env.example を参考に .env を作成してください。'
  )
}

export const supabase = createClient(supabaseUrl, supabaseKey)

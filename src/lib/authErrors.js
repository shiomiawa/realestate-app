// Supabaseの認証エラーを日本語メッセージに変換する
export function toJapaneseAuthError(error) {
  const message = error?.message ?? ''

  if (message.includes('Invalid login credentials')) {
    return 'メールアドレスまたはパスワードが正しくありません。'
  }
  if (message.includes('Email not confirmed')) {
    return 'メールアドレスの確認が完了していません。確認メールのリンクを開いてください。'
  }
  if (message.includes('User already registered')) {
    return 'このメールアドレスは既に登録されています。'
  }
  if (message.includes('Password should be at least')) {
    return 'パスワードは6文字以上で入力してください。'
  }
  if (message.includes('rate limit')) {
    return 'リクエストが多すぎます。しばらく待ってからやり直してください。'
  }
  return `エラーが発生しました: ${message}`
}

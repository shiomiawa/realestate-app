import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { toJapaneseAuthError } from '../lib/authErrors'

export default function Signup() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setInfo('')

    if (password !== passwordConfirm) {
      setError('パスワードが一致しません。')
      return
    }

    setSubmitting(true)
    const { data, error } = await signUp(email, password)
    setSubmitting(false)

    if (error) {
      setError(toJapaneseAuthError(error))
      return
    }

    // メール確認が有効な場合、登録済みのメールアドレスではidentitiesが空で返ってくる
    if (data.user?.identities?.length === 0) {
      setError('このメールアドレスは既に登録されています。')
      return
    }

    // メール確認が無効ならそのままログイン状態になるので物件一覧へ遷移する
    if (data.session) {
      navigate('/', { replace: true })
      return
    }

    // メール確認が有効な場合は、確認メールの案内を表示する
    setInfo('確認メールを送信しました。メール内のリンクを開いてからログインしてください。')
  }

  return (
    <div className="auth-page">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h1>会員登録</h1>

        <label htmlFor="email">メールアドレス</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />

        <label htmlFor="password">パスワード（6文字以上）</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          minLength={6}
          required
        />

        <label htmlFor="passwordConfirm">パスワード（確認）</label>
        <input
          id="passwordConfirm"
          type="password"
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
          autoComplete="new-password"
          minLength={6}
          required
        />

        {error && <p className="message error">{error}</p>}
        {info && <p className="message info">{info}</p>}

        <button type="submit" disabled={submitting}>
          {submitting ? '登録中...' : '会員登録'}
        </button>

        <p className="auth-link">
          既にアカウントをお持ちの方は <Link to="/login">ログイン</Link>
        </p>
      </form>
    </div>
  )
}

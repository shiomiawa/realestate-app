import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

// ログイン済みのユーザーがログイン・会員登録画面を開いた場合は物件一覧へ移動させる
export default function PublicRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <p className="loading">読み込み中...</p>
  }

  if (user) {
    return <Navigate to="/" replace />
  }

  return children
}

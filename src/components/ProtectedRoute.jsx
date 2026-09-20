import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

// ログイン済みの場合のみ子要素を表示し、未ログインならログイン画面へリダイレクトする
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <p className="loading">読み込み中...</p>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

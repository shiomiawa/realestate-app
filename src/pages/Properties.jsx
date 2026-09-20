import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import PropertyForm from '../components/PropertyForm'
import {
  createProperty,
  deleteProperty,
  fetchProperties,
  toJapaneseDbError,
  updateProperty,
} from '../lib/propertiesApi'

// 家賃を「128,000円」の形式に整形する
const formatRent = (rent) => `${rent.toLocaleString('ja-JP')}円`

export default function Properties() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [listError, setListError] = useState('')
  // フォームの状態: null=非表示 / { property: null }=新規登録 / { property: 物件 }=編集
  const [formState, setFormState] = useState(null)
  // 削除など、フォーム以外の操作で起きたエラーの表示用
  const [actionError, setActionError] = useState('')

  // 画面を開いたときに、自分の物件一覧を取得する
  useEffect(() => {
    // 画面を離れた後に state を更新しないためのフラグ
    let cancelled = false

    fetchProperties()
      .then((data) => {
        if (!cancelled) setProperties(data)
      })
      .catch((error) => {
        if (!cancelled) setListError(toJapaneseDbError(error))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const handleLogout = async () => {
    await signOut()
    navigate('/login', { replace: true })
  }

  // 新規登録・編集フォームの保存処理
  const handleSave = async (values) => {
    try {
      if (formState.property) {
        // 編集: 返ってきた最新の内容で一覧の該当行を置き換える
        const updated = await updateProperty(formState.property.id, values)
        setProperties((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
      } else {
        // 新規登録: 一覧の先頭に追加する
        const created = await createProperty(values)
        setProperties((prev) => [created, ...prev])
      }
      setFormState(null)
    } catch (error) {
      // フォーム側でエラーメッセージを表示できるよう、日本語にして投げ直す
      throw new Error(toJapaneseDbError(error))
    }
  }

  const handleDelete = async (property) => {
    if (!window.confirm(`「${property.name}」を削除しますか？この操作は取り消せません。`)) {
      return
    }

    setActionError('')
    try {
      await deleteProperty(property.id)
      setProperties((prev) => prev.filter((p) => p.id !== property.id))
      // 編集中の物件を削除した場合はフォームも閉じる
      if (formState?.property?.id === property.id) setFormState(null)
    } catch (error) {
      setActionError(toJapaneseDbError(error))
    }
  }

  return (
    <div className="properties-page">
      <header className="header">
        <h1>物件一覧</h1>
        <div className="header-right">
          <span className="user-email">{user?.email}</span>
          <button type="button" className="logout-button" onClick={handleLogout}>
            ログアウト
          </button>
        </div>
      </header>

      <main>
        <div className="toolbar">
          <p className="count">{loading ? '' : `${properties.length}件`}</p>
          <button
            type="button"
            className="primary-button"
            onClick={() => setFormState({ property: null })}
            disabled={loading || Boolean(listError)}
          >
            ＋ 物件を登録
          </button>
        </div>

        {/* 編集対象が変わったときにフォームの入力値をリセットするため key を指定する */}
        {formState && (
          <PropertyForm
            key={formState.property?.id ?? 'new'}
            property={formState.property}
            onSubmit={handleSave}
            onCancel={() => setFormState(null)}
          />
        )}

        {actionError && <p className="message error">{actionError}</p>}
        {listError && <p className="message error">{listError}</p>}
        {loading && <p className="loading">読み込み中...</p>}

        {!loading && !listError && properties.length === 0 && (
          <p className="empty">
            登録された物件はありません。「＋ 物件を登録」から追加してください。
          </p>
        )}

        <ul className="property-grid">
          {properties.map((property) => (
            <li key={property.id} className="property-card">
              <h2>{property.name}</h2>
              <p className="rent">
                <span className="label">家賃</span>
                {formatRent(property.rent)}
                <span className="unit"> / 月</span>
              </p>
              <p className="area">
                <span className="label">エリア</span>
                {property.area}
              </p>
              <p className="area">
                <span className="label">間取り</span>
                {property.floor_plan}
              </p>

              <div className="card-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setFormState({ property })}
                >
                  編集
                </button>
                <button
                  type="button"
                  className="danger-button"
                  onClick={() => handleDelete(property)}
                >
                  削除
                </button>
              </div>
            </li>
          ))}
        </ul>
      </main>
    </div>
  )
}

import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { dummyProperties } from '../data/dummyProperties'

// 家賃を「128,000円」の形式に整形する
const formatRent = (rent) => `${rent.toLocaleString('ja-JP')}円`

export default function Properties() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut()
    navigate('/login', { replace: true })
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
        <ul className="property-grid">
          {dummyProperties.map((property) => (
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
            </li>
          ))}
        </ul>
      </main>
    </div>
  )
}

import { useState } from 'react'

// 間取りの入力候補（自由入力も可能）
const FLOOR_PLAN_OPTIONS = ['1R', '1K', '1DK', '1LDK', '2K', '2DK', '2LDK', '3LDK', '4LDK']

// 物件の新規登録・編集で共用するフォーム
// - property: 編集時は編集対象の物件、新規登録時は null
// - onSubmit: 保存処理（{ name, rent, area, floor_plan } を受け取る。失敗時は throw する）
// - onCancel: キャンセルボタンを押したときの処理
export default function PropertyForm({ property, onSubmit, onCancel }) {
  const isEdit = Boolean(property)

  const [name, setName] = useState(property?.name ?? '')
  const [rent, setRent] = useState(property?.rent?.toString() ?? '')
  const [area, setArea] = useState(property?.area ?? '')
  const [floorPlan, setFloorPlan] = useState(property?.floor_plan ?? '')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // 前後の空白は取り除いて保存する
    const values = {
      name: name.trim(),
      rent: Number(rent),
      area: area.trim(),
      floor_plan: floorPlan.trim(),
    }

    if (!values.name || !values.area || !values.floor_plan) {
      setError('物件名・エリア名・間取りを入力してください。')
      return
    }
    if (!Number.isInteger(values.rent) || values.rent < 0) {
      setError('家賃は0以上の整数（円）で入力してください。')
      return
    }

    setSubmitting(true)
    try {
      await onSubmit(values)
    } catch (err) {
      // 親から渡された onSubmit が投げたエラーの内容を表示する
      setError(err.message)
      setSubmitting(false)
    }
    // 成功時は親がフォームを閉じるので、submitting を戻す必要はない
  }

  return (
    <form className="property-form" onSubmit={handleSubmit}>
      <h2>{isEdit ? '物件を編集' : '物件を新規登録'}</h2>

      <label htmlFor="property-name">物件名</label>
      <input
        id="property-name"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="例：サンライズ渋谷"
        required
      />

      <label htmlFor="property-rent">家賃（円）</label>
      <input
        id="property-rent"
        type="number"
        value={rent}
        onChange={(e) => setRent(e.target.value)}
        min="0"
        step="1"
        placeholder="例：128000"
        required
      />

      <label htmlFor="property-area">エリア名</label>
      <input
        id="property-area"
        type="text"
        value={area}
        onChange={(e) => setArea(e.target.value)}
        placeholder="例：東京都渋谷区"
        required
      />

      <label htmlFor="property-floor-plan">間取り</label>
      <input
        id="property-floor-plan"
        type="text"
        list="floor-plan-options"
        value={floorPlan}
        onChange={(e) => setFloorPlan(e.target.value)}
        placeholder="例：1LDK"
        required
      />
      <datalist id="floor-plan-options">
        {FLOOR_PLAN_OPTIONS.map((option) => (
          <option key={option} value={option} />
        ))}
      </datalist>

      {error && <p className="message error">{error}</p>}

      <div className="form-actions">
        <button type="button" className="secondary-button" onClick={onCancel}>
          キャンセル
        </button>
        <button type="submit" className="primary-button" disabled={submitting}>
          {submitting ? '保存中...' : isEdit ? '更新する' : '登録する'}
        </button>
      </div>
    </form>
  )
}

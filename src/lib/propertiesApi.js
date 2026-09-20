import { supabase } from './supabase'

// 物件テーブルへのCRUD操作をまとめたファイル。
// どの関数も、失敗した場合は Error を throw する（呼び出し側で try/catch する）。
// 「自分の物件のみ」の絞り込みは、DB側のRLSポリシーが行うため、ここでは条件を付けない。

const TABLE = 'properties'

// 一覧取得（SELECT）: 新しく登録した順
export async function fetchProperties() {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

// 新規登録（INSERT）
// user_id は送らない。DB側の default auth.uid() で、ログイン中のユーザーのIDが自動的に入る。
export async function createProperty(values) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert(values)
    .select()
    .single()

  if (error) throw error
  return data
}

// 更新（UPDATE）
// 他人の物件はRLSで対象外になり、0件更新となる（single() がエラーを返す）。
export async function updateProperty(id, values) {
  const { data, error } = await supabase
    .from(TABLE)
    .update(values)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// 削除（DELETE）
export async function deleteProperty(id) {
  const { error } = await supabase.from(TABLE).delete().eq('id', id)

  if (error) throw error
}

// テーブル未作成・通信失敗などのエラーを、画面に出す日本語メッセージに変換する
export function toJapaneseDbError(error) {
  // テーブルがまだ作成されていない場合
  if (error?.code === 'PGRST205' || error?.code === '42P01') {
    return 'propertiesテーブルが見つかりません。supabase/schema.sql をSupabaseで実行してください。'
  }
  // 更新・削除の対象が存在しない（または他人の物件でRLSにより見えない）場合
  if (error?.code === 'PGRST116') {
    return '対象の物件が見つかりません。既に削除されたか、操作する権限がありません。'
  }
  // RLSによる拒否
  if (error?.code === '42501') {
    return 'この操作を行う権限がありません。'
  }
  // 入力値がテーブルの制約（家賃が負数、空文字など）に違反した場合
  if (error?.code === '23514' || error?.code === '23502') {
    return '入力内容が正しくありません。各項目を確認してください。'
  }
  return `エラーが発生しました: ${error?.message ?? '不明なエラー'}`
}

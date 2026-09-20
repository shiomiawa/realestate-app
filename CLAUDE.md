# CLAUDE.md

このファイルは、Claude Code がこのリポジトリで作業する際のガイドです。

## プロジェクト概要

- プロジェクト名: realestate-app（不動産アプリ）
- 技術スタック: React 19 + Vite（JavaScript）/ react-router-dom / Supabase（認証）

### コマンド

- `npm install`: 依存パッケージのインストール
- `npm run dev`: 開発サーバーの起動
- `npm run build`: 本番ビルド（変更後はこれが通ることを確認する）
- テストは未導入

### セットアップ

`.env.example` を `.env` にコピーし、Supabase の Project URL と Publishable key を設定する。
`.env` は `.gitignore` 対象のため、コミットしないこと。

### 構成

- `src/lib/supabase.js`: Supabase クライアント（`.env` の `VITE_SUPABASE_*` を使用）
- `src/contexts/AuthContext.jsx`: 認証状態の管理（`useAuth` フック）
- `src/components/ProtectedRoute.jsx`: 未ログインならログイン画面へリダイレクト
- `src/components/PublicRoute.jsx`: ログイン済みなら物件一覧へリダイレクト
- `src/pages/`: ログイン・会員登録・物件一覧の各画面
- `src/lib/propertiesApi.js`: 物件テーブルのCRUD（SELECT/INSERT/UPDATE/DELETE）とDBエラーの日本語化
- `src/components/PropertyForm.jsx`: 物件の新規登録・編集で共用するフォーム
- `supabase/schema.sql`: `properties` テーブルとRLSポリシーの定義

### データベース

- `properties` テーブル（物件名 `name` / 家賃 `rent` / エリア名 `area` / 間取り `floor_plan` / 登録者 `user_id`）。
- RLS を有効にしており、ログインユーザーは自分が登録した物件（`user_id = auth.uid()`）のみ表示・編集・削除できる。
  絞り込みは DB 側のポリシーで行うため、React 側の SELECT に `user_id` の条件は付けていない。
- `user_id` は INSERT 時に DB の `default auth.uid()` で自動設定される。React 側からは送らない。
- スキーマを変更する場合は `supabase/schema.sql` を更新し、Supabase の SQL Editor で実行する（再実行可能な書き方にしてある）。

## 言語・コミュニケーション

- ユーザーへの返答、コミットメッセージ、コード内コメントは日本語で書く。
- 変数名・関数名・ファイル名などの識別子は英語で書く。

## Git 運用ルール

### 基本方針

**コードを変更するたびに、変更内容をコミットして GitHub にプッシュする。**
作業の最後にまとめてではなく、意味のある変更単位ごとに行うこと。

### 手順

1. 変更内容を確認する（`git status` / `git diff`）。
2. 関連するファイルだけをステージする（`git add <ファイル>`）。`git add -A` や `git add .` は、意図しないファイル（`.env`、ビルド成果物など）を含めないよう内容を確認したうえでのみ使う。
3. 変更内容が分かるメッセージでコミットする。
4. `git push` で GitHub のリモートリポジトリへプッシュする。

### コミットメッセージ

- 1行目に変更内容の要約を簡潔に書く。必要なら空行の後に理由や補足を書く。
- 「何を変えたか」だけでなく「なぜ変えたか」が分かるようにする。

### 注意事項

- `main` ブランチで作業している場合は、機能追加や修正ごとに作業ブランチを切ってからコミット・プッシュする。
- `git push --force` などの履歴を書き換える操作は、ユーザーの明示的な指示がない限り行わない。
- フック（pre-commit 等）を `--no-verify` で回避しない。失敗した場合は原因を修正する。
- 秘密情報（APIキー、パスワード、`.env` など）は絶対にコミットしない。`.gitignore` で除外する。
- プッシュに失敗した場合（リモート未設定、認証エラー、競合など）は、その旨をユーザーに報告し、原因と対処を相談する。

### 初期セットアップ（未実施の場合）

このディレクトリは現時点で Git リポジトリとして初期化されておらず、GitHub のリモートも未設定。
最初のコミット・プッシュの前に、`git init` とリモートの設定（`git remote add origin <URL>`）が必要。
リモートの URL が不明な場合は、ユーザーに確認すること。

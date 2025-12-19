# 🔌 07. API ドキュメント

バックエンド (`auth-api`) が提供する外部インターフェースの仕様をまとめます。
ベース URL: `http://localhost:8000/api`

## 🔑 認証関連 (`/auth`)

### 1. ユーザー登録

- **Endpoint**: `POST /auth/signup`
- **Body**: `{ "email": "...", "password": "..." }`
- **Response**: `201 Created`
- **Description**: 新規ユーザーを作成し、セッションクッキーを設定します。

### 2. ログイン

- **Endpoint**: `POST /auth/login`
- **Body**: `{ "email": "...", "password": "..." }`
- **Response**: `200 OK`
- **Description**: 資格情報を検証し、認証済みクッキーを設定します。

### 3. 現在のユーザー情報取得

- **Endpoint**: `GET /auth/me`
- **Response**: `200 OK`, `{ "ok": true, "user": { ... } }`
- **Description**: クッキーによる認証状態を確認し、ログイン中のユーザー情報を返します。

### 4. ログアウト

- **Endpoint**: `POST /auth/logout`
- **Response**: `200 OK`
- **Description**: 認証クッキーをクリアします。

## 📝 メモ関連 (`/memos`)

※ すべてのエンドポイントで認証が必要です。

### 1. メモ一覧取得

- **Endpoint**: `GET /memos`
- **Response**: `200 OK`, `[ { "id": 1, "title": "...", ... }, ... ]`
- **Description**: ログインユーザーが作成したすべてのメモを取得します。

### 2. メモ作成

- **Endpoint**: `POST /memos`
- **Body**: `{ "title": "...", "content": "..." }`
- **Response**: `201 Created`
- **Description**: 新しいメモを作成します。

---

次は [🧪 08. テスト戦略](./08-テスト戦略.md) で、品質管理の仕組みを確認しましょう。

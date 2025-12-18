# ログイン機能付きメモ帳アプリケーション

このプロジェクトは、React と Node.js (Express) を使用して構築された、フルスタックの Web アプリケーションです。ユーザー認証機能と、ログインしたユーザー専用のシンプルなメモ帳機能を提供します。

## ✨ 主な機能

- **ユーザー認証**: 新規登録、ログイン
- **セッション管理**: JWT と Cookie を使用したログイン状態の維持
- **メモ帳 (CRUD)**: メモの作成、一覧表示、更新、削除

## 💻 技術スタック

### フロントエンド (`my-login-app`)

- **React**: UI 構築のためのライブラリ
- **TypeScript**: 静的型付けによる開発効率と安全性の向上
- **Tailwind CSS**: ユーティリティファーストの CSS フレームワーク

### バックエンド (`auth-api`)

- **Node.js / Express**: サーバーサイドのフレームワーク
- **TypeScript**: 静的型付け
- **Prisma**: データベースとのやり取りを効率化する ORM
- **MySQL**: リレーショナルデータベース
- **JWT (JSON Web Token)**: 認証トークンの生成と検証

## 📂 プロジェクト構造 (バックエンド)

バックエンドは、関心の分離を目的としたレイヤー化アーキテクチャを採用しています。

```
src/
├── controllers/  # (受付係) HTTPリクエスト/レスポンスの処理
├── services/     # (頭脳) ビジネスロジックの実行
├── models/       # (DB係) データベースとの直接的なやり取り
├── routes/       # (交通整理) URLとControllerの紐付け
├── middleware/   # 認証チェックなど、ルート間で共有される処理
├── utils/        # パスワードのハッシュ化など、共通の便利道具
└── app.ts        # アプリケーション全体の組み立て
```

この構造により、各ファイルが単一の責任を持つようになり、コードの可読性とメンテナンス性が向上しています。

## 🚀 セットアップと実行方法

### 1. バックエンド (`auth-api`)

1.  **ディレクトリに移動**:

    ```bash
    cd auth-api
    ```

2.  **依存関係のインストール**:

    ```bash
    npm install
    ```

3.  **環境変数ファイルの設定**:
    `.env` ファイルをプロジェクトルートに作成し、データベース接続情報と JWT の秘密鍵を設定します。

    ```env
    DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/DATABASE_NAME"
    JWT_SECRET="YOUR_SUPER_SECRET_KEY"
    ```

4.  **データベースのマイグレーション**:
    Prisma のスキーマをデータベースに反映させます。

    ```bash
    npx prisma migrate dev
    ```

5.  **開発サーバーの起動**:
    `http://localhost:8000` でサーバーが起動します。
    ```bash
    npm run watch
    ```

### 2. フロントエンド (`my-login-app`)

1.  **ディレクトリに移動**:

    ```bash
    cd my-login-app
    ```

2.  **依存関係のインストール**:

    ```bash
    npm install
    ```

3.  **開発サーバーの起動**:
    `http://localhost:3000` (またはターミナルに表示される URL) でアプリケーションが起動します。
    ```bash
    npm start
    ```

## 📝 API エンドポイント一覧

### 認証 (`/api/auth`)

- `POST /registration`: 新規ユーザー登録
- `POST /login`: ログイン
- `GET /me`: 現在のログイン状態（ユーザー情報）を確認

### メモ (`/api/memos`)

- `GET /`: ログイン中のユーザーのすべてのメモを取得
- `POST /`: 新しいメモを作成
- `GET /:id`: 特定のメモを 1 件取得
- `PUT /:id`: 特定のメモを更新
- `DELETE /:id`: 特定のメモを削除

---

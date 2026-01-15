import {
  getMemosByAuthorId,
  createMemo as createMemoInDb,
  getMemoById,
  deleteMemo as deleteMemoInDb,
  updateMemoByAuthor,
  deleteMemoByAuthor,
} from "@/models/memos";

/**
 * Service層: メモに関するビジネスロジックを提供します。
 *
 * - コントローラー（ルート）から呼ばれ、DBモデルの関数をラップして
 *   認可チェックやエラーハンドリングを行います。
 * - ここでは単純な所有者チェックや存在チェックを行い、エラーには
 *   `statusCode` を付与して上位でHTTPレスポンスに変換しやすくしています。
 */
/**
 * 特定のユーザーのすべてのメモを取得する
 * @param userId ユーザーID
/**
 * Service層: メモに関するビジネスロジックを提供します。
 *
 * - コントローラー（ルート）から呼ばれ、DBモデルの関数をラップして
 *   認可チェックやエラーハンドリングを行います。
 * - ここでは単純な所有者チェックや存在チェックを行い、エラーには
 *   `statusCode` を付与して上位でHTTPレスポンスに変換しやすくしています。
 */

/**
 * 指定ユーザーの全メモを取得する
 *
 * 単純にモデルの `getMemosByAuthorId` を呼び出します。
 * - 例外や認可エラーはこの関数内では発生しない想定（呼び出し元が認証済みであること）
 *
 * @param userId - メモの作成者（所有者）であるユーザーのID
 * @returns モデルが返すメモ配列（空配列の可能性あり）
 */
export const getMemosForUser = async (userId: number) => {
  return await getMemosByAuthorId(userId);
};

/**
 * 指定IDのメモを取得し、呼び出しユーザーが所有者であるかを検証する
 *
 * 主な処理:
 * 1. DBからメモを取得（存在確認）
 * 2. メモが存在しなければ404エラーを投げる
 * 3. メモの `authorId` と `userId` を比較し、不一致なら403を投げる
 *
 * @param userId - リクエスト実行ユーザーのID（認可チェックに使用）
 * @param memoId - 取得対象のメモID
 * @throws Error - メモが存在しない場合は `statusCode = 404`
 * @throws Error - 所有者でない場合は `statusCode = 403`
 * @returns メモオブジェクト（存在かつ所有者である場合）
 */
export const getMemoByIdForUser = async (userId: number, memoId: number) => {
  const memo = await getMemoById(memoId);

  // 存在確認: DBに該当IDのメモが無い場合
  if (!memo) {
    const error = new Error("メモが見つかりません");
    // 上位レイヤー（ミドルウェア/コントローラ）でHTTPステータスに変換しやすくするため付与
    (error as any).statusCode = 404;
    throw error;
  }

  // 所有者確認: リクエストユーザーとメモのauthorIdが一致しない場合はアクセス拒否
  if (memo.authorId !== userId) {
    const error = new Error("アクセス権がありません");
    (error as any).statusCode = 403;
    throw error;
  }

  return memo;
};

/**
 * ユーザーのために新しいメモを作成する
 *
 * 単純ラッパ: モデルの `createMemo` を呼び出すだけです。
 * - フロントエンド/コントローラ側で入力バリデーション（タイトル長や必須チェック）を行っている
 *   想定がある場合はここでは重複して行わなくてもよいですが、必要ならバリデーションを追加してください。
 *
 * @param userId - メモ所有者のユーザーID
 * @param title - メモタイトル
 * @param content - メモ本文
 * @returns 作成されたメモ（モデルの返り値に依存）
 */
export const createMemoForUser = async (
  userId: number,
  title: string,
  content: string,
) => {
  return await createMemoInDb(title, content, userId);
};

/**
 * メモを更新する（所有者チェックを内部で行う）
 *
 * 実装のポイント:
 * - `updateMemoByAuthor` は内部で `UPDATE ... WHERE id=:memoId AND authorId=:userId` のような
 *   所有者に紐づく更新を行う想定で、影響行数（count）を返します。
 * - 影響行数が0なら対象が存在しない、またはユーザーに更新権限がないためエラーを返します。
 * - 成功した場合は最新のメモを `getMemoById` で再取得して返します。
 *
 * @param userId - 更新を実行するユーザーのID（所有者である必要がある）
 * @param memoId - 更新対象のメモID
 * @param title - 更新後のタイトル
 * @param content - 更新後の内容
 * @throws Error - 更新対象が無いか権限がない場合は `statusCode = 404`
 * @returns 更新後のメモオブジェクト
 */
export const updateMemoForUser = async (
  userId: number,
  memoId: number,
  title: string,
  content: string,
) => {
  const result = await updateMemoByAuthor(memoId, userId, title, content);

  // countが0なら「対象なし」か「権限なし」
  if (result.count === 0) {
    const error = new Error("メモが見つからないか、更新権限がありません");
    // 上位で404/403のどちらにマッピングするかは共通ミドルウェア次第ですが、
    // 一旦404を設定している（呼び出し元で詳細を判断しても良い）
    (error as any).statusCode = 404;
    throw error;
  }

  // 要件によりここで再取得して最新のメモを返す
  return await getMemoById(memoId);
};

/**
 * メモを削除する（所有者チェックを含む）
 *
 * - `deleteMemoByAuthor` は `DELETE ... WHERE id=:memoId AND authorId=:userId` のように
 *   所有者に紐づいた削除を想定しています。
 * - 影響行数が0なら対象が存在しないか所有権がないためエラーを投げます。
 *
 * @param userId - 削除を実行するユーザーのID
 * @param memoId - 削除対象のメモID
 * @throws Error - 対象が無い、または削除権限がない場合は `statusCode = 404`
 */
export const deleteUserMemo = async (userId: number, memoId: number) => {
  const result = await deleteMemoByAuthor(memoId, userId);

  // countが0なら「対象なし」か「権限なし」
  if (result.count === 0) {
    const error = new Error("メモが見つからないか、削除権限がありません");
    (error as any).statusCode = 404;
    throw error;
  }
};

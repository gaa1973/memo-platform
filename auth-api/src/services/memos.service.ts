import {
  getMemosByAuthorId,
  createMemo as createMemoInDb,
  getMemoById,
  deleteMemo as deleteMemoInDb,
  updateMemoByAuthor,
  deleteMemoByAuthor,
} from "@/models/memos";

/**
 * 特定のユーザーのすべてのメモを取得する
 * @param userId ユーザーID
 */
export const getMemosForUser = async (userId: number) => {
  return await getMemosByAuthorId(userId);
};


export const getMemoByIdForUser = async (
  userId: number,
  memoId: number,
) => {
    const memo = await getMemoById(memoId);
    if (!memo) {
      const error = new Error("メモが見つかりません");
      (error as any).statusCode = 404;
      throw error;
    }
    if(memo.authorId !== userId){
      const error = new Error("アクセス権がありません");
      (error as any).statusCode = 403;
      throw error;
    }
    return memo;
  };

/**
 * 特定のユーザーのために新しいメモを作成する
 * @param userId ユーザーID
 * @param title メモのタイトル
 * @param content メモの内容
 */
export const createMemoForUser = async (
  userId: number,
  title: string,
  content: string,
) => {
  return await createMemoInDb(title, content, userId);
};

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
    (error as any).statusCode = 404; // Forbidden
    throw error;
  }

  // 更新後のデータを返したい場合は再取得が必要ですが、
  // 要件次第では { success: true } や result を返すだけでもOKです
  return await getMemoById(memoId);
};


/**
 * メモを削除する（所有者チェックを含む）
 * @param userId リクエストしたユーザーのID
 * @param memoId 削除対象のメモID
 */
export const deleteUserMemo = async (userId: number, memoId: number) => {
  const result = await deleteMemoByAuthor(memoId, userId);

  // countが0なら「対象なし」か「権限なし」
  if (result.count === 0) {
    const error = new Error("メモが見つからないか、削除権限がありません");
    (error as any).statusCode = 404; // Forbidden
    throw error;
  }
};

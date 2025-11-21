// src/models/memos.ts
import {databaseManager} from "@/db";

/**
 * 指定ユーザーのメモを取得
 */
export const getMemosByAuthorId = async (authorId: number) => {
  const prisma = databaseManager.getInstance();
  return await prisma.memo.findMany({
    where: {authorId},
    orderBy: {createdAt: "desc"},
  });
};

/**
 * 新しいメモを作成
 */
export const createMemo = async (
  title: string,
  content: string,
  authorId: number,
) => {
  const prisma = databaseManager.getInstance();
  return await prisma.memo.create({
    data: {title, content, authorId},
  });
};

/**
 * IDでメモ取得
 */
export const getMemoById = async (id: number) => {
  const prisma = databaseManager.getInstance();
  return await prisma.memo.findUnique({where: {id}});
};

/**
 * IDと作成者IDを指定してメモを更新
 * (所有者でなければ更新されない)
 */
export const updateMemoByAuthor = async(
  id: number,
  authorId: number,
  title: string,
  content: string,
) => {
  const prisma = databaseManager.getInstance();
  // updateManyを使うのがポイント
  return await prisma.memo.updateMany({
    where: {
      id: id,
      authorId: authorId  // ここで所有者を限定する
    },
    data: {title, content},
  });
};

/**
 * IDと作成者IDを指定してメモを削除
 * (所有者でなければ削除されない)
 */
export const deleteMemoByAuthor = async( id: number, authorId: number) => {
  const prisma = databaseManager.getInstance();
  // deleteManyを使うのがポイント
  return await prisma.memo.deleteMany({
    where: {
      id: id,
      authorId: authorId  // ここで所有者を限定する
    }
  })
}

/**
 * メモを削除
 */
export const deleteMemo = async (id: number) => {
  const prisma = databaseManager.getInstance();
  return await prisma.memo.delete({where: {id}});
};

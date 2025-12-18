import { useState, useEffect, useCallback } from "react";
import { useApi } from "../hooks/useApi";

// このコンポーネントで扱う「メモ」のデータ構造をTypeScriptの型として定義します
type Memo = {
  id: number;
  title: string;
  content: string;
};

// このコンポーネントが親（App.tsx）から受け取るプロパティ（props）の型を定義します。
type MemoAppProps = {
  setMessage: (message: string) => void;
  onLogout: () => void;
};

// const API_BASE_URL = "http://localhost:8000/api";

export const MemoApp = ({ setMessage, onLogout }: MemoAppProps) => {
  const [memos, setMemos] = useState<Memo[]>([]); // メモの一覧を保持するためのstateです。初期値は空の配列です。
  const [newMemoTitle, setNewMemoTitle] = useState(""); // 新規作成フォームの「タイトル」入力欄の値を保持するstateです。
  const [newMemoContent, setNewMemoContent] = useState(""); // 新規作成フォームの「内容」入力欄の値を保持するstateです。

  // 各API呼び出し用のカスタムフックインスタンスを用意する
  // 1. メモ一覧取得用の専門家
  const {
    data: memosData,
    request: fetchMemos,
    isLoading: isLoadingMemos,
  } = useApi<Memo[]>();
  // 2. メモ作成用の専門家
  const { request: createMemoRequest, isLoading: isCreating } = useApi<Memo>();
  // 3. メモ削除用の専門家
  const { request: deleteMemoRequest, isLoading: isDeleting } = useApi<void>();

  // --- 副作用の管理 (useEffect) ---

  // 初回レンダリング時にメモを取得
  // このコンポーネントが最初に画面に表示された時に一度だけ実行される処理です。
  useEffect(() => {
    fetchMemos("/memos", { method: "GET" }).catch((error) => {
      setMessage(error.message || "メモの取得に失敗しました。");
    });
  }, [fetchMemos, setMessage]);

  // APIからメモが取得されたら、コンポーネントの状態を更新
  // `memosData`（APIから取得したデータ）が変更された時に実行される処理です。
  useEffect(() => {
    // `memosData` にデータが存在すれば、コンポーネントの `memos` stateを更新します。
    if (memosData) {
      setMemos(memosData);
    }
  }, [memosData]); // `memosData` が変わるたびにこの処理が走ります。

  // --- イベントハンドラ ---

  // 「作成」ボタンがクリックされた時に実行される関数です
  const handleCreateMemo = async () => {
    setMessage(""); // メッセージをリセット
    if (!newMemoTitle) {
      setMessage("タイトルを入力してください");
      return;
    }

    try {
      // APIからの応答を待つ前に、UIを楽観的に更新する
      const tempId = Date.now(); // 一時的なID
      const newMemo = {
        id: tempId,
        title: newMemoTitle,
        content: newMemoContent,
      };
      setMemos([newMemo, ...memos]); // stateの先頭に新しいメモを追加

      setNewMemoTitle(""); // 入力フォームをクリア
      setNewMemoContent("");

      // 実際にAPIを呼び出してサーバーにメモを作成します。
      const createdMemo = await createMemoRequest("/memos", {
        method: "POST",
        body: JSON.stringify({ title: newMemoTitle, content: newMemoContent }),
      });

      setMessage("新しいメモを作成しました");
      // サーバーから返された正式なメモでUIを更新（IDが確定する）
      setMemos((prevMemos) =>
        prevMemos.map((m) => (m.id === tempId ? createdMemo : m))
      );
    } catch (error: any) {
      setMessage(error.message || "メモの作成に失敗しました。");
      // 失敗した場合は、追加したメモを元に戻す
      setMemos(memos);
    }
  };

  // 「削除」ボタンがクリックされた時に実行される関数です。
  const handleDeleteMemo = async (id: number) => {
    setMessage("");
    try {
      // UIを楽観的に更新
      const originalMemos = memos;
      setMemos(memos.filter((memo) => memo.id !== id));

      await deleteMemoRequest(`/memos/${id}`, { method: "DELETE" });
      setMessage("メモを削除しました");
    } catch (error: any) {
      setMessage(error.message || "メモの削除に失敗しました。");
      // 失敗した場合は、UIを元の状態に戻す
      setMemos(memos);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">メモ帳</h1>
        <button
          onClick={onLogout}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          ログアウト
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* New Memo Form */}
        <div className="md:col-span-1">
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">新しいメモ</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="タイトル"
                value={newMemoTitle}
                onChange={(e) => setNewMemoTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              <textarea
                placeholder="内容"
                value={newMemoContent}
                onChange={(e) => setNewMemoContent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                rows={4}
              />
              <button
                onClick={handleCreateMemo}
                disabled={isCreating}
                className="w-full px-4 py-2 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isCreating ? "作成中..." : "作成"}
              </button>
            </div>
          </div>
        </div>

        {/* Memo List */}
        <div className="md:col-span-2">
          <h2 className="text-2xl font-semibold mb-4">メモ一覧</h2>
          {isLoadingMemos ? (
            <p className="text-gray-500">読み込み中...</p>
          ) : memos.length > 0 ? (
            <div className="space-y-4">
              {memos.map((memo) => (
                <div
                  key={memo.id}
                  className="p-4 bg-white rounded-lg shadow-md flex justify-between items-start"
                >
                  <div>
                    <strong className="text-lg font-medium text-gray-900">
                      {memo.title}
                    </strong>
                    <p className="mt-1 text-gray-600">{memo.content}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteMemo(memo.id)}
                    className="ml-4 px-3 py-1 text-sm font-medium text-red-600 bg-red-100 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                    disabled={isDeleting}
                  >
                    削除
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">メモはまだありません。</p>
          )}
        </div>
      </div>
    </div>
  );
};

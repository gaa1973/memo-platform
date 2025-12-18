import { useState, useCallback } from "react";

const API_BASE_URL = "http://localhost:8000/api";

/**
 * API通信をカプセル化し、データ、ローディング状態、エラーを管理する汎用カスタムフック
 * @template T 期待されるデータの型
 * @returns { data, error, isLoading, request }
 */
export const useApi = <T>() => {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const request = useCallback(
    async (endpoint: string, options: RequestInit = {}) => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE_URL}${endpoint}`, {
          credentials: "include",
          ...options,
          headers: {
            "Content-Type": "application/json",
            ...options.headers,
          },
        });

        if (!res.ok) {
          const contentType = res.headers.get("content-type");
          let errorData;
          // レスポンスがJSON形式の場合のみパースを試みる
          if (contentType && contentType.includes("application/json")) {
            errorData = await res.json();
          } else {
            // JSONでない場合（HTMLなど）は、コンポーネント側で処理しやすいようにエラーオブジェクトを作成
            errorData = { message: `サーバーエラー: ${res.status} ${res.statusText}` };
          }
          throw errorData;
        }

        // 成功時のレスポンス処理
        const responseData = res.status === 204 ? null : await res.json();

        setData(responseData as T);
        return responseData as T;
      } catch (err: any) {
        console.error("API Hook Error:", err); // 1. デバッグ用にコンソールにエラーを出力
        setError(err.message || "予期せぬエラーが発生しました。"); // 2. エラーメッセージをstateに保存
        throw err; // 3. 呼び出し元でさらに処理できるようエラーを再スロー
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return { data, error, isLoading, request };
};

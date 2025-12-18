import { useState, useEffect } from "react";
import "./index.css";
import { LoginForm } from "./components/LoginForm";
import { MemoApp } from "./components/MemoApp";
import { useApi } from "./hooks/useApi";

// APIのベースURLを定義（環境変数から取得するのが理想）
const API_BASE_URL = "http://localhost:8000/api";

function App() {
  const [message, setMessage] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // 認証状態を確認中かどうかのローディング状態

  // アプリケーションの初回読み込み時にログイン状態を確認する
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        // セッション確認用のエンドポイントを叩く
        // このエンドポイントは、有効なセッションがあればユーザー情報を返し、なければ401を返す想定
        const res = await fetch(`${API_BASE_URL}/auth/me`, {
          method: "GET",
          credentials: "include",
        });
        if (res.ok) {
          setIsLoggedIn(true); // セッションが有効ならログイン状態にする
        }
      } catch (error) {
        // apiFetchがnullを返すか、エラーをスローした場合（401など）
        // この場合、特に何もしなくてもisLoggedInはfalseのまま
        console.error("ログイン状態の確認中にエラーが発生しました:", error);
      } finally {
        setIsLoading(false); // 確認が終わったのでローディングを解除
      }
    };

    // 初回レンダリング時にログイン状態を確認
    checkLoginStatus();
  }, []);

  const { request: logoutRequest } = useApi();

  const handleLogout = async () => {
    try {
      await logoutRequest("/auth/logout", { method: "POST" });
      setIsLoggedIn(false);
      setMessage("ログアウトしました");
    } catch (error: any) {
      setMessage(error.message || "ログアウトに失敗しました。");
    }
  };

  // ローディング中のUI
  if (isLoading) {
    return <div>認証状態を確認中...</div>;
  }

  // ログインしている場合のUI
  return (
    <div className="p-5">
      {isLoggedIn ? (
        <MemoApp setMessage={setMessage} onLogout={handleLogout} />
      ) : (
        <LoginForm
          onLoginSuccess={() => setIsLoggedIn(true)}
          setMessage={setMessage}
        />
      )}
      <p>{message}</p>
    </div>
  );
}

export default App;

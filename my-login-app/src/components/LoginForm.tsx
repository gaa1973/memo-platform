import { useState } from "react";
import { useApi } from "../hooks/useApi";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

type LoginFormProps = {
  onLoginSuccess: () => void;
  setMessage: (message: string) => void;
};

// ログイン/登録フォームの入力バリデーションをzodで定義
const loginSchema = z.object({
  email: z
    .string()
    .min(1, "メールアドレスを入力してください")
    .email("有効なメールアドレス形式で入力してください"),
  password: z.string().min(6, "パスワードは6文字以上で入力してください"),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

export const LoginForm = ({ onLoginSuccess, setMessage }: LoginFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    // 入力値の検証にzodを使う
    resolver: zodResolver(loginSchema),
  });

  // APIの呼び出しエラーをまとめて表示するためのstate
  const [generalError, setGeneralError] = useState<string | null>(null);
  const { request, isLoading } = useApi();
  // trueならログイン、falseなら新規登録モード
  const [isLoginMode, setIsLoginMode] = useState(true);

  // フォーム送信時の処理（ログイン/新規登録を切り替えて呼び出す）
  const onSubmit = async (data: LoginFormInputs) => {
    const endpoint = isLoginMode ? "/auth/login" : "/auth/registration";
    const successMsg = isLoginMode ? "ログイン成功" : "新規登録成功";
    setMessage("");
    setGeneralError(null);

    try {
      await request(endpoint, {
        method: "POST",
        body: JSON.stringify(data),
      });
      setMessage(successMsg);
      onLoginSuccess();
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error.message ||
        "エラーが発生しました";
      setGeneralError(errorMessage);
    }
  };

  return (
    // カード状のレイアウトでフォームを表示
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-gray-900">
          {isLoginMode ? "ログイン" : "新規登録"}
        </h1>
        {generalError && (
          <div className="p-3 text-sm text-center text-red-800 bg-red-100 border border-red-200 rounded-md">
            {generalError}
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="text-sm font-medium text-gray-700"
              >
                メールアドレス
              </label>
              <input
                id="email"
                type="email"
                placeholder="user@example.com"
                className={`w-full px-3 py-2 mt-1 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
                {...register("email")}
              />
              {errors.email && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="password"
                className="text-sm font-medium text-gray-700"
              >
                パスワード
              </label>
              <input
                id="password"
                type="password"
                placeholder="password"
                className={`w-full px-3 py-2 mt-1 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.password ? "border-red-500" : "border-gray-300"
                }`}
                {...register("password")}
              />
              {errors.password && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-2 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? "処理中..." : isLoginMode ? "ログイン" : "新規登録"}
            </button>
            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsLoginMode(!isLoginMode)}
                className="text-sm text-indigo-600 hover:text-indigo-500"
              >
                {isLoginMode
                  ? "アカウントをお持ちでない方はこちら"
                  : "すでにアカウントをお持ちの方はこちら"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

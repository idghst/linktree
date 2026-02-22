// 파일 목적: 회원가입 페이지 컴포넌트
// 주요 기능: username/email/password/확인 폼, 유효성 검사, useAuth().register 호출, 자동 로그인 후 /dashboard 이동
// 사용 방법: Next.js App Router가 /auth/register 경로에서 자동 렌더링

"use client";

import { useState, FormEvent, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { ApiError } from "@/lib/graphql-client";
import { ROUTES } from "@/lib/constants";

function validateRegisterForm(
  username: string,
  email: string,
  password: string,
  confirmPassword: string
): string {
  if (!username.trim()) return "사용자명을 입력해주세요.";
  const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
  if (!usernameRegex.test(username))
    return "사용자명은 영문, 숫자, 언더스코어만 사용 가능하며 3-30자여야 합니다.";

  if (!email.trim()) return "이메일을 입력해주세요.";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return "올바른 이메일 형식을 입력해주세요.";

  if (!password) return "비밀번호를 입력해주세요.";
  if (password.length < 8) return "비밀번호는 최소 8자 이상이어야 합니다.";

  if (!confirmPassword) return "비밀번호 확인을 입력해주세요.";
  if (password !== confirmPassword) return "비밀번호가 일치하지 않습니다.";

  return "";
}

export default function RegisterPage() {
  const { register, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      router.replace(ROUTES.DASHBOARD);
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    const validationError = validateRegisterForm(username, email, password, confirmPassword);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      await register({ username, email, password });
      // register 성공 시 AuthContext에서 자동 로그인 후 /dashboard로 이동
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.detail);
      } else {
        setError("회원가입에 실패했습니다. 다시 시도해주세요.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-violet-600">Linktree</h1>
          <p className="mt-2 text-gray-600">새 계정을 만드세요</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1">
            <label htmlFor="username" className="text-sm font-medium text-gray-700">
              사용자명
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="myusername"
              autoComplete="username"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
            <p className="text-xs text-gray-400">
              /{username || "username"} 으로 공개 프로필이 생성됩니다
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-sm font-medium text-gray-700">
              이메일
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              autoComplete="email"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-sm font-medium text-gray-700">
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="최소 8자"
              autoComplete="new-password"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
              비밀번호 확인
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="비밀번호 재입력"
              autoComplete="new-password"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
          </div>

          {error && (
            <div role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-violet-500 py-2.5 font-semibold text-white transition-colors hover:bg-violet-600 disabled:bg-violet-300 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                가입 중...
              </span>
            ) : (
              "회원가입"
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          이미 계정이 있으신가요?{" "}
          <Link href={ROUTES.LOGIN} className="font-semibold text-violet-600 hover:underline">
            로그인
          </Link>
        </p>
      </div>
    </main>
  );
}

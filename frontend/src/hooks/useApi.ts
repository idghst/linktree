// 파일 목적: API 요청 상태 관리 커스텀 훅 (로딩, 에러, 데이터)
// 주요 기능: useApi<T> - 초기 fetch + loading/error/data 상태 반환, 메모리 캐시로 페이지 이동 시 깜빡임 방지, 재시도 로직
// 사용 방법: const { data, loading, error, refetch } = useApi<Link[]>("/api/links")

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { GqlError as ApiError } from "@/lib/graphql-client";
import { STORAGE_KEYS } from "@/lib/constants";

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UseApiOptions {
  /** 자동 재시도 횟수 (기본값: 0) */
  retries?: number;
  /** 재시도 간격 ms (기본값: 1000) */
  retryDelay?: number;
  /** 이 URL은 캐시를 건너뜀 (기본값: false) */
  skipCache?: boolean;
}

const memoryCache = new Map<string, unknown>();

async function fetchWithRetry<T>(
  url: string,
  retries: number,
  retryDelay: number
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
          : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const response = await fetch(url, { headers });
      if (!response.ok) {
        let detail = "요청에 실패했습니다.";
        try {
          const errorData = await response.json();
          detail = errorData.detail || detail;
        } catch { /* JSON 파싱 실패 시 기본 메시지 사용 */ }
        throw new ApiError(response.status, detail);
      }
      if (response.status === 204) return undefined as T;
      return response.json() as Promise<T>;
    } catch (err) {
      lastError = err;
      // 4xx 클라이언트 오류는 재시도하지 않음
      if (err instanceof ApiError && err.status >= 400 && err.status < 500) {
        throw err;
      }
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      }
    }
  }
  throw lastError;
}

export function useApi<T>(url: string, options: UseApiOptions = {}): UseApiState<T> {
  const { retries = 0, retryDelay = 1000, skipCache = false } = options;

  const cached = !skipCache ? (memoryCache.get(url) as T | undefined) : undefined;
  const [data, setData] = useState<T | null>(cached ?? null);
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    // 이전 요청 취소
    if (abortRef.current) {
      abortRef.current.abort();
    }
    abortRef.current = new AbortController();

    setError(null);
    if (skipCache || !memoryCache.has(url)) setLoading(true);

    try {
      const result = await fetchWithRetry<T>(url, retries, retryDelay);
      if (!skipCache) {
        memoryCache.set(url, result);
      }
      setData(result);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.detail);
      } else if (err instanceof Error && err.name === "AbortError") {
        // 요청 취소 시 에러 무시
        return;
      } else {
        setError("알 수 없는 오류가 발생했습니다.");
      }
      // 에러 발생 시 데이터를 null로 초기화하지 않음 (기존 데이터 유지)
    } finally {
      setLoading(false);
    }
  }, [url, retries, retryDelay, skipCache]);

  useEffect(() => {
    fetchData();
    return () => {
      /* c8 ignore start */
      if (abortRef.current) {
        abortRef.current.abort();
      }
      /* c8 ignore stop */
    };
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

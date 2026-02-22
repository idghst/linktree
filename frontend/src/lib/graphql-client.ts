// 파일 목적: GraphQL 클라이언트 - 인증 헤더 자동 주입 (native fetch 기반)
// 주요 기능: gqlRequest<T>() - access token 자동 첨부, 인증 에러 시 refresh 재시도
// 사용 방법: import { gqlRequest, GqlError } from "@/lib/graphql-client"

import { STORAGE_KEYS } from "@/lib/constants";

const GRAPHQL_ENDPOINT = "/graphql";

export class GqlError extends Error {
  constructor(
    public status: number,
    public detail: string
  ) {
    super(detail);
    this.name = "GqlError";
  }
}

// ApiError 호환성을 위한 별칭
export { GqlError as ApiError };

function getAccessToken(): string | null {
  /* c8 ignore start */
  if (typeof window === "undefined") return null;
  /* c8 ignore stop */
  return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
}

function getRefreshToken(): string | null {
  /* c8 ignore start */
  if (typeof window === "undefined") return null;
  /* c8 ignore stop */
  return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
}

async function executeGql<T>(
  query: string,
  variables?: Record<string, unknown>,
  token?: string | null
): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: "POST",
    headers,
    body: JSON.stringify({ query, variables }),
  });

  const json = await response.json();

  if (json.errors && json.errors.length > 0) {
    const msg: string = json.errors[0].message || "GraphQL 오류가 발생했습니다.";
    const isAuthError =
      msg.includes("인증이 필요합니다") || msg.includes("유효하지 않은 토큰");
    throw Object.assign(new GqlError(isAuthError ? 401 : 200, msg), {
      _isAuthError: isAuthError,
    });
  }

  return json.data as T;
}

async function tryRefreshToken(): Promise<string | null> {
  /* c8 ignore start */
  if (typeof window === "undefined") return null;
  /* c8 ignore stop */
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const mutation = `
      mutation RefreshToken($input: RefreshTokenInput!) {
        refreshToken(input: $input) {
          accessToken
          refreshToken
          tokenType
        }
      }
    `;
    const data = await executeGql<{
      refreshToken: { accessToken: string; refreshToken: string };
    }>(mutation, { input: { refreshToken } });

    const newAccessToken = data.refreshToken.accessToken;
    const newRefreshToken = data.refreshToken.refreshToken;

    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, newAccessToken);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);

    return newAccessToken;
  } catch {
    return null;
  }
}

export async function gqlRequest<T>(
  query: string,
  variables?: Record<string, unknown>,
  skipAuth = false,
  _retry = false
): Promise<T> {
  const token = skipAuth ? null : getAccessToken();

  try {
    return await executeGql<T>(query, variables, token);
  } catch (error) {
    if (
      !skipAuth &&
      !_retry &&
      error instanceof GqlError &&
      (error as GqlError & { _isAuthError?: boolean })._isAuthError
    ) {
      const newToken = await tryRefreshToken();
      if (newToken) {
        return gqlRequest<T>(query, variables, skipAuth, true);
      }
      /* c8 ignore start */
      if (typeof window !== "undefined") {
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        window.dispatchEvent(new CustomEvent("auth:logout"));
      }
      /* c8 ignore stop */
      throw new GqlError(401, "세션이 만료되었습니다. 다시 로그인해주세요.");
    }

    if (error instanceof GqlError) throw error;

    throw new GqlError(
      0,
      error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다."
    );
  }
}

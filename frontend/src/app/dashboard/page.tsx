// 파일 목적: 대시보드 홈 페이지 - 통계 요약, 링크 순위, 방문 추이 표시
// 주요 기능: 통계 카드 4개, 링크별 클릭 순위 (상위 5개), 최근 7일 바 차트, 빈 상태 처리
// 사용 방법: Next.js App Router가 /dashboard 경로에서 렌더링

"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useApi } from "@/hooks/useApi";
import { Spinner } from "@/components/ui/Spinner";
import type { AnalyticsSummary, ViewStats, LinkAnalytics } from "@/types/api";
import { MousePointerClick, Eye, Link2, TrendingUp, AlertCircle, BarChart2 } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const [days, setDays] = useState<7 | 30>(7);

  const {
    data: summary,
    loading: summaryLoading,
    error: summaryError,
  } = useApi<AnalyticsSummary>("/api/analytics/summary");

  const {
    data: viewStats,
    loading: viewLoading,
    error: viewError,
  } = useApi<ViewStats>(`/api/analytics/views?days=${days}`, { skipCache: true });

  const {
    data: linkStats,
    loading: linkLoading,
    error: linkError,
  } = useApi<LinkAnalytics[]>("/api/analytics/links");

  const isLoading = summaryLoading || viewLoading || linkLoading;

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  // 상위 5개 링크 (클릭 수 내림차순)
  const topLinks = [...(linkStats ?? [])]
    .sort((a, b) => b.click_count - a.click_count)
    .slice(0, 5);

  const maxClicks = topLinks.length > 0 ? Math.max(...topLinks.map((l) => l.click_count)) : 1;

  // 바 차트용 일별 데이터 최대값
  const dailyData = viewStats?.daily ?? [];
  const maxViews = dailyData.length > 0 ? Math.max(...dailyData.map((d) => d.view_count), 1) : 1;

  return (
    <div className="max-w-4xl space-y-8">
      {/* 헤더 */}
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-gray-900">
          안녕하세요, {user?.display_name || user?.username}님
        </h1>
        <p className="mt-1 text-gray-500">/@{user?.username} 페이지의 통계입니다.</p>
      </div>

      {/* 통계 카드 */}
      {summaryError ? (
        <ErrorBanner message={summaryError} />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard
            icon={<MousePointerClick className="h-5 w-5 text-blue-500" />}
            label="총 클릭 수"
            value={summary?.total_clicks ?? 0}
            color="blue"
          />
          <StatCard
            icon={<Eye className="h-5 w-5 text-violet-500" />}
            label="총 방문 수"
            value={summary?.total_views ?? 0}
            color="violet"
          />
          <StatCard
            icon={<MousePointerClick className="h-5 w-5 text-orange-500" />}
            label="오늘 클릭 수"
            value={summary?.today_clicks ?? 0}
            color="orange"
          />
          <StatCard
            icon={<Link2 className="h-5 w-5 text-purple-500" />}
            label="등록된 링크"
            value={summary?.total_links ?? 0}
            color="purple"
          />
        </div>
      )}

      {/* 방문 추이 바 차트 */}
      <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900">방문 추이</h2>
          </div>
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            <button
              onClick={() => setDays(7)}
              className={`px-3 py-1 text-sm font-medium transition-colors ${
                days === 7
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              7일
            </button>
            <button
              onClick={() => setDays(30)}
              className={`px-3 py-1 text-sm font-medium transition-colors ${
                days === 30
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              30일
            </button>
          </div>
        </div>

        {viewError ? (
          <ErrorBanner message={viewError} />
        ) : dailyData.length === 0 ? (
          <EmptyState message="아직 방문 데이터가 없습니다." />
        ) : (
          <div className="flex items-end gap-1 h-40">
            {dailyData.map((day) => {
              const heightPct = maxViews > 0 ? (day.view_count / maxViews) * 100 : 0;
              const label = day.date.slice(5); // MM-DD
              return (
                <div
                  key={day.date}
                  className="flex flex-1 flex-col items-center gap-1 group"
                >
                  <div className="relative w-full flex flex-col justify-end h-32">
                    <div
                      className="w-full bg-blue-400 rounded-t hover:bg-blue-500 transition-colors"
                      style={{ height: `${Math.max(heightPct, 2)}%` }}
                      title={`${day.date}: ${day.view_count}회`}
                    />
                  </div>
                  {dailyData.length <= 14 && (
                    <span className="text-xs text-gray-400 truncate w-full text-center">
                      {label}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {!viewError && dailyData.length > 0 && (
          <p className="mt-3 text-sm text-gray-500 text-right">
            총 {(viewStats?.total_views ?? 0).toLocaleString("ko-KR")}회 방문
          </p>
        )}
      </div>

      {/* 링크별 클릭 순위 */}
      <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900">링크 클릭 순위</h2>
          <span className="ml-auto text-sm text-gray-400">상위 5개</span>
        </div>

        {linkError ? (
          <ErrorBanner message={linkError} />
        ) : topLinks.length === 0 ? (
          <EmptyState message="아직 링크가 없습니다. 링크를 추가해보세요." />
        ) : (
          <ol className="space-y-3">
            {topLinks.map((link, idx) => {
              const barWidth = maxClicks > 0 ? (link.click_count / maxClicks) * 100 : 0;
              return (
                <li key={link.id} className="flex items-center gap-3">
                  <span className="w-5 text-sm font-bold text-gray-400 text-right shrink-0">
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className="text-sm font-medium text-gray-800 truncate"
                        title={link.title}
                      >
                        {link.title}
                      </span>
                      <span className="ml-2 text-sm font-semibold text-gray-600 shrink-0">
                        {link.click_count.toLocaleString("ko-KR")}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-blue-400 transition-all duration-500"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </div>
                  {!link.is_active && (
                    <span className="text-xs text-gray-400 shrink-0">(비활성)</span>
                  )}
                </li>
              );
            })}
          </ol>
        )}
      </div>

      {/* 공개 프로필 링크 */}
      <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
        <h2 className="mb-2 text-lg font-semibold text-gray-900">내 공개 프로필</h2>
        <p className="text-gray-500 text-sm mb-3">
          아래 링크를 공유하면 누구나 내 링크 페이지를 볼 수 있습니다.
        </p>
        <a
          href={`/@${user?.username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg bg-violet-50 px-4 py-2 text-violet-700 font-medium hover:bg-violet-100 transition-colors"
        >
          /@{user?.username}
        </a>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: "blue" | "violet" | "purple" | "orange";
}) {
  const bgColors = {
    blue: "bg-blue-50",
    violet: "bg-violet-50",
    purple: "bg-purple-50",
    orange: "bg-orange-50",
  };

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-100">
      <div className={`mb-3 inline-flex rounded-lg p-2 ${bgColors[color]}`}>{icon}</div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-gray-900">
        {value.toLocaleString("ko-KR")}
      </p>
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
      <AlertCircle className="h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="py-8 text-center text-sm text-gray-400">{message}</div>
  );
}

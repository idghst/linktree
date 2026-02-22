// 파일 목적: 링크 관리 대시보드 페이지
// 주요 기능: 링크 목록 조회/추가/수정/삭제/토글, 드래그앤드롭 순서 변경, Modal로 폼 표시
// 사용 방법: Next.js App Router가 /dashboard/links 경로에서 렌더링

"use client";

import { useState, useRef } from "react";
import { useApi } from "@/hooks/useApi";
import { linksService } from "@/services/links";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { ApiError } from "@/lib/graphql-client";
import type { Link, CreateLinkRequest, UpdateLinkRequest } from "@/types/api";
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

function getDomain(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function getScheduleBadge(link: Link): { label: string; className: string } | null {
  const now = new Date();
  if (link.scheduled_end && new Date(link.scheduled_end) < now) {
    return { label: "만료됨", className: "bg-red-100 text-red-600" };
  }
  if (link.scheduled_start && new Date(link.scheduled_start) > now) {
    return { label: "예약됨", className: "bg-gray-100 text-gray-500" };
  }
  return null;
}

export default function LinksPage() {
  const { data: links, loading, refetch } = useApi<Link[]>("/api/links");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showHeaderModal, setShowHeaderModal] = useState(false);
  const [editingLink, setEditingLink] = useState<Link | null>(null);
  const [error, setError] = useState("");
  const [localLinks, setLocalLinks] = useState<Link[] | null>(null);
  const [reordering, setReordering] = useState(false);

  const displayLinks = localLinks ?? links;

  // DnD state
  const dragIndexRef = useRef<number | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleCreate = async (data: CreateLinkRequest) => {
    try {
      await linksService.createLink(data);
      setShowAddModal(false);
      setLocalLinks(null);
      refetch();
    } catch (err) {
      if (err instanceof ApiError) setError(err.detail);
      else setError("링크 생성에 실패했습니다.");
    }
  };

  const handleUpdate = async (id: string, data: UpdateLinkRequest) => {
    try {
      await linksService.updateLink(id, data);
      setEditingLink(null);
      setLocalLinks(null);
      refetch();
    } catch (err) {
      if (err instanceof ApiError) setError(err.detail);
      else setError("링크 수정에 실패했습니다.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("이 링크를 삭제하시겠습니까?")) return;
    try {
      await linksService.deleteLink(id);
      setLocalLinks(null);
      refetch();
    } catch (err) {
      if (err instanceof ApiError) setError(err.detail);
      else setError("링크 삭제에 실패했습니다.");
    }
  };

  const handleToggle = async (id: string) => {
    // 낙관적 업데이트
    if (displayLinks) {
      setLocalLinks(
        displayLinks.map((l) =>
          l.id === id ? { ...l, is_active: !l.is_active } : l
        )
      );
    }
    try {
      await linksService.toggleLink(id);
      refetch();
    } catch (err) {
      setLocalLinks(null); // 실패 시 롤백
      if (err instanceof ApiError) setError(err.detail);
      else setError("링크 상태 변경에 실패했습니다.");
    }
  };

  // DnD 핸들러
  const handleDragStart = (index: number) => {
    dragIndexRef.current = index;
    setDragIndex(index);
  };

  const handleDragEnter = (index: number) => {
    if (dragIndexRef.current === null || dragIndexRef.current === index) return;
    setDragOverIndex(index);

    // 로컬 순서 즉시 반영
    if (!displayLinks) return;
    const reordered = [...displayLinks];
    const dragged = reordered.splice(dragIndexRef.current, 1)[0];
    reordered.splice(index, 0, dragged);
    dragIndexRef.current = index;
    setLocalLinks(reordered);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async () => {
    setDragIndex(null);
    setDragOverIndex(null);
    dragIndexRef.current = null;

    if (!localLinks) return;

    setReordering(true);
    try {
      const items = localLinks.map((link, index) => ({
        id: link.id,
        position: index,
      }));
      await linksService.reorderLinks(items);
      refetch();
    } catch (err) {
      setLocalLinks(null);
      if (err instanceof ApiError) setError(err.detail);
      else setError("순서 변경에 실패했습니다.");
    } finally {
      setReordering(false);
    }
  };

  const handleDragEnd = () => {
    // dragend는 drop이 발생하지 않은 경우 취소 처리
    setDragIndex(null);
    setDragOverIndex(null);
    dragIndexRef.current = null;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  const linkCount = displayLinks?.length ?? 0;

  return (
    <div className="max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">링크 관리</h1>
          {linkCount > 0 && (
            <p className="mt-0.5 text-sm text-gray-400">{linkCount}개의 링크</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setShowHeaderModal(true)}>
            <Plus className="h-4 w-4" />
            헤더 추가
          </Button>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4" />
            링크 추가
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
          <button
            onClick={() => setError("")}
            className="ml-2 underline hover:no-underline"
          >
            닫기
          </button>
        </div>
      )}

      {reordering && (
        <div className="mb-4 rounded-lg bg-blue-50 px-4 py-2 text-sm text-blue-600 flex items-center gap-2">
          <Spinner size="sm" />
          순서를 저장하는 중...
        </div>
      )}

      <div className="flex flex-col gap-3">
        {!displayLinks || displayLinks.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-gray-200 py-16 text-center">
            <GripVertical className="mx-auto mb-3 h-10 w-10 text-gray-200" />
            <p className="text-gray-500 font-medium">아직 링크가 없습니다.</p>
            <p className="mt-1 text-sm text-gray-400">
              첫 번째 링크를 추가하여 프로필을 채워보세요.
            </p>
            <Button
              variant="secondary"
              className="mt-5"
              onClick={() => setShowAddModal(true)}
            >
              <Plus className="h-4 w-4" />
              첫 번째 링크 추가하기
            </Button>
          </div>
        ) : (
          displayLinks.map((link, index) => {
            const badge = getScheduleBadge(link);
            const isHeader = link.link_type === 'header';
            return (
              <div
                key={link.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragEnter={() => handleDragEnter(index)}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onDragEnd={handleDragEnd}
                className={cn(
                  "flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm border transition-all select-none",
                  dragIndex === index
                    ? "opacity-50 border-violet-300 shadow-md"
                    : dragOverIndex === index
                    ? "border-violet-400 shadow-md"
                    : "border-gray-100",
                  !link.is_active && "bg-gray-50",
                  isHeader && "bg-gray-50 border-dashed border-gray-300"
                )}
              >
                {/* 드래그 핸들 */}
                <div
                  className="cursor-grab active:cursor-grabbing flex-shrink-0 touch-none"
                  title="드래그하여 순서 변경"
                >
                  <GripVertical className="h-5 w-5 text-gray-300 hover:text-gray-500 transition-colors" />
                </div>

                {/* 링크 정보 */}
                <div className="flex-1 min-w-0">
                  {isHeader ? (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 border-t border-gray-300" />
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        {link.title}
                      </p>
                      <div className="flex-1 border-t border-gray-300" />
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        {link.favicon_url && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={link.favicon_url} alt="" width={16} height={16} className="flex-shrink-0" />
                        )}
                        <p
                          className={cn(
                            "font-medium truncate",
                            link.is_active ? "text-gray-900" : "text-gray-400 line-through"
                          )}
                        >
                          {link.title}
                        </p>
                        {badge && (
                          <span className={cn("flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium", badge.className)}>
                            {badge.label}
                          </span>
                        )}
                        {link.is_sensitive && (
                          <span className="flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-600">
                            민감
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 truncate">{getDomain(link.url)}</p>
                      <p className="text-xs text-gray-300 mt-0.5">클릭 {link.click_count}회</p>
                    </>
                  )}
                </div>

                {/* 액션 버튼 */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => handleToggle(link.id)}
                    className="rounded-lg p-1.5 hover:bg-gray-100 transition-colors"
                    title={link.is_active ? "비활성화" : "활성화"}
                  >
                    {link.is_active ? (
                      <ToggleRight className="h-5 w-5 text-violet-500" />
                    ) : (
                      <ToggleLeft className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                  <button
                    onClick={() => setEditingLink(link)}
                    className="rounded-lg p-1.5 hover:bg-gray-100 transition-colors"
                    title="링크 수정"
                  >
                    <Pencil className="h-4 w-4 text-gray-500" />
                  </button>
                  <button
                    onClick={() => handleDelete(link.id)}
                    className="rounded-lg p-1.5 hover:bg-red-50 transition-colors"
                    title="링크 삭제"
                  >
                    <Trash2 className="h-4 w-4 text-red-400" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 링크 추가 모달 */}
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="링크 추가">
        <LinkForm onSubmit={handleCreate} onCancel={() => setShowAddModal(false)} />
      </Modal>

      {/* 헤더 추가 모달 */}
      <Modal open={showHeaderModal} onClose={() => setShowHeaderModal(false)} title="헤더 추가">
        <LinkForm
          defaultLinkType="header"
          onSubmit={handleCreate}
          onCancel={() => setShowHeaderModal(false)}
        />
      </Modal>

      {/* 링크 수정 모달 */}
      <Modal open={!!editingLink} onClose={() => setEditingLink(null)} title="링크 수정">
        {editingLink && (
          <LinkForm
            initialData={editingLink}
            onSubmit={(data) => handleUpdate(editingLink.id, data)}
            onCancel={() => setEditingLink(null)}
          />
        )}
      </Modal>
    </div>
  );
}

function LinkForm({
  initialData,
  defaultLinkType,
  onSubmit,
  onCancel,
}: {
  initialData?: Link;
  defaultLinkType?: 'link' | 'header';
  onSubmit: (data: CreateLinkRequest) => Promise<void>;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [url, setUrl] = useState(initialData?.url ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [isSensitive, setIsSensitive] = useState(initialData?.is_sensitive ?? false);
  const [linkType, setLinkType] = useState<'link' | 'header'>(
    initialData?.link_type ?? defaultLinkType ?? 'link'
  );
  const [scheduledStart, setScheduledStart] = useState(
    initialData?.scheduled_start ? initialData.scheduled_start.slice(0, 16) : ""
  );
  const [scheduledEnd, setScheduledEnd] = useState(
    initialData?.scheduled_end ? initialData.scheduled_end.slice(0, 16) : ""
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isHeader = linkType === 'header';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await onSubmit({
        title,
        url: isHeader ? "" : url,
        // description이 비어있으면 전송하지 않음
        ...(description.trim() ? { description: description.trim() } : {}),
        is_sensitive: isSensitive,
        link_type: linkType,
        scheduled_start: scheduledStart ? new Date(scheduledStart).toISOString() : null,
        scheduled_end: scheduledEnd ? new Date(scheduledEnd).toISOString() : null,
      });
    } catch (err) {
      if (err instanceof ApiError) setError(err.detail);
      else setError("오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-gray-700">유형</label>
        <div className="flex gap-2">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="radio"
              name="link-type"
              value="link"
              checked={linkType === 'link'}
              onChange={() => setLinkType('link')}
              className="text-violet-500 focus:ring-violet-500"
            />
            <span className="text-sm text-gray-700">링크</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="radio"
              name="link-type"
              value="header"
              checked={linkType === 'header'}
              onChange={() => setLinkType('header')}
              className="text-violet-500 focus:ring-violet-500"
            />
            <span className="text-sm text-gray-700">헤더</span>
          </label>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="link-title" className="text-sm font-medium text-gray-700">
          제목 <span className="text-red-500">*</span>
        </label>
        <input
          id="link-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={isHeader ? "섹션 제목" : "내 블로그"}
          required
          maxLength={100}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
        />
      </div>
      {!isHeader && (
        <>
          <div className="flex flex-col gap-1">
            <label htmlFor="link-url" className="text-sm font-medium text-gray-700">
              URL <span className="text-red-500">*</span>
            </label>
            <input
              id="link-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://myblog.com"
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="link-description" className="text-sm font-medium text-gray-700">
              설명 <span className="text-gray-400 font-normal">(선택)</span>
            </label>
            <textarea
              id="link-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="링크에 대한 간단한 설명을 입력하세요"
              maxLength={200}
              rows={2}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="link-scheduled-start" className="text-sm font-medium text-gray-700">
              공개 시작 시간 <span className="text-gray-400 font-normal">(선택)</span>
            </label>
            <input
              id="link-scheduled-start"
              type="datetime-local"
              value={scheduledStart}
              onChange={(e) => setScheduledStart(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="link-scheduled-end" className="text-sm font-medium text-gray-700">
              공개 종료 시간 <span className="text-gray-400 font-normal">(선택)</span>
            </label>
            <input
              id="link-scheduled-end"
              type="datetime-local"
              value={scheduledEnd}
              onChange={(e) => setScheduledEnd(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              id="link-is-sensitive"
              type="checkbox"
              checked={isSensitive}
              onChange={(e) => setIsSensitive(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-violet-500 focus:ring-violet-500"
            />
            <label htmlFor="link-is-sensitive" className="text-sm font-medium text-gray-700">
              민감한 콘텐츠
            </label>
          </div>
        </>
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="flex gap-2 justify-end">
        <Button variant="secondary" type="button" onClick={onCancel}>
          취소
        </Button>
        <Button type="submit" loading={loading}>
          {initialData ? "저장" : "추가"}
        </Button>
      </div>
    </form>
  );
}

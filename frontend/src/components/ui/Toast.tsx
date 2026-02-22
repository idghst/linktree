// 파일 목적: 토스트 알림 컴포넌트
// 주요 기능: success/error/info 타입 알림, 3초 자동 소멸, 화면 우하단 고정
// 사용 방법: showToast("메시지", "success") 형태로 호출

"use client";

import { useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "info";

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

type ToastListener = (message: string, type: ToastType) => void;

// 전역 리스너 목록
const listeners: ToastListener[] = [];

export function showToast(message: string, type: ToastType = "info") {
  listeners.forEach((listener) => listener(message, type));
}

const typeClasses: Record<ToastType, string> = {
  success: "bg-violet-500 text-white",
  error: "bg-red-500 text-white",
  info: "bg-gray-800 text-white",
};

const typeIcons: Record<ToastType, string> = {
  success: "\u2713",
  error: "\u2715",
  info: "\u2139",
};

let nextId = 0;

export function Toast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((message: string, type: ToastType) => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  useEffect(() => {
    listeners.push(addToast);
    return () => {
      const index = listeners.indexOf(addToast);
      /* c8 ignore start */
      if (index !== -1) listeners.splice(index, 1);
      /* c8 ignore stop */
    };
  }, [addToast]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "flex items-center gap-2 rounded-lg px-4 py-3 shadow-lg text-sm font-medium min-w-[200px] max-w-[320px] animate-in slide-in-from-right-4",
            typeClasses[toast.type]
          )}
        >
          <span className="shrink-0 text-base leading-none">{typeIcons[toast.type]}</span>
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
}

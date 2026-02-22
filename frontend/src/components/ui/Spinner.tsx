// 파일 목적: 로딩 스피너 컴포넌트
// 주요 기능: 크기 조절 가능한 애니메이션 스피너
// 사용 방법: <Spinner size="lg" /> 또는 <Spinner />

"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
};

export function Spinner({ size = "md", className }: SpinnerProps) {
  return (
    <Loader2
      className={cn("animate-spin text-violet-500", sizeClasses[size], className)}
    />
  );
}

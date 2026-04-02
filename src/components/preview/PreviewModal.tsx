'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { X } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

export default function PreviewModal({ children }: Props) {
  const router = useRouter();

  const close = () => router.back();

  // ESC 키로 닫기
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* 오버레이 */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={close}
      />

      {/* 모달 */}
      <div className="relative w-full sm:max-w-lg mx-4 sm:mx-auto bg-stone-50 rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* 모달 헤더 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200 shrink-0">
          <div>
            <p className="text-xs text-stone-400 font-medium uppercase tracking-wide">미리보기</p>
            <p className="text-sm text-stone-600 mt-0.5">실제 폼이 이렇게 보여요</p>
          </div>
          <button
            onClick={close}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 스크롤 영역 */}
        <div className="overflow-y-auto flex-1 px-4 py-4 min-w-[384px]">
          {children}
        </div>
      </div>
    </div>
  );
}

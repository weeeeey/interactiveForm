'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect } from 'react';
import { X } from 'lucide-react';
import CreateFormButton from './CreateFormButton';

interface Props {
    children: React.ReactNode;
    formId: string;
}

export default function PreviewModal({ children, formId }: Props) {
    const router = useRouter();

    const close = useCallback(() => router.back(), [router]);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') close();
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [close]);

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            {/* 오버레이 */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={close}
            />

            {/* 모달 */}
            <div className="relative w-full sm:max-w-lg mx-4 sm:mx-auto bg-stone-50 rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col shadow-2xl">
                <button
                    onClick={close}
                    className="absolute rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-all top-2 right-2"
                >
                    <X className="size-5" />
                </button>

                {/* 모달 헤더 */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200 shrink-0">
                    <div>
                        <p className="text-xs text-stone-400 font-medium uppercase tracking-wide">
                            미리보기
                        </p>
                        <p className="text-sm text-stone-600 mt-0.5">
                            실제 폼이 이렇게 보여요
                        </p>
                    </div>

                    <div className="mr-5">
                        <CreateFormButton formId={formId} />
                    </div>
                </div>

                {/* 스크롤 영역 */}
                <div className="overflow-y-auto flex-1 px-4 py-4 min-w-[384px]">
                    {children}
                </div>
            </div>
        </div>
    );
}

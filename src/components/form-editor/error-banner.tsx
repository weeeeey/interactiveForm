'use client';

import { useEffect, useState } from 'react';

export default function ErrorBanner({ 
    errorId,
    errorTrigger
}: { 
    errorId: string | null;
    errorTrigger: number;
}) {
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        if (errorId) {
            setShowBanner(true);
            const timer = setTimeout(() => {
                setShowBanner(false);
            }, 5000);
            return () => clearTimeout(timer);
        } else {
            setShowBanner(false);
        }
    }, [errorId, errorTrigger]);

    if (!showBanner || !errorId) return null;

    return (
        <div className="fixed top-14 z-10 max-w-3xl left-1/2 -translate-x-1/2 px-4 sm:px-6 pt-2 min-w-[384px]">
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-2.5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <span>⚠</span>
                    비어있는 항목이 있어요. 모든 질문과 옵션을 채워주세요.
                </div>
                <button
                    onClick={() => setShowBanner(false)}
                    className="text-red-400 hover:text-red-600 text-lg leading-none shrink-0"
                >
                    ×
                </button>
            </div>
        </div>
    );
}

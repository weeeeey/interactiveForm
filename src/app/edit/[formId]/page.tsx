'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye } from 'lucide-react';
import { FormProvider, useFormContext } from '@/context/FormContext';
import FormEditor from '@/components/form-editor/FormEditor';
import Header from '@/components/ui/header';
import Button from '@/components/ui/button';

function EditPageInner({
    formId,
    errorId,
    setErrorId,
}: {
    formId: string;
    errorId: string | null;
    setErrorId: (id: string | null) => void;
}) {
    const router = useRouter();
    const { validate } = useFormContext();

    const handlePreview = () => {
        const result = validate();
        if (!result.valid) {
            setErrorId(result.firstErrorId);
            if (result.firstErrorItemId) {
                const cardEl = document.getElementById(
                    `card-${result.firstErrorItemId}`,
                );
                if (cardEl) {
                    cardEl.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center',
                    });
                }
            }
            return;
        }
        setErrorId(null);
        router.push(`/edit/${formId}/preview`);
    };

    return (
        <>
            {/* 헤더 */}

            <Header>
                <Button onClick={handlePreview}>
                    <Eye className="w-4 h-4" />
                    미리보기
                </Button>
            </Header>

            {/* 에러 배너 */}
            {errorId && (
                <div className="sticky top-14 z-10 max-w-3xl mx-auto px-4 sm:px-6 pt-2 min-w-[384px]">
                    <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-2.5 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <span>⚠</span>
                            비어있는 항목이 있어요. 모든 질문과 옵션을
                            채워주세요.
                        </div>
                        <button
                            onClick={() => setErrorId(null)}
                            className="text-red-400 hover:text-red-600 text-lg leading-none shrink-0"
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}

            <main className="max-w-3xl min-h-screen bg-stone-50 mx-auto px-4 sm:px-6 py-6 min-w-[384px] border-x-2">
                <FormEditor
                    errorId={errorId}
                    onClearError={() => setErrorId(null)}
                />
            </main>
        </>
    );
}

export default function EditPage({
    params,
}: {
    params: Promise<{ formId: string }>;
}) {
    const { formId } = use(params);
    const [errorId, setErrorId] = useState<string | null>(null);

    return (
        <FormProvider formId={formId}>
            <EditPageInner
                formId={formId}
                errorId={errorId}
                setErrorId={setErrorId}
            />
        </FormProvider>
    );
}

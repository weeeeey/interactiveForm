'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye } from 'lucide-react';
import { FormProvider, useFormContext } from '@/context/FormContext';
import FormEditor from '@/components/form-editor/FormEditor';
import Header from '@/components/ui/header';
import Button from '@/components/ui/button';
import ErrorBanner from '@/components/form-editor/error-banner';

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
    const [errorTrigger, setErrorTrigger] = useState(0);

    const handlePreview = () => {
        const result = validate();
        if (!result.valid) {
            setErrorId(result.firstErrorId);
            setErrorTrigger((prev) => prev + 1);
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
            <Header>
                <Button onClick={handlePreview}>
                    <Eye className="size-5" />
                    미리보기
                </Button>
            </Header>

            <ErrorBanner errorId={errorId} errorTrigger={errorTrigger} />

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

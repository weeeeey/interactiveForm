'use client';

import { use, useEffect, useState } from 'react';
import { getForm } from '@/lib/storage';
import { Form } from '@/types/form';
import FormPreview from '@/components/preview/FormPreview';
import { FormProvider } from '@/context/FormContext';

interface FormIdPageProps {
    params: Promise<{
        formId: string;
    }>;
}

/**
 * 폼 응답 제출 페이지 컴포넌트입니다. (배포용)
 * isCreate 상태가 true인 경우에만 폼을 렌더링하며,
 * 실제 사용자가 답변을 입력하고 제출할 수 있는 인터페이스를 제공합니다.
 */
export default function FormIdPage({ params }: FormIdPageProps) {
    const { formId } = use(params);
    const [form, setForm] = useState<Form | null>(null);

    useEffect(() => {
        const savedForm = getForm(formId);
        if (savedForm && savedForm.isCreate) {
            setForm(savedForm);
        } else {
            alert('존재하지 않거나 아직 생성되지 않은 폼입니다.');
        }
    }, [formId]);

    const handleFormSubmit = (data: Record<string, string | string[]>) => {
        console.log('제출된 데이터 (페이지 레벨):', data);
        alert(
            '성공적으로 양식이 제출되었습니다! (세부 데이터는 브라우저 콘솔을 확인하세요)',
        );
    };

    if (!form) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-stone-100">
                <div className="w-6 h-6 border-2 border-stone-300 border-t-stone-700 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <FormProvider formId={formId}>
            <main className="min-h-screen bg-stone-100 py-10">
                <div className="max-w-3xl mx-auto px-4 sm:px-6">
                    <FormPreview form={form} onSubmit={handleFormSubmit} />
                </div>
            </main>
        </FormProvider>
    );
}

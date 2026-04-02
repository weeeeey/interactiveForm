'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { Form } from '@/types/form';
import { getForm } from '@/lib/storage';
import FormPreview from '@/components/preview/FormPreview';
import Header from '@/components/ui/header';

export default function PreviewPage({
    params,
}: {
    params: Promise<{ formId: string }>;
}) {
    const { formId } = use(params);
    const [form, setForm] = useState<Form | null>(null);

    useEffect(() => {
        const f = getForm(formId);
        setForm(f);
    }, [formId]);

    if (!form) {
        return (
            <div className="min-h-screen bg-stone-50 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-stone-300 border-t-stone-700 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <>
            <Header>
                <Link
                    href={`/edit/${formId}`}
                    className="flex items-center gap-2  hover:text-stone-200 transition-colors bg-black text-white px-4 py-2 rounded-full"
                >
                    <span className="text-sm font-medium">
                        편집으로 돌아가기
                    </span>
                </Link>
            </Header>
            <main className="min-h-screen max-w-3xl mx-auto px-4 sm:px-6 py-6 min-w-[384px] bg-stone-50 border-x-2  ">
                <FormPreview form={form} />
            </main>
        </>
    );
}

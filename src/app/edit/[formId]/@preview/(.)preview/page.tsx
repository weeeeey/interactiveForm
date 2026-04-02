'use client';

import { use, useEffect, useState } from 'react';
import { Form } from '@/types/form';
import { getForm } from '@/lib/storage';
import PreviewModal from '@/components/preview/PreviewModal';
import FormPreview from '@/components/preview/FormPreview';

export default function PreviewInterceptPage({
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

    if (!form) return null;

    return (
        <PreviewModal formId={formId}>
            <FormPreview form={form} />
        </PreviewModal>
    );
}

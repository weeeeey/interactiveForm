import { FormProvider } from '@/context/FormContext';
import { ReactNode } from 'react';

interface Props {
    children: ReactNode;
    preview: ReactNode;
    params: Promise<{
        formId: string;
    }>;
}

export default async function EditLayout({ children, preview, params }: Props) {
    const { formId } = await params;
    return (
        <FormProvider formId={formId}>
            {children}
            {preview}
        </FormProvider>
    );
}

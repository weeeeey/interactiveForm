'use client';

import { useFormContext } from '@/context/FormContext';
import { useRouter } from 'next/navigation';

function CreateFormButton({ formId }: { formId: string }) {
    const router = useRouter();
    const { createForm } = useFormContext();

    const handleClick = () => {
        createForm(formId);
        setTimeout(() => {
            router.push(`/form/${formId}`);
        }, 500);
    };

    return (
        <button
            onClick={handleClick}
            className="px-2 py-1 rounded-md bg-black text-white"
        >
            폼 생성하기
        </button>
    );
}

export default CreateFormButton;

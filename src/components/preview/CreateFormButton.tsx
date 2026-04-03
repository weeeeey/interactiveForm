'use client';

import { useFormContext } from '@/context/FormContext';
import { useRouter } from 'next/navigation';

/**
 * 편집 중인 폼을 '발행' 상태로 전환하는 버튼 컴포넌트입니다.
 * 발행 시 isCreate 상태를 true로 변경하고 사용자를 실제 폼 페이지로 이동시킵니다.
 */
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

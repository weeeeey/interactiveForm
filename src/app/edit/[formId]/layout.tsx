import { ReactNode } from 'react';

interface Props {
    children: ReactNode;
    preview: ReactNode;
}

export default function EditLayout({ children, preview }: Props) {
    return (
        <>
            {children}
            {preview}
        </>
    );
}

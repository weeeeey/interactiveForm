import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'Form Builder',
    description: '나만의 폼을 만들어보세요',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="ko">
            <body className="antialiased ">{children}</body>
        </html>
    );
}

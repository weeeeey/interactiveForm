'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Form } from '@/types/form';
import { deleteForm, generateId, getForms } from '@/lib/storage';
import { FileText, Plus, Trash2 } from 'lucide-react';
import Header from '@/components/ui/header';
import Button from '@/components/ui/button';

export default function HomePage() {
    const router = useRouter();
    const [forms, setForms] = useState<Form[]>([]);

    useEffect(() => {
        setForms(getForms().sort((a, b) => b.updatedAt - a.updatedAt));
    }, []);

    const handleCreate = () => {
        const id = generateId();
        router.push(`/edit/${id}`);
    };

    const handleDelete = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        deleteForm(id);
        setForms((prev) => prev.filter((f) => f.id !== id));
    };

    const formatDate = (ts: number) =>
        new Date(ts).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });

    return (
        <>
            {/* Header */}

            <Header>
                <Button onClick={handleCreate}>
                    <Plus className="w-4 h-4" />새 폼 만들기
                </Button>
            </Header>

            <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 min-w-[384px] border-x-2 min-h-screen">
                {forms.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center">
                            <FileText className="w-8 h-8 text-stone-400" />
                        </div>
                        <div className="text-center">
                            <p className="text-stone-700 font-medium">
                                아직 만든 폼이 없어요
                            </p>
                            <p className="text-stone-400 text-sm mt-1">
                                새 폼 만들기 버튼을 눌러 시작해보세요
                            </p>
                        </div>
                        <button
                            onClick={handleCreate}
                            className="mt-2 flex items-center gap-1.5 bg-stone-900 text-white text-sm font-medium px-5 py-2.5 rounded-full hover:bg-stone-700 transition-colors"
                        >
                            <Plus className="w-4 h-4" />새 폼 만들기
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <p className="text-sm text-stone-500 mb-4">
                            총 {forms.length}개의 폼
                        </p>
                        {forms.map((form) => (
                            <div
                                key={form.id}
                                onClick={() => router.push(`/edit/${form.id}`)}
                                className="group bg-white border border-stone-200 rounded-2xl px-5 py-4 flex items-center justify-between cursor-pointer hover:border-stone-400 hover:shadow-sm transition-all"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-9 h-9 rounded-xl bg-stone-100 flex items-center justify-center shrink-0">
                                        <FileText className="w-4 h-4 text-stone-500" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-medium text-stone-800 truncate">
                                            {form.title}
                                        </p>
                                        <p className="text-xs text-stone-400 mt-0.5">
                                            {form.items.length}개 항목 ·{' '}
                                            {formatDate(form.updatedAt)} 수정
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 shrink-0 ml-3">
                                    <button
                                        onClick={(e) =>
                                            handleDelete(e, form.id)
                                        }
                                        className="p-2 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                    <button className="bg-black text-white px-3 py-1 rounded-lg">
                                        수정
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </>
    );
}

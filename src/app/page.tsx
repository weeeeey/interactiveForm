'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Form } from '@/types/form';
import { deleteForm, generateId, getForms } from '@/lib/storage';
import { FileText, Plus, Trash2 } from 'lucide-react';
import Header from '@/components/ui/header';
import Button from '@/components/ui/button';
import { formatDate } from '@/lib/utils';

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

    return (
        <>
            <Header>
                <Button onClick={handleCreate}>
                    <Plus className="w-4 h-4" />새 폼 만들기
                </Button>
            </Header>

            <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 min-w-[384px] border-x-2 min-h-screen">
                <div className="space-y-8">
                    <p className="text-sm text-stone-500 mb-4">
                        총 {forms.length}개의 폼
                    </p>

                    {/* 생성 된 폼 */}
                    {forms.filter((f) => f.isCreate).length > 0 && (
                        <div className="space-y-3">
                            <h2 className="text-sm font-bold text-indigo-600 px-1">
                                생성 된 폼
                            </h2>
                            {forms
                                .filter((f) => f.isCreate)
                                .map((form) => (
                                    <div
                                        key={form.id}
                                        onClick={() =>
                                            router.push(`/edit/${form.id}`)
                                        }
                                        className="group bg-indigo-600 border border-indigo-500 rounded-2xl px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-indigo-700 hover:shadow-md transition-all"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="size-9 rounded-xl bg-indigo-500/50 flex items-center justify-center shrink-0">
                                                <FileText className="w-4 h-4 text-indigo-100" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-medium text-white truncate">
                                                    {form.title}
                                                </p>
                                                <p className="text-xs text-indigo-200 mt-0.5">
                                                    {form.items.length}개 항목
                                                    ·{' '}
                                                    {formatDate(form.updatedAt)}{' '}
                                                    수정
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0 ml-3">
                                            <button className="bg-white text-indigo-600 px-3 py-1 rounded-lg text-sm font-semibold hover:bg-indigo-50 transition-colors">
                                                수정
                                            </button>
                                            <button
                                                onClick={(e) =>
                                                    handleDelete(e, form.id)
                                                }
                                                className="p-2 rounded-lg text-indigo-300 hover:text-white hover:bg-indigo-500/50 transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    )}

                    {/* 생성중인 폼 */}
                    {forms.filter((f) => !f.isCreate).length > 0 && (
                        <div className="space-y-3">
                            <h2 className="text-sm font-bold text-stone-500 px-1">
                                생성중인 폼
                            </h2>
                            {forms
                                .filter((f) => !f.isCreate)
                                .map((form) => (
                                    <div
                                        key={form.id}
                                        onClick={() =>
                                            router.push(`/edit/${form.id}`)
                                        }
                                        className="group bg-white border border-stone-200 rounded-2xl px-5 py-4 flex items-center justify-between cursor-pointer hover:border-stone-400 hover:shadow-sm transition-all"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="size-9 rounded-xl bg-stone-100 flex items-center justify-center shrink-0">
                                                <FileText className="w-4 h-4 text-stone-500" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-medium text-stone-800 truncate">
                                                    {form.title}
                                                </p>
                                                <p className="text-xs text-stone-400 mt-0.5">
                                                    {form.items.length}개 항목
                                                    ·{' '}
                                                    {formatDate(form.updatedAt)}{' '}
                                                    수정
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0 ml-3">
                                            <button className="bg-black text-white px-3 py-1 rounded-lg text-sm hover:bg-stone-800 transition-colors">
                                                수정
                                            </button>
                                            <button
                                                onClick={(e) =>
                                                    handleDelete(e, form.id)
                                                }
                                                className="p-2 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    )}
                </div>
            </main>
        </>
    );
}

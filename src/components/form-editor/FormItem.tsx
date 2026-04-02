'use client';

import { useEffect, useRef, useState } from 'react';
import { FormItem } from '@/types/form';
import { useFormContext } from '@/context/FormContext';
import {
    MoreHorizontal,
    Plus,
    X,
    Pencil,
    Trash2,
    Type,
    AlignLeft,
    Circle,
    ChevronDownSquare,
} from 'lucide-react';

const TYPE_LABEL: Record<FormItem['type'], string> = {
    input: '단답형',
    textarea: '장문형',
    radio: '라디오',
    select: '선택지 (체크된 옵션은 기본 선택지가 됩니다)',
};

const TYPE_ICON: Record<FormItem['type'], React.ReactNode> = {
    input: <Type className="w-3.5 h-3.5" />,
    textarea: <AlignLeft className="w-3.5 h-3.5" />,
    radio: <Circle className="w-3.5 h-3.5" />,
    select: <ChevronDownSquare className="w-3.5 h-3.5" />,
};

interface Props {
    item: FormItem;
    errorId: string | null;
}

export default function FormItemCard({ item, errorId }: Props) {
    const { updateItem, deleteItem, addOption, updateOption, deleteOption } =
        useFormContext();
    const [menuOpen, setMenuOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const labelRef = useRef<HTMLInputElement>(null);
    const optionRefs = useRef<Map<string, HTMLInputElement>>(new Map());

    // 에러 포커싱
    useEffect(() => {
        if (!errorId) return;

        if (errorId === `label-${item.id}`) {
            labelRef.current?.focus();
            setIsEditing(true);
        } else if (errorId === `option-${item.id}`) {
            // 옵션 없는 경우 - 카드로 스크롤
            const el = document.getElementById(`card-${item.id}`);
            el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setIsEditing(true);
        } else if (errorId.startsWith(`option-${item.id}-`)) {
            const optId = errorId.replace(`option-${item.id}-`, '');
            const el = optionRefs.current.get(optId);
            if (el) {
                el.focus();
                setIsEditing(true);
            }
        }
    }, [errorId, item.id]);

    // 외부 클릭 시 메뉴 닫기
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(e.target as Node)
            ) {
                setMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const isError =
        errorId === `label-${item.id}` ||
        errorId === `option-${item.id}` ||
        errorId?.startsWith(`option-${item.id}-`);

    return (
        <div
            id={`card-${item.id}`}
            className={`group relative bg-white border rounded-2xl transition-all ${
                isError
                    ? 'border-red-300 shadow-sm shadow-red-100'
                    : 'border-stone-200 hover:border-stone-300 hover:shadow-sm'
            }`}
        >
            {/* 타입 뱃지 */}
            <div className="flex items-center justify-between px-4 pt-3.5 pb-2">
                <span className="flex items-center gap-1.5 text-xs text-black font-medium">
                    {TYPE_ICON[item.type]}
                    {TYPE_LABEL[item.type]}
                </span>

                {/* 더보기 메뉴 */}
                <div ref={menuRef} className="relative">
                    <button
                        onClick={() => setMenuOpen((v) => !v)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-all"
                    >
                        <MoreHorizontal className="w-4 h-4" />
                    </button>
                    {menuOpen && (
                        <div className="absolute right-0 top-full mt-1 bg-white border border-stone-200 rounded-xl shadow-lg py-1 z-10 min-w-[120px]">
                            <button
                                onClick={() => {
                                    setIsEditing(true);
                                    setMenuOpen(false);
                                    setTimeout(
                                        () => labelRef.current?.focus(),
                                        50,
                                    );
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-stone-700 hover:bg-stone-50"
                            >
                                <Pencil className="w-3.5 h-3.5" />
                                수정하기
                            </button>
                            <button
                                onClick={() => {
                                    deleteItem(item.id);
                                    setMenuOpen(false);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                삭제하기
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="px-4 pb-4 space-y-3">
                {/* 라벨 입력 */}
                <div className="flex items-center gap-x-2 text-sm">
                    <div className="text-nowrap bg-slate-400 px-2 py-1 text-white rounded-md">
                        제목
                    </div>
                    <input
                        ref={labelRef}
                        value={item.label}
                        onChange={(e) =>
                            updateItem(item.id, { label: e.target.value })
                        }
                        onFocus={() => setIsEditing(true)}
                        placeholder="질문을 입력하세요(200자 이내)"
                        maxLength={200}
                        className={`w-full  font-medium text-stone-800 bg-transparent border-b pb-1 outline-none transition-colors placeholder:text-stone-300 ${
                            isEditing || item.label
                                ? errorId === `label-${item.id}`
                                    ? 'border-red-400'
                                    : 'border-stone-300 focus:border-stone-600'
                                : 'border-transparent hover:border-stone-200'
                        }`}
                    />
                </div>
                {errorId === `label-${item.id}` && (
                    <p className="text-xs text-red-500 mt-1">
                        질문을 입력해주세요
                    </p>
                )}

                {/* Input / Textarea */}
                {(item.type === 'input' || item.type === 'textarea') &&
                    (item.type === 'input' ? (
                        <input
                            value={item.placeholder ?? ''}
                            onChange={(e) =>
                                updateItem(item.id, {
                                    placeholder: e.target.value,
                                })
                            }
                            placeholder="플레이스홀더 텍스트 (선택사항)"
                            className="w-full text-sm text-stone-500 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 outline-none focus:border-stone-400 transition-colors placeholder:text-stone-300"
                        />
                    ) : (
                        <textarea
                            value={item.placeholder ?? ''}
                            onChange={(e) =>
                                updateItem(item.id, {
                                    placeholder: e.target.value,
                                })
                            }
                            placeholder="플레이스홀더 텍스트 (선택사항)"
                            rows={2}
                            className="w-full text-sm text-stone-500 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 outline-none focus:border-stone-400 transition-colors placeholder:text-stone-300 resize-none"
                        />
                    ))}

                {/* Radio / Select 옵션 */}
                {(item.type === 'radio' || item.type === 'select') && (
                    <div className="space-y-2">
                        {errorId === `option-${item.id}` && (
                            <p className="text-xs text-red-500">
                                옵션을 하나 이상 입력해주세요
                            </p>
                        )}
                        {(item.options ?? []).map((opt, idx) => (
                            <div
                                key={opt.id}
                                className="flex items-center gap-2"
                            >
                                {item.type === 'select' ? (
                                    <input
                                        type="checkbox"
                                        checked={
                                            item.defaultOptionId === opt.id
                                        }
                                        onChange={() =>
                                            updateItem(item.id, {
                                                defaultOptionId: opt.id,
                                            })
                                        }
                                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300 shrink-0 cursor-pointer"
                                        title="이 옵션을 기본값으로 설정"
                                    />
                                ) : (
                                    <span className="text-stone-300 text-sm w-5 text-center shrink-0">
                                        ○
                                    </span>
                                )}
                                <input
                                    ref={(el) => {
                                        if (el)
                                            optionRefs.current.set(opt.id, el);
                                        else optionRefs.current.delete(opt.id);
                                    }}
                                    value={opt.value}
                                    onChange={(e) =>
                                        updateOption(
                                            item.id,
                                            opt.id,
                                            e.target.value,
                                        )
                                    }
                                    placeholder={`옵션 ${idx + 1}`}
                                    className={`flex-1 text-sm bg-transparent border-b pb-1 outline-none transition-colors placeholder:text-stone-300 ${
                                        errorId ===
                                        `option-${item.id}-${opt.id}`
                                            ? 'border-red-400 text-stone-700'
                                            : 'border-stone-200 focus:border-stone-500 text-stone-700'
                                    }`}
                                />
                                {(item.options?.length ?? 0) > 1 && (
                                    <button
                                        onClick={() =>
                                            deleteOption(item.id, opt.id)
                                        }
                                        className="p-1 text-stone-300 hover:text-red-400 transition-colors"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            onClick={() => addOption(item.id)}
                            className="flex items-center gap-1.5 text-sm text-stone-400 hover:text-stone-700 transition-colors mt-1 pl-7"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            옵션 추가
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

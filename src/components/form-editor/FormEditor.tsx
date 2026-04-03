'use client';

import { useFormContext } from '@/context/FormContext';
import FormItemCard from './FormItem';
import AddItemButton from './AddItemButton';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';

interface Props {
    errorId: string | null;
    onClearError: () => void;
}

/**
 * 폼 에디터의 주 본문 컴포넌트입니다.
 * 폼 제목의 인라인 편집과 아이템 목록의 드래그 앤 드롭 순서 변경을 담당합니다.
 */
export default function FormEditor({ errorId, onClearError }: Props) {
    const { form, lastUsedType, addItem, updateTitle, reorderItem } = useFormContext();

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = form!.items.findIndex((item) => item.id === active.id);
            const newIndex = form!.items.findIndex((item) => item.id === over.id);
            
            if (oldIndex !== -1 && newIndex !== -1) {
                reorderItem(oldIndex, newIndex);
            }
        }
    };

    if (!form) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-6 h-6 border-2 border-stone-300 border-t-stone-700 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* 폼 제목 */}
            <div className="bg-indigo-400 border border-stone-200 rounded-2xl px-5 py-4">
                <input
                    value={form.title}
                    onChange={(e) => updateTitle(e.target.value)}
                    placeholder="폼 제목을 입력하세요"
                    className="w-full text-xl font-semibold text-stone-50 bg-transparent outline-none placeholder:text-stone-300"
                />
                <div className="mt-2 h-px bg-stone-100" />
                <p className="text-xs text-stone-50 mt-2">
                    총 {form.items.length}개 항목
                </p>
            </div>

            {/* 아이템 리스트 */}
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={form.items.map((item) => item.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {form.items.map((item) => (
                        <FormItemCard key={item.id} item={item} errorId={errorId} />
                    ))}
                </SortableContext>
            </DndContext>

            {/* 추가 버튼 */}
            <div className="flex justify-center pt-2 pb-8">
                <AddItemButton
                    lastUsedType={lastUsedType}
                    onAdd={(type) => {
                        addItem(type);
                        onClearError();
                    }}
                />
            </div>
        </div>
    );
}

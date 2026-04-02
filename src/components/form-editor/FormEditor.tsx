'use client';

import { useFormContext } from '@/context/FormContext';
import FormItemCard from './FormItem';
import AddItemButton from './AddItemButton';

interface Props {
  errorId: string | null;
  onClearError: () => void;
}

export default function FormEditor({ errorId, onClearError }: Props) {
  const { form, lastUsedType, addItem, updateTitle } = useFormContext();

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
      <div className="bg-white border border-stone-200 rounded-2xl px-5 py-4">
        <input
          value={form.title}
          onChange={(e) => updateTitle(e.target.value)}
          placeholder="폼 제목을 입력하세요"
          className="w-full text-xl font-semibold text-stone-800 bg-transparent outline-none placeholder:text-stone-300"
        />
        <div className="mt-2 h-px bg-stone-100" />
        <p className="text-xs text-stone-400 mt-2">
          {form.items.length}개 항목
        </p>
      </div>

      {/* 아이템 리스트 */}
      {form.items.map((item) => (
        <FormItemCard
          key={item.id}
          item={item}
          errorId={errorId}
        />
      ))}

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

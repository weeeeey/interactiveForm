'use client';

import { useEffect, useRef, useState } from 'react';
import { ItemType } from '@/types/form';
import { ChevronDown, Check, Type, AlignLeft, Circle, ChevronDownSquare } from 'lucide-react';

interface Props {
  lastUsedType: ItemType;
  onAdd: (type: ItemType) => void;
}

const TYPE_CONFIG: { type: ItemType; label: string; icon: React.ReactNode }[] = [
  { type: 'input', label: '단답형 입력', icon: <Type className="w-4 h-4" /> },
  { type: 'textarea', label: '장문형 입력', icon: <AlignLeft className="w-4 h-4" /> },
  { type: 'radio', label: '라디오 (단일 선택)', icon: <Circle className="w-4 h-4" /> },
  { type: 'select', label: '드롭다운 선택', icon: <ChevronDownSquare className="w-4 h-4" /> },
];

export default function AddItemButton({ lastUsedType, onAdd }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const currentLabel = TYPE_CONFIG.find((c) => c.type === lastUsedType)?.label ?? '추가하기';

  return (
    <div ref={ref} className="relative inline-flex">
      {/* 추가하기 버튼 */}
      <button
        onClick={() => onAdd(lastUsedType)}
        className="flex items-center gap-2 bg-stone-900 text-white text-sm font-medium pl-4 pr-3 py-2.5 rounded-l-full hover:bg-stone-700 transition-colors border-r border-stone-700"
      >
        추가하기
      </button>

      {/* 드롭다운 토글 버튼 */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="bg-stone-900 text-white px-3 py-2.5 rounded-r-full hover:bg-stone-700 transition-colors"
        aria-label="항목 유형 선택"
      >
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* 드롭다운 메뉴 */}
      {open && (
        <div className="absolute bottom-full mb-2 left-0 bg-white border border-stone-200 rounded-2xl shadow-lg py-1.5 min-w-[200px] z-20">
          {TYPE_CONFIG.map(({ type, label, icon }) => (
            <button
              key={type}
              onClick={() => {
                onAdd(type);
                setOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50 transition-colors text-left"
            >
              <span className="text-stone-400">{icon}</span>
              <span className="flex-1">{label}</span>
              {type === lastUsedType && (
                <Check className="w-4 h-4 text-stone-900" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

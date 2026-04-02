'use client';

import { Form } from '@/types/form';

interface Props {
  form: Form;
}

export default function FormPreview({ form }: Props) {
  return (
    <div className="space-y-4">
      {/* 폼 제목 카드 */}
      <div className="bg-white border-t-4 border-t-stone-900 border border-stone-200 rounded-2xl px-5 py-5">
        <h1 className="text-2xl font-bold text-stone-800">{form.title || '제목 없는 폼'}</h1>
        <p className="text-sm text-stone-400 mt-1">{form.items.length}개 질문</p>
      </div>

      {/* 아이템들 */}
      {form.items.map((item) => (
        <div key={item.id} className="bg-white border border-stone-200 rounded-2xl px-5 py-5 space-y-3">
          <label className="block text-sm font-semibold text-stone-800">
            {item.label}
            <span className="text-red-400 ml-0.5">*</span>
          </label>

          {item.type === 'input' && (
            <input
              type="text"
              placeholder={item.placeholder || '답변을 입력하세요'}
              className="w-full text-sm text-stone-700 border-b border-stone-200 pb-2 outline-none focus:border-stone-500 transition-colors bg-transparent placeholder:text-stone-300"
            />
          )}

          {item.type === 'textarea' && (
            <textarea
              placeholder={item.placeholder || '답변을 입력하세요'}
              rows={3}
              className="w-full text-sm text-stone-700 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 outline-none focus:border-stone-400 transition-colors placeholder:text-stone-300 resize-none"
            />
          )}

          {item.type === 'radio' && (
            <div className="space-y-2.5">
              {(item.options ?? []).map((opt) => (
                <label key={opt.id} className="flex items-center gap-2.5 cursor-pointer group">
                  <span className="w-4 h-4 rounded-full border-2 border-stone-300 group-hover:border-stone-500 transition-colors shrink-0" />
                  <span className="text-sm text-stone-700">{opt.value}</span>
                </label>
              ))}
            </div>
          )}

          {item.type === 'select' && (
            <select className="w-full text-sm text-stone-700 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 outline-none focus:border-stone-400 transition-colors appearance-none">
              <option value="" disabled selected>선택하세요</option>
              {(item.options ?? []).map((opt) => (
                <option key={opt.id} value={opt.value}>
                  {opt.value}
                </option>
              ))}
            </select>
          )}
        </div>
      ))}

      {form.items.length > 0 && (
        <div className="pb-8">
          <button
            type="button"
            className="w-full bg-stone-900 text-white font-medium py-3 rounded-2xl hover:bg-stone-700 transition-colors"
          >
            제출하기
          </button>
        </div>
      )}
    </div>
  );
}

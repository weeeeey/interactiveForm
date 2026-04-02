'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Form, FormItem, FormItemOption, ItemType } from '@/types/form';
import { generateId, getForm, saveForm } from '@/lib/storage';

interface FormContextValue {
  form: Form | null;
  lastUsedType: ItemType;
  setLastUsedType: (type: ItemType) => void;
  addItem: (type: ItemType) => void;
  updateItem: (id: string, patch: Partial<FormItem>) => void;
  deleteItem: (id: string) => void;
  addOption: (itemId: string) => void;
  updateOption: (itemId: string, optionId: string, value: string) => void;
  deleteOption: (itemId: string, optionId: string) => void;
  updateTitle: (title: string) => void;
  // validation
  validate: () => { valid: boolean; firstErrorId: string | null; firstErrorItemId: string | null };
}

const FormContext = createContext<FormContextValue | null>(null);

export function FormProvider({
  children,
  formId,
}: {
  children: React.ReactNode;
  formId: string;
}) {
  const [form, setForm] = useState<Form | null>(null);
  const [lastUsedType, setLastUsedType] = useState<ItemType>('input');
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const existing = getForm(formId);
    if (existing) {
      setForm(existing);
    } else {
      const newForm: Form = {
        id: formId,
        title: '제목 없는 폼',
        items: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setForm(newForm);
      saveForm(newForm);
    }
  }, [formId]);

  const persist = useCallback((updated: Form) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveForm({ ...updated, updatedAt: Date.now() });
    }, 400);
  }, []);

  const setFormAndPersist = useCallback(
    (updater: (prev: Form) => Form) => {
      setForm((prev) => {
        if (!prev) return prev;
        const next = updater(prev);
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const addItem = useCallback(
    (type: ItemType) => {
      const newItem: FormItem = {
        id: generateId(),
        type,
        label: '',
        ...(type === 'input' || type === 'textarea'
          ? { placeholder: '' }
          : {
              options: [{ id: generateId(), value: '' }],
            }),
      };
      setLastUsedType(type);
      setFormAndPersist((prev) => ({
        ...prev,
        items: [...prev.items, newItem],
      }));
    },
    [setFormAndPersist],
  );

  const updateItem = useCallback(
    (id: string, patch: Partial<FormItem>) => {
      setFormAndPersist((prev) => ({
        ...prev,
        items: prev.items.map((item) =>
          item.id === id ? { ...item, ...patch } : item,
        ),
      }));
    },
    [setFormAndPersist],
  );

  const deleteItem = useCallback(
    (id: string) => {
      setFormAndPersist((prev) => ({
        ...prev,
        items: prev.items.filter((item) => item.id !== id),
      }));
    },
    [setFormAndPersist],
  );

  const addOption = useCallback(
    (itemId: string) => {
      const newOpt: FormItemOption = { id: generateId(), value: '' };
      setFormAndPersist((prev) => ({
        ...prev,
        items: prev.items.map((item) =>
          item.id === itemId
            ? { ...item, options: [...(item.options ?? []), newOpt] }
            : item,
        ),
      }));
    },
    [setFormAndPersist],
  );

  const updateOption = useCallback(
    (itemId: string, optionId: string, value: string) => {
      setFormAndPersist((prev) => ({
        ...prev,
        items: prev.items.map((item) =>
          item.id === itemId
            ? {
                ...item,
                options: (item.options ?? []).map((o) =>
                  o.id === optionId ? { ...o, value } : o,
                ),
              }
            : item,
        ),
      }));
    },
    [setFormAndPersist],
  );

  const deleteOption = useCallback(
    (itemId: string, optionId: string) => {
      setFormAndPersist((prev) => ({
        ...prev,
        items: prev.items.map((item) =>
          item.id === itemId
            ? {
                ...item,
                options: (item.options ?? []).filter((o) => o.id !== optionId),
              }
            : item,
        ),
      }));
    },
    [setFormAndPersist],
  );

  const updateTitle = useCallback(
    (title: string) => {
      setFormAndPersist((prev) => ({ ...prev, title }));
    },
    [setFormAndPersist],
  );

  const validate = useCallback((): {
    valid: boolean;
    firstErrorId: string | null;
    firstErrorItemId: string | null;
  } => {
    if (!form) return { valid: false, firstErrorId: null, firstErrorItemId: null };

    for (const item of form.items) {
      // 라벨 비어있으면 에러
      if (!item.label.trim()) {
        return {
          valid: false,
          firstErrorId: `label-${item.id}`,
          firstErrorItemId: item.id,
        };
      }
      // radio/select: 옵션 없거나 빈 옵션 있으면 에러
      if (item.type === 'radio' || item.type === 'select') {
        const options = item.options ?? [];
        if (options.length === 0) {
          return {
            valid: false,
            firstErrorId: `option-${item.id}`,
            firstErrorItemId: item.id,
          };
        }
        const emptyOpt = options.find((o) => !o.value.trim());
        if (emptyOpt) {
          return {
            valid: false,
            firstErrorId: `option-${item.id}-${emptyOpt.id}`,
            firstErrorItemId: item.id,
          };
        }
      }
    }
    return { valid: true, firstErrorId: null, firstErrorItemId: null };
  }, [form]);

  return (
    <FormContext.Provider
      value={{
        form,
        lastUsedType,
        setLastUsedType,
        addItem,
        updateItem,
        deleteItem,
        addOption,
        updateOption,
        deleteOption,
        updateTitle,
        validate,
      }}
    >
      {children}
    </FormContext.Provider>
  );
}

export function useFormContext() {
  const ctx = useContext(FormContext);
  if (!ctx) throw new Error('useFormContext must be used within FormProvider');
  return ctx;
}

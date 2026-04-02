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
    reorderItem: (oldIndex: number, newIndex: number) => void;
    // validation
    validate: () => {
        valid: boolean;
        firstErrorId: string | null;
        firstErrorItemId: string | null;
    };
    createForm: (formId: string) => void;
}

const FormContext = createContext<FormContextValue | null>(null);

export function useFormContext() {
    const ctx = useContext(FormContext);
    if (!ctx)
        throw new Error('useFormContext must be used within FormProvider');
    return ctx;
}

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
                isCreate: false,
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
            const initialOptionId = generateId();
            const newItem: FormItem = {
                id: generateId(),
                type,
                label: '',
                required: true,
                ...(type === 'input' || type === 'textarea'
                    ? { placeholder: '' }
                    : {
                          options: [{ id: initialOptionId, value: '' }],
                          ...(type === 'select'
                              ? { defaultOptionId: initialOptionId }
                              : {}),
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
                        ? {
                              ...item,
                              options: [...(item.options ?? []), newOpt],
                          }
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
                items: prev.items.map((item) => {
                    if (item.id === itemId) {
                        const newOptions = (item.options ?? []).filter(
                            (o) => o.id !== optionId,
                        );
                        // 삭제된 옵션이 현재 기본값이면, 다른 옵션 중 첫 번째 것을 기본값으로 설정
                        if (
                            item.type === 'select' &&
                            item.defaultOptionId === optionId
                        ) {
                            return {
                                ...item,
                                options: newOptions,
                                defaultOptionId:
                                    newOptions.length > 0
                                        ? newOptions[0].id
                                        : undefined,
                            };
                        }
                        return {
                            ...item,
                            options: newOptions,
                        };
                    }
                    return item;
                }),
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

    const reorderItem = useCallback(
        (oldIndex: number, newIndex: number) => {
            setFormAndPersist((prev) => {
                const newItems = [...prev.items];
                const [moved] = newItems.splice(oldIndex, 1);
                newItems.splice(newIndex, 0, moved);
                return { ...prev, items: newItems };
            });
        },
        [setFormAndPersist],
    );

    const validate = useCallback((): {
        valid: boolean;
        firstErrorId: string | null;
        firstErrorItemId: string | null;
    } => {
        if (!form)
            return { valid: false, firstErrorId: null, firstErrorItemId: null };

        for (const item of form.items) {
            // 라벨 비어있으면 에러
            if (!item.label.trim()) {
                return {
                    valid: false,
                    firstErrorId: `label-${item.id}`,
                    firstErrorItemId: item.id,
                };
            }
            // radio/select/checkbox: 옵션 없거나 빈 옵션 있으면 에러
            if (
                item.type === 'radio' ||
                item.type === 'select' ||
                item.type === 'checkbox'
            ) {
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

    const createForm = useCallback(
        (formId: string) => {
            setFormAndPersist((p) => {
                if (p && p.id === formId) {
                    return { ...p, isCreate: true };
                }
                return p;
            });
        },
        [setFormAndPersist],
    );

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
                reorderItem,
                validate,
                createForm,
            }}
        >
            {children}
        </FormContext.Provider>
    );
}

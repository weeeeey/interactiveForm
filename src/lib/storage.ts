import { Form } from '@/types/form';

const STORAGE_KEY = 'form-builder-forms';

export function getForms(): Form[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getForm(id: string): Form | null {
  const forms = getForms();
  return forms.find((f) => f.id === id) ?? null;
}

export function saveForm(form: Form): void {
  const forms = getForms();
  const idx = forms.findIndex((f) => f.id === form.id);
  if (idx >= 0) {
    forms[idx] = form;
  } else {
    forms.push(form);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(forms));
}

export function deleteForm(id: string): void {
  const forms = getForms().filter((f) => f.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(forms));
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

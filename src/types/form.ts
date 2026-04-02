export type ItemType = 'input' | 'textarea' | 'radio' | 'select';

export interface FormItemOption {
  id: string;
  value: string;
}

export interface FormItem {
  id: string;
  type: ItemType;
  label: string;
  placeholder?: string; // input, textarea 전용
  options?: FormItemOption[]; // radio, select 전용
}

export interface Form {
  id: string;
  title: string;
  items: FormItem[];
  createdAt: number;
  updatedAt: number;
}

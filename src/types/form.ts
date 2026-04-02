export type ItemType = 'input' | 'textarea' | 'radio' | 'select' | 'checkbox';

export interface FormItemOption {
  id: string;
  value: string;
}

export interface FormItem {
  id: string;
  type: ItemType;
  label: string;
  required: boolean; // 필수 답변 항목 여부
  placeholder?: string; // input, textarea 전용
  options?: FormItemOption[]; // radio, select, checkbox 전용
  defaultOptionId?: string; // select 전용 기본값 옵션 ID
}

export interface Form {
  id: string;
  title: string;
  items: FormItem[];
  createdAt: number;
  updatedAt: number;
}

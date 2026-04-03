/**
 * 폼 아이템이 될 수 있는 요소의 유형입니다.
 * - input: 단답형 텍스트 입력
 * - textarea: 장문형 텍스트 입력
 * - radio: 단일 선택형 라디오 버튼
 * - select: 드롭다운 선택 메뉴
 * - checkbox: 다중 선택형 체크박스
 */
export type ItemType = 'input' | 'textarea' | 'radio' | 'select' | 'checkbox';

/**
 * 라디오, 선택지, 체크박스 등 옵션이 필요한 아이템의 개별 선택지 정보입니다.
 */
export interface FormItemOption {
    id: string; // 고유 식별자 (generateId로 생성)
    value: string; // 옵션에 표시될 텍스트
}

/**
 * 폼을 구성하는 개별 질문(아이템)의 정보입니다.
 */
export interface FormItem {
    id: string; // 고유 식별자
    type: ItemType; // 아이템의 유형
    label: string; // 질문의 제목 (라벨)
    required: boolean; // 필수 답변 여부
    placeholder?: string; // input, textarea 전용 힌트 텍스트
    options?: FormItemOption[]; // radio, select, checkbox 전용 선택지 목록
    defaultOptionId?: string; // select 전용 기본값으로 설정된 옵션 ID
}

/**
 * 전체 폼의 메타데이터 및 아이템 목록을 포함하는 최상위 객체입니다.
 */
export interface Form {
    id: string; // 폼 고유 식별자
    title: string; // 폼 제목
    items: FormItem[]; // 폼에 포함된 아이템(질문) 목록
    isCreate: boolean; // 폼 발행(배포) 완료 여부
    createdAt: number; // 생성 일시 (Unix timestamp)
    updatedAt: number; // 마지막 수정 일시 (Unix timestamp)
}

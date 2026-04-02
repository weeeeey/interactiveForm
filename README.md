# Form Builder — 프로젝트 문서

Google Forms처럼 사용자가 직접 폼을 만들고 미리볼 수 있는 웹 애플리케이션입니다.

---

## 목차

1. [기술 스택](#1-기술-스택)
2. [프로젝트 구조](#2-프로젝트-구조)
3. [타입 정의](#3-타입-정의)
4. [데이터 레이어 — localStorage](#4-데이터-레이어--localstorage)
5. [상태 관리 — Context API](#5-상태-관리--context-api)
6. [라우팅 설계](#6-라우팅-설계)
7. [페이지별 상세 설명](#7-페이지별-상세-설명)
8. [컴포넌트별 상세 설명](#8-컴포넌트별-상세-설명)
9. [Validation 로직](#9-validation-로직)
10. [미리보기 — Parallel Route + Route Interception](#10-미리보기--parallel-route--route-interception)
11. [설치 및 실행](#11-설치-및-실행)
12. [주요 설계 결정 및 이유](#12-주요-설계-결정-및-이유)

---

## 1. 기술 스택

| 항목 | 선택 | 이유 |
|------|------|------|
| 프레임워크 | Next.js 15 (App Router) | Parallel Route, Route Interception 등 고급 라우팅 기능 활용 |
| 스타일링 | Tailwind CSS v3 | 빠른 UI 개발, 반응형 처리 용이 |
| 상태 관리 | React Context API | 서버 없이 클라이언트 전용 상태 관리에 적합 |
| 데이터 저장 | localStorage | 별도 백엔드 없이 폼 데이터 영속 저장 |
| 아이콘 | lucide-react | 경량, 일관된 디자인 시스템 |
| 언어 | TypeScript | 타입 안전성, 자동완성 |

---

## 2. 프로젝트 구조

```
src/
├── app/
│   ├── layout.tsx                                   # 루트 레이아웃
│   ├── globals.css                                  # Tailwind 전역 CSS
│   ├── page.tsx                                     # 홈 페이지 (폼 리스트)
│   └── edit/
│       └── [formId]/
│           ├── layout.tsx                           # Parallel Route 레이아웃
│           ├── page.tsx                             # 편집 페이지
│           ├── preview/
│           │   └── page.tsx                         # 직접 접근 시 전체 미리보기 페이지
│           └── @preview/                            # Parallel Route 슬롯
│               ├── default.tsx                      # 기본 슬롯 (null 렌더링)
│               └── (.)preview/
│                   └── page.tsx                     # Route Interception → 모달 렌더링
├── components/
│   ├── form-editor/
│   │   ├── FormEditor.tsx                           # 에디터 컨테이너
│   │   ├── FormItem.tsx                             # 개별 아이템 카드
│   │   └── AddItemButton.tsx                        # 추가하기 버튼 + 타입 드롭다운
│   └── preview/
│       ├── FormPreview.tsx                          # 완성된 폼 렌더링
│       └── PreviewModal.tsx                         # 모달 래퍼 (ESC, 오버레이 닫기)
├── context/
│   └── FormContext.tsx                              # 전역 폼 상태 + 모든 CRUD + validate
├── types/
│   └── form.ts                                      # 타입 정의
└── lib/
    └── storage.ts                                   # localStorage CRUD 유틸
```

---

## 3. 타입 정의

`src/types/form.ts`

### `ItemType`

```ts
type ItemType = 'input' | 'textarea' | 'radio' | 'select';
```

아이템이 될 수 있는 컨텐츠 유형 4가지입니다.

### `FormItemOption`

```ts
interface FormItemOption {
  id: string;    // generateId()로 생성된 고유 식별자
  value: string; // 옵션 텍스트 값
}
```

`radio`, `select` 타입 아이템의 선택지 단위입니다.

### `FormItem`

```ts
interface FormItem {
  id: string;
  type: ItemType;
  label: string;           // 질문 제목 (필수, 비어있으면 validation 에러)
  placeholder?: string;    // input, textarea 전용 — 미리보기에서 placeholder로 사용
  options?: FormItemOption[]; // radio, select 전용
}
```

### `Form`

```ts
interface Form {
  id: string;
  title: string;
  items: FormItem[];
  createdAt: number; // Unix timestamp
  updatedAt: number; // Unix timestamp — 홈에서 최신순 정렬에 사용
}
```

---

## 4. 데이터 레이어 — localStorage

`src/lib/storage.ts`

모든 폼 데이터는 `form-builder-forms` 키로 localStorage에 `Form[]` 배열 형태로 저장됩니다.

### 함수 목록

| 함수 | 설명 |
|------|------|
| `getForms()` | 전체 폼 배열 반환. SSR 환경(`window === undefined`) 안전 처리 포함 |
| `getForm(id)` | 특정 ID의 폼 반환. 없으면 `null` |
| `saveForm(form)` | 폼이 이미 있으면 업데이트, 없으면 새로 추가 (upsert) |
| `deleteForm(id)` | 해당 ID를 배열에서 제거 후 저장 |
| `generateId()` | `Math.random().toString(36).slice(2, 10)` — 8자리 랜덤 ID 생성 |

### 자동 저장 (Debounce)

Context 내부의 `persist()` 함수가 `setTimeout` 400ms 디바운스로 동작합니다. 사용자가 타이핑할 때마다 저장하지 않고, 입력이 멈춘 뒤 400ms 후에 한 번만 저장해 성능을 최적화합니다.

```ts
const persist = useCallback((updated: Form) => {
  if (saveTimer.current) clearTimeout(saveTimer.current);
  saveTimer.current = setTimeout(() => {
    saveForm({ ...updated, updatedAt: Date.now() });
  }, 400);
}, []);
```

---

## 5. 상태 관리 — Context API

`src/context/FormContext.tsx`

편집 페이지 전체에서 사용하는 폼 상태를 Context로 관리합니다. `FormProvider`는 `edit/[formId]/page.tsx`에서 `formId`를 prop으로 받아 마운트 시 localStorage에서 해당 폼을 불러오거나 새로 생성합니다.

### Context에서 제공하는 값

| 값 / 함수 | 타입 | 설명 |
|-----------|------|------|
| `form` | `Form \| null` | 현재 편집 중인 폼 상태 |
| `lastUsedType` | `ItemType` | 마지막으로 추가한 아이템 타입 — 추가하기 버튼 기본값으로 사용 |
| `setLastUsedType` | `(type) => void` | 마지막 타입 업데이트 |
| `addItem` | `(type) => void` | 새 아이템 추가. `input/textarea`는 `placeholder: ''`, `radio/select`는 빈 옵션 1개로 초기화 |
| `updateItem` | `(id, patch) => void` | 특정 아이템 부분 업데이트 |
| `deleteItem` | `(id) => void` | 특정 아이템 삭제 |
| `addOption` | `(itemId) => void` | `radio/select` 아이템에 옵션 추가 |
| `updateOption` | `(itemId, optId, value) => void` | 특정 옵션 값 수정 |
| `deleteOption` | `(itemId, optId) => void` | 특정 옵션 삭제 |
| `updateTitle` | `(title) => void` | 폼 제목 수정 |
| `validate` | `() => ValidationResult` | 미리보기 전 전체 유효성 검사 |

### 내부 패턴 — `setFormAndPersist`

모든 업데이트 함수는 `setFormAndPersist`를 통해 React state 업데이트와 localStorage 저장을 동시에 처리합니다.

```ts
const setFormAndPersist = (updater: (prev: Form) => Form) => {
  setForm((prev) => {
    if (!prev) return prev;
    const next = updater(prev);
    persist(next); // debounce 저장
    return next;
  });
};
```

---

## 6. 라우팅 설계

### 전체 라우트 맵

| 경로 | 설명 |
|------|------|
| `/` | 홈 — 저장된 폼 리스트 |
| `/edit/[formId]` | 편집 페이지 |
| `/edit/[formId]/preview` | 미리보기 전체 페이지 (직접 URL 접근 시) |
| `/edit/[formId]/preview` (Interception) | Route Interception — 편집 페이지에서 접근 시 모달로 렌더링 |

### Parallel Route + Route Interception 구조

```
edit/[formId]/
├── layout.tsx           → { children } + { preview } 두 슬롯을 동시에 렌더링
├── page.tsx             → children 슬롯
├── @preview/
│   ├── default.tsx      → preview 슬롯 기본값 (null) — 모달 미표시 상태
│   └── (.)preview/
│       └── page.tsx     → 편집 페이지 내에서 /preview 접근 시 인터셉트 → 모달 표시
└── preview/
    └── page.tsx         → 직접 /preview URL 입력 시 전체 페이지로 표시
```

**동작 방식:**
- 편집 페이지의 `미리보기` 버튼 클릭 → `router.push('/edit/[formId]/preview')` → `(.)preview`가 인터셉트 → **모달** 렌더링
- 브라우저에서 직접 `/edit/[formId]/preview` 입력 → 인터셉트 없음 → **전체 페이지** 렌더링

---

## 7. 페이지별 상세 설명

### 홈 페이지 (`src/app/page.tsx`)

- localStorage에서 폼 목록을 불러와 `updatedAt` 기준 최신순 정렬
- 폼이 없을 때 빈 상태 UI 표시
- `새 폼 만들기` 버튼 → `generateId()`로 랜덤 ID 생성 → `/edit/[id]`로 이동
- 폼 카드 hover 시 삭제 버튼 표시 (`opacity-0 → group-hover:opacity-100`)
- 폼 카드 클릭 시 해당 편집 페이지로 이동

### 편집 페이지 (`src/app/edit/[formId]/page.tsx`)

- `FormProvider`로 감싸 formId 기반 상태 초기화
- sticky 헤더: 좌측 홈 버튼 / 우측 미리보기 버튼
- 미리보기 버튼 클릭 시 `validate()` 호출 → 에러 있으면 에러 배너 표시 + 해당 카드로 스크롤
- 에러 없으면 `/edit/[formId]/preview`로 `router.push`
- 에러 배너는 sticky top-14로 헤더 바로 아래에 고정, X 버튼으로 수동 닫기 가능

### 미리보기 전체 페이지 (`src/app/edit/[formId]/preview/page.tsx`)

- 직접 URL 접근 시 렌더링
- `useEffect`에서 localStorage로 폼 데이터 로드
- sticky 헤더: 편집으로 돌아가기 버튼 / 미리보기 레이블
- `FormPreview` 컴포넌트로 완성된 폼 렌더링

### 인터셉트 모달 페이지 (`src/app/edit/[formId]/@preview/(.)preview/page.tsx`)

- Parallel Route로 편집 페이지 위에 레이어됨
- localStorage에서 폼 데이터 로드 후 `PreviewModal`로 래핑

---

## 8. 컴포넌트별 상세 설명

### `FormEditor.tsx`

props:
- `errorId: string | null` — 에러가 있는 요소의 ID
- `onClearError: () => void` — 아이템 추가 시 에러 초기화

역할:
- 폼 제목 인라인 편집 input
- `form.items` 배열을 순회하며 `FormItemCard` 렌더링
- 하단에 `AddItemButton` 렌더링

### `FormItem.tsx` (FormItemCard)

props:
- `item: FormItem` — 렌더링할 아이템 데이터
- `errorId: string | null` — 현재 에러 ID

주요 동작:
- 아이템 상단에 타입 뱃지 (아이콘 + 라벨) 표시
- hover 시 `···` (MoreHorizontal) 아이콘 표시 (`group-hover`)
- `···` 클릭 → 드롭다운 메뉴: 수정하기 / 삭제하기
  - 수정하기: 라벨 input에 포커스 + `isEditing: true`
  - 삭제하기: `deleteItem()` 호출
- 라벨 input: 항상 노출, 포커스 시 border 표시 (인라인 편집)
- `input/textarea`: placeholder 텍스트 입력 필드 표시
- `radio/select`: 옵션 목록 + 옵션 추가 버튼
  - 옵션이 2개 이상이면 각 옵션에 삭제(X) 버튼 표시
- `errorId`가 이 아이템을 가리키면 `useEffect`에서 해당 요소로 자동 포커스

### `AddItemButton.tsx`

props:
- `lastUsedType: ItemType` — 마지막으로 사용한 타입
- `onAdd: (type: ItemType) => void` — 아이템 추가 콜백

구조:
```
[ 추가하기 버튼 ] [ ∨ 드롭다운 토글 버튼 ]
```

동작:
- `추가하기` 클릭 → `onAdd(lastUsedType)` 호출
- `∨` 클릭 → 드롭다운 열기
- 드롭다운에서 타입 선택 → `onAdd(selectedType)` + 드롭다운 닫기
- 현재 `lastUsedType`에 `✓` 체크 표시
- 외부 클릭 시 드롭다운 자동 닫힘 (`mousedown` 이벤트)

### `FormPreview.tsx`

props:
- `form: Form` — 미리볼 폼 데이터

역할: 편집 데이터를 실제 폼 UI로 렌더링

| 아이템 타입 | 렌더링 |
|------------|--------|
| `input` | `<input type="text">` with placeholder |
| `textarea` | `<textarea>` with placeholder |
| `radio` | 커스텀 라디오 버튼 리스트 (CSS 원형 아이콘) |
| `select` | `<select>` with 옵션들 |

### `PreviewModal.tsx`

props:
- `children: ReactNode` — 모달 내부 콘텐츠

동작:
- `router.back()`으로 모달 닫기
- 배경 오버레이 클릭 시 닫기
- ESC 키 이벤트로 닫기
- 모바일: 하단에서 올라오는 시트 (`items-end`)
- 데스크탑: 중앙 모달 (`sm:items-center`)

---

## 9. Validation 로직

`FormContext.tsx`의 `validate()` 함수

미리보기 버튼 클릭 시 실행되며 다음 순서로 검사합니다.

```
폼 아이템 순서대로 순회
  ├── label이 비어있음?
  │     → { valid: false, firstErrorId: "label-{itemId}", firstErrorItemId: itemId }
  │
  └── type이 radio 또는 select?
        ├── options 배열이 비어있음?
        │     → { valid: false, firstErrorId: "option-{itemId}", firstErrorItemId: itemId }
        │
        └── value가 빈 옵션이 존재?
              → { valid: false, firstErrorId: "option-{itemId}-{optionId}", firstErrorItemId: itemId }

모두 통과 → { valid: true, firstErrorId: null, firstErrorItemId: null }
```

### `firstErrorId` 포맷

| 에러 종류 | ID 포맷 | 포커스 대상 |
|-----------|---------|------------|
| 라벨 비어있음 | `label-{itemId}` | 라벨 input (`ref={labelRef}`) |
| 옵션 없음 | `option-{itemId}` | 카드로 스크롤 후 isEditing |
| 빈 옵션 존재 | `option-{itemId}-{optionId}` | 해당 옵션 input (`optionRefs.current.get(optId)`) |

### `FormItem.tsx`에서의 포커스 처리

`useEffect([errorId])`에서 errorId 패턴을 분석해 해당 요소에 `.focus()` 호출:

```ts
useEffect(() => {
  if (!errorId) return;

  if (errorId === `label-${item.id}`) {
    labelRef.current?.focus();
    setIsEditing(true);
  } else if (errorId === `option-${item.id}`) {
    // 카드 스크롤 후 편집 모드
    document.getElementById(`card-${item.id}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setIsEditing(true);
  } else if (errorId.startsWith(`option-${item.id}-`)) {
    const optId = errorId.replace(`option-${item.id}-`, '');
    optionRefs.current.get(optId)?.focus();
    setIsEditing(true);
  }
}, [errorId, item.id]);
```

---

## 10. 미리보기 — Parallel Route + Route Interception

Next.js App Router의 고급 라우팅 기능 두 가지를 조합했습니다.

### Parallel Route

`layout.tsx`에서 `children`과 `preview` 두 슬롯을 동시에 렌더링합니다.

```tsx
// edit/[formId]/layout.tsx
export default function EditLayout({ children, preview }) {
  return (
    <>
      {children}   {/* 편집 페이지 */}
      {preview}    {/* 모달 (비어있으면 @preview/default.tsx → null) */}
    </>
  );
}
```

`@preview/default.tsx`는 `null`을 반환해 기본 상태에서는 아무것도 렌더링하지 않습니다.

### Route Interception `(.)`

`(.)preview`는 같은 레벨의 `preview` 세그먼트를 가로챕니다.

- **편집 페이지에서** `router.push('/edit/[id]/preview')` → `(.)preview/page.tsx` 실행 → **모달**
- **브라우저 직접 입력** `/edit/[id]/preview` → 인터셉트 없음 → `preview/page.tsx` 실행 → **전체 페이지**

이 패턴 덕분에 별도 모달 state 관리 없이 URL만으로 모달/페이지 전환이 가능합니다.

---

## 11. 설치 및 실행

```bash
# 1. 의존성 설치
npm install

# 2. 개발 서버 실행
npm run dev
# → http://localhost:3000

# 3. 빌드
npm run build

# 4. 프로덕션 서버
npm start
```

### 필수 환경

- Node.js 18.17 이상
- npm 또는 yarn

---

## 12. 주요 설계 결정 및 이유

### localStorage vs 서버 DB

별도 백엔드 없이 클라이언트만으로 완결되는 구조를 택했습니다. 추후 Supabase 등으로 교체 시 `src/lib/storage.ts`의 함수 시그니처만 유지하면 Context 이상의 코드는 변경이 필요 없습니다.

### Context API vs Zustand/Jotai

폼 편집 페이지 단위의 상태이므로 전역 상태 라이브러리 없이 Context만으로 충분합니다. `FormProvider`가 `formId`를 받아 초기화하므로 여러 탭에서 다른 폼을 동시에 편집해도 독립적으로 동작합니다.

### `firstErrorItemId`를 별도로 반환하는 이유

`firstErrorId`의 포맷(`label-{id}`, `option-{id}`, `option-{id}-{optId}`)에서 itemId를 파싱하려면 문자열 조작이 필요합니다. `generateId()`는 Base36 랜덤 문자열이라 `-`를 포함할 수 없지만, 파싱 로직이 복잡해지는 것을 피하고 명확성을 위해 `firstErrorItemId`를 별도로 반환했습니다.

### 인라인 편집 (inline editing)

모달이나 사이드 패널 없이 카드 자체에서 바로 편집하는 방식을 택했습니다. `수정하기` 클릭 시 라벨 input에 포커스를 주는 것으로 충분하며, 불필요한 UI 레이어를 줄여 모바일에서도 쾌적한 경험을 제공합니다.

### 모바일 퍼스트 레이아웃

- 최소 너비 `min-w-[384px]` (sm 기준)
- 최대 너비 `max-w-3xl`로 데스크탑에서 과도하게 넓어지는 것 방지
- 미리보기 모달은 모바일에서 `items-end` (bottom sheet), 데스크탑에서 `sm:items-center` (center modal)로 각 환경에 최적화

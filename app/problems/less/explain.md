# 객체·함수 의존성과 exhaustive-deps

## 📌 상황

`ThemePreview` 컴포넌트는 `theme` 문자열과 `onApplied` 콜백을 props로 받습니다. 컴포넌트 내부에서는 `theme` 값을 기반으로 배경색과 글자색이 담긴 `style` 객체를 만들고, `useEffect` 안에서 `applyTheme(style)`로 문서에 테마를 적용한 뒤 `onApplied(theme)`로 부모에게 적용 사실을 알립니다. 그런데 `useEffect`의 deps 배열이 `[]`로 되어 있어 린트 경고가 발생하고 있습니다.

---

## 🚨 린트 에러 내용

> React Hook useEffect has missing dependencies: 'onApplied', 'style', and 'theme'.  
> Either include them or remove the dependency array.

`eslint-plugin-react-hooks`의 `exhaustive-deps` 규칙이
effect 내부에서 사용하는 값 중 deps에 없는 것들을 경고합니다.

---

## 🔍 왜 린트 에러가 뜨는 걸까요?

React의 `useEffect`는 deps 배열에 명시된 값이 바뀔 때만 다시 실행됩니다.
만약 effect 안에서 외부 값을 읽는데 deps에 넣지 않으면,
그 값이 바뀌어도 effect가 다시 실행되지 않아 **오래된 값(stale closure)** 을 읽게 됩니다.

이를 방지하기 위해 exhaustive-deps 규칙은 effect 내부에서 참조하는 모든 외부 값을
deps에 넣도록 강제합니다.
현재 코드에서는 `style`, `onApplied`, `theme`을 effect 안에서 사용하고 있지만
deps가 `[]`이라 경고가 뜨는 것입니다.

---

## 🤔 생각해보기

### 1. deps에 `style`을 추가하면 해결될까요?

경고는 사라지지만 새로운 문제가 생깁니다.
`style` 객체는 컴포넌트 바디에서 매 렌더마다 새로 생성됩니다.
JavaScript에서 객체는 내용이 같아도 참조가 다르면 다른 값으로 취급합니다.

```js
const a = { color: 'red' };
const b = { color: 'red' };
console.log(a === b); // false
```

따라서 `[style]`을 deps에 넣으면
렌더마다 새 참조 → effect 재실행 → state 업데이트 → 렌더 → **무한 루프** 가 발생합니다.

### 2. deps에 `onApplied`도 같이 추가하면요?

부모 컴포넌트에서 `onApplied`를 인라인 함수로 넘기고 있습니다.

```jsx
<ThemePreview
  onApplied={t => setLog(prev => [...prev, `Applied: ${t}`])}
/>
```

인라인 함수도 렌더마다 새로 생성되기 때문에 참조가 매번 달라집니다.
`style`과 같은 이유로, `onApplied`를 deps에 추가해도 무한 루프를 피할 수 없습니다.

### 3. `style` 문제와 `onApplied` 문제의 성격이 다를까요?

둘 다 "매 렌더마다 새 참조"라는 같은 증상이지만, 원인과 해결 방향이 다릅니다.

- **`style`** 은 `theme`으로부터 파생된 값입니다.
  객체로 묶을 필요 없이 effect 안에서 직접 계산하거나, 순수 함수로 추출하면 됩니다.

- **`onApplied`** 는 외부(부모)에서 넘어오는 함수입니다.
  컴포넌트 입장에서는 직접 통제하기 어렵기 때문에
  부모 쪽에서 참조를 안정화하거나, 내부에서 ref로 추적하는 방법을 써야 합니다.

### 4. 어떤 해결 방법들이 있을까요?

**방법 1 — 메모이제이션** (`solve1.jsx`)

`style`을 `useMemo`로 감싸고, `onApplied`를 부모에서 `useCallback`으로 감쌉니다.
두 값 모두 안정적인 참조가 되므로 deps에 안전하게 넣을 수 있습니다.
구조 변경 없이 해결할 수 있지만, 메모이제이션 레이어가 추가됩니다.

**방법 2 — 순수 함수 추출** (`solve2.jsx`)

객체 생성 로직을 컴포넌트 바깥 순수 함수로 옮깁니다.
effect 내부에서 함수를 호출하면 반환된 객체는 deps 대상이 아니라
effect 안의 지역 변수가 됩니다.
`onApplied`는 여전히 부모에서 `useCallback`이 필요합니다.

**방법 3 — useRef로 콜백 추적** (`solve3.jsx`)

`onApplied`를 ref에 저장하고 매 렌더마다 최신 값으로 갱신합니다.
effect는 ref를 통해 최신 함수를 호출하므로 `onApplied`를 deps에서 제외할 수 있습니다.
부모 수정 없이 해결된다는 게 장점이며,
React가 실험적으로 제공하는 `useEffectEvent`가 이 패턴을 공식화한 것입니다.

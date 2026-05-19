// [풀이 3] useRef로 최신 콜백 추적
//
// 핵심 아이디어: onApplied는 "최신 값을 읽기만 하면 되는" 함수라서,
// effect의 재실행을 유발하는 reactive 의존성이 될 필요가 없음.
// ref에 항상 최신 onApplied를 저장해두면, effect는 theme만 바라보면 됨.
// 부모가 인라인 함수를 넘겨도 무한 루프가 생기지 않는 게 풀이 1, 2와의 차이점.
// (React가 나중에 안정화할 useEffectEvent의 수동 구현 버전이기도 함)

import { useState, useEffect, useRef } from "react";

function getStyle(theme) {
  return {
    background: theme === "dark" ? "#222" : "#fff",
    color: theme === "dark" ? "#fff" : "#222",
  };
}

function applyTheme(style) {
  document.body.style.background = style.background;
  document.body.style.color = style.color;
}

function ThemePreview({ theme, onApplied }) {
  const onAppliedRef = useRef(onApplied);
  // deps 없음 → 매 렌더 후 ref를 최신 함수로 갱신
  // ref 갱신은 effect 실행을 유발하지 않음
  useEffect(() => {
    onAppliedRef.current = onApplied;
  });

  // onApplied 대신 ref를 읽기 때문에 deps에서 완전히 제외 가능
  useEffect(() => {
    applyTheme(getStyle(theme));
    onAppliedRef.current(theme);
    return () => {
      document.body.style.background = "";
      document.body.style.color = "";
    };
  }, [theme]);

  return <div style={getStyle(theme)}>현재 테마: {theme}</div>;
}

export default function LessSolve3() {
  const [theme, setTheme] = useState("light");
  const [log, setLog] = useState([]);

  return (
    <div>
      <button
        onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
      >
        Toggle Theme (currently: {theme})
      </button>
      {/* 인라인 함수 그대로 넘겨도 무한 루프 없음 → 부모 수정 불필요 */}
      <ThemePreview
        theme={theme}
        onApplied={(t) => setLog((prev) => [...prev, `Applied: ${t}`])}
      />
      <ul>
        {log.map((entry, i) => (
          <li key={i}>{entry}</li>
        ))}
      </ul>
    </div>
  );
}

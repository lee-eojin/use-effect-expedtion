// [풀이 1] useMemo + useCallback으로 참조 안정화
//
// 핵심 아이디어: 문제의 구조를 최대한 유지하면서 deps가 안정되도록 메모이제이션.
// - style 객체는 useMemo로 감싸서, theme이 바뀔 때만 새 객체를 만들도록 함
// - onApplied 함수는 부모에서 useCallback으로 감싸서 렌더마다 새로 만들어지지 않게 함
// 두 가지 모두 안정적인 참조가 됐기 때문에 deps에 안전하게 넣을 수 있음

import { useState, useEffect, useMemo, useCallback } from "react";

function applyTheme(style) {
  document.body.style.background = style.background;
  document.body.style.color = style.color;
}

function ThemePreview({ theme, onApplied }) {
  // theme이 바뀔 때만 새 객체를 생성 → deps에 넣어도 무한 루프 없음
  const style = useMemo(
    () => ({
      background: theme === "dark" ? "#222" : "#fff",
      color: theme === "dark" ? "#fff" : "#222",
    }),
    [theme],
  );

  useEffect(() => {
    applyTheme(style);
    onApplied(theme);
    return () => {
      document.body.style.background = "";
      document.body.style.color = "";
    };
  }, [style, theme, onApplied]);

  return <div style={style}>현재 테마: {theme}</div>;
}

export default function LessSolve1() {
  const [theme, setTheme] = useState("light");
  const [log, setLog] = useState([]);

  // 빈 deps [] → 컴포넌트 생애 동안 같은 함수 참조를 유지
  const handleApplied = useCallback((t) => {
    setLog((prev) => [...prev, `Applied: ${t}`]);
  }, []);

  return (
    <div>
      <button
        onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
      >
        Toggle Theme (currently: {theme})
      </button>
      <ThemePreview theme={theme} onApplied={handleApplied} />
      <ul>
        {log.map((entry, i) => (
          <li key={i}>{entry}</li>
        ))}
      </ul>
    </div>
  );
}

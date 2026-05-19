// [풀이 2] 객체를 컴포넌트 바깥 순수 함수로 추출
//
// 핵심 아이디어: 문제의 원인은 "컴포넌트 바디에서 객체를 생성"했다는 것.
// 객체 생성을 컴포넌트 밖 순수 함수(getStyle)로 옮기면, effect 안에서 호출해도
// 반환된 객체가 deps에 들어가지 않기 때문에 무한 루프가 생기지 않음.
// onApplied는 부모에서 useCallback으로 안정화해서 deps에 안전하게 추가.

import { useState, useEffect, useCallback } from "react";

// 컴포넌트 외부 → 렌더와 무관하게 항상 동일한 함수 참조
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
  // getStyle은 컴포넌트 외부 함수라 deps에 추가할 필요 없음
  // theme과 onApplied만 추적하면 충분
  useEffect(() => {
    applyTheme(getStyle(theme));
    onApplied(theme);
    return () => {
      document.body.style.background = "";
      document.body.style.color = "";
    };
  }, [theme, onApplied]);

  return <div style={getStyle(theme)}>현재 테마: {theme}</div>;
}

export default function LessSolve2() {
  const [theme, setTheme] = useState("light");
  const [log, setLog] = useState([]);

  // 풀이 1과 동일하게 부모 쪽에서 useCallback 필요
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

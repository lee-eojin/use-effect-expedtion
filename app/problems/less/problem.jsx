// 테마를 토글할 수 있는 컴포넌트가 있다. 
// 이 컴포넌트는 현재 테마를 기반으로 배경색과 글자색 정보를 담은 객체를 만들고, 부모로부터 테마가 적용됐을 때 호출할 콜백 함수를 prop으로 받는다.
// 내부의 이펙트는 그 객체를 DOM에 적용하고, 콜백을 호출해 부모에게 알린다. 그런데 이 이펙트의 의존성 배열은 비어 있고, 린트 경고가 발생하고 있다.

// 버튼 누르면 ThemePreview 안의 div는 style prop으로 테마가 바뀌어 보임
// 근데 document.body 배경색은 초기값 그대로 (effect 재실행 안 됨)
// 로그도 처음 Applied: light 한 번만 찍히고 이후 토글해도 안 찍힘


import { useState, useEffect } from "react";

function applyTheme(style) {
  document.body.style.background = style.background;
  document.body.style.color = style.color;
}

function ThemePreview({ theme, onApplied }) {
  const style = {
    background: theme === "dark" ? "#222" : "#fff",
    color: theme === "dark" ? "#fff" : "#222",
  };

  useEffect(() => {
    applyTheme(style);
    onApplied(theme);
    return () => {
      document.body.style.background = "";
      document.body.style.color = "";
    };
  }, []);
  // exhaustive-deps

  return <div style={style}>현재 테마: {theme}</div>;
}

export default function LessProblem() {
  const [theme, setTheme] = useState("light");
  const [log, setLog] = useState([]);

  return (
    <div>
      <button
        onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
      >
        Toggle Theme (currently: {theme})
      </button>
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

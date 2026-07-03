"use client";

import { supabase } from "../lib/supabase";

export default function Home() {

  const vote = async (score) => {

    const { error } = await supabase
      .from("moods")
      .insert({
        score,
      });

    if (error) {
      alert("저장 실패");
      return;
    }

    alert("투표 완료!");
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        alignItems: "center",
        justifyContent: "center",
        background: "#f8f8f8",
        padding: "20px"
      }}
    >
      <h1>회사가기 싫을지도</h1>

      <p>
        오늘 회사가기 싫은 정도는?
      </p>

      <button onClick={() => vote(20)}>
        😀 출근할만함
      </button>

      <button onClick={() => vote(40)}>
        🙂 그럭저럭
      </button>

      <button onClick={() => vote(60)}>
        😐 귀찮음
      </button>

      <button onClick={() => vote(80)}>
        😭 가기 싫음
      </button>

      <button onClick={() => vote(100)}>
        🤮 죽어도 싫음
      </button>

    </main>
  );
}

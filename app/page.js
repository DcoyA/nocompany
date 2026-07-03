"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const moods = [
  {
    label: "😀 출근할만함",
    score: 20,
    color: "#22c55e",
  },
  {
    label: "🙂 그럭저럭",
    score: 40,
    color: "#84cc16",
  },
  {
    label: "😐 귀찮음",
    score: 60,
    color: "#f59e0b",
  },
  {
    label: "😭 가기 싫음",
    score: 80,
    color: "#ef4444",
  },
  {
    label: "🤮 죽어도 싫음",
    score: 100,
    color: "#111827",
  },
];

export default function Home() {
  const [average, setAverage] = useState(null);
  const [count, setCount] = useState(0);
  const [selectedScore, setSelectedScore] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    const { data, error } = await supabase.from("moods").select("score");

    if (error) {
      console.error("통계 조회 실패:", error);
      return;
    }

    if (!data || data.length === 0) {
      setAverage(null);
      setCount(0);
      return;
    }

    const total = data.reduce((sum, item) => sum + item.score, 0);
    const avg = Math.round(total / data.length);

    setAverage(avg);
    setCount(data.length);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const vote = async (score) => {
    setLoading(true);

    const { error } = await supabase.from("moods").insert({
      score,
    });

    setLoading(false);

    if (error) {
      alert("저장 실패. Supabase 설정을 확인해주세요.");
      console.error("투표 저장 실패:", error);
      return;
    }

    setSelectedScore(score);
    fetchStats();
  };

  const getMoodText = (score) => {
    if (score >= 90) return "전국 직장인 멘탈 붕괴 직전";
    if (score >= 75) return "오늘 다들 회사 가기 싫은 날";
    if (score >= 55) return "그럭저럭 버티는 중";
    if (score >= 35) return "아직은 출근 가능";
    return "이 정도면 회사 체질";
  };

  const goScout = () => {
    window.open("https://hellomedia.win", "_blank", "noopener,noreferrer");
  };

  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <div style={styles.badge}>NO COMPANY</div>

        <h1 style={styles.title}>회사가기 싫을지도</h1>

        <p style={styles.subtitle}>
          오늘 대한민국 직장인들이 얼마나 회사 가기 싫은지
          <br />
          익명으로 모아보는 실시간 퇴사욕구 지수
        </p>

        <div style={styles.scoreBox}>
          <p style={styles.scoreLabel}>오늘의 회사가기 싫음 지수</p>

          <strong style={styles.score}>
            {average === null ? "--" : average}
            <span style={styles.scoreUnit}>점</span>
          </strong>

          <p style={styles.scoreText}>
            {average === null ? "아직 투표가 없습니다" : getMoodText(average)}
          </p>

          <p style={styles.count}>현재 {count.toLocaleString()}명 참여</p>
        </div>

        <div style={styles.voteSection}>
          <p style={styles.question}>오늘 회사가기 싫은 정도는?</p>

          <div style={styles.buttons}>
            {moods.map((mood) => (
              <button
                key={mood.score}
                type="button"
                onClick={() => vote(mood.score)}
                disabled={loading}
                style={{
                  ...styles.button,
                  background: mood.color,
                  opacity: loading ? 0.6 : 1,
                }}
              >
                {mood.label}
              </button>
            ))}
          </div>
        </div>

        {selectedScore !== null && (
          <div style={styles.resultBox}>
            <p style={styles.resultTitle}>투표 완료</p>
            <p style={styles.resultText}>
              당신의 오늘 퇴사욕구는 {selectedScore}점입니다.
            </p>
          </div>
        )}

        <div style={styles.linkBox}>
          <p style={styles.linkText}>
            언젠가 회사를 안 가고 싶다면?
            <br />
            경제적 자유를 위한 우량주 탐색도 필요합니다.
          </p>

          <button type="button" onClick={goScout} style={styles.linkButton}>
            우량주 스카우터 보기
          </button>
        </div>
      </section>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #fff1f2 0%, #f8fafc 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  card: {
    width: "100%",
    maxWidth: "440px",
    background: "#ffffff",
    borderRadius: "28px",
    padding: "28px 22px",
    boxShadow: "0 20px 50px rgba(15, 23, 42, 0.12)",
    textAlign: "center",
  },
  badge: {
    display: "inline-block",
    padding: "7px 12px",
    borderRadius: "999px",
    background: "#111827",
    color: "#ffffff",
    fontSize: "12px",
    letterSpacing: "0.08em",
    fontWeight: 800,
    marginBottom: "14px",
  },
  title: {
    margin: 0,
    fontSize: "34px",
    lineHeight: 1.15,
    color: "#111827",
    letterSpacing: "-0.04em",
  },
  subtitle: {
    margin: "12px auto 22px",
    color: "#64748b",
    fontSize: "15px",
    lineHeight: 1.55,
  },
  scoreBox: {
    background: "#fff1f2",
    border: "1px solid #ffe4e6",
    borderRadius: "24px",
    padding: "22px 16px",
    marginBottom: "22px",
  },
  scoreLabel: {
    margin: 0,
    color: "#be123c",
    fontSize: "14px",
    fontWeight: 700,
  },
  score: {
    display: "block",
    marginTop: "6px",
    color: "#e11d48",
    fontSize: "64px",
    lineHeight: 1,
    letterSpacing: "-0.06em",
  },
  scoreUnit: {
    fontSize: "24px",
    marginLeft: "4px",
  },
  scoreText: {
    margin: "10px 0 0",
    color: "#111827",
    fontWeight: 800,
    fontSize: "17px",
  },
  count: {
    margin: "8px 0 0",
    color: "#64748b",
    fontSize: "13px",
  },
  voteSection: {
    marginTop: "8px",
  },
  question: {
    margin: "0 0 12px",
    color: "#111827",
    fontWeight: 800,
    fontSize: "18px",
  },
  buttons: {
    display: "grid",
    gap: "10px",
  },
  button: {
    width: "100%",
    border: "0",
    borderRadius: "16px",
    color: "#ffffff",
    padding: "15px 16px",
    fontSize: "17px",
    fontWeight: 800,
    cursor: "pointer",
  },
  resultBox: {
    marginTop: "18px",
    background: "#f8fafc",
    borderRadius: "18px",
    padding: "14px",
    border: "1px solid #e2e8f0",
  },
  resultTitle: {
    margin: 0,
    fontWeight: 900,
    color: "#111827",
  },
  resultText: {
    margin: "6px 0 0",
    color: "#475569",
    fontSize: "14px",
  },
  linkBox: {
    marginTop: "22px",
    padding: "16px",
    background: "#f1f5f9",
    borderRadius: "20px",
  },
  linkText: {
    margin: 0,
    color: "#475569",
    fontSize: "14px",
    lineHeight: 1.5,
  },
  linkButton: {
    display: "inline-block",
    marginTop: "12px",
    padding: "11px 15px",
    borderRadius: "999px",
    background: "#111827",
    color: "#ffffff",
    border: "0",
    fontWeight: 800,
    fontSize: "14px",
    cursor: "pointer",
  },
};

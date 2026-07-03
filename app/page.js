"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { moods, regions, mapPins } from "../lib/data";
import AppHeader from "../components/AppHeader";
import BottomNav from "../components/BottomNav";

export default function Home() {
  const [records, setRecords] = useState([]);
  const [average, setAverage] = useState(null);
  const [count, setCount] = useState(0);
  const [selectedScore, setSelectedScore] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    const { data, error } = await supabase
      .from("moods")
      .select("score, created_at")
      .order("created_at", { ascending: false })
      .limit(1000);

    if (error) {
      console.error("통계 조회 실패:", error);
      return;
    }

    if (!data || data.length === 0) {
      setRecords([]);
      setAverage(null);
      setCount(0);
      return;
    }

    const total = data.reduce((sum, item) => sum + item.score, 0);
    const avg = Math.round(total / data.length);

    setRecords(data);
    setAverage(avg);
    setCount(data.length);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const distribution = useMemo(() => {
    return moods.map((mood) => {
      const moodCount = records.filter((item) => item.score === mood.score).length;
      const percent = records.length === 0 ? 0 : Math.round((moodCount / records.length) * 100);

      return {
        ...mood,
        percent,
      };
    });
  }, [records]);

  const currentMood = useMemo(() => {
    if (average === null) return moods[2];
    if (average >= 90) return moods[4];
    if (average >= 75) return moods[3];
    if (average >= 55) return moods[2];
    if (average >= 35) return moods[1];
    return moods[0];
  }, [average]);

  const selectedMood = moods.find((mood) => mood.score === selectedScore);

  const vote = async (score) => {
    setLoading(true);

    const { error } = await supabase.from("moods").insert({ score });

    setLoading(false);

    if (error) {
      alert("저장 실패. Supabase RLS 또는 Vercel 환경변수를 확인해주세요.");
      console.error("투표 저장 실패:", error);
      return;
    }

    setSelectedScore(score);
    fetchStats();
  };

  const getMoodText = (score) => {
    if (score === null) return "첫 투표를 기다리는 중";
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
      <div style={styles.phone}>
        <AppHeader />

        <section style={styles.heroCard}>
          <div style={styles.heroTop}>
            <div>
              <p style={styles.cardLabel}>오늘의 회사가기 싫음 지수</p>

              <div style={styles.scoreRow}>
                <span style={styles.bigEmoji}>{currentMood.emoji}</span>
                <strong style={styles.mainScore}>
                  {average === null ? "--" : average}
                  <span style={styles.scoreUnit}>점</span>
                </strong>
              </div>

              <p style={styles.moodText}>{getMoodText(average)}</p>
            </div>

            <div style={styles.trendBox}>
              <span style={styles.trendLabel}>어제보다</span>
              <strong style={styles.trendValue}>+6</strong>
              <span style={styles.trendLine}>⌁⌁╱╲╱╲</span>
            </div>
          </div>

          <div style={styles.distribution}>
            {distribution.map((item) => (
              <div key={item.score} style={styles.distItem}>
                <div style={{ ...styles.distEmoji, background: item.bg }}>
                  {item.emoji}
                </div>
                <strong style={styles.distPercent}>{item.percent}%</strong>
                <span style={styles.distLabel}>{item.short}</span>
              </div>
            ))}
          </div>

          <p style={styles.countText}>
            현재 {count.toLocaleString()}명 참여 · 익명 저장
          </p>
        </section>

        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>오늘 내 상태 입력</h2>
          <p style={styles.sectionSub}>3초만에 참여하고 전국 직장인들과 함께해요.</p>

          <div style={styles.moodGrid}>
            {moods.map((mood) => {
              const isSelected = selectedScore === mood.score;

              return (
                <button
                  key={mood.score}
                  type="button"
                  onClick={() => vote(mood.score)}
                  disabled={loading}
                  style={{
                    ...styles.moodButton,
                    background: isSelected ? mood.color : "#f8fafc",
                    color: isSelected ? "#ffffff" : "#111827",
                    borderColor: isSelected ? mood.color : "#eef2f7",
                    opacity: loading ? 0.65 : 1,
                  }}
                >
                  <span style={styles.moodEmoji}>{mood.emoji}</span>
                  <span style={styles.moodLabel}>{mood.label}</span>
                </button>
              );
            })}
          </div>

          {selectedMood && (
            <div style={styles.resultBox}>
              <div style={styles.resultEmoji}>{selectedMood.emoji}</div>
              <div style={styles.resultContent}>
                <p style={styles.resultTitle}>{selectedMood.label}</p>
                <p style={styles.resultText}>
                  당신의 오늘 퇴사욕구는 {selectedScore}점입니다.
                </p>
              </div>
            </div>
          )}
        </section>

        <section style={styles.card}>
          <div style={styles.sectionHeader}>
            <div>
              <h2 style={styles.sectionTitle}>지역별 회사가기 싫음 지수</h2>
              <p style={styles.sectionSub}>지도 API 붙이기 전 임시 지역 대시보드</p>
            </div>
            <button
              type="button"
              onClick={() => {
                window.location.href = "/rankings";
              }}
              style={styles.moreButton}
            >
              전체보기
            </button>
          </div>

          <div style={styles.fakeMap}>
            <div style={styles.mapBgCircleOne} />
            <div style={styles.mapBgCircleTwo} />

            {mapPins.map((pin) => (
              <div
                key={pin.name}
                style={{
                  ...styles.pin,
                  top: pin.top,
                  left: pin.left,
                  borderColor: pin.color,
                }}
              >
                <span style={styles.pinName}>{pin.name}</span>
                <strong style={{ ...styles.pinScore, color: pin.color }}>
                  {pin.score}
                </strong>
              </div>
            ))}
          </div>
        </section>

        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>오늘의 TOP 5</h2>
          <p style={styles.sectionSub}>퇴사욕구 높은 업무지구</p>

          <div style={styles.rankList}>
            {regions.slice(0, 5).map((region, index) => (
              <div key={region.name} style={styles.rankItem}>
                <div style={styles.rankLeft}>
                  <span style={styles.rankNo}>{index + 1}</span>
                  <span style={styles.rankEmoji}>{region.emoji}</span>
                  <strong style={styles.rankName}>{region.name}</strong>
                </div>

                <div style={styles.rankRight}>
                  <div style={styles.rankBarTrack}>
                    <div
                      style={{
                        ...styles.rankBar,
                        width: `${region.score}%`,
                        background: region.color,
                      }}
                    />
                  </div>
                  <strong style={styles.rankScore}>{region.score}점</strong>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section style={styles.simulatorCard}>
          <p style={styles.darkLabel}>퇴사 가능할까?</p>
          <h2 style={styles.darkTitle}>내 통장으로 몇 개월 버틸지 계산해보기</h2>
          <p style={styles.darkSub}>
            월급, 현금, 생활비를 입력하면 퇴사 가능 기간을 계산합니다.
          </p>

          <button
            type="button"
            onClick={() => {
              window.location.href = "/simulator";
            }}
            style={styles.simulatorButton}
          >
            퇴사 시뮬레이터 시작
          </button>
        </section>

        <section style={styles.scoutCard}>
          <div>
            <p style={styles.scoutTitle}>경제적 자유를 원한다면?</p>
            <p style={styles.scoutText}>
              회사를 안 가는 상상만 하지 말고, 우량주 후보도 같이 찾아보세요.
            </p>
          </div>

          <button type="button" onClick={goScout} style={styles.scoutButton}>
            우량주 스카우터 보기
          </button>
        </section>

        <BottomNav active="home" />
      </div>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "radial-gradient(circle at top left, #ffe4e6 0, transparent 28%), linear-gradient(180deg, #fff7f8 0%, #eef2f7 100%)",
    display: "flex",
    justifyContent: "center",
    padding: "18px",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    color: "#111827",
  },
  phone: {
    width: "100%",
    maxWidth: "430px",
    minHeight: "100vh",
    paddingBottom: "86px",
  },
  heroCard: {
    background: "rgba(255,255,255,0.92)",
    borderRadius: "30px",
    padding: "22px",
    boxShadow: "0 22px 60px rgba(15, 23, 42, 0.12)",
    border: "1px solid rgba(255,255,255,0.8)",
    marginBottom: "14px",
  },
  heroTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "14px",
    alignItems: "flex-start",
  },
  cardLabel: {
    margin: 0,
    fontSize: "14px",
    color: "#475569",
    fontWeight: 800,
  },
  scoreRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginTop: "8px",
  },
  bigEmoji: {
    fontSize: "54px",
  },
  mainScore: {
    fontSize: "52px",
    color: "#f43f5e",
    letterSpacing: "-0.08em",
    lineHeight: 1,
  },
  scoreUnit: {
    fontSize: "22px",
    marginLeft: "3px",
  },
  moodText: {
    margin: "8px 0 0",
    fontSize: "14px",
    color: "#111827",
    fontWeight: 900,
  },
  trendBox: {
    minWidth: "96px",
    padding: "12px",
    borderRadius: "18px",
    background: "#fff1f2",
    border: "1px solid #ffe4e6",
    textAlign: "center",
  },
  trendLabel: {
    display: "block",
    fontSize: "11px",
    color: "#64748b",
    fontWeight: 800,
  },
  trendValue: {
    display: "block",
    marginTop: "3px",
    fontSize: "22px",
    color: "#f43f5e",
  },
  trendLine: {
    display: "block",
    marginTop: "4px",
    color: "#fb7185",
    fontSize: "13px",
  },
  distribution: {
    marginTop: "18px",
    padding: "12px",
    borderRadius: "22px",
    background: "#f8fafc",
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)",
    gap: "8px",
  },
  distItem: {
    textAlign: "center",
  },
  distEmoji: {
    width: "42px",
    height: "42px",
    borderRadius: "16px",
    margin: "0 auto 5px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "22px",
  },
  distPercent: {
    display: "block",
    fontSize: "13px",
  },
  distLabel: {
    display: "block",
    marginTop: "1px",
    fontSize: "10px",
    color: "#64748b",
    fontWeight: 800,
  },
  countText: {
    margin: "12px 0 0",
    fontSize: "12px",
    color: "#64748b",
    fontWeight: 700,
    textAlign: "center",
  },
  card: {
    background: "#ffffff",
    borderRadius: "28px",
    padding: "20px",
    boxShadow: "0 18px 46px rgba(15, 23, 42, 0.09)",
    marginBottom: "14px",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "14px",
  },
  sectionTitle: {
    margin: 0,
    fontSize: "19px",
    fontWeight: 950,
    letterSpacing: "-0.04em",
  },
  sectionSub: {
    margin: "5px 0 14px",
    fontSize: "12px",
    color: "#64748b",
    fontWeight: 700,
  },
  moreButton: {
    border: "0",
    borderRadius: "999px",
    background: "#fff1f2",
    color: "#f43f5e",
    padding: "8px 11px",
    fontSize: "12px",
    fontWeight: 900,
    cursor: "pointer",
  },
  moodGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "10px",
  },
  moodButton: {
    minHeight: "92px",
    borderRadius: "22px",
    border: "1px solid #eef2f7",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "7px",
    fontWeight: 900,
    cursor: "pointer",
  },
  moodEmoji: {
    fontSize: "31px",
  },
  moodLabel: {
    fontSize: "12px",
  },
  resultBox: {
    marginTop: "14px",
    padding: "14px",
    borderRadius: "22px",
    background: "#fff1f2",
    display: "flex",
    gap: "12px",
    alignItems: "center",
    border: "1px solid #ffe4e6",
  },
  resultEmoji: {
    width: "52px",
    height: "52px",
    borderRadius: "18px",
    background: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "30px",
  },
  resultContent: {
    flex: 1,
  },
  resultTitle: {
    margin: 0,
    fontSize: "17px",
    fontWeight: 950,
  },
  resultText: {
    margin: "3px 0 0",
    fontSize: "12px",
    color: "#64748b",
    fontWeight: 700,
  },
  fakeMap: {
    position: "relative",
    height: "250px",
    borderRadius: "26px",
    overflow: "hidden",
    background: "linear-gradient(145deg, #dbeafe 0%, #ecfeff 42%, #fef3c7 100%)",
    border: "1px solid #e2e8f0",
  },
  mapBgCircleOne: {
    position: "absolute",
    width: "220px",
    height: "160px",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.42)",
    top: "32px",
    left: "42px",
    transform: "rotate(-18deg)",
  },
  mapBgCircleTwo: {
    position: "absolute",
    width: "160px",
    height: "120px",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.35)",
    right: "12px",
    bottom: "20px",
    transform: "rotate(20deg)",
  },
  pin: {
    position: "absolute",
    transform: "translate(-50%, -50%)",
    width: "62px",
    height: "62px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.92)",
    border: "3px solid",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 14px 26px rgba(15,23,42,0.17)",
  },
  pinName: {
    fontSize: "11px",
    color: "#334155",
    fontWeight: 900,
  },
  pinScore: {
    fontSize: "18px",
    fontWeight: 950,
    lineHeight: 1.1,
  },
  rankList: {
    display: "grid",
    gap: "12px",
  },
  rankItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
  },
  rankLeft: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    minWidth: "105px",
  },
  rankNo: {
    width: "22px",
    height: "22px",
    borderRadius: "8px",
    background: "#f1f5f9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "11px",
    fontWeight: 900,
    color: "#64748b",
  },
  rankEmoji: {
    fontSize: "22px",
  },
  rankName: {
    fontSize: "14px",
  },
  rankRight: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  rankBarTrack: {
    flex: 1,
    height: "10px",
    background: "#e5e7eb",
    borderRadius: "999px",
    overflow: "hidden",
  },
  rankBar: {
    height: "100%",
    borderRadius: "999px",
  },
  rankScore: {
    width: "42px",
    textAlign: "right",
    fontSize: "12px",
  },
  simulatorCard: {
    background: "linear-gradient(135deg, #111827 0%, #1f2937 100%)",
    color: "#ffffff",
    borderRadius: "30px",
    padding: "23px",
    boxShadow: "0 20px 50px rgba(15, 23, 42, 0.22)",
    marginBottom: "14px",
  },
  darkLabel: {
    margin: 0,
    color: "#fb7185",
    fontSize: "13px",
    fontWeight: 900,
  },
  darkTitle: {
    margin: "7px 0 0",
    fontSize: "22px",
    lineHeight: 1.28,
    letterSpacing: "-0.05em",
  },
  darkSub: {
    margin: "8px 0 18px",
    color: "#cbd5e1",
    fontSize: "13px",
    lineHeight: 1.5,
    fontWeight: 700,
  },
  simulatorButton: {
    width: "100%",
    border: "0",
    borderRadius: "18px",
    background: "linear-gradient(135deg, #fb7185 0%, #f43f5e 100%)",
    color: "#ffffff",
    padding: "15px",
    fontSize: "15px",
    fontWeight: 950,
    cursor: "pointer",
  },
  scoutCard: {
    background: "#fff7ed",
    border: "1px solid #fed7aa",
    borderRadius: "26px",
    padding: "18px",
    display: "flex",
    gap: "14px",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "18px",
  },
  scoutTitle: {
    margin: 0,
    fontSize: "15px",
    fontWeight: 950,
    color: "#9a3412",
  },
  scoutText: {
    margin: "5px 0 0",
    fontSize: "12px",
    color: "#9a3412",
    lineHeight: 1.45,
    fontWeight: 700,
  },
  scoutButton: {
    flexShrink: 0,
    border: "0",
    borderRadius: "999px",
    padding: "11px 13px",
    background: "#111827",
    color: "#ffffff",
    fontSize: "12px",
    fontWeight: 900,
    cursor: "pointer",
  },
};

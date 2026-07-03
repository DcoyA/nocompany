"use client";

import { useEffect, useMemo, useState } from "react";
import { moods } from "../../lib/data";
import AppHeader from "../../components/AppHeader";
import BottomNav from "../../components/BottomNav";

export default function MyPage() {
  const [lastVoteDate, setLastVoteDate] = useState(null);
  const [lastVoteRegion, setLastVoteRegion] = useState(null);
  const [lastVoteScore, setLastVoteScore] = useState(null);

  useEffect(() => {
    setLastVoteDate(localStorage.getItem("lastVoteDate"));
    setLastVoteRegion(localStorage.getItem("lastVoteRegion"));
    setLastVoteScore(localStorage.getItem("lastVoteScore"));
  }, []);

  const todayKey = new Date().toISOString().slice(0, 10);
  const votedToday = lastVoteDate === todayKey;

  const myMood = useMemo(() => {
    if (!lastVoteScore) return null;
    return moods.find((mood) => mood.score === Number(lastVoteScore)) || null;
  }, [lastVoteScore]);

  const getStatusText = () => {
    if (!lastVoteScore) return "아직 참여 기록이 없습니다.";

    const score = Number(lastVoteScore);

    if (score >= 90) return "오늘은 정말 쉽지 않은 날입니다.";
    if (score >= 75) return "퇴사욕구가 꽤 높은 상태입니다.";
    if (score >= 55) return "그럭저럭 버티는 중입니다.";
    if (score >= 35) return "아직은 출근 가능한 상태입니다.";
    return "회사 체질에 가까운 상태입니다.";
  };

  const resetMyData = () => {
    const ok = confirm("내 기기에서 저장된 참여 기록을 삭제할까요?");

    if (!ok) return;

    localStorage.removeItem("lastVoteDate");
    localStorage.removeItem("lastVoteRegion");
    localStorage.removeItem("lastVoteScore");

    setLastVoteDate(null);
    setLastVoteRegion(null);
    setLastVoteScore(null);
  };

  const goHome = () => {
    window.location.href = "/";
  };

  const goScout = () => {
    window.open("https://hellomedia.win", "_blank", "noopener,noreferrer");
  };

  return (
    <main style={styles.page}>
      <div style={styles.phone}>
        <AppHeader title="마이" showBack />

        <section style={styles.profileCard}>
          <div style={styles.avatar}>{myMood ? myMood.emoji : "🫥"}</div>

          <div>
            <p style={styles.kicker}>MY NO COMPANY</p>
            <h1 style={styles.title}>
              {votedToday ? "오늘 참여 완료" : "오늘 아직 미참여"}
            </h1>
            <p style={styles.desc}>{getStatusText()}</p>
          </div>
        </section>

        <section style={styles.statusCard}>
          <p style={styles.statusLabel}>내 오늘 퇴사욕구</p>

          <div style={styles.scoreBox}>
            <strong style={styles.score}>
              {lastVoteScore ? lastVoteScore : "--"}
              <span>점</span>
            </strong>

            <div style={styles.moodBadge}>
              {myMood ? myMood.label : "기록 없음"}
            </div>
          </div>

          <div style={styles.progressTrack}>
            <div
              style={{
                ...styles.progressBar,
                width: `${lastVoteScore ? Number(lastVoteScore) : 0}%`,
                background: myMood ? myMood.color : "#cbd5e1",
              }}
            />
          </div>
        </section>

        <section style={styles.grid}>
          <div style={styles.infoCard}>
            <p style={styles.infoLabel}>내 업무지역</p>
            <strong style={styles.infoValue}>{lastVoteRegion || "-"}</strong>
          </div>

          <div style={styles.infoCard}>
            <p style={styles.infoLabel}>마지막 참여일</p>
            <strong style={styles.infoValue}>{lastVoteDate || "-"}</strong>
          </div>

          <div style={styles.infoCard}>
            <p style={styles.infoLabel}>오늘 참여 여부</p>
            <strong style={styles.infoValue}>{votedToday ? "완료" : "대기"}</strong>
          </div>

          <div style={styles.infoCard}>
            <p style={styles.infoLabel}>참여 방식</p>
            <strong style={styles.infoValue}>익명</strong>
          </div>
        </section>

        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>내 기록 안내</h2>
          <p style={styles.sectionText}>
            현재 마이페이지는 로그인 없이 이 기기의 localStorage에 저장된 마지막
            참여 기록만 보여줍니다. 나중에 회원가입을 붙이면 참여일수, 연속 참여,
            내 평균 점수까지 확장할 수 있습니다.
          </p>
        </section>

        {!votedToday && (
          <section style={styles.actionCard}>
            <div>
              <p style={styles.actionTitle}>오늘 아직 참여하지 않았어요</p>
              <p style={styles.actionText}>
                홈에서 오늘 회사가기 싫은 정도를 입력해보세요.
              </p>
            </div>

            <button type="button" onClick={goHome} style={styles.actionButton}>
              투표하러 가기
            </button>
          </section>
        )}

        {votedToday && (
          <section style={styles.actionCard}>
            <div>
              <p style={styles.actionTitle}>내일 다시 참여 가능</p>
              <p style={styles.actionText}>
                하루 1회만 참여할 수 있어 지역 순위 조작을 줄입니다.
              </p>
            </div>

            <button type="button" onClick={goHome} style={styles.actionButton}>
              홈으로 가기
            </button>
          </section>
        )}

        <section style={styles.scoutCard}>
          <p style={styles.scoutTitle}>퇴사욕구를 줄이는 현실적인 방법</p>
          <p style={styles.scoutText}>
            현금흐름, 배당, 우량주 후보를 보면서 회사 밖 선택지를 준비해보세요.
          </p>

          <button type="button" onClick={goScout} style={styles.scoutButton}>
            우량주 스카우터 보기
          </button>
        </section>

        <button type="button" onClick={resetMyData} style={styles.resetButton}>
          내 기기 기록 삭제
        </button>

        <BottomNav active="my" />
      </div>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #fff7f8 0%, #eef2f7 100%)",
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
  profileCard: {
    background: "linear-gradient(135deg, #111827 0%, #1f2937 100%)",
    color: "#ffffff",
    borderRadius: "30px",
    padding: "24px",
    marginBottom: "14px",
    boxShadow: "0 20px 50px rgba(15, 23, 42, 0.22)",
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  avatar: {
    width: "74px",
    height: "74px",
    borderRadius: "26px",
    background: "rgba(255,255,255,0.12)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "42px",
    flexShrink: 0,
  },
  kicker: {
    margin: 0,
    color: "#fb7185",
    fontSize: "12px",
    fontWeight: 950,
    letterSpacing: "0.06em",
  },
  title: {
    margin: "8px 0 0",
    fontSize: "28px",
    lineHeight: 1.15,
    letterSpacing: "-0.06em",
  },
  desc: {
    margin: "8px 0 0",
    color: "#cbd5e1",
    fontSize: "13px",
    lineHeight: 1.5,
    fontWeight: 700,
  },
  statusCard: {
    background: "#ffffff",
    borderRadius: "30px",
    padding: "24px",
    marginBottom: "14px",
    boxShadow: "0 18px 46px rgba(15, 23, 42, 0.09)",
  },
  statusLabel: {
    margin: 0,
    fontSize: "14px",
    color: "#64748b",
    fontWeight: 900,
  },
  scoreBox: {
    marginTop: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
  },
  score: {
    fontSize: "58px",
    lineHeight: 1,
    letterSpacing: "-0.08em",
    color: "#f43f5e",
  },
  moodBadge: {
    padding: "10px 12px",
    borderRadius: "999px",
    background: "#fff1f2",
    color: "#f43f5e",
    fontSize: "13px",
    fontWeight: 950,
  },
  progressTrack: {
    marginTop: "16px",
    width: "100%",
    height: "12px",
    background: "#e5e7eb",
    borderRadius: "999px",
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: "999px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
    marginBottom: "14px",
  },
  infoCard: {
    background: "#ffffff",
    borderRadius: "24px",
    padding: "17px",
    boxShadow: "0 12px 34px rgba(15, 23, 42, 0.07)",
  },
  infoLabel: {
    margin: 0,
    color: "#64748b",
    fontSize: "12px",
    fontWeight: 900,
  },
  infoValue: {
    display: "block",
    marginTop: "5px",
    fontSize: "18px",
    fontWeight: 950,
  },
  card: {
    background: "#ffffff",
    borderRadius: "28px",
    padding: "20px",
    boxShadow: "0 18px 46px rgba(15, 23, 42, 0.09)",
    marginBottom: "14px",
  },
  sectionTitle: {
    margin: 0,
    fontSize: "18px",
    fontWeight: 950,
    letterSpacing: "-0.04em",
  },
  sectionText: {
    margin: "8px 0 0",
    color: "#64748b",
    fontSize: "13px",
    fontWeight: 700,
    lineHeight: 1.55,
  },
  actionCard: {
    background: "#fff1f2",
    border: "1px solid #ffe4e6",
    borderRadius: "26px",
    padding: "18px",
    marginBottom: "14px",
  },
  actionTitle: {
    margin: 0,
    color: "#be123c",
    fontSize: "16px",
    fontWeight: 950,
  },
  actionText: {
    margin: "6px 0 14px",
    color: "#be123c",
    fontSize: "13px",
    fontWeight: 700,
    lineHeight: 1.45,
  },
  actionButton: {
    width: "100%",
    border: "0",
    borderRadius: "18px",
    background: "#f43f5e",
    color: "#ffffff",
    padding: "14px",
    fontSize: "14px",
    fontWeight: 950,
    cursor: "pointer",
  },
  scoutCard: {
    background: "#fff7ed",
    border: "1px solid #fed7aa",
    borderRadius: "26px",
    padding: "18px",
    marginBottom: "14px",
  },
  scoutTitle: {
    margin: 0,
    fontSize: "15px",
    fontWeight: 950,
    color: "#9a3412",
  },
  scoutText: {
    margin: "5px 0 14px",
    fontSize: "12px",
    color: "#9a3412",
    lineHeight: 1.45,
    fontWeight: 700,
  },
  scoutButton: {
    border: "0",
    borderRadius: "999px",
    padding: "11px 13px",
    background: "#111827",
    color: "#ffffff",
    fontSize: "12px",
    fontWeight: 900,
    cursor: "pointer",
  },
  resetButton: {
    width: "100%",
    border: "0",
    borderRadius: "18px",
    background: "#e5e7eb",
    color: "#64748b",
    padding: "13px",
    fontSize: "13px",
    fontWeight: 900,
    cursor: "pointer",
  },
};

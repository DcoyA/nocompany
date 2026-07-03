"use client";

import { regions } from "../../lib/data";
import AppHeader from "../../components/AppHeader";
import BottomNav from "../../components/BottomNav";

export default function RankingsPage() {
  return (
    <main style={styles.page}>
      <div style={styles.phone}>
        <AppHeader title="지역 순위" showBack />

        <section style={styles.introCard}>
          <p style={styles.kicker}>TODAY RANKING</p>
          <h1 style={styles.title}>
            오늘 회사가기
            <br />
            제일 싫은 동네는?
          </h1>
          <p style={styles.desc}>
            현재는 임시 데이터입니다. 다음 단계에서 투표할 때 지역을 함께 저장해서 실시간 순위로 바꿀 수 있습니다.
          </p>
        </section>

        <section style={styles.rankCard}>
          {regions.map((region, index) => (
            <div key={region.name} style={styles.rankItem}>
              <div style={styles.rankLeft}>
                <span style={index === 0 ? styles.rankNoTop : styles.rankNo}>
                  {index + 1}
                </span>

                <span style={styles.rankEmoji}>{region.emoji}</span>

                <div>
                  <strong style={styles.rankName}>{region.name}</strong>
                  <p style={styles.rankSub}>
                    퇴사욕구 {region.score >= 85 ? "위험" : region.score >= 75 ? "높음" : "보통"}
                  </p>
                </div>
              </div>

              <div style={styles.rankRight}>
                <strong style={{ ...styles.rankScore, color: region.color }}>
                  {region.score}점
                </strong>
                <div style={styles.rankBarTrack}>
                  <div
                    style={{
                      ...styles.rankBar,
                      width: `${region.score}%`,
                      background: region.color,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </section>

        <section style={styles.noticeCard}>
          <h2 style={styles.noticeTitle}>다음 업데이트 예정</h2>
          <p style={styles.noticeText}>
            투표할 때 지역을 선택하게 만들면, 이 순위는 실제 사용자 데이터 기반으로 자동 계산됩니다.
          </p>
        </section>

        <BottomNav active="rankings" />
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
  introCard: {
    background: "linear-gradient(135deg, #111827 0%, #1f2937 100%)",
    color: "#ffffff",
    borderRadius: "30px",
    padding: "24px",
    marginBottom: "14px",
    boxShadow: "0 20px 50px rgba(15, 23, 42, 0.22)",
  },
  kicker: {
    margin: 0,
    color: "#fb7185",
    fontSize: "12px",
    fontWeight: 950,
    letterSpacing: "0.06em",
  },
  title: {
    margin: "10px 0 0",
    fontSize: "34px",
    lineHeight: 1.15,
    letterSpacing: "-0.06em",
  },
  desc: {
    margin: "12px 0 0",
    color: "#cbd5e1",
    fontSize: "14px",
    lineHeight: 1.55,
    fontWeight: 700,
  },
  rankCard: {
    background: "#ffffff",
    borderRadius: "28px",
    padding: "18px",
    boxShadow: "0 18px 46px rgba(15, 23, 42, 0.09)",
    marginBottom: "14px",
  },
  rankItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    padding: "14px 0",
    borderBottom: "1px solid #eef2f7",
  },
  rankLeft: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  rankNo: {
    width: "28px",
    height: "28px",
    borderRadius: "10px",
    background: "#f1f5f9",
    color: "#64748b",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "13px",
    fontWeight: 950,
  },
  rankNoTop: {
    width: "28px",
    height: "28px",
    borderRadius: "10px",
    background: "#fff1f2",
    color: "#f43f5e",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "13px",
    fontWeight: 950,
  },
  rankEmoji: {
    fontSize: "30px",
  },
  rankName: {
    display: "block",
    fontSize: "16px",
    fontWeight: 950,
  },
  rankSub: {
    margin: "3px 0 0",
    color: "#64748b",
    fontSize: "12px",
    fontWeight: 700,
  },
  rankRight: {
    width: "120px",
    textAlign: "right",
  },
  rankScore: {
    display: "block",
    fontSize: "18px",
    fontWeight: 950,
    marginBottom: "6px",
  },
  rankBarTrack: {
    width: "100%",
    height: "9px",
    background: "#e5e7eb",
    borderRadius: "999px",
    overflow: "hidden",
  },
  rankBar: {
    height: "100%",
    borderRadius: "999px",
  },
  noticeCard: {
    background: "#fff7ed",
    border: "1px solid #fed7aa",
    borderRadius: "26px",
    padding: "18px",
  },
  noticeTitle: {
    margin: 0,
    fontSize: "16px",
    fontWeight: 950,
    color: "#9a3412",
  },
  noticeText: {
    margin: "6px 0 0",
    fontSize: "13px",
    color: "#9a3412",
    lineHeight: 1.45,
    fontWeight: 700,
  },
};

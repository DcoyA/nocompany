"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import { regions } from "../../lib/data";
import AppHeader from "../../components/AppHeader";
import BottomNav from "../../components/BottomNav";

export default function RankingsPage() {
  const [records, setRecords] = useState([]);

  const fetchRankings = async () => {
    const { data, error } = await supabase
      .from("moods")
      .select("score, region, created_at")
      .not("region", "is", null)
      .order("created_at", { ascending: false })
      .limit(3000);

    if (error) {
      console.error("지역 순위 조회 실패:", error);
      return;
    }

    setRecords(data || []);
  };

  useEffect(() => {
    fetchRankings();
  }, []);

  const ranking = useMemo(() => {
    const grouped = {};

    records.forEach((item) => {
      if (!item.region) return;

      if (!grouped[item.region]) {
        grouped[item.region] = {
          name: item.region,
          total: 0,
          count: 0,
        };
      }

      grouped[item.region].total += item.score;
      grouped[item.region].count += 1;
    });

    return Object.values(grouped)
      .map((item) => ({
        name: item.name,
        score: Math.round(item.total / item.count),
        count: item.count,
      }))
      .sort((a, b) => b.score - a.score);
  }, [records]);

  const displayRanking = ranking.length > 0 ? ranking : regions;

  const getStatus = (score) => {
    if (score >= 90) return "멘탈 붕괴";
    if (score >= 80) return "퇴사욕구 위험";
    if (score >= 70) return "상당히 높음";
    if (score >= 60) return "보통";
    return "아직 괜찮음";
  };

  const getEmoji = (score) => {
    if (score >= 90) return "🤮";
    if (score >= 80) return "😭";
    if (score >= 70) return "😐";
    if (score >= 60) return "🙂";
    return "😀";
  };

  const getColor = (score) => {
    if (score >= 90) return "#ef4444";
    if (score >= 80) return "#fb7185";
    if (score >= 70) return "#f97316";
    if (score >= 60) return "#f59e0b";
    return "#22c55e";
  };

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
            투표 시 선택한 지역을 기준으로 평균 퇴사욕구 점수를 계산합니다.
          </p>
        </section>

        <section style={styles.summaryCard}>
          <div>
            <p style={styles.summaryLabel}>집계 지역</p>
            <strong style={styles.summaryValue}>{ranking.length || regions.length}곳</strong>
          </div>
          <div>
            <p style={styles.summaryLabel}>지역 투표 수</p>
            <strong style={styles.summaryValue}>{records.length.toLocaleString()}건</strong>
          </div>
        </section>

        <section style={styles.rankCard}>
          {displayRanking.map((region, index) => {
            const score = region.score;
            const color = getColor(score);

            return (
              <div key={region.name} style={styles.rankItem}>
                <div style={styles.rankLeft}>
                  <span style={index === 0 ? styles.rankNoTop : styles.rankNo}>
                    {index + 1}
                  </span>

                  <span style={styles.rankEmoji}>{region.emoji || getEmoji(score)}</span>

                  <div>
                    <strong style={styles.rankName}>{region.name}</strong>
                    <p style={styles.rankSub}>
                      {getStatus(score)}
                      {region.count ? ` · ${region.count}명 참여` : ""}
                    </p>
                  </div>
                </div>

                <div style={styles.rankRight}>
                  <strong style={{ ...styles.rankScore, color }}>
                    {score}점
                  </strong>
                  <div style={styles.rankBarTrack}>
                    <div
                      style={{
                        ...styles.rankBar,
                        width: `${score}%`,
                        background: color,
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        <section style={styles.noticeCard}>
          <h2 style={styles.noticeTitle}>참고</h2>
          <p style={styles.noticeText}>
            기존에 지역 없이 저장된 투표는 지역 순위 계산에서 제외됩니다. 지금부터 새로 저장되는 투표부터 지역 순위에 반영됩니다.
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
  summaryCard: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
    marginBottom: "14px",
  },
  summaryLabel: {
    margin: 0,
    color: "#64748b",
    fontSize: "12px",
    fontWeight: 900,
  },
  summaryValue: {
    display: "block",
    marginTop: "4px",
    fontSize: "24px",
    fontWeight: 950,
    color: "#111827",
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

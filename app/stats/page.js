"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import { moods } from "../../lib/data";
import AppHeader from "../../components/AppHeader";
import BottomNav from "../../components/BottomNav";

export default function StatsPage() {
  const [todayRecords, setTodayRecords] = useState([]);
  const [yesterdayRecords, setYesterdayRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const { data: todayData, error: todayError } = await supabase
      .from("moods")
      .select("score, region, created_at")
      .gte("created_at", today.toISOString())
      .lt("created_at", tomorrow.toISOString())
      .order("created_at", { ascending: false });

    const { data: yesterdayData, error: yesterdayError } = await supabase
      .from("moods")
      .select("score, region, created_at")
      .gte("created_at", yesterday.toISOString())
      .lt("created_at", today.toISOString())
      .order("created_at", { ascending: false });

    if (todayError) console.error("오늘 통계 조회 실패:", todayError);
    if (yesterdayError) console.error("어제 통계 조회 실패:", yesterdayError);

    setTodayRecords(todayData || []);
    setYesterdayRecords(yesterdayData || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const todayAverage = useMemo(() => {
    if (todayRecords.length === 0) return null;
    const total = todayRecords.reduce((sum, item) => sum + item.score, 0);
    return Math.round(total / todayRecords.length);
  }, [todayRecords]);

  const yesterdayAverage = useMemo(() => {
    if (yesterdayRecords.length === 0) return null;
    const total = yesterdayRecords.reduce((sum, item) => sum + item.score, 0);
    return Math.round(total / yesterdayRecords.length);
  }, [yesterdayRecords]);

  const diff = useMemo(() => {
    if (todayAverage === null || yesterdayAverage === null) return null;
    return todayAverage - yesterdayAverage;
  }, [todayAverage, yesterdayAverage]);

  const distribution = useMemo(() => {
    return moods.map((mood) => {
      const count = todayRecords.filter((item) => item.score === mood.score).length;
      const percent =
        todayRecords.length === 0
          ? 0
          : Math.round((count / todayRecords.length) * 100);

      return {
        ...mood,
        count,
        percent,
      };
    });
  }, [todayRecords]);

  const regionRanking = useMemo(() => {
    const grouped = {};

    todayRecords.forEach((item) => {
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
  }, [todayRecords]);

  const hottestRegion = regionRanking[0] || null;

  const mostVotedRegion = useMemo(() => {
    if (regionRanking.length === 0) return null;
    return [...regionRanking].sort((a, b) => b.count - a.count)[0];
  }, [regionRanking]);

  const getMoodText = (score) => {
    if (score === null) return "아직 데이터가 부족합니다";
    if (score >= 90) return "전국 직장인 멘탈 붕괴 직전";
    if (score >= 75) return "오늘 다들 회사 가기 싫은 날";
    if (score >= 55) return "그럭저럭 버티는 중";
    if (score >= 35) return "아직은 출근 가능";
    return "이 정도면 회사 체질";
  };

  const getDiffText = () => {
    if (diff === null) return "어제 데이터 부족";
    if (diff > 0) return `어제보다 +${diff}점`;
    if (diff < 0) return `어제보다 ${diff}점`;
    return "어제와 동일";
  };

  const getDiffColor = () => {
    if (diff === null) return "#64748b";
    if (diff > 0) return "#ef4444";
    if (diff < 0) return "#22c55e";
    return "#64748b";
  };

  return (
    <main style={styles.page}>
      <div style={styles.phone}>
        <AppHeader title="통계" showBack />

        <section style={styles.introCard}>
          <p style={styles.kicker}>TODAY STATS</p>
          <h1 style={styles.title}>
            오늘 직장인들은
            <br />
            얼마나 회사가기 싫을까?
          </h1>
          <p style={styles.desc}>
            오늘 00시 이후 투표만 기준으로 집계합니다.
          </p>
        </section>

        <section style={styles.mainStatCard}>
          <p style={styles.statLabel}>오늘 회사가기 싫음 지수</p>

          <div style={styles.scoreRow}>
            <strong style={styles.bigScore}>
              {todayAverage === null ? "--" : todayAverage}
              <span>점</span>
            </strong>

            <div style={styles.diffBox}>
              <span style={{ ...styles.diffText, color: getDiffColor() }}>
                {getDiffText()}
              </span>
            </div>
          </div>

          <p style={styles.moodText}>{getMoodText(todayAverage)}</p>

          {loading && <p style={styles.loadingText}>통계 불러오는 중...</p>}
        </section>

        <section style={styles.summaryGrid}>
          <div style={styles.summaryCard}>
            <p style={styles.summaryLabel}>오늘 참여자</p>
            <strong style={styles.summaryValue}>
              {todayRecords.length.toLocaleString()}명
            </strong>
          </div>

          <div style={styles.summaryCard}>
            <p style={styles.summaryLabel}>어제 참여자</p>
            <strong style={styles.summaryValue}>
              {yesterdayRecords.length.toLocaleString()}명
            </strong>
          </div>

          <div style={styles.summaryCard}>
            <p style={styles.summaryLabel}>퇴사욕구 1위</p>
            <strong style={styles.summaryValue}>
              {hottestRegion ? hottestRegion.name : "-"}
            </strong>
          </div>

          <div style={styles.summaryCard}>
            <p style={styles.summaryLabel}>최다 참여 지역</p>
            <strong style={styles.summaryValue}>
              {mostVotedRegion ? mostVotedRegion.name : "-"}
            </strong>
          </div>
        </section>

        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>감정 분포</h2>
          <p style={styles.sectionSub}>오늘 투표한 사람들의 상태 비율</p>

          <div style={styles.distributionList}>
            {distribution.map((item) => (
              <div key={item.score} style={styles.distRow}>
                <div style={styles.distLeft}>
                  <span style={{ ...styles.distEmoji, background: item.bg }}>
                    {item.emoji}
                  </span>
                  <div>
                    <strong style={styles.distName}>{item.label}</strong>
                    <p style={styles.distCount}>{item.count}명</p>
                  </div>
                </div>

                <div style={styles.distRight}>
                  <strong style={styles.distPercent}>{item.percent}%</strong>
                  <div style={styles.barTrack}>
                    <div
                      style={{
                        ...styles.bar,
                        width: `${item.percent}%`,
                        background: item.color,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>지역 통계 TOP 5</h2>
          <p style={styles.sectionSub}>오늘 지역별 평균 퇴사욕구</p>

          {regionRanking.length === 0 ? (
            <div style={styles.emptyBox}>
              아직 지역 데이터가 없습니다.
              <br />
              홈에서 지역을 선택하고 투표하면 여기에 표시됩니다.
            </div>
          ) : (
            <div style={styles.rankList}>
              {regionRanking.slice(0, 5).map((region, index) => {
                const color =
                  region.score >= 90
                    ? "#ef4444"
                    : region.score >= 80
                    ? "#fb7185"
                    : region.score >= 70
                    ? "#f97316"
                    : "#84cc16";

                return (
                  <div key={region.name} style={styles.rankItem}>
                    <div style={styles.rankLeft}>
                      <span style={index === 0 ? styles.rankNoTop : styles.rankNo}>
                        {index + 1}
                      </span>

                      <div>
                        <strong style={styles.rankName}>{region.name}</strong>
                        <p style={styles.rankSub}>{region.count}명 참여</p>
                      </div>
                    </div>

                    <div style={styles.rankRight}>
                      <strong style={{ ...styles.rankScore, color }}>
                        {region.score}점
                      </strong>
                      <div style={styles.barTrack}>
                        <div
                          style={{
                            ...styles.bar,
                            width: `${region.score}%`,
                            background: color,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <BottomNav active="stats" />
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
  mainStatCard: {
    background: "#ffffff",
    borderRadius: "30px",
    padding: "24px",
    marginBottom: "14px",
    boxShadow: "0 18px 46px rgba(15, 23, 42, 0.09)",
  },
  statLabel: {
    margin: 0,
    color: "#64748b",
    fontSize: "14px",
    fontWeight: 900,
  },
  scoreRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    marginTop: "8px",
  },
  bigScore: {
    fontSize: "58px",
    lineHeight: 1,
    letterSpacing: "-0.08em",
    color: "#f43f5e",
  },
  diffBox: {
    padding: "10px 12px",
    borderRadius: "16px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
  },
  diffText: {
    fontSize: "13px",
    fontWeight: 950,
  },
  moodText: {
    margin: "10px 0 0",
    fontSize: "16px",
    fontWeight: 950,
  },
  loadingText: {
    margin: "8px 0 0",
    color: "#64748b",
    fontSize: "12px",
    fontWeight: 800,
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
    marginBottom: "14px",
  },
  summaryCard: {
    background: "#ffffff",
    borderRadius: "24px",
    padding: "17px",
    boxShadow: "0 12px 34px rgba(15, 23, 42, 0.07)",
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
    fontSize: "22px",
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
    fontSize: "19px",
    fontWeight: 950,
    letterSpacing: "-0.04em",
  },
  sectionSub: {
    margin: "5px 0 16px",
    fontSize: "12px",
    color: "#64748b",
    fontWeight: 700,
  },
  distributionList: {
    display: "grid",
    gap: "13px",
  },
  distRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
  },
  distLeft: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    minWidth: "135px",
  },
  distEmoji: {
    width: "42px",
    height: "42px",
    borderRadius: "15px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "23px",
  },
  distName: {
    display: "block",
    fontSize: "14px",
    fontWeight: 950,
  },
  distCount: {
    margin: "2px 0 0",
    color: "#64748b",
    fontSize: "12px",
    fontWeight: 700,
  },
  distRight: {
    flex: 1,
    textAlign: "right",
  },
  distPercent: {
    display: "block",
    fontSize: "14px",
    fontWeight: 950,
    marginBottom: "5px",
  },
  barTrack: {
    width: "100%",
    height: "9px",
    background: "#e5e7eb",
    borderRadius: "999px",
    overflow: "hidden",
  },
  bar: {
    height: "100%",
    borderRadius: "999px",
  },
  rankList: {
    display: "grid",
    gap: "13px",
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
    gap: "10px",
    minWidth: "130px",
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
  rankName: {
    display: "block",
    fontSize: "15px",
    fontWeight: 950,
  },
  rankSub: {
    margin: "2px 0 0",
    color: "#64748b",
    fontSize: "12px",
    fontWeight: 700,
  },
  rankRight: {
    flex: 1,
    textAlign: "right",
  },
  rankScore: {
    display: "block",
    fontSize: "16px",
    fontWeight: 950,
    marginBottom: "5px",
  },
  emptyBox: {
    padding: "18px",
    borderRadius: "20px",
    background: "#f8fafc",
    color: "#64748b",
    textAlign: "center",
    fontSize: "13px",
    fontWeight: 800,
    lineHeight: 1.55,
  },
};

"use client";

import { useMemo, useState } from "react";
import AppHeader from "../../components/AppHeader";
import BottomNav from "../../components/BottomNav";

export default function SimulatorPage() {
  const [salary, setSalary] = useState(0);
  const [cash, setCash] = useState(0);
  const [livingCost, setLivingCost] = useState(0);
  const [debtCost, setDebtCost] = useState(0);

  const result = useMemo(() => {
    const monthlyCost = Number(livingCost || 0) + Number(debtCost || 0);
    const runwayMonths = monthlyCost > 0 ? Number(cash || 0) / monthlyCost : 0;
    const fullMonths = Math.floor(runwayMonths);
    const remainDays = Math.floor((runwayMonths - fullMonths) * 30);
    const totalDays = Math.floor(runwayMonths * 30);
    const reducedCost = Math.round(monthlyCost * 0.9);
    const reducedMonths = reducedCost > 0 ? Number(cash || 0) / reducedCost : 0;
    const extraDays = Math.max(0, Math.floor((reducedMonths - runwayMonths) * 30));
    const spendingRatio = salary > 0 ? Math.round((monthlyCost / salary) * 100) : 0;

    return {
      monthlyCost,
      runwayMonths,
      fullMonths,
      remainDays,
      totalDays,
      extraDays,
      spendingRatio,
    };
  }, [salary, cash, livingCost, debtCost]);

  const formatWon = (value) => {
    return Number(value || 0).toLocaleString();
  };

  const goScout = () => {
    window.open("https://hellomedia.win", "_blank", "noopener,noreferrer");
  };

  return (
    <main style={styles.page}>
      <div style={styles.phone}>
        <AppHeader title="퇴사 시뮬레이터" showBack />

        <section style={styles.introCard}>
          <p style={styles.kicker}>NO COMPANY CALCULATOR</p>
          <h1 style={styles.title}>
            지금 퇴사하면
            <br />
            몇 개월 버틸까?
          </h1>
          <p style={styles.desc}>
            현재 현금과 월 고정지출을 기준으로, 월급이 끊긴 뒤 버틸 수 있는 기간을 계산합니다.
          </p>
        </section>

        <section style={styles.inputCard}>
          <h2 style={styles.inputTitle}>현재 상황을 입력해주세요</h2>

          <MoneyInput label="월급 (세후)" value={salary} onChange={setSalary} />
          <MoneyInput label="현재 보유 현금" value={cash} onChange={setCash} />
          <MoneyInput label="월 평균 생활비" value={livingCost} onChange={setLivingCost} />
          <MoneyInput label="대출 / 카드값 (월)" value={debtCost} onChange={setDebtCost} />
        </section>

        <section style={styles.resultPanel}>
          <p style={styles.resultSmall}>당신의 퇴사 가능 기간</p>

          <div style={styles.runwayResult}>
            <span style={styles.partyEmoji}>🎉</span>
            <strong style={styles.runwayMonths}>
              {result.fullMonths}
              <span>개월</span>
            </strong>
            <strong style={styles.runwayDays}>
              {result.remainDays}
              <span>일</span>
            </strong>
          </div>

          <p style={styles.totalDaysText}>
            총 {result.totalDays.toLocaleString()}일 동안 버틸 수 있어요.
          </p>

          <div style={styles.summaryBox}>
            <div style={styles.summaryItem}>
              <p>월 고정지출</p>
              <strong>{formatWon(result.monthlyCost)}원</strong>
            </div>
            <div style={styles.summaryItem}>
              <p>월급 대비 지출</p>
              <strong>{result.spendingRatio}%</strong>
            </div>
          </div>

          <div style={styles.tipBox}>
            <strong>TIP.</strong>
            <p>
              월 생활비를 10% 줄이면 약 {result.extraDays.toLocaleString()}일 더 버틸 수 있어요.
            </p>
          </div>
        </section>

        <section style={styles.scoutCard}>
          <p style={styles.scoutTitle}>퇴사보다 먼저 현금흐름부터</p>
          <p style={styles.scoutText}>
            배당주, ETF, 우량주 후보를 비교해보고 싶다면 우량주 스카우터에서 확인해보세요.
          </p>
          <button type="button" onClick={goScout} style={styles.scoutButton}>
            우량주 스카우터 보기
          </button>
        </section>

        <BottomNav active="simulator" />
      </div>
    </main>
  );
}

function MoneyInput({ label, value, onChange }) {
  const formatNumber = (number) => {
    if (number === null || number === undefined || number === "") return "";
    return Number(number).toLocaleString();
  };

  const parseNumber = (text) => {
    const onlyNumber = text.replace(/[^0-9]/g, "");
    return Number(onlyNumber || 0);
  };

  return (
    <label style={styles.inputRow}>
      <span style={styles.inputLabel}>{label}</span>

      <div style={styles.inputBox}>
        <input
          type="text"
          inputMode="numeric"
          value={formatNumber(value)}
          onChange={(event) => onChange(parseNumber(event.target.value))}
          style={styles.input}
        />
        <span style={styles.won}>원</span>
      </div>
    </label>
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
  inputCard: {
    background: "#ffffff",
    borderRadius: "28px",
    padding: "20px",
    marginBottom: "14px",
    boxShadow: "0 18px 46px rgba(15, 23, 42, 0.09)",
  },
  inputTitle: {
    margin: "0 0 14px",
    fontSize: "18px",
    fontWeight: 950,
    letterSpacing: "-0.04em",
  },
  inputRow: {
    display: "block",
    padding: "14px 0",
    borderBottom: "1px solid #eef2f7",
  },
  inputLabel: {
    display: "block",
    fontSize: "13px",
    color: "#64748b",
    fontWeight: 900,
    marginBottom: "8px",
  },
  inputBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  input: {
    flex: 1,
    width: "100%",
    border: "0",
    outline: "none",
    fontSize: "22px",
    fontWeight: 950,
    color: "#111827",
    background: "transparent",
  },
  won: {
    fontSize: "14px",
    color: "#64748b",
    fontWeight: 900,
  },
  resultPanel: {
    background: "#ffffff",
    borderRadius: "30px",
    padding: "24px",
    marginBottom: "14px",
    boxShadow: "0 18px 46px rgba(15, 23, 42, 0.09)",
    textAlign: "center",
  },
  resultSmall: {
    margin: 0,
    fontSize: "14px",
    color: "#64748b",
    fontWeight: 900,
  },
  runwayResult: {
    marginTop: "8px",
    display: "flex",
    alignItems: "baseline",
    justifyContent: "center",
    gap: "8px",
  },
  partyEmoji: {
    fontSize: "24px",
  },
  runwayMonths: {
    fontSize: "48px",
    color: "#111827",
    letterSpacing: "-0.08em",
  },
  runwayDays: {
    fontSize: "28px",
    color: "#111827",
    letterSpacing: "-0.06em",
  },
  totalDaysText: {
    margin: "6px 0 0",
    color: "#64748b",
    fontSize: "13px",
    fontWeight: 800,
  },
  summaryBox: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
    marginTop: "18px",
  },
  summaryItem: {
    background: "#f8fafc",
    borderRadius: "18px",
    padding: "14px",
  },
  tipBox: {
    marginTop: "16px",
    padding: "14px",
    borderRadius: "20px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    textAlign: "left",
  },
  scoutCard: {
    background: "#fff7ed",
    border: "1px solid #fed7aa",
    borderRadius: "26px",
    padding: "18px",
    marginBottom: "18px",
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
};

"use client";

export default function AppHeader({ title = "회사가기 싫을지도", subtitle = "실시간 대한민국 직장인 현황", showBack = false }) {
  const goBack = () => {
    window.location.href = "/";
  };

  return (
    <header style={styles.header}>
      {showBack ? (
        <button type="button" onClick={goBack} style={styles.backButton}>
          ‹
        </button>
      ) : (
        <div style={styles.brand}>
          <div style={styles.logo}>🚨</div>
          <div>
            <div style={styles.appName}>{title}</div>
            <div style={styles.appSub}>{subtitle}</div>
          </div>
        </div>
      )}

      {showBack ? (
        <>
          <div style={styles.headerTitle}>{title}</div>
          <div style={styles.headerSpace} />
        </>
      ) : (
        <button type="button" style={styles.iconButton}>
          🔔
        </button>
      )}
    </header>
  );
}

const styles = {
  header: {
    height: "58px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "12px",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  logo: {
    width: "38px",
    height: "38px",
    borderRadius: "14px",
    background: "#111827",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 10px 24px rgba(15, 23, 42, 0.22)",
  },
  appName: {
    fontSize: "18px",
    fontWeight: 900,
    letterSpacing: "-0.04em",
  },
  appSub: {
    marginTop: "2px",
    fontSize: "12px",
    color: "#64748b",
    fontWeight: 700,
  },
  iconButton: {
    width: "38px",
    height: "38px",
    borderRadius: "14px",
    border: "1px solid #e5e7eb",
    background: "rgba(255,255,255,0.8)",
    boxShadow: "0 8px 20px rgba(15, 23, 42, 0.08)",
    cursor: "pointer",
  },
  backButton: {
    width: "38px",
    height: "38px",
    borderRadius: "14px",
    border: "1px solid #e5e7eb",
    background: "#ffffff",
    fontSize: "31px",
    lineHeight: 1,
    cursor: "pointer",
  },
  headerTitle: {
    fontSize: "17px",
    fontWeight: 950,
  },
  headerSpace: {
    width: "38px",
  },
};

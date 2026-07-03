"use client";

export default function BottomNav({ active = "home" }) {
  const items = [
    { key: "home", label: "홈", icon: "⌂", href: "/" },
    { key: "rankings", label: "지역순위", icon: "◎", href: "/rankings" },
    { key: "simulator", label: "퇴사", icon: "▣", href: "/simulator" },
    { key: "stats", label: "통계", icon: "▥", href: "/stats" },
    { key: "my", label: "마이", icon: "○", href: "/my" },
  ];

  return (
    <nav style={styles.bottomNav}>
      {items.map((item) => {
        const isActive = active === item.key;

        return (
          <button
            key={item.key}
            type="button"
            onClick={() => {
              window.location.href = item.href;
            }}
            style={isActive ? styles.navItemActive : styles.navItem}
          >
            <span>{item.icon}</span>
            <small>{item.label}</small>
          </button>
        );
      })}
    </nav>
  );
}

const styles = {
  bottomNav: {
    position: "fixed",
    left: "50%",
    bottom: "14px",
    transform: "translateX(-50%)",
    width: "calc(100% - 28px)",
    maxWidth: "430px",
    height: "64px",
    borderRadius: "24px",
    background: "rgba(255,255,255,0.92)",
    border: "1px solid rgba(226,232,240,0.9)",
    boxShadow: "0 18px 50px rgba(15, 23, 42, 0.18)",
    backdropFilter: "blur(16px)",
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)",
    padding: "7px",
    zIndex: 50,
  },
  navItem: {
    border: "0",
    background: "transparent",
    color: "#94a3b8",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "3px",
    fontWeight: 900,
    cursor: "pointer",
  },
  navItemActive: {
    border: "0",
    borderRadius: "18px",
    background: "#fff1f2",
    color: "#f43f5e",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "3px",
    fontWeight: 900,
    cursor: "pointer",
  },
};

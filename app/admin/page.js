"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function AdminPage() {
  const [accessKey, setAccessKey] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [posts, setPosts] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("");

  const adminKey = process.env.NEXT_PUBLIC_ADMIN_KEY;

  useEffect(() => {
    const savedKey = localStorage.getItem("adminAccessKey");

    if (savedKey && adminKey && savedKey === adminKey) {
      setAuthorized(true);
      setAccessKey(savedKey);
      fetchPosts();
    }
  }, [adminKey]);

  const login = () => {
    if (!adminKey) {
      alert("Vercel 환경변수 NEXT_PUBLIC_ADMIN_KEY가 없습니다.");
      return;
    }

    if (accessKey !== adminKey) {
      alert("관리자 키가 올바르지 않습니다.");
      return;
    }

    localStorage.setItem("adminAccessKey", accessKey);
    setAuthorized(true);
    fetchPosts();
  };

  const logout = () => {
    localStorage.removeItem("adminAccessKey");
    setAuthorized(false);
    setAccessKey("");
  };

  const fetchPosts = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("posts")
      .select("id, content, region, anonymous_id, likes, report_count, is_hidden, created_at")
      .order("created_at", { ascending: false })
      .limit(300);

    setLoading(false);

    if (error) {
      alert("게시글 조회 실패");
      console.error("게시글 조회 실패:", error);
      return;
    }

    setPosts(data || []);
  };

  const hidePost = async (post) => {
    const { error } = await supabase
      .from("posts")
      .update({ is_hidden: true })
      .eq("id", post.id);

    if (error) {
      alert("숨김 처리 실패");
      console.error(error);
      return;
    }

    setPosts((prev) =>
      prev.map((item) =>
        item.id === post.id ? { ...item, is_hidden: true } : item
      )
    );
  };

  const unhidePost = async (post) => {
    const { error } = await supabase
      .from("posts")
      .update({ is_hidden: false, report_count: 0 })
      .eq("id", post.id);

    if (error) {
      alert("복구 실패");
      console.error(error);
      return;
    }

    setPosts((prev) =>
      prev.map((item) =>
        item.id === post.id
          ? { ...item, is_hidden: false, report_count: 0 }
          : item
      )
    );
  };

  const deletePost = async (post) => {
    const ok = confirm("이 게시글을 영구 삭제할까요? 복구할 수 없습니다.");

    if (!ok) return;

    const { error } = await supabase
      .from("posts")
      .delete()
      .eq("id", post.id);

    if (error) {
      alert("삭제 실패");
      console.error(error);
      return;
    }

    setPosts((prev) => prev.filter((item) => item.id !== post.id));
  };

  const resetReport = async (post) => {
    const { error } = await supabase
      .from("posts")
      .update({ report_count: 0 })
      .eq("id", post.id);

    if (error) {
      alert("신고 초기화 실패");
      console.error(error);
      return;
    }

    setPosts((prev) =>
      prev.map((item) =>
        item.id === post.id ? { ...item, report_count: 0 } : item
      )
    );
  };

  const banUser = async (post) => {
    if (!post.anonymous_id) {
      alert("익명ID가 없습니다.");
      return;
    }

    const reason = prompt("차단 사유를 입력하세요.", "운영정책 위반");

    if (reason === null) return;

    const { error } = await supabase
      .from("banned_users")
      .upsert({
        anonymous_id: post.anonymous_id,
        reason: reason || "운영정책 위반",
      }, {
        onConflict: "anonymous_id",
      });

    if (error) {
      alert("사용자 차단 실패");
      console.error(error);
      return;
    }

    const hideAll = confirm("이 사용자의 기존 게시글도 모두 숨김 처리할까요?");

    if (hideAll) {
      const { error: hideError } = await supabase
        .from("posts")
        .update({ is_hidden: true })
        .eq("anonymous_id", post.anonymous_id);

      if (hideError) {
        alert("사용자 글 숨김 처리 실패");
        console.error(hideError);
        return;
      }

      setPosts((prev) =>
        prev.map((item) =>
          item.anonymous_id === post.anonymous_id
            ? { ...item, is_hidden: true }
            : item
        )
      );
    }

    alert("익명 사용자를 차단 목록에 추가했습니다.");
  };

  const copyContent = async (post) => {
    try {
      await navigator.clipboard.writeText(post.content);
      alert("게시글 내용을 복사했습니다.");
    } catch (error) {
      alert("복사 실패");
    }
  };

  const filteredPosts = useMemo(() => {
    let result = posts;

    if (filter === "reported") {
      result = result.filter((post) => Number(post.report_count || 0) > 0);
    }

    if (filter === "hidden") {
      result = result.filter((post) => post.is_hidden);
    }

    if (filter === "visible") {
      result = result.filter((post) => !post.is_hidden);
    }

    if (keyword.trim()) {
      const q = keyword.trim().toLowerCase();

      result = result.filter((post) => {
        const content = String(post.content || "").toLowerCase();
        const region = String(post.region || "").toLowerCase();
        const anonymousId = String(post.anonymous_id || "").toLowerCase();

        return (
          content.includes(q) ||
          region.includes(q) ||
          anonymousId.includes(q)
        );
      });
    }

    return result;
  }, [posts, filter, keyword]);

  const stats = useMemo(() => {
    const total = posts.length;
    const hidden = posts.filter((post) => post.is_hidden).length;
    const reported = posts.filter((post) => Number(post.report_count || 0) > 0).length;
    const visible = posts.filter((post) => !post.is_hidden).length;

    return {
      total,
      hidden,
      reported,
      visible,
    };
  }, [posts]);

  const getTimeText = (dateString) => {
    const created = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - created.getTime();
    const diffMin = Math.floor(diffMs / 60000);

    if (diffMin < 1) return "방금 전";
    if (diffMin < 60) return `${diffMin}분 전`;

    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour}시간 전`;

    const diffDay = Math.floor(diffHour / 24);
    return `${diffDay}일 전`;
  };

  if (!authorized) {
    return (
      <main style={styles.page}>
        <section style={styles.loginCard}>
          <div style={styles.adminBadge}>ADMIN</div>

          <h1 style={styles.loginTitle}>관리자 로그인</h1>

          <p style={styles.loginDesc}>
            퇴근방 게시글 신고, 숨김, 삭제를 관리하는 페이지입니다.
          </p>

          <input
            type="password"
            value={accessKey}
            onChange={(event) => setAccessKey(event.target.value)}
            placeholder="관리자 키 입력"
            style={styles.loginInput}
          />

          <button type="button" onClick={login} style={styles.loginButton}>
            관리자 입장
          </button>

          <button
            type="button"
            onClick={() => {
              window.location.href = "/";
            }}
            style={styles.homeButton}
          >
            홈으로 돌아가기
          </button>
        </section>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <div style={styles.adminWrap}>
        <header style={styles.header}>
          <div>
            <div style={styles.adminBadge}>ADMIN</div>
            <h1 style={styles.title}>퇴근방 관리자</h1>
            <p style={styles.subtitle}>
              신고글 확인, 숨김 처리, 삭제, 익명ID 차단을 관리합니다.
            </p>
          </div>

          <div style={styles.headerActions}>
            <button type="button" onClick={fetchPosts} style={styles.refreshButton}>
              새로고침
            </button>

            <button type="button" onClick={logout} style={styles.logoutButton}>
              로그아웃
            </button>
          </div>
        </header>

        <section style={styles.statGrid}>
          <div style={styles.statCard}>
            <p>전체</p>
            <strong>{stats.total}</strong>
          </div>

          <div style={styles.statCard}>
            <p>노출중</p>
            <strong>{stats.visible}</strong>
          </div>

          <div style={styles.statCard}>
            <p>신고됨</p>
            <strong>{stats.reported}</strong>
          </div>

          <div style={styles.statCard}>
            <p>숨김</p>
            <strong>{stats.hidden}</strong>
          </div>
        </section>

        <section style={styles.controlCard}>
          <div style={styles.filterRow}>
            <button
              type="button"
              onClick={() => setFilter("all")}
              style={filter === "all" ? styles.filterActive : styles.filterButton}
            >
              전체
            </button>

            <button
              type="button"
              onClick={() => setFilter("reported")}
              style={filter === "reported" ? styles.filterActive : styles.filterButton}
            >
              신고글
            </button>

            <button
              type="button"
              onClick={() => setFilter("visible")}
              style={filter === "visible" ? styles.filterActive : styles.filterButton}
            >
              노출중
            </button>

            <button
              type="button"
              onClick={() => setFilter("hidden")}
              style={filter === "hidden" ? styles.filterActive : styles.filterButton}
            >
              숨김
            </button>
          </div>

          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="내용, 지역, 익명ID 검색"
            style={styles.searchInput}
          />
        </section>

        <section style={styles.listCard}>
          <div style={styles.listHeader}>
            <h2 style={styles.sectionTitle}>게시글 목록</h2>
            <p style={styles.listCount}>
              {loading ? "불러오는 중..." : `${filteredPosts.length}개 표시`}
            </p>
          </div>

          {filteredPosts.length === 0 ? (
            <div style={styles.emptyBox}>
              표시할 게시글이 없습니다.
            </div>
          ) : (
            <div style={styles.postList}>
              {filteredPosts.map((post) => (
                <article
                  key={post.id}
                  style={{
                    ...styles.postItem,
                    opacity: post.is_hidden ? 0.55 : 1,
                  }}
                >
                  <div style={styles.postTop}>
                    <div style={styles.postMeta}>
                      <span style={styles.writer}>
                        {post.anonymous_id
                          ? post.anonymous_id.replace("worker_", "익명직장인 ")
                          : "익명직장인"}
                      </span>
                      <span style={styles.dot}>·</span>
                      <span>{post.region || "기타"}</span>
                      <span style={styles.dot}>·</span>
                      <span>{getTimeText(post.created_at)}</span>
                    </div>

                    <div style={styles.statusBadges}>
                      {post.is_hidden && (
                        <span style={styles.hiddenBadge}>숨김</span>
                      )}

                      {Number(post.report_count || 0) > 0 && (
                        <span style={styles.reportBadge}>
                          신고 {post.report_count}
                        </span>
                      )}
                    </div>
                  </div>

                  <p style={styles.postContent}>{post.content}</p>

                  <div style={styles.postInfo}>
                    <span>좋아요 {Number(post.likes || 0).toLocaleString()}</span>
                    <span>ID: {post.anonymous_id || "-"}</span>
                    <span>글번호: {post.id}</span>
                  </div>

                  <div style={styles.actionRow}>
                    {!post.is_hidden ? (
                      <button
                        type="button"
                        onClick={() => hidePost(post)}
                        style={styles.warnButton}
                      >
                        숨김
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => unhidePost(post)}
                        style={styles.okButton}
                      >
                        복구
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => resetReport(post)}
                      style={styles.grayButton}
                    >
                      신고초기화
                    </button>

                    <button
                      type="button"
                      onClick={() => banUser(post)}
                      style={styles.darkButton}
                    >
                      작성자차단
                    </button>

                    <button
                      type="button"
                      onClick={() => copyContent(post)}
                      style={styles.grayButton}
                    >
                      복사
                    </button>

                    <button
                      type="button"
                      onClick={() => deletePost(post)}
                      style={styles.dangerButton}
                    >
                      삭제
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
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
  loginCard: {
    width: "100%",
    maxWidth: "420px",
    alignSelf: "center",
    background: "#ffffff",
    borderRadius: "30px",
    padding: "28px",
    boxShadow: "0 24px 70px rgba(15, 23, 42, 0.14)",
  },
  adminBadge: {
    display: "inline-block",
    padding: "7px 11px",
    borderRadius: "999px",
    background: "#111827",
    color: "#ffffff",
    fontSize: "12px",
    fontWeight: 950,
    letterSpacing: "0.08em",
  },
  loginTitle: {
    margin: "16px 0 0",
    fontSize: "30px",
    letterSpacing: "-0.06em",
  },
  loginDesc: {
    margin: "8px 0 18px",
    color: "#64748b",
    fontSize: "14px",
    lineHeight: 1.5,
    fontWeight: 700,
  },
  loginInput: {
    width: "100%",
    height: "52px",
    border: "1px solid #e2e8f0",
    borderRadius: "18px",
    padding: "0 15px",
    fontSize: "16px",
    fontWeight: 800,
    outline: "none",
    boxSizing: "border-box",
  },
  loginButton: {
    width: "100%",
    marginTop: "12px",
    border: "0",
    borderRadius: "18px",
    background: "#f43f5e",
    color: "#ffffff",
    padding: "15px",
    fontSize: "15px",
    fontWeight: 950,
    cursor: "pointer",
  },
  homeButton: {
    width: "100%",
    marginTop: "9px",
    border: "0",
    borderRadius: "18px",
    background: "#f1f5f9",
    color: "#64748b",
    padding: "13px",
    fontSize: "14px",
    fontWeight: 900,
    cursor: "pointer",
  },
  adminWrap: {
    width: "100%",
    maxWidth: "760px",
  },
  header: {
    background: "linear-gradient(135deg, #111827 0%, #1f2937 100%)",
    color: "#ffffff",
    borderRadius: "30px",
    padding: "24px",
    marginBottom: "14px",
    boxShadow: "0 20px 50px rgba(15, 23, 42, 0.22)",
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    alignItems: "flex-start",
  },
  title: {
    margin: "12px 0 0",
    fontSize: "32px",
    letterSpacing: "-0.06em",
  },
  subtitle: {
    margin: "8px 0 0",
    color: "#cbd5e1",
    fontSize: "14px",
    fontWeight: 700,
    lineHeight: 1.5,
  },
  headerActions: {
    display: "flex",
    gap: "8px",
    flexShrink: 0,
  },
  refreshButton: {
    border: "0",
    borderRadius: "999px",
    background: "#ffffff",
    color: "#111827",
    padding: "10px 12px",
    fontSize: "12px",
    fontWeight: 950,
    cursor: "pointer",
  },
  logoutButton: {
    border: "0",
    borderRadius: "999px",
    background: "#fb7185",
    color: "#ffffff",
    padding: "10px 12px",
    fontSize: "12px",
    fontWeight: 950,
    cursor: "pointer",
  },
  statGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "10px",
    marginBottom: "14px",
  },
  statCard: {
    background: "#ffffff",
    borderRadius: "24px",
    padding: "17px",
    boxShadow: "0 12px 34px rgba(15, 23, 42, 0.07)",
  },
  controlCard: {
    background: "#ffffff",
    borderRadius: "26px",
    padding: "16px",
    marginBottom: "14px",
    boxShadow: "0 14px 38px rgba(15, 23, 42, 0.08)",
  },
  filterRow: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    marginBottom: "12px",
  },
  filterButton: {
    border: "0",
    borderRadius: "999px",
    background: "#f1f5f9",
    color: "#64748b",
    padding: "10px 13px",
    fontSize: "13px",
    fontWeight: 900,
    cursor: "pointer",
  },
  filterActive: {
    border: "0",
    borderRadius: "999px",
    background: "#fff1f2",
    color: "#f43f5e",
    padding: "10px 13px",
    fontSize: "13px",
    fontWeight: 950,
    cursor: "pointer",
  },
  searchInput: {
    width: "100%",
    height: "46px",
    border: "1px solid #e2e8f0",
    outline: "none",
    borderRadius: "16px",
    padding: "0 14px",
    fontSize: "15px",
    fontWeight: 800,
    boxSizing: "border-box",
  },
  listCard: {
    background: "#ffffff",
    borderRadius: "28px",
    padding: "20px",
    boxShadow: "0 18px 46px rgba(15, 23, 42, 0.09)",
  },
  listHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "14px",
  },
  sectionTitle: {
    margin: 0,
    fontSize: "20px",
    fontWeight: 950,
    letterSpacing: "-0.04em",
  },
  listCount: {
    margin: 0,
    color: "#64748b",
    fontSize: "13px",
    fontWeight: 900,
  },
  emptyBox: {
    padding: "24px",
    borderRadius: "20px",
    background: "#f8fafc",
    color: "#64748b",
    textAlign: "center",
    fontSize: "14px",
    fontWeight: 800,
  },
  postList: {
    display: "grid",
    gap: "13px",
  },
  postItem: {
    padding: "16px",
    borderRadius: "22px",
    background: "#f8fafc",
    border: "1px solid #eef2f7",
  },
  postTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
    alignItems: "flex-start",
  },
  postMeta: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "5px",
    color: "#64748b",
    fontSize: "12px",
    fontWeight: 800,
  },
  writer: {
    color: "#f43f5e",
    fontWeight: 950,
  },
  dot: {
    color: "#cbd5e1",
  },
  statusBadges: {
    display: "flex",
    gap: "6px",
    flexShrink: 0,
  },
  hiddenBadge: {
    padding: "6px 8px",
    borderRadius: "999px",
    background: "#e5e7eb",
    color: "#64748b",
    fontSize: "11px",
    fontWeight: 950,
  },
  reportBadge: {
    padding: "6px 8px",
    borderRadius: "999px",
    background: "#fee2e2",
    color: "#ef4444",
    fontSize: "11px",
    fontWeight: 950,
  },
  postContent: {
    margin: "11px 0 12px",
    color: "#111827",
    fontSize: "15px",
    fontWeight: 800,
    lineHeight: 1.55,
    whiteSpace: "pre-wrap",
  },
  postInfo: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    color: "#94a3b8",
    fontSize: "11px",
    fontWeight: 800,
    marginBottom: "12px",
  },
  actionRow: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },
  warnButton: {
    border: "0",
    borderRadius: "999px",
    background: "#fff7ed",
    color: "#ea580c",
    padding: "9px 11px",
    fontSize: "12px",
    fontWeight: 950,
    cursor: "pointer",
  },
  okButton: {
    border: "0",
    borderRadius: "999px",
    background: "#dcfce7",
    color: "#15803d",
    padding: "9px 11px",
    fontSize: "12px",
    fontWeight: 950,
    cursor: "pointer",
  },
  grayButton: {
    border: "0",
    borderRadius: "999px",
    background: "#e5e7eb",
    color: "#475569",
    padding: "9px 11px",
    fontSize: "12px",
    fontWeight: 900,
    cursor: "pointer",
  },
  darkButton: {
    border: "0",
    borderRadius: "999px",
    background: "#111827",
    color: "#ffffff",
    padding: "9px 11px",
    fontSize: "12px",
    fontWeight: 900,
    cursor: "pointer",
  },
  dangerButton: {
    border: "0",
    borderRadius: "999px",
    background: "#ef4444",
    color: "#ffffff",
    padding: "9px 11px",
    fontSize: "12px",
    fontWeight: 950,
    cursor: "pointer",
  },
};

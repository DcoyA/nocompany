"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import AppHeader from "../../components/AppHeader";
import BottomNav from "../../components/BottomNav";

const regionOptions = [
  "판교",
  "여의도",
  "강남",
  "가산",
  "성수",
  "광화문",
  "마곡",
  "구로",
  "을지로",
  "잠실",
  "분당",
  "기타",
];

const placeholders = [
  "출근 10분 만에 퇴근하고 싶었다.",
  "회의가 짧게 끝난다는 말은 왜 항상 거짓말일까.",
  "오늘의 생존 팁 하나 남겨주세요.",
  "월급날까지 버티는 방법 공유합니다.",
];

export default function BoardPage() {
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState("");
  const [region, setRegion] = useState("판교");
  const [loading, setLoading] = useState(false);
  const [anonymousId, setAnonymousId] = useState("");

  const placeholder = useMemo(() => {
    return placeholders[Math.floor(Math.random() * placeholders.length)];
  }, []);

  useEffect(() => {
    let savedId = localStorage.getItem("anonymousUserId");

    if (!savedId) {
      savedId = `worker_${Math.floor(1000 + Math.random() * 9000)}`;
      localStorage.setItem("anonymousUserId", savedId);
    }

    setAnonymousId(savedId);
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from("posts")
      .select("id, content, region, anonymous_id, likes, report_count, created_at")
      .eq("is_hidden", false)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("게시글 조회 실패:", error);
      return;
    }

    setPosts(data || []);
  };

  const submitPost = async () => {
    const trimmed = content.trim();

    if (!trimmed) {
      alert("내용을 입력해주세요.");
      return;
    }

    if (trimmed.length > 120) {
      alert("퇴근방 글은 120자까지만 작성할 수 있습니다.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("posts").insert({
      content: trimmed,
      region,
      anonymous_id: anonymousId || "anonymous",
    });

    setLoading(false);

    if (error) {
      alert("글 작성에 실패했습니다. Supabase 설정을 확인해주세요.");
      console.error("글 작성 실패:", error);
      return;
    }

    setContent("");
    fetchPosts();
  };

  const likePost = async (post) => {
    const likedKey = `likedPost_${post.id}`;
    const alreadyLiked = localStorage.getItem(likedKey);

    if (alreadyLiked) {
      alert("이미 좋아요를 눌렀습니다.");
      return;
    }

    const nextLikes = Number(post.likes || 0) + 1;

    const { error } = await supabase
      .from("posts")
      .update({ likes: nextLikes })
      .eq("id", post.id);

    if (error) {
      alert("좋아요 처리에 실패했습니다.");
      console.error("좋아요 실패:", error);
      return;
    }

    localStorage.setItem(likedKey, "1");

    setPosts((prev) =>
      prev.map((item) =>
        item.id === post.id ? { ...item, likes: nextLikes } : item
      )
    );
  };

  const reportPost = async (post) => {
    const ok = confirm("이 글을 신고할까요?");

    if (!ok) return;

    const nextReportCount = Number(post.report_count || 0) + 1;
    const shouldHide = nextReportCount >= 3;

    const { error } = await supabase
      .from("posts")
      .update({
        report_count: nextReportCount,
        is_hidden: shouldHide,
      })
      .eq("id", post.id);

    if (error) {
      alert("신고 처리에 실패했습니다.");
      console.error("신고 실패:", error);
      return;
    }

    if (shouldHide) {
      setPosts((prev) => prev.filter((item) => item.id !== post.id));
      alert("신고가 누적되어 글이 숨김 처리되었습니다.");
      return;
    }

    alert("신고가 접수되었습니다.");
  };

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

  const remaining = 120 - content.length;

  return (
    <main style={styles.page}>
      <div style={styles.phone}>
        <AppHeader title="퇴근방" showBack />

        <section style={styles.introCard}>
          <p style={styles.kicker}>AFTER WORK ROOM</p>
          <h1 style={styles.title}>
            회사가기 싫은
            <br />
            사람들의 익명 쉼터
          </h1>
          <p style={styles.desc}>
            실명, 회사명, 특정인 비방 없이 짧게 털어놓는 공간입니다.
          </p>
        </section>

        <section style={styles.writeCard}>
          <div style={styles.writeHeader}>
            <div>
              <h2 style={styles.sectionTitle}>오늘의 한마디</h2>
              <p style={styles.sectionSub}>최대 120자 · 댓글 없음 · 좋아요만</p>
            </div>

            <span style={styles.anonymousBadge}>
              {anonymousId ? anonymousId.replace("worker_", "익명직장인 ") : "익명"}
            </span>
          </div>

          <div style={styles.regionWrap}>
            <label style={styles.regionLabel}>업무지역</label>
            <select
              value={region}
              onChange={(event) => setRegion(event.target.value)}
              style={styles.regionSelect}
            >
              {regionOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder={placeholder}
            maxLength={120}
            style={styles.textarea}
          />

          <div style={styles.writeFooter}>
            <span
              style={{
                ...styles.remaining,
                color: remaining < 20 ? "#ef4444" : "#64748b",
              }}
            >
              {remaining}자 남음
            </span>

            <button
              type="button"
              onClick={submitPost}
              disabled={loading}
              style={{
                ...styles.submitButton,
                opacity: loading ? 0.6 : 1,
              }}
            >
              익명으로 올리기
            </button>
          </div>
        </section>

        <section style={styles.ruleCard}>
          <strong>퇴근방 이용 규칙</strong>
          <p>
            실명, 회사명+직급, 특정인 저격, 욕설, 개인정보, 혐오 표현은 숨김 처리될 수 있습니다.
          </p>
        </section>

        <section style={styles.listCard}>
          <div style={styles.listHeader}>
            <h2 style={styles.sectionTitle}>실시간 퇴근방</h2>
            <button type="button" onClick={fetchPosts} style={styles.refreshButton}>
              새로고침
            </button>
          </div>

          {posts.length === 0 ? (
            <div style={styles.emptyBox}>
              아직 글이 없습니다.
              <br />
              오늘 첫 퇴근방 글을 남겨보세요.
            </div>
          ) : (
            <div style={styles.postList}>
              {posts.map((post) => (
                <article key={post.id} style={styles.postItem}>
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

                  <p style={styles.postContent}>{post.content}</p>

                  <div style={styles.postActions}>
                    <button
                      type="button"
                      onClick={() => likePost(post)}
                      style={styles.actionButton}
                    >
                      👍 {Number(post.likes || 0).toLocaleString()}
                    </button>

                    <button
                      type="button"
                      onClick={() => reportPost(post)}
                      style={styles.reportButton}
                    >
                      🚩 신고
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <BottomNav active="board" />
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
  writeCard: {
    background: "#ffffff",
    borderRadius: "28px",
    padding: "20px",
    boxShadow: "0 18px 46px rgba(15, 23, 42, 0.09)",
    marginBottom: "14px",
  },
  writeHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
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
    margin: "5px 0 0",
    fontSize: "12px",
    color: "#64748b",
    fontWeight: 700,
  },
  anonymousBadge: {
    flexShrink: 0,
    padding: "8px 10px",
    borderRadius: "999px",
    background: "#fff1f2",
    color: "#f43f5e",
    fontSize: "12px",
    fontWeight: 950,
  },
  regionWrap: {
    marginBottom: "12px",
    padding: "12px",
    borderRadius: "18px",
    background: "#f8fafc",
    border: "1px solid #eef2f7",
  },
  regionLabel: {
    display: "block",
    marginBottom: "7px",
    fontSize: "12px",
    color: "#64748b",
    fontWeight: 900,
  },
  regionSelect: {
    width: "100%",
    height: "42px",
    border: "0",
    outline: "none",
    borderRadius: "14px",
    background: "#ffffff",
    padding: "0 12px",
    fontSize: "15px",
    fontWeight: 900,
    color: "#111827",
  },
  textarea: {
    width: "100%",
    minHeight: "104px",
    resize: "none",
    border: "1px solid #e2e8f0",
    outline: "none",
    borderRadius: "20px",
    padding: "15px",
    fontSize: "15px",
    lineHeight: 1.5,
    fontWeight: 700,
    color: "#111827",
    background: "#f8fafc",
    boxSizing: "border-box",
  },
  writeFooter: {
    marginTop: "12px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
  },
  remaining: {
    fontSize: "12px",
    fontWeight: 900,
  },
  submitButton: {
    border: "0",
    borderRadius: "999px",
    background: "#f43f5e",
    color: "#ffffff",
    padding: "12px 15px",
    fontSize: "13px",
    fontWeight: 950,
    cursor: "pointer",
  },
  ruleCard: {
    background: "#fff7ed",
    border: "1px solid #fed7aa",
    color: "#9a3412",
    borderRadius: "24px",
    padding: "16px",
    marginBottom: "14px",
    fontSize: "13px",
    lineHeight: 1.5,
    fontWeight: 800,
  },
  listCard: {
    background: "#ffffff",
    borderRadius: "28px",
    padding: "20px",
    boxShadow: "0 18px 46px rgba(15, 23, 42, 0.09)",
    marginBottom: "14px",
  },
  listHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "14px",
  },
  refreshButton: {
    border: "0",
    borderRadius: "999px",
    background: "#f1f5f9",
    color: "#64748b",
    padding: "8px 11px",
    fontSize: "12px",
    fontWeight: 900,
    cursor: "pointer",
  },
  emptyBox: {
    padding: "22px",
    borderRadius: "20px",
    background: "#f8fafc",
    color: "#64748b",
    textAlign: "center",
    fontSize: "13px",
    fontWeight: 800,
    lineHeight: 1.55,
  },
  postList: {
    display: "grid",
    gap: "12px",
  },
  postItem: {
    padding: "16px",
    borderRadius: "22px",
    background: "#f8fafc",
    border: "1px solid #eef2f7",
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
  postContent: {
    margin: "10px 0 13px",
    color: "#111827",
    fontSize: "15px",
    fontWeight: 800,
    lineHeight: 1.55,
    whiteSpace: "pre-wrap",
  },
  postActions: {
    display: "flex",
    gap: "8px",
  },
  actionButton: {
    border: "0",
    borderRadius: "999px",
    background: "#ffffff",
    color: "#111827",
    padding: "9px 12px",
    fontSize: "12px",
    fontWeight: 950,
    cursor: "pointer",
  },
  reportButton: {
    border: "0",
    borderRadius: "999px",
    background: "#ffffff",
    color: "#94a3b8",
    padding: "9px 12px",
    fontSize: "12px",
    fontWeight: 900,
    cursor: "pointer",
  },
};

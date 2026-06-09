import { useEffect, useRef, useState } from "react";

const P = {
  panel: { background: "#111120", border: "1px solid #1e1e35", borderRadius: 14, padding: "20px 22px" },
  label: { fontSize: 11, fontWeight: 700, letterSpacing: 1, color: "#6c63ff", textTransform: "uppercase", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 },
};

function StatCard({ label, value, sub, color }) {
  return (
    <div style={{ background: "#0d0d1a", border: "1px solid #1a1a30", borderRadius: 12, padding: "16px 18px" }}>
      <div style={{ fontSize: 11, color: "#555575", fontWeight: 600, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color: color || "#fff" }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: "#555575", marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

function SentBadge({ s }) {
  const m = {
    positive: ["#4ade80", "rgba(74,222,128,0.12)"],
    negative: ["#f87171", "rgba(248,113,113,0.12)"],
    neutral: ["#94a3b8", "rgba(148,163,184,0.12)"]
  };
  const [c, bg] = m[s] || m.neutral;
  return (
    <span style={{ background: bg, color: c, fontSize: 11, fontWeight: 700, padding: "3px 11px", borderRadius: 12, textTransform: "capitalize", whiteSpace: "nowrap" }}>
      {s}
    </span>
  );
}

function DonutChart({ pos, neg, neu }) {
  const ref = useRef(); const ch = useRef();
  useEffect(() => {
    if (!ref.current) return;
    if (ch.current) ch.current.destroy();
    ch.current = new window.Chart(ref.current, {
      type: "doughnut",
      data: {
        labels: ["Positive", "Negative", "Neutral"],
        datasets: [{ data: [pos, neg, neu], backgroundColor: ["#4ade80", "#f87171", "#475569"], borderWidth: 0, hoverOffset: 4 }]
      },
      options: {
        cutout: "68%",
        plugins: { legend: { labels: { color: "#888899", font: { family: "Space Grotesk", size: 12 }, padding: 16 } } },
        responsive: true, maintainAspectRatio: true
      }
    });
  }, [pos, neg, neu]);
  return <canvas ref={ref} style={{ maxHeight: 220 }} />;
}

function BarChart({ sources }) {
  const ref = useRef(); const ch = useRef();
  useEffect(() => {
    if (!ref.current || !sources?.length) return;
    if (ch.current) ch.current.destroy();
    ch.current = new window.Chart(ref.current, {
      type: "bar",
      data: {
        labels: sources.map(s => s.source),
        datasets: [{ label: "Mentions", data: sources.map(s => s.count), backgroundColor: "#6c63ff99", borderColor: "#6c63ff", borderWidth: 1, borderRadius: 6 }]
      },
      options: {
        indexAxis: "y",
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: "#555575" }, grid: { color: "#1a1a2e" } },
          y: { ticks: { color: "#888899", font: { family: "Space Grotesk" } }, grid: { display: false } }
        },
        responsive: true, maintainAspectRatio: true
      }
    });
  }, [sources]);
  return <canvas ref={ref} style={{ maxHeight: 220 }} />;
}

function TrendChart({ trend }) {
  const ref = useRef(); const ch = useRef();
  useEffect(() => {
    if (!ref.current || !trend) return;
    if (ch.current) ch.current.destroy();
    ch.current = new window.Chart(ref.current, {
      type: "line",
      data: {
        labels: trend.labels,
        datasets: [
          { label: "Positive", data: trend.positive, borderColor: "#4ade80", backgroundColor: "rgba(74,222,128,0.08)", tension: 0.4, fill: true, pointRadius: 4 },
          { label: "Negative", data: trend.negative, borderColor: "#f87171", backgroundColor: "rgba(248,113,113,0.08)", tension: 0.4, fill: true, pointRadius: 4 },
          { label: "Neutral", data: trend.neutral, borderColor: "#64748b", backgroundColor: "rgba(100,116,139,0.05)", tension: 0.4, fill: true, pointRadius: 4 },
        ]
      },
      options: {
        plugins: { legend: { labels: { color: "#888899", font: { family: "Space Grotesk", size: 12 } } } },
        scales: {
          x: { ticks: { color: "#555575" }, grid: { color: "#1a1a2e" } },
          y: { ticks: { color: "#555575" }, grid: { color: "#1a1a2e" } }
        },
        responsive: true, maintainAspectRatio: true
      }
    });
  }, [trend]);
  return <canvas ref={ref} style={{ maxHeight: 230 }} />;
}

// AI Insight Summary Box
function AIInsightBox({ data }) {
  const sentiment = (data?.overall_sentiment || "neutral").toLowerCase();
  const sentimentColors = {
    positive: { bg: "rgba(74,222,128,0.07)", border: "rgba(74,222,128,0.25)", icon: "🟢", label: "Positive", color: "#4ade80" },
    negative: { bg: "rgba(248,113,113,0.07)", border: "rgba(248,113,113,0.25)", icon: "🔴", label: "Negative", color: "#f87171" },
    neutral: { bg: "rgba(148,163,184,0.07)", border: "rgba(148,163,184,0.2)", icon: "⚪", label: "Neutral", color: "#94a3b8" },
  };
  const sc = sentimentColors[sentiment] || sentimentColors.neutral;
  const topThemes = (data?.trending_keywords || []).slice(0, 3).join(", ");

  return (
    <div style={{
      background: sc.bg,
      border: `1px solid ${sc.border}`,
      borderRadius: 14,
      padding: "18px 22px",
      marginBottom: 20,
      display: "flex",
      gap: 16,
      alignItems: "flex-start",
    }}>
      {/* Left: icon strip */}
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: `${sc.color}18`,
        border: `1px solid ${sc.color}40`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 22, flexShrink: 0
      }}>
        🤖
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: sc.color, textTransform: "uppercase" }}>
            AI Insight Summary
          </span>
          <span style={{
            background: `${sc.color}18`, color: sc.color,
            fontSize: 10, fontWeight: 700, padding: "2px 10px",
            borderRadius: 10, textTransform: "uppercase", letterSpacing: 0.5
          }}>
            {sc.icon} {sc.label} Sentiment
          </span>
        </div>
        <div style={{ fontSize: 14, color: "#c4b5fd", lineHeight: 1.75 }}>
          <strong style={{ color: "#e2e2f0" }}>"{data?.keyword}"</strong> is currently getting mostly{" "}
          <strong style={{ color: sc.color }}>{sc.label.toLowerCase()} sentiment</strong> across{" "}
          <strong style={{ color: "#67e8f9" }}>{data?.total_mentions || 0} articles</strong>.{" "}
          {topThemes && (
            <>
              Most articles are related to{" "}
              <strong style={{ color: "#a78bfa" }}>{topThemes}</strong>.{" "}
            </>
          )}
          {data?.sentiment_positive > 60 && "Public reception appears largely favourable. "}
          {data?.sentiment_negative > 60 && "There is notable concern or criticism around this topic. "}
          {data?.key_insight && (
            <span style={{ color: "#888899" }}>{data.key_insight}</span>
          )}
        </div>
      </div>
    </div>
  );
}

function openArticle(url, title) {
  const isValid = url && url !== "undefined" && url !== "" && !url.startsWith("https://news.google.com/search");
  if (isValid) {
    window.open(url, "_blank", "noopener,noreferrer");
  } else {
    window.open(`https://www.google.com/search?q=${encodeURIComponent(title)}&tbm=nws`, "_blank", "noopener,noreferrer");
  }
}

function exportCSV(data) {
  const rows = [
    ["Title", "Source", "Source Type", "Date", "Sentiment", "Sentiment Score", "Credibility", "URL", "Summary", "Tags"],
    ...(data.articles || []).map(a => [
      a.title, a.source, a.source_type, a.date, a.sentiment,
      a.sentiment_score, a.credibility, a.url || "", a.summary, (a.tags || []).join("|")
    ])
  ];
  const csv = rows.map(r => r.map(c => `"${String(c || "").replace(/"/g, '""')}"`).join(",")).join("\n");
  dl(new Blob([csv], { type: "text/csv" }), `SocialPulse_${data.keyword.replace(/\s+/g, "_")}.csv`);
}

function exportJSON(data) {
  dl(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }), `SocialPulse_${data.keyword.replace(/\s+/g, "_")}.json`);
}

function dl(blob, name) {
  const url = URL.createObjectURL(blob), a = document.createElement("a");
  a.href = url; a.download = name; a.click(); URL.revokeObjectURL(url);
}

export default function Dashboard({ keyword, data, loading, error, onBack, onNewSearch, onCompare }) {
  const [newKw, setNewKw] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");

  const arts = (data?.articles || [])
    .filter(a => filter === "all" || a.sentiment === filter)
    .sort((a, b) => sortBy === "credibility" ? b.credibility - a.credibility : 0);

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* Sticky Header */}
      <div style={{ padding: "14px 28px", borderBottom: "1px solid #1a1a2e", background: "#0a0a18", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", position: "sticky", top: 0, zIndex: 100 }}>
        <button onClick={onBack} style={{ background: "#1a1a2e", border: "1px solid #2a2a45", borderRadius: 8, padding: "7px 14px", color: "#a78bfa", fontSize: 13, cursor: "pointer", fontFamily: "'Space Grotesk',sans-serif" }}>← Back</button>
        <div style={{ width: 30, height: 30, background: "linear-gradient(135deg,#6c63ff,#a78bfa)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>📡</div>
        <div style={{ fontWeight: 800, color: "#fff", fontSize: 15, fontFamily: "'Space Grotesk',sans-serif" }}>SocialPulse</div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <button
            onClick={onCompare}
            style={{ background: "#1a1a2e", border: "1px solid #6c63ff55", borderRadius: 8, padding: "7px 14px", color: "#a78bfa", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Space Grotesk',sans-serif" }}>
            ⚔️ Compare
          </button>
          <div style={{ background: "#1a1a2e", border: "1px solid #2a2a45", borderRadius: 8, padding: "6px 14px", display: "flex", gap: 8, alignItems: "center" }}>
            <input value={newKw} onChange={e => setNewKw(e.target.value)}
              onKeyDown={e => e.key === "Enter" && newKw.trim() && onNewSearch(newKw.trim())}
              placeholder="New keyword..."
              style={{ background: "transparent", border: "none", outline: "none", fontSize: 13, color: "#e2e2f0", width: 150, fontFamily: "'Space Grotesk',sans-serif" }} />
            <button onClick={() => newKw.trim() && onNewSearch(newKw.trim())}
              style={{ background: "#6c63ff", border: "none", borderRadius: 6, padding: "5px 12px", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Space Grotesk',sans-serif" }}>Go</button>
          </div>
          {data && <>
            <button onClick={() => exportCSV(data)} style={{ background: "#1a1a2e", border: "1px solid #2a2a45", borderRadius: 8, padding: "7px 14px", color: "#4ade80", fontSize: 12, cursor: "pointer", fontFamily: "'Space Grotesk',sans-serif" }}>⬇ CSV</button>
            <button onClick={() => exportJSON(data)} style={{ background: "#1a1a2e", border: "1px solid #2a2a45", borderRadius: 8, padding: "7px 14px", color: "#67e8f9", fontSize: 12, cursor: "pointer", fontFamily: "'Space Grotesk',sans-serif" }}>⬇ JSON</button>
          </>}
        </div>
      </div>

      <div style={{ padding: "26px 28px", maxWidth: 1200, margin: "0 auto" }}>

        {/* Loading */}
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "100px 0", gap: 22 }} className="fade-in">
            <div style={{ width: 48, height: 48, border: "3px solid #1e1e35", borderTop: "3px solid #6c63ff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            <div style={{ color: "#888899", fontSize: 15, fontFamily: "'Space Grotesk',sans-serif" }}>
              Analysing "<span style={{ color: "#a78bfa" }}>{keyword}</span>" across the web...
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, maxWidth: 480, width: "100%", marginTop: 12 }}>
              {["🔍 Fetching news articles", "🧠 Running sentiment AI", "📊 Building dashboard"].map(s => (
                <div key={s} style={{ background: "#111120", border: "1px solid #1e1e35", borderRadius: 10, padding: "10px 12px", fontSize: 11, color: "#555575", textAlign: "center", fontFamily: "'Space Grotesk',sans-serif" }}>{s}</div>
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.25)", borderRadius: 12, padding: 20, color: "#f87171", marginBottom: 20, fontFamily: "'Space Grotesk',sans-serif" }}>
            ❌ {error}
          </div>
        )}

        {/* Results */}
        {data && !loading && (
          <div className="fade-in">

            {/* Topic Header */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 11, color: "#6c63ff", fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8, fontFamily: "'Space Grotesk',sans-serif" }}>
                Monitoring Results · {data.search_date}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <h1 style={{ fontSize: 30, fontWeight: 800, color: "#fff", letterSpacing: -0.5, fontFamily: "'Space Grotesk',sans-serif" }}>"{data.keyword}"</h1>
                <span style={{ background: "rgba(108,99,255,0.15)", border: "1px solid rgba(108,99,255,0.3)", borderRadius: 20, padding: "4px 16px", fontSize: 12, color: "#a78bfa", fontWeight: 700 }}>
                  {data.overall_sentiment} Overall
                </span>
              </div>
            </div>

            {/* ✨ AI INSIGHT SUMMARY BOX */}
            <AIInsightBox data={data} />

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(145px,1fr))", gap: 12, marginBottom: 22 }}>
              <StatCard label="Total Mentions" value={data.total_mentions} sub="articles tracked" />
              <StatCard label="Est. Reach" value={data.reach} color="#a78bfa" sub="people reached" />
              <StatCard label="Engagement" value={data.engagement_rate} color="#67e8f9" sub="avg rate" />
              <StatCard label="Positive" value={`${data.sentiment_positive}%`} color="#4ade80" sub="of mentions" />
              <StatCard label="Negative" value={`${data.sentiment_negative}%`} color="#f87171" sub="of mentions" />
              <StatCard label="Neutral" value={`${data.sentiment_neutral}%`} color="#94a3b8" sub="of mentions" />
            </div>

            {/* Key Insight */}
            <div style={{ ...P.panel, borderLeft: "3px solid #6c63ff", borderRadius: "0 14px 14px 0", marginBottom: 20 }}>
              <div style={P.label}>💡 Key Insight</div>
              <div style={{ fontSize: 15, color: "#c4b5fd", lineHeight: 1.75, fontWeight: 500 }}>{data.key_insight}</div>
            </div>

            {/* Charts */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
              <div style={P.panel}>
                <div style={P.label}>📊 Sentiment Distribution</div>
                <DonutChart pos={data.sentiment_positive} neg={data.sentiment_negative} neu={data.sentiment_neutral} />
              </div>
              <div style={P.panel}>
                <div style={P.label}>📰 Mentions by Source</div>
                <BarChart sources={data.sources_breakdown} />
              </div>
            </div>
            <div style={{ ...P.panel, marginBottom: 20 }}>
              <div style={P.label}>📈 Sentiment Trend — Last 5 Weeks</div>
              <TrendChart trend={data.trend_data} />
            </div>

            {/* Summary + Keywords */}
            <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16, marginBottom: 20 }}>
              <div style={P.panel}>
                <div style={P.label}>🧠 AI Summary</div>
                <div style={{ fontSize: 14, color: "#a0a0c0", lineHeight: 1.85 }}>{data.summary}</div>
              </div>
              <div style={P.panel}>
                <div style={P.label}>🔥 Trending Keywords</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
                  {(data.trending_keywords || []).map((kw, i) => (
                    <span key={i} style={{ background: "#1a1a2e", border: "1px solid #2a2a45", borderRadius: 6, padding: "5px 12px", fontSize: 12, color: "#c4b5fd", fontFamily: "'DM Mono',monospace" }}>#{kw}</span>
                  ))}
                </div>
                <div style={P.label}>📡 Source Types</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {["News", "Blog", "Social", "Forum"].map(type => {
                    const count = (data.sources_breakdown || []).filter(s => s.type === type).reduce((a, b) => a + b.count, 0);
                    const colors = { News: "#6c63ff", Blog: "#a78bfa", Social: "#67e8f9", Forum: "#4ade80" };
                    return count > 0
                      ? <span key={type} style={{ background: "#1a1a2e", border: `1px solid ${colors[type]}44`, borderRadius: 8, padding: "5px 14px", fontSize: 12, color: colors[type], fontWeight: 600 }}>{type}: {count}</span>
                      : null;
                  })}
                </div>
              </div>
            </div>

            {/* Articles */}
            <div style={P.panel}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
                <div style={{ ...P.label, marginBottom: 0 }}>📋 Articles & Mentions ({arts.length})</div>
                <div style={{ marginLeft: "auto", display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {["all", "positive", "negative", "neutral"].map(f => (
                    <button key={f} onClick={() => setFilter(f)}
                      style={{ background: filter === f ? "#6c63ff" : "#1a1a2e", border: "1px solid", borderColor: filter === f ? "#6c63ff" : "#2a2a45", borderRadius: 20, padding: "4px 14px", fontSize: 11, color: filter === f ? "#fff" : "#888899", cursor: "pointer", textTransform: "capitalize", fontFamily: "'Space Grotesk',sans-serif" }}>
                      {f}
                    </button>
                  ))}
                  <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                    style={{ background: "#1a1a2e", border: "1px solid #2a2a45", borderRadius: 8, padding: "4px 10px", fontSize: 11, color: "#888899", fontFamily: "'Space Grotesk',sans-serif" }}>
                    <option value="date">Sort: Date</option>
                    <option value="credibility">Sort: Credibility</option>
                  </select>
                </div>
              </div>

              <div style={{ background: "rgba(74,222,128,0.07)", border: "1px solid rgba(74,222,128,0.2)", borderRadius: 10, padding: "10px 16px", fontSize: 12, color: "#4ade80", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                🔗 Click any article to open it directly on the source website
              </div>

              {arts.length === 0
                ? <div style={{ textAlign: "center", color: "#555575", padding: 40, fontSize: 14 }}>No articles match this filter.</div>
                : arts.map(a => (
                  <div key={a.id}
                    onClick={() => openArticle(a.url, a.title)}
                    style={{ background: "#0d0d1a", border: "1px solid #1a1a30", borderRadius: 10, padding: "16px 18px", marginBottom: 10, cursor: "pointer", transition: "all 0.2s" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "#6c63ff"; e.currentTarget.style.background = "#0f0f22"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "#1a1a30"; e.currentTarget.style.background = "#0d0d1a"; e.currentTarget.style.transform = "translateY(0)"; }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 8 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "#e2e2f0", marginBottom: 7, lineHeight: 1.55 }}>{a.title}</div>
                        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                          <span style={{ fontSize: 12, color: "#6c63ff", fontWeight: 600 }}>{a.source}</span>
                          <span style={{ fontSize: 11, color: "#555575", background: "#1a1a2e", padding: "1px 8px", borderRadius: 4 }}>{a.source_type}</span>
                          <span style={{ fontSize: 11, color: "#555575" }}>{a.date}</span>
                          {a.credibility && (
                            <span style={{ fontSize: 11, color: "#888899", marginLeft: "auto" }}>
                              Credibility: <strong style={{ color: a.credibility > 70 ? "#4ade80" : a.credibility > 40 ? "#fbbf24" : "#f87171" }}>{a.credibility}%</strong>
                            </span>
                          )}
                        </div>
                      </div>
                      <SentBadge s={a.sentiment} />
                    </div>
                    <div style={{ fontSize: 13, color: "#6c6c8a", lineHeight: 1.65, marginBottom: 8 }}>{a.summary}</div>
                    {a.tags?.length > 0 && (
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                        {a.tags.map((t, i) => (
                          <span key={i} style={{ background: "#151525", border: "1px solid #252540", borderRadius: 4, padding: "2px 8px", fontSize: 11, color: "#6c6c8a" }}>{t}</span>
                        ))}
                      </div>
                    )}
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(108,99,255,0.15)", border: "1px solid rgba(108,99,255,0.35)", borderRadius: 20, padding: "3px 10px", fontSize: 11, color: "#a78bfa", fontWeight: 600 }}>
                      🔗 Open article →
                    </div>
                  </div>
                ))
              }
            </div>

            <div style={{ textAlign: "center", padding: "32px 0 16px", fontSize: 12, color: "#333350", fontFamily: "'Space Grotesk',sans-serif" }}>
              SocialPulse — Social Media Listening Tool
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

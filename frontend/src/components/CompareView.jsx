import { useState, useEffect, useRef } from "react";

const P = {
  panel: { background: "#111120", border: "1px solid #1e1e35", borderRadius: 14, padding: "20px 22px" },
  label: { fontSize: 11, fontWeight: 700, letterSpacing: 1, color: "#6c63ff", textTransform: "uppercase", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 },
};

const SENT_COLORS = {
  positive: "#4ade80",
  negative: "#f87171",
  neutral: "#94a3b8",
};

function SentBadge({ s }) {
  const c = SENT_COLORS[(s || "neutral").toLowerCase()] || "#94a3b8";
  return (
    <span style={{
      background: `${c}18`, color: c,
      fontSize: 12, fontWeight: 700, padding: "4px 14px",
      borderRadius: 12, textTransform: "capitalize"
    }}>{s}</span>
  );
}

function CompareBarChart({ kw1, kw2, val1, val2, color1, color2, label }) {
  const max = Math.max(val1, val2, 1);
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 11, color: "#555575", fontWeight: 600, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 8 }}>{label}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ fontSize: 12, color: color1, fontWeight: 700, width: 120, flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{kw1}</div>
          <div style={{ flex: 1, background: "#1a1a2e", borderRadius: 6, height: 10, overflow: "hidden" }}>
            <div style={{ width: `${(val1 / max) * 100}%`, height: "100%", background: color1, borderRadius: 6, transition: "width 0.6s ease" }} />
          </div>
          <div style={{ fontSize: 13, color: color1, fontWeight: 700, width: 36, textAlign: "right" }}>{val1}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ fontSize: 12, color: color2, fontWeight: 700, width: 120, flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{kw2}</div>
          <div style={{ flex: 1, background: "#1a1a2e", borderRadius: 6, height: 10, overflow: "hidden" }}>
            <div style={{ width: `${(val2 / max) * 100}%`, height: "100%", background: color2, borderRadius: 6, transition: "width 0.6s ease" }} />
          </div>
          <div style={{ fontSize: 13, color: color2, fontWeight: 700, width: 36, textAlign: "right" }}>{val2}</div>
        </div>
      </div>
    </div>
  );
}

function RadarChart({ d1, d2, kw1, kw2 }) {
  const ref = useRef(); const ch = useRef();
  useEffect(() => {
    if (!ref.current || !d1 || !d2) return;
    if (ch.current) ch.current.destroy();
    ch.current = new window.Chart(ref.current, {
      type: "radar",
      data: {
        labels: ["Positive%", "Mentions", "Engagement", "Credibility", "Neutral%"],
        datasets: [
          {
            label: kw1,
            data: [
              d1.sentiment_positive || 0,
              Math.min((d1.total_mentions || 0) * 2, 100),
              parseFloat(d1.engagement_rate) || 0,
              65,
              d1.sentiment_neutral || 0,
            ],
            borderColor: "#6c63ff",
            backgroundColor: "rgba(108,99,255,0.12)",
            pointBackgroundColor: "#6c63ff",
            borderWidth: 2,
            pointRadius: 4,
          },
          {
            label: kw2,
            data: [
              d2.sentiment_positive || 0,
              Math.min((d2.total_mentions || 0) * 2, 100),
              parseFloat(d2.engagement_rate) || 0,
              60,
              d2.sentiment_neutral || 0,
            ],
            borderColor: "#f59e0b",
            backgroundColor: "rgba(245,158,11,0.1)",
            pointBackgroundColor: "#f59e0b",
            borderWidth: 2,
            pointRadius: 4,
          }
        ]
      },
      options: {
        scales: {
          r: {
            ticks: { color: "#555575", backdropColor: "transparent", font: { size: 9 } },
            grid: { color: "#1a1a2e" },
            pointLabels: { color: "#888899", font: { family: "Space Grotesk", size: 11 } },
            suggestedMin: 0, suggestedMax: 100,
          }
        },
        plugins: {
          legend: { labels: { color: "#888899", font: { family: "Space Grotesk", size: 12 }, padding: 16 } }
        },
        responsive: true, maintainAspectRatio: true,
      }
    });
  }, [d1, d2, kw1, kw2]);
  return <canvas ref={ref} style={{ maxHeight: 260 }} />;
}

function WinnerBadge({ winner, label }) {
  return (
    <span style={{
      background: "rgba(250,204,21,0.12)", color: "#fbbf24",
      fontSize: 10, fontWeight: 800, padding: "2px 10px",
      borderRadius: 10, letterSpacing: 0.5, textTransform: "uppercase",
      border: "1px solid rgba(250,204,21,0.25)"
    }}>
      🏆 {label}
    </span>
  );
}

export default function CompareView({ onBack, analyzeKeyword }) {
  const [kw1, setKw1] = useState("");
  const [kw2, setKw2] = useState("");
  const [data1, setData1] = useState(null);
  const [data2, setData2] = useState(null);
  const [loading1, setLoading1] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [error1, setError1] = useState("");
  const [error2, setError2] = useState("");
  const [compared, setCompared] = useState(false);

  const handleCompare = async () => {
    if (!kw1.trim() || !kw2.trim()) return;
    setData1(null); setData2(null);
    setError1(""); setError2("");
    setLoading1(true); setLoading2(true);
    setCompared(true);

    const [r1, r2] = await Promise.all([
      analyzeKeyword(kw1.trim()),
      analyzeKeyword(kw2.trim()),
    ]);

    setLoading1(false); setLoading2(false);
    if (r1.error) setError1(r1.error); else setData1(r1.data);
    if (r2.error) setError2(r2.error); else setData2(r2.data);
  };

  const bothLoaded = data1 && data2 && !loading1 && !loading2;

  // Determine winners
  const winner = bothLoaded ? {
    sentiment: data1.sentiment_positive >= data2.sentiment_positive ? kw1 : kw2,
    articles: (data1.total_mentions || 0) >= (data2.total_mentions || 0) ? kw1 : kw2,
    positiveRatio: data1.sentiment_positive >= data2.sentiment_positive ? kw1 : kw2,
    negativeRatio: data1.sentiment_negative <= data2.sentiment_negative ? kw1 : kw2,
  } : null;

  const QUICK_PAIRS = [
    ["iPhone", "Samsung"],
    ["AI", "Blockchain"],
    ["Cricket", "Football"],
    ["Tesla", "Toyota"],
  ];

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ padding: "14px 28px", borderBottom: "1px solid #1a1a2e", background: "#0a0a18", display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, zIndex: 100 }}>
        <button onClick={onBack} style={{ background: "#1a1a2e", border: "1px solid #2a2a45", borderRadius: 8, padding: "7px 14px", color: "#a78bfa", fontSize: 13, cursor: "pointer", fontFamily: "'Space Grotesk',sans-serif" }}>← Back</button>
        <div style={{ width: 30, height: 30, background: "linear-gradient(135deg,#6c63ff,#a78bfa)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>📡</div>
        <div style={{ fontWeight: 800, color: "#fff", fontSize: 15, fontFamily: "'Space Grotesk',sans-serif" }}>SocialPulse</div>
        <div style={{ background: "rgba(108,99,255,0.15)", border: "1px solid rgba(108,99,255,0.3)", borderRadius: 20, padding: "4px 14px", fontSize: 11, color: "#a78bfa", fontWeight: 700 }}>
          ⚔️ KEYWORD COMPARE
        </div>
      </div>

      <div style={{ padding: "32px 28px", maxWidth: 1100, margin: "0 auto" }}>

        {/* Compare Input */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 11, color: "#6c63ff", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>Compare Two Keywords</div>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: "#fff", marginBottom: 8, letterSpacing: -0.5 }}>
            Head-to-Head Sentiment Battle
          </h2>
          <p style={{ fontSize: 14, color: "#555575", marginBottom: 24, lineHeight: 1.7 }}>
            Enter two keywords to compare their sentiment, article count, positive/negative ratio, and overall media presence.
          </p>

          {/* Quick pairs */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
            <span style={{ fontSize: 11, color: "#444460", alignSelf: "center", marginRight: 4 }}>Quick:</span>
            {QUICK_PAIRS.map(([a, b]) => (
              <button key={a + b}
                onClick={() => { setKw1(a); setKw2(b); }}
                style={{ background: "#111120", border: "1px solid #2a2a45", borderRadius: 20, padding: "5px 14px", fontSize: 12, color: "#a78bfa", cursor: "pointer", fontFamily: "'Space Grotesk',sans-serif" }}
                onMouseEnter={e => { e.target.style.borderColor = "#6c63ff"; }}
                onMouseLeave={e => { e.target.style.borderColor = "#2a2a45"; }}
              >
                {a} vs {b}
              </button>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr auto", gap: 12, alignItems: "center", maxWidth: 680 }}>
            <div style={{ background: "#111120", border: "1.5px solid #6c63ff55", borderRadius: 12, padding: "10px 18px", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 16 }}>🔵</span>
              <input
                value={kw1}
                onChange={e => setKw1(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleCompare()}
                placeholder="Keyword 1 (e.g. iPhone)"
                style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 15, color: "#e2e2f0", fontFamily: "'Space Grotesk',sans-serif" }}
              />
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#444460", textAlign: "center", padding: "0 4px" }}>vs</div>
            <div style={{ background: "#111120", border: "1.5px solid #f59e0b55", borderRadius: 12, padding: "10px 18px", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 16 }}>🟡</span>
              <input
                value={kw2}
                onChange={e => setKw2(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleCompare()}
                placeholder="Keyword 2 (e.g. Samsung)"
                style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 15, color: "#e2e2f0", fontFamily: "'Space Grotesk',sans-serif" }}
              />
            </div>
            <button
              onClick={handleCompare}
              disabled={!kw1.trim() || !kw2.trim() || loading1 || loading2}
              style={{
                background: (!kw1.trim() || !kw2.trim()) ? "#1a1a2e" : "linear-gradient(135deg,#6c63ff,#a78bfa)",
                border: "none", borderRadius: 12, padding: "12px 22px",
                color: (!kw1.trim() || !kw2.trim()) ? "#444460" : "#fff",
                fontSize: 14, fontWeight: 700, cursor: (!kw1.trim() || !kw2.trim()) ? "not-allowed" : "pointer",
                fontFamily: "'Space Grotesk',sans-serif", whiteSpace: "nowrap"
              }}
            >
              {loading1 || loading2 ? "⏳ Analyzing..." : "⚔️ Compare"}
            </button>
          </div>
        </div>

        {/* Loading State */}
        {compared && (loading1 || loading2) && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "60px 0", gap: 18 }}>
            <div style={{ width: 44, height: 44, border: "3px solid #1e1e35", borderTop: "3px solid #6c63ff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            <div style={{ color: "#888899", fontSize: 14 }}>
              Comparing <span style={{ color: "#6c63ff" }}>{kw1}</span> vs <span style={{ color: "#f59e0b" }}>{kw2}</span>...
            </div>
          </div>
        )}

        {/* Error States */}
        {(error1 || error2) && (
          <div style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.25)", borderRadius: 12, padding: 16, color: "#f87171", marginBottom: 20, fontSize: 13 }}>
            {error1 && <div>❌ {kw1}: {error1}</div>}
            {error2 && <div>❌ {kw2}: {error2}</div>}
          </div>
        )}

        {/* Compare Results */}
        {bothLoaded && (
          <div>
            {/* VS Header Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 16, marginBottom: 24, alignItems: "center" }}>
              {/* Keyword 1 Card */}
              <div style={{ background: "rgba(108,99,255,0.08)", border: "1.5px solid rgba(108,99,255,0.35)", borderRadius: 16, padding: "22px 24px", textAlign: "center" }}>
                <div style={{ fontSize: 11, color: "#6c63ff", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Keyword 1</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: "#fff", marginBottom: 10 }}>{data1.keyword}</div>
                <SentBadge s={data1.overall_sentiment} />
                <div style={{ marginTop: 14, display: "flex", gap: 12, justifyContent: "center" }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: "#6c63ff" }}>{data1.total_mentions}</div>
                    <div style={{ fontSize: 10, color: "#555575", textTransform: "uppercase", letterSpacing: 0.8 }}>Articles</div>
                  </div>
                  <div style={{ width: 1, background: "#1a1a2e" }} />
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: "#4ade80" }}>{data1.sentiment_positive}%</div>
                    <div style={{ fontSize: 10, color: "#555575", textTransform: "uppercase", letterSpacing: 0.8 }}>Positive</div>
                  </div>
                  <div style={{ width: 1, background: "#1a1a2e" }} />
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: "#f87171" }}>{data1.sentiment_negative}%</div>
                    <div style={{ fontSize: 10, color: "#555575", textTransform: "uppercase", letterSpacing: 0.8 }}>Negative</div>
                  </div>
                </div>
              </div>

              {/* VS */}
              <div style={{ textAlign: "center", padding: "0 8px" }}>
                <div style={{ fontSize: 32, fontWeight: 900, color: "#333355", letterSpacing: -1 }}>VS</div>
              </div>

              {/* Keyword 2 Card */}
              <div style={{ background: "rgba(245,158,11,0.07)", border: "1.5px solid rgba(245,158,11,0.3)", borderRadius: 16, padding: "22px 24px", textAlign: "center" }}>
                <div style={{ fontSize: 11, color: "#f59e0b", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Keyword 2</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: "#fff", marginBottom: 10 }}>{data2.keyword}</div>
                <SentBadge s={data2.overall_sentiment} />
                <div style={{ marginTop: 14, display: "flex", gap: 12, justifyContent: "center" }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: "#f59e0b" }}>{data2.total_mentions}</div>
                    <div style={{ fontSize: 10, color: "#555575", textTransform: "uppercase", letterSpacing: 0.8 }}>Articles</div>
                  </div>
                  <div style={{ width: 1, background: "#1a1a2e" }} />
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: "#4ade80" }}>{data2.sentiment_positive}%</div>
                    <div style={{ fontSize: 10, color: "#555575", textTransform: "uppercase", letterSpacing: 0.8 }}>Positive</div>
                  </div>
                  <div style={{ width: 1, background: "#1a1a2e" }} />
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: "#f87171" }}>{data2.sentiment_negative}%</div>
                    <div style={{ fontSize: 10, color: "#555575", textTransform: "uppercase", letterSpacing: 0.8 }}>Negative</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Comparison Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 16, marginBottom: 16 }}>
              {/* Bar Comparisons */}
              <div style={P.panel}>
                <div style={P.label}>📊 Head-to-Head Metrics</div>
                <CompareBarChart
                  kw1={data1.keyword} kw2={data2.keyword}
                  val1={data1.total_mentions || 0} val2={data2.total_mentions || 0}
                  color1="#6c63ff" color2="#f59e0b"
                  label="Total Articles"
                />
                <CompareBarChart
                  kw1={data1.keyword} kw2={data2.keyword}
                  val1={data1.sentiment_positive || 0} val2={data2.sentiment_positive || 0}
                  color1="#4ade80" color2="#4ade80"
                  label="Positive Sentiment %"
                />
                <CompareBarChart
                  kw1={data1.keyword} kw2={data2.keyword}
                  val1={data1.sentiment_negative || 0} val2={data2.sentiment_negative || 0}
                  color1="#f87171" color2="#f87171"
                  label="Negative Sentiment %"
                />
                <CompareBarChart
                  kw1={data1.keyword} kw2={data2.keyword}
                  val1={data1.sentiment_neutral || 0} val2={data2.sentiment_neutral || 0}
                  color1="#94a3b8" color2="#94a3b8"
                  label="Neutral Sentiment %"
                />
              </div>

              {/* Radar Chart */}
              <div style={P.panel}>
                <div style={P.label}>🕸️ Radar Comparison</div>
                <RadarChart d1={data1} d2={data2} kw1={data1.keyword} kw2={data2.keyword} />
              </div>
            </div>

            {/* Winner Summary */}
            <div style={{ ...P.panel, marginBottom: 16, background: "rgba(250,204,21,0.04)", borderColor: "rgba(250,204,21,0.15)" }}>
              <div style={P.label}>🏆 Comparison Summary</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12 }}>
                {[
                  { label: "More Articles", winner: winner.articles, icon: "📰" },
                  { label: "Better Positive Ratio", winner: winner.positiveRatio, icon: "😊" },
                  { label: "Less Negative Coverage", winner: winner.negativeRatio, icon: "🛡️" },
                  { label: "Overall Sentiment", winner: winner.sentiment, icon: "🎯" },
                ].map(({ label, winner: w, icon }) => (
                  <div key={label} style={{ background: "#0d0d1a", border: "1px solid #1a1a30", borderRadius: 10, padding: "14px 16px" }}>
                    <div style={{ fontSize: 11, color: "#555575", fontWeight: 600, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 6 }}>{icon} {label}</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: w === kw1 ? "#6c63ff" : "#f59e0b" }}>
                      {w}
                    </div>
                    <WinnerBadge winner={w} label="Winner" />
                  </div>
                ))}
              </div>
            </div>

            {/* AI Insights Side by Side */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div style={{ ...P.panel, borderTop: "2px solid #6c63ff" }}>
                <div style={{ ...P.label, color: "#6c63ff" }}>🤖 AI Insight — {data1.keyword}</div>
                <div style={{ fontSize: 13, color: "#a0a0c0", lineHeight: 1.8 }}>{data1.key_insight || data1.summary}</div>
                <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {(data1.trending_keywords || []).slice(0, 4).map((kw, i) => (
                    <span key={i} style={{ background: "#1a1a2e", border: "1px solid #2a2a45", borderRadius: 6, padding: "3px 10px", fontSize: 11, color: "#6c63ff" }}>#{kw}</span>
                  ))}
                </div>
              </div>
              <div style={{ ...P.panel, borderTop: "2px solid #f59e0b" }}>
                <div style={{ ...P.label, color: "#f59e0b" }}>🤖 AI Insight — {data2.keyword}</div>
                <div style={{ fontSize: 13, color: "#a0a0c0", lineHeight: 1.8 }}>{data2.key_insight || data2.summary}</div>
                <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {(data2.trending_keywords || []).slice(0, 4).map((kw, i) => (
                    <span key={i} style={{ background: "#1a1a2e", border: "1px solid #2a2a45", borderRadius: 6, padding: "3px 10px", fontSize: 11, color: "#f59e0b" }}>#{kw}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

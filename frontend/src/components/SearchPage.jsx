import { useState } from "react";

const QUICK_TAGS = [
  ["📱 iPhone 16", "iPhone 16"],
  ["🏏 Virat Kohli", "Virat Kohli"],
  ["🤖 AI Jobs India", "AI jobs India"],
  ["📈 Stock Market", "stock market India"],
  ["🗳 India Election", "India election 2026"],
  ["💬 ChatGPT", "ChatGPT news"],
  ["₿ Bitcoin", "Bitcoin"],
  ["🚀 ISRO", "ISRO 2026"],
];

const FEATURES = [
  ["📰", "Real-time News", "Fetches latest articles via Anthropic web search — real URLs, real articles"],
  ["🧠", "Sentiment Analysis", "Classifies each article as Positive / Negative / Neutral using AI NLP"],
  ["🔗", "Clickable Articles", "Click any article card to open the real article in a new tab"],
  ["📊", "Visual Analytics", "Donut chart, bar chart, 5-week sentiment trend line"],
  ["📋", "Article Intelligence", "Source credibility score, tags, publish date for every result"],
  ["⬇", "Export Reports", "Download all results as CSV or JSON for your presentation"],
];

export default function SearchPage({ onSearch, history }) {
  const [input, setInput] = useState("");

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ padding: "18px 32px", borderBottom: "1px solid #1a1a2e", background: "#0a0a18", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 38, height: 38, background: "linear-gradient(135deg,#6c63ff,#a78bfa)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>📡</div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 17, color: "#fff" }}>SocialPulse</div>
          <div style={{ fontSize: 11, color: "#555575" }}>Social Media Listening Tool</div>
        </div>
        <div style={{ marginLeft: "auto", background: "#1a1a2e", border: "1px solid #2a2a45", borderRadius: 20, padding: "4px 14px", fontSize: 11, color: "#a78bfa", fontWeight: 700 }}>
          AI + WEB SCRAPING
        </div>
      </div>

      {/* Hero */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 24px" }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2.5, color: "#6c63ff", textTransform: "uppercase", marginBottom: 14 }}>
          Real-time Intelligence
        </div>
        <h1 style={{ fontSize: 44, fontWeight: 800, color: "#fff", lineHeight: 1.15, marginBottom: 16, letterSpacing: -1, textAlign: "center" }}>
          Track what the internet<br />
          <span style={{ background: "linear-gradient(90deg,#6c63ff,#a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            is saying right now
          </span>
        </h1>
        <p style={{ fontSize: 15, color: "#666680", lineHeight: 1.8, textAlign: "center", maxWidth: 560, marginBottom: 36 }}>
          Enter any keyword, brand, or topic — get instant news monitoring, sentiment analysis, trending keywords, and source intelligence — inspired by SEMrush Media Monitoring.
        </p>

        {/* Search */}
        <div style={{ width: "100%", maxWidth: 640, display: "flex", gap: 10, background: "#111120", border: "1.5px solid #2a2a45", borderRadius: 14, padding: "7px 7px 7px 20px", marginBottom: 16 }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && input.trim() && onSearch(input.trim())}
            placeholder="Search keyword, brand, topic, person..."
            style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 16, color: "#e2e2f0", fontFamily: "'Space Grotesk',sans-serif" }}
          />
          <button
            onClick={() => input.trim() && onSearch(input.trim())}
            style={{ background: "linear-gradient(135deg,#6c63ff,#a78bfa)", border: "none", borderRadius: 10, padding: "11px 24px", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Space Grotesk',sans-serif" }}
          >
            🔍 Analyze
          </button>
        </div>

        {/* Quick Tags */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", maxWidth: 620, marginBottom: 44 }}>
          {QUICK_TAGS.map(([label, kw]) => (
            <button key={kw} onClick={() => onSearch(kw)}
              style={{ background: "#111120", border: "1px solid #2a2a45", borderRadius: 20, padding: "6px 16px", fontSize: 13, color: "#a78bfa", cursor: "pointer", fontFamily: "'Space Grotesk',sans-serif" }}
              onMouseEnter={e => { e.target.style.borderColor = "#6c63ff"; e.target.style.background = "#1a1a2e"; }}
              onMouseLeave={e => { e.target.style.borderColor = "#2a2a45"; e.target.style.background = "#111120"; }}>
              {label}
            </button>
          ))}
        </div>

        {/* Feature Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(175px,1fr))", gap: 14, maxWidth: 820, width: "100%", marginBottom: 32 }}>
          {FEATURES.map(([icon, title, desc]) => (
            <div key={title} style={{ background: "#111120", border: "1px solid #1e1e35", borderRadius: 14, padding: "18px 16px" }}>
              <div style={{ fontSize: 24, marginBottom: 10 }}>{icon}</div>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#e2e2f0", marginBottom: 5 }}>{title}</div>
              <div style={{ fontSize: 12, color: "#555575", lineHeight: 1.6 }}>{desc}</div>
            </div>
          ))}
        </div>

        {/* History */}
        {history.length > 0 && (
          <div style={{ maxWidth: 640, width: "100%" }}>
            <div style={{ fontSize: 11, color: "#555575", fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>Recent Searches</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {history.map((h, i) => (
                <button key={i} onClick={() => onSearch(h)}
                  style={{ background: "#1a1a2e", border: "1px solid #2a2a45", borderRadius: 8, padding: "5px 14px", fontSize: 12, color: "#c4b5fd", cursor: "pointer", fontFamily: "'Space Grotesk',sans-serif" }}>
                  🕐 {h}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

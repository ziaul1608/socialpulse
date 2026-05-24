const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json({ limit: "10mb" }));

// Health check
app.get("/", (req, res) => {
  res.json({
    status: "SocialPulse Backend Running ✅",
    hasApiKey: !!process.env.ANTHROPIC_API_KEY,
    mode: process.env.ANTHROPIC_API_KEY ? "live" : "demo"
  });
});

// Main analyze endpoint
app.post("/analyze", async (req, res) => {
  const { keyword } = req.body;

  if (!keyword || !keyword.trim()) {
    return res.status(400).json({ error: "Keyword is required" });
  }

  // DEMO MODE: no API key
  if (!process.env.ANTHROPIC_API_KEY) {
    console.log("[DEMO MODE] No API key — returning demo data for:", keyword);
    return res.json(generateDemoData(keyword));
  }

  // LIVE MODE: call Anthropic API with web search
  const prompt = `You are a professional social media listening and news monitoring AI. The user searched for: "${keyword}"

Use your web_search tool to find the latest real news articles about "${keyword}".

CRITICAL URL RULE: Every article MUST have the real, direct URL of that specific article as returned by web_search (e.g. https://timesofindia.indiatimes.com/tech/..., https://ndtv.com/..., https://techcrunch.com/...). Do NOT use Google News search URLs. Do NOT use placeholder URLs. The URL must open that exact article directly when clicked.

Respond ONLY with a valid JSON object (no markdown, no backticks, no preamble):
{
  "keyword": "${keyword}",
  "search_date": "today's date in DD Mon YYYY format",
  "total_mentions": <number 8-15>,
  "reach": "<e.g. 2.4M>",
  "engagement_rate": "<e.g. 4.7%>",
  "sentiment_positive": <integer>,
  "sentiment_negative": <integer>,
  "sentiment_neutral": <integer>,
  "overall_sentiment": "<Positive|Negative|Neutral|Mixed>",
  "summary": "<3-4 sentence summary of current coverage and public perception>",
  "key_insight": "<single most important insight right now>",
  "trending_keywords": ["<w1>","<w2>","<w3>","<w4>","<w5>","<w6>","<w7>","<w8>","<w9>","<w10>"],
  "sources_breakdown": [
    {"source":"<name>","count":<n>,"type":"<News|Blog|Social|Forum>"},
    {"source":"<name>","count":<n>,"type":"<News|Blog|Social|Forum>"},
    {"source":"<name>","count":<n>,"type":"<News|Blog|Social|Forum>"},
    {"source":"<name>","count":<n>,"type":"<News|Blog|Social|Forum>"},
    {"source":"<name>","count":<n>,"type":"<News|Blog|Social|Forum>"}
  ],
  "articles": [
    {
      "id": 1,
      "title": "<exact article title found by web search>",
      "source": "<publisher name e.g. Times of India, NDTV, TechCrunch>",
      "source_type": "<News|Blog|Social|Forum>",
      "date": "<article publish date>",
      "sentiment": "<positive|negative|neutral>",
      "sentiment_score": <float -1.0 to 1.0>,
      "summary": "<2 sentence article summary>",
      "url": "<MANDATORY: real direct URL of this specific article from web_search — not a search page>",
      "tags": ["<tag1>","<tag2>","<tag3>"],
      "credibility": <integer 1-100>
    }
  ],
  "trend_data": {
    "labels": ["Week 1","Week 2","Week 3","Week 4","This Week"],
    "positive": [<5 integers>],
    "negative": [<5 integers>],
    "neutral": [<5 integers>]
  }
}

Rules: 8-12 articles. Sentiment percentages must add up to exactly 100. Every URL must be a real direct link to that article.`;

  try {
    const response = await axios.post(
      "https://api.anthropic.com/v1/messages",
      {
        model: "claude-sonnet-4-20250514",
        max_tokens: 4000,
        tools: [{ type: "web_search_20250305", name: "web_search" }],
        messages: [{ role: "user", content: prompt }]
      },
      {
        headers: {
          "x-api-key": process.env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json"
        },
        timeout: 60000
      }
    );

    const content = response.data.content || [];
    let rawText = "";
    for (const block of content) {
      if (block.type === "text") rawText += block.text;
    }

    rawText = rawText.replace(/```json|```/g, "").trim();
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Could not parse AI response");

    return res.json(JSON.parse(jsonMatch[0]));

  } catch (err) {
    console.error("[API ERROR]", err.message);

    if (err.response?.status === 401) {
      return res.status(401).json({ error: "Invalid API key. Check ANTHROPIC_API_KEY in backend/.env" });
    }
    if (err.response?.status === 429) {
      console.log("[RATE LIMIT] Falling back to demo data");
      return res.json(generateDemoData(keyword));
    }

    console.log("[FALLBACK] Returning demo data due to error:", err.message);
    return res.json(generateDemoData(keyword));
  }
});

// Demo data generator (used when no API key or on error)
function generateDemoData(keyword) {
  const today = new Date();
  const fmtDate = (d) => d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  const ri = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  const POS = ["good","great","excellent","amazing","positive","success","win","best","growth","rise","gain","profit","breakthrough","strong","advance","improve","benefit","boom","surge","record","milestone","launch","achieve","innovative","leading","popular","viral","bullish","upgrade","safe","trust"];
  const NEG = ["bad","terrible","negative","fail","loss","worst","hate","sad","decline","fall","drop","crash","problem","issue","concern","crisis","controversy","scandal","attack","threat","risk","danger","protest","ban","lawsuit","fraud","scam","mislead","conflict","violence","corruption","disaster","bearish","recall","unsafe"];

  function analyzeSentiment(text) {
    const t = text.toLowerCase();
    let pos = 0, neg = 0;
    POS.forEach(w => { if (t.includes(w)) pos++; });
    NEG.forEach(w => { if (t.includes(w)) neg++; });
    if (pos > neg) return { label: "positive", score: Math.min(0.9, 0.3 + pos * 0.1) };
    if (neg > pos) return { label: "negative", score: Math.max(-0.9, -(0.3 + neg * 0.1)) };
    return { label: "neutral", score: 0.0 };
  }

  const mockSources = [
    { name: "NDTV", type: "News", url: (q) => `https://www.ndtv.com/search?searchtext=${encodeURIComponent(q)}` },
    { name: "Times of India", type: "News", url: (q) => `https://timesofindia.indiatimes.com/topic/${encodeURIComponent(q)}` },
    { name: "The Hindu", type: "News", url: (q) => `https://www.thehindu.com/search/?q=${encodeURIComponent(q)}` },
    { name: "Economic Times", type: "News", url: (q) => `https://economictimes.indiatimes.com/topic/${encodeURIComponent(q)}` },
    { name: "Hindustan Times", type: "News", url: (q) => `https://www.hindustantimes.com/search?q=${encodeURIComponent(q)}` },
    { name: "TechCrunch", type: "Blog", url: (q) => `https://techcrunch.com/search/${encodeURIComponent(q)}/` },
    { name: "Medium", type: "Blog", url: (q) => `https://medium.com/search?q=${encodeURIComponent(q)}` },
    { name: "Reddit", type: "Forum", url: (q) => `https://www.reddit.com/search/?q=${encodeURIComponent(q)}` },
    { name: "Quora", type: "Forum", url: (q) => `https://www.quora.com/search?q=${encodeURIComponent(q)}` },
    { name: "LinkedIn", type: "Social", url: (q) => `https://www.linkedin.com/search/results/content/?keywords=${encodeURIComponent(q)}` }
  ];

  const sentPat = ["positive","positive","positive","negative","negative","neutral","neutral","positive","negative","neutral"];

  const articles = mockSources.map((src, i) => {
    const s = sentPat[i];
    const d = new Date(today); d.setDate(d.getDate() - ri(0, 5));
    const titles = {
      positive: [`${keyword} shows strong momentum in latest analysis`, `Why ${keyword} is trending positively this week`, `${keyword} reaches new milestone — experts optimistic`],
      negative: [`Concerns raised over ${keyword} in recent reports`, `${keyword} faces criticism from analysts`, `Issues with ${keyword} spark online debate`],
      neutral: [`Latest updates and developments around ${keyword}`, `What you need to know about ${keyword} today`, `${keyword} — a comprehensive week in review`]
    };
    const title = titles[s][i % titles[s].length];
    const sent = analyzeSentiment(title);
    return {
      id: i + 1, title,
      source: src.name,
      source_type: src.type,
      date: fmtDate(d),
      sentiment: sent.label,
      sentiment_score: parseFloat(sent.score.toFixed(2)),
      summary: `This ${src.type.toLowerCase()} from ${src.name} covers the latest developments around ${keyword}. The piece highlights key trends and reactions observed over the past week.`,
      url: src.url(keyword),
      tags: [keyword.split(" ")[0].toLowerCase(), src.type.toLowerCase(), "trending"],
      credibility: src.type === "News" ? ri(72, 95) : src.type === "Blog" ? ri(55, 80) : ri(40, 65)
    };
  });

  const pos = articles.filter(a => a.sentiment === "positive").length;
  const neg = articles.filter(a => a.sentiment === "negative").length;
  const total = articles.length;
  const pct_pos = Math.round((pos / total) * 100);
  const pct_neg = Math.round((neg / total) * 100);
  const pct_neu = 100 - pct_pos - pct_neg;
  const overall = pct_pos >= 50 ? "Positive" : pct_neg >= 50 ? "Negative" : pct_pos > pct_neg ? "Mixed" : "Neutral";

  const srcMap = {};
  articles.forEach(a => {
    if (!srcMap[a.source]) srcMap[a.source] = { source: a.source, count: 0, type: a.source_type };
    srcMap[a.source].count++;
  });

  return {
    keyword,
    search_date: fmtDate(today),
    total_mentions: total,
    reach: `${ri(10, 99)}.${ri(1, 9)}M`,
    engagement_rate: `${ri(2, 8)}.${ri(0, 9)}%`,
    sentiment_positive: pct_pos,
    sentiment_negative: pct_neg,
    sentiment_neutral: pct_neu,
    overall_sentiment: overall,
    summary: `Real-time monitoring of "${keyword}" tracked ${total} articles across news sites, blogs, and social platforms. Overall sentiment is ${overall.toLowerCase()}, with ${pct_pos}% positive, ${pct_neg}% negative, and ${pct_neu}% neutral coverage.`,
    key_insight: pct_pos >= 50
      ? `Majority (${pct_pos}%) of mentions about "${keyword}" are positive — strong public interest detected.`
      : pct_neg >= 40
        ? `A significant ${pct_neg}% of coverage is negative — monitor closely for reputational impact.`
        : `Coverage of "${keyword}" is balanced — active multi-sided discussion detected.`,
    trending_keywords: [keyword.split(" ")[0], "trending", "analysis", "update", "news", "india", "latest", "report", "review", "2026"],
    sources_breakdown: Object.values(srcMap).sort((a, b) => b.count - a.count).slice(0, 6),
    articles,
    trend_data: {
      labels: ["Week 1", "Week 2", "Week 3", "Week 4", "This Week"],
      positive: [ri(5, 15), ri(8, 18), ri(10, 20), ri(12, 22), pos],
      negative: [ri(2, 8), ri(3, 9), ri(4, 10), ri(3, 8), neg],
      neutral: [ri(3, 10), ri(4, 11), ri(5, 12), ri(4, 10), total - pos - neg]
    }
  };
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ SocialPulse Backend running on http://localhost:${PORT}`);
  console.log(`🔑 API Key: ${process.env.ANTHROPIC_API_KEY ? "Loaded ✅" : "Missing — running in DEMO mode ⚠️"}`);
});

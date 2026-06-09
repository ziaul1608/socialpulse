import { useState } from "react";
import SearchPage from "./components/SearchPage";
import Dashboard from "./components/Dashboard";
import CompareView from "./components/CompareView";
import { analyzeKeyword } from "./api.js";

export default function App() {
  const [view, setView] = useState("search");
  const [keyword, setKeyword] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);

  const handleSearch = async (kw) => {
    setKeyword(kw);
    setView("dashboard");
    setLoading(true);
    setError("");
    setData(null);

    setHistory(prev => {
      const updated = prev.filter(h => h.keyword !== kw);
      return [{ keyword: kw, timestamp: Date.now() }, ...updated].slice(0, 10);
    });

    const { data: result, error: err } = await analyzeKeyword(kw);

    if (err) {
      setError(err);
    } else {
      // Store result in history with metadata
      setHistory(prev => {
        const updated = prev.map(h =>
          h.keyword === kw
            ? {
                ...h,
                articles: result?.total_mentions || 0,
                sentiment: result?.overall_sentiment || "Neutral"
              }
            : h
        );
        return updated;
      });
      setData(result);
    }

    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#07070f", color: "#e2e2f0", fontFamily: "'Space Grotesk', sans-serif" }}>
      {view === "search" ? (
        <SearchPage
          onSearch={handleSearch}
          history={history}
          onCompare={() => setView("compare")}
        />
      ) : view === "compare" ? (
        <CompareView
          onBack={() => setView("search")}
          analyzeKeyword={analyzeKeyword}
        />
      ) : (
        <Dashboard
          keyword={keyword}
          data={data}
          loading={loading}
          error={error}
          onBack={() => setView("search")}
          onNewSearch={handleSearch}
          onCompare={() => setView("compare")}
        />
      )}
    </div>
  );
}

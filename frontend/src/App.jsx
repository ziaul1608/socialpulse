import { useState } from "react";
import SearchPage from "./components/SearchPage";
import Dashboard from "./components/Dashboard";
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

    setHistory(prev => prev.includes(kw) ? prev : [kw, ...prev.slice(0, 4)]);

    const { data: result, error: err } = await analyzeKeyword(kw);

    if (err) {
      setError(err);
    } else {
      setData(result);
    }

    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#07070f", color: "#e2e2f0", fontFamily: "'Space Grotesk', sans-serif" }}>
      {view === "search" ? (
        <SearchPage onSearch={handleSearch} history={history} />
      ) : (
        <Dashboard
          keyword={keyword}
          data={data}
          loading={loading}
          error={error}
          onBack={() => setView("search")}
          onNewSearch={handleSearch}
        />
      )}
    </div>
  );
}

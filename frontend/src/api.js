import axios from "axios";

// Local dev  → /api  (Vite proxy → localhost:5000)
// Production → set VITE_BACKEND_URL in frontend/.env
const BASE_URL = import.meta.env.VITE_BACKEND_URL || "/api";

export async function analyzeKeyword(keyword) {
  try {
    const response = await axios.post(
      `${BASE_URL}/analyze`,
      { keyword },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 60000
      }
    );
    return { data: response.data, error: null };
  } catch (err) {
    const msg =
      err.response?.data?.error ||
      err.message ||
      "Failed to connect to backend. Make sure backend is running on port 5000.";
    return { data: null, error: msg };
  }
}

export async function checkBackendHealth() {
  try {
    const r = await axios.get(`${BASE_URL}/`, { timeout: 5000 });
    return r.data;
  } catch {
    return null;
  }
}

# SocialPulse — Social Media Listening Tool

AI-powered news monitoring and sentiment analysis. Search any keyword and get real news articles with direct links, sentiment charts, and source breakdowns.

---

## Run in VS Code (2 terminals)

### Prerequisites
- Node.js 18+ installed ([nodejs.org](https://nodejs.org))

---

### Terminal 1 — Backend

```bash
cd backend
npm install
npm run dev
```

Backend runs on → http://localhost:5000

---

### Terminal 2 — Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on → http://localhost:3000

Open http://localhost:3000 in your browser.

---

## API Key

The Anthropic API key is already set in `backend/.env`.

To use your own key, replace it:
```
ANTHROPIC_API_KEY=your_key_here
```

Get a key at: https://console.anthropic.com/

> **Without an API key** the app runs in Demo Mode (mock data, but still clickable source links).

---

## Project Structure

```
socialpulse/
├── backend/
│   ├── server.js       ← Express API server
│   ├── package.json
│   └── .env            ← API key goes here
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── api.js
    │   └── components/
    │       ├── SearchPage.jsx
    │       └── Dashboard.jsx
    ├── index.html
    ├── vite.config.js
    └── package.json
```

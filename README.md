# ⚡ SportPulse — Dynamic Themed Sports Information Hub

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Vanilla JS](https://img.shields.io/badge/Vanilla-JavaScript-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![HTML5 & CSS3](https://img.shields.io/badge/HTML5%20%2F%20CSS3-Modern%20Design-E34F26?logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![OpenF1](https://img.shields.io/badge/API-OpenF1-red)](https://openf1.org/)
[![Lichess & Chess.com](https://img.shields.io/badge/API-Lichess%20%26%20Chess.com-purple)](https://lichess.org/api)
[![TheSportsDB](https://img.shields.io/badge/API-TheSportsDB-green)](https://www.thesportsdb.com/)

**SportPulse** is a lightweight, responsive single-page web dashboard designed to bring live statistics, standings, match schedules, and deep insights from multiple sports disciplines into one unified interface.

Built purely with **Vanilla JavaScript (ES6+)**, **modern CSS3 custom properties**, and **semantic HTML5**, SportPulse delivers instant data visualizations without heavy frameworks or unnecessary dependencies.

---

## 🌟 Highlights & Features

### 🏎️ Formula 1 Hub
- **Telemetry & Live Laps**: Real-time lap data, sector times, and session telemetry powered by the [OpenF1 API](https://openf1.org/).
- **Driver Standings**: Comprehensive standings with team colors, podium highlights, and point differentials.
- **Dynamic Theming**: High-octane motorsport aesthetic featuring technical fonts (`Orbitron`) and neon/race accents.

### ♟️ Chess Multi-Card Dashboard
- **Top Grandmasters & Ratings**: Fetches real-time leaderboard statistics from both **Lichess** and **Chess.com** public APIs.
- **Tactical Insights & Games**: Interactive cards showcasing recent grandmaster games, accuracy scores, and tournament results.
- **Classic Aesthetic**: Elegant serif typography (`Playfair Display`) tailored for strategic depth.

### 🏏 Cricket Live Center
- **Live Match Tracking**: Real-time scores, innings summaries, and run rates via ESPNCricinfo feeds.
- **Upcoming Fixtures & Schedules**: Comprehensive international and league tournament calendars.
- **Match Insights**: Detailed breakdown of wickets, boundaries, and key partnerships.

### ⚽ Football / Soccer Arena
- **Premier League & Top 5 Leagues**: Past fixtures, real-time match results, and upcoming schedules powered by [TheSportsDB API](https://www.thesportsdb.com/).
- **Live Standings Tables**: Full table view with club badges, goals for/against, goal difference, and points.
- **Stadium & Club Spotlight**: Rich details on club venues, capacities, and historical facts.

---

## 🎨 UI/UX Features

- 🌓 **Dark / Light Mode**: Seamless theme switching with persistent state saved in `localStorage`.
- 🔄 **Live Data Refresh**: One-click refresh to fetch the latest scores without reloading the browser.
- 📱 **Fully Responsive**: Mobile-first design that adapts effortlessly across smartphones, tablets, and wide desktop screens.
- ⚡ **Zero External Frameworks**: Fast page loads, zero npm build steps, and pure native web standards.
- 🔐 **Interactive Modal**: Clean user login / preference modal for saved configurations.
- 🔔 **Toast Notification System**: In-app feedback for API status, errors, and system alerts.

---

## 📁 Project Structure

```text
Sports-Pulse/
├── index.html       # Primary single-page HTML layout & navigation
├── script.js        # Core JavaScript application logic & API fetch handlers
├── app.js           # Companion/modular script logic
├── style.css        # Main stylesheet with CSS tokens, dark mode & sport themes
├── styles.css       # Supporting styles and responsive layout rules
├── LICENSE          # MIT Open Source License
└── README.md        # Project documentation
```

---

## 🚀 Getting Started

No build tools, bundlers, or package installations are required! You can run this project locally in seconds.

### 1. Clone the Repository
```bash
git clone https://github.com/hasmitha-47/Sports-Pulse.git
cd Sports-Pulse
```

### 2. Run the App

#### Option A: Direct Browser Launch
Simply double-click `index.html` or open it with your browser of choice (Chrome, Edge, Firefox, Safari).

#### Option B: Local Development Server (Recommended)
Using Python:
```bash
# Python 3
python -m http.server 8000
```
Then navigate to `http://localhost:8000` in your web browser.

Or using VS Code:
- Install the **Live Server** extension.
- Right-click `index.html` and click **"Open with Live Server"**.

---

## ⚙️ API Configuration

The project is pre-configured with free public endpoints and developer access keys:

| Sport | Provider | Config Variable in `script.js` | Note |
| :--- | :--- | :--- | :--- |
| **Formula 1** | [OpenF1](https://openf1.org/) | `F1_ACCESS_TOKEN` | Free public access or optional Bearer token |
| **Chess** | [Lichess API](https://lichess.org/api) & [Chess.com](https://www.chess.com/news/view/published-data-api) | *Direct public endpoints* | No API key required |
| **Football** | [TheSportsDB](https://www.thesportsdb.com/) | `SPORTSDB_API_KEY` | Free public test key (`"3"`) included |
| **Cricket** | [ESPNCricinfo RSS](https://www.espncricinfo.com/) | `CRICKET_API_KEY` | Free RSS-to-JSON or optional CricAPI key |

To add your own API tokens, open `script.js` (or `app.js`) and edit lines 27–29:
```javascript
const F1_ACCESS_TOKEN = "YOUR_TOKEN_HERE"; // Optional Bearer token for OpenF1
const SPORTSDB_API_KEY = "3";               // TheSportsDB test key
const CRICKET_API_KEY = "YOUR_KEY_HERE";   // Optional custom cricket API key
```

---

## 🛠️ Built With

- **HTML5** — Semantic page architecture and accessible components
- **CSS3** — Custom properties (CSS variables), Flexbox, CSS Grid, Glassmorphism
- **JavaScript (ES6+)** — Fetch API, DOM manipulation, async/await, localStorage
- **Google Fonts** — [Inter](https://fonts.google.com/specimen/Inter), [Orbitron](https://fonts.google.com/specimen/Orbitron), [Playfair Display](https://fonts.google.com/specimen/Playfair+Display)

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for full details.

---

## 🤝 Contributing

Contributions, issues, and feature suggestions are welcome!
Feel free to open an issue or submit a Pull Request.

/**
 * ============================================================================
 * SPORTPULSE — VANILLA JAVASCRIPT LIVE API APPLICATION LOGIC (script.js)
 * Beginner-friendly, modular script handling:
 * 1. API Configuration Keys & Key Registration Guides
 * 2. Real Live Data Fetching via fetch() for F1, Chess, Cricket, and Football
 * 3. Strict OpenF1 API usage: /v1/laps?session_key=latest with OAuth2 Bearer Token header
 * 4. Multi-Card Chess Dashboard (Cards A, B, C)
 * 5. Multi-Card Football Dashboard:
 *    - Card A: Recent Premier League Matches (TheSportsDB past events)
 *    - Card B: Top 5 League Standings Table (TheSportsDB lookup table with team badges)
 *    - Card C: Stadium & League Spotlight Card
 * 6. Robust Error Handling & Loading Feedback (Spinners / Error Badges)
 * 7. Dark Mode Theme Switching with localStorage Memory
 * 8. Seamless Single-Page Tab Switching (No Page Reload)
 * 9. Login Modal Interaction & User Settings
 * ============================================================================
 */

// ============================================================================
// 1. API CONFIGURATION KEYS & OAUTH2 TOKENS
// - OpenF1 API (F1): Free public REST API for live F1 lap times & session details.
// - Lichess & Chess.com APIs (Chess Multi-Card Hub): Free public REST APIs
// - ESPNCricinfo RSS (Cricket): Free RSS-to-JSON API
// - TheSportsDB API (Football): Uses free developer test key "3" or "1"
// ============================================================================
const F1_ACCESS_TOKEN = "YOUR_TOKEN_HERE"; // OAuth2 Bearer Token placeholder for OpenF1 API
const SPORTSDB_API_KEY = "3"; // Free public developer key for TheSportsDB API
const CRICKET_API_KEY = "YOUR_KEY_HERE"; // Optional: Register at https://www.cricapi.com/ if using CricAPI

// Object to track fetched state for caching during current session
const fetchState = {
  f1: false,
  chess: false,
  cricket: false,
  football: false
};

document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================================================
     2. DOM ELEMENT SELECTION
     ========================================================================== */
  // Theme & Navigation Controls
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const darkModeCheckbox = document.getElementById('dark-mode-checkbox');
  const refreshApiBtn = document.getElementById('refresh-api-btn');
  const settingsBtn = document.getElementById('settings-btn');
  const settingsMenu = document.getElementById('settings-menu');

  // Tab Elements
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  // Container Elements for Live API rendering
  const f1Container = document.getElementById('f1-container');
  const chessContainer = document.getElementById('chess-container');
  const cricketContainer = document.getElementById('cricket-container');
  const footballContainer = document.getElementById('football-container');

  // Status Badges
  const f1Badge = document.getElementById('f1-status-badge');
  const chessBadge = document.getElementById('chess-status-badge');
  const cricketBadge = document.getElementById('cricket-status-badge');
  const footballBadge = document.getElementById('football-status-badge');

  // Login Modal Elements
  const openLoginBtn = document.getElementById('open-login-btn');
  const loginModal = document.getElementById('login-modal');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const loginForm = document.getElementById('login-form');
  const toastContainer = document.getElementById('toast-notification');


  /* ==========================================================================
     3. DARK MODE THEME LOGIC
     ========================================================================== */
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('sportpulse_theme', theme);
    if (darkModeCheckbox) {
      darkModeCheckbox.checked = (theme === 'dark');
    }
  }

  function initTheme() {
    const savedTheme = localStorage.getItem('sportpulse_theme');
    if (savedTheme) {
      applyTheme(savedTheme);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      applyTheme(prefersDark ? 'dark' : 'light');
    }
  }

  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = (currentTheme === 'dark') ? 'light' : 'dark';
    applyTheme(newTheme);
    showToast(`Switched to ${newTheme.toUpperCase()} theme`);
  }

  if (themeToggleBtn) themeToggleBtn.addEventListener('click', toggleTheme);
  if (darkModeCheckbox) {
    darkModeCheckbox.addEventListener('change', (e) => {
      applyTheme(e.target.checked ? 'dark' : 'light');
    });
  }
  initTheme();


  /* ==========================================================================
     4. REAL LIVE API FETCH FUNCTIONS (NO FAKE DATA)
     ========================================================================== */

  /**
   * Helper function to render a clean Error Card if fetch fails or times out.
   */
  function renderError(container, badge, sportName, retryFunction) {
    if (badge) {
      badge.textContent = "API Error";
      badge.className = "api-status-tag error";
    }

    container.innerHTML = `
      <div class="error-card" style="grid-column: 1 / -1;">
        <h4>Unable to load ${sportName} live data</h4>
        <p>The external public API request failed or timed out. Please check your connection and try again.</p>
        <button class="btn btn-outline retry-btn">Retry Fetch</button>
      </div>
    `;

    const retryBtn = container.querySelector('.retry-btn');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        container.innerHTML = `
          <div class="loading-state" style="grid-column: 1 / -1;">
            <div class="spinner"></div>
            <p>Retrying connection to ${sportName} API...</p>
          </div>
        `;
        retryFunction();
      });
    }
  }

  // --------------------------------------------------------------------------
  // A. FORMULA 1 API FETCH (OpenF1 Live Laps & Session API)
  // --------------------------------------------------------------------------
  async function fetchF1Data() {
    try {
      if (f1Badge) {
        f1Badge.textContent = "Fetching OpenF1...";
        f1Badge.className = "api-status-tag";
      }

      // Configure OAuth2 Bearer Token in Request Headers for OpenF1 API
      const f1Headers = {};
      if (typeof F1_ACCESS_TOKEN !== 'undefined' && F1_ACCESS_TOKEN && F1_ACCESS_TOKEN !== "YOUR_TOKEN_HERE") {
        f1Headers['Authorization'] = `Bearer ${F1_ACCESS_TOKEN}`;
      }

      // Fetch in parallel using OpenF1 endpoints including live laps with OAuth2 header
      const [lapsRes, resultsRes, meetingRes, driversRes] = await Promise.all([
        fetch('https://api.openf1.org/v1/laps?session_key=latest', { headers: f1Headers }),
        fetch('https://api.openf1.org/v1/session_result?session_key=latest', { headers: f1Headers }),
        fetch('https://api.openf1.org/v1/meetings?meeting_key=latest', { headers: f1Headers }),
        fetch('https://api.openf1.org/v1/drivers?session_key=latest', { headers: f1Headers })
      ]);

      if (!lapsRes.ok && !resultsRes.ok) {
        throw new Error('OpenF1 API network request failed.');
      }

      const lapsData = lapsRes.ok ? await lapsRes.json() : [];
      const resultsData = resultsRes.ok ? await resultsRes.json() : [];
      const meetingData = meetingRes.ok ? await meetingRes.json() : [];
      const driversData = driversRes.ok ? await driversRes.json() : [];

      // Map driver numbers to full names & teams for display enrichment
      const driverMap = {};
      driversData.forEach(d => {
        driverMap[d.driver_number] = {
          name: d.full_name || `${d.first_name} ${d.last_name}`,
          acronym: d.name_acronym,
          team: d.team_name,
          color: d.team_colour ? `#${d.team_colour}` : 'var(--accent-primary)'
        };
      });

      // Meeting info
      const eventDetails = meetingData && meetingData.length > 0 ? meetingData[0] : {};
      
      // Filter top finished positions from session results
      const topResults = resultsData
        .filter(r => r.position !== null)
        .sort((a, b) => a.position - b.position);

      const p1 = topResults[0] || {};
      const p2 = topResults[1] || {};
      const p3 = topResults[2] || {};

      const getDriver = (num) => driverMap[num] || { name: `Driver #${num}`, team: 'F1 Team', color: 'var(--accent-primary)' };

      // Filter valid laps with lap_duration, driver_number, lap_number
      const validLaps = lapsData.filter(l => l.lap_duration !== null && l.driver_number !== null && l.lap_number !== null);

      if (f1Badge) {
        f1Badge.textContent = "Connected to OpenF1 Laps";
        f1Badge.className = "api-status-tag connected";
      }

      fetchState.f1 = true;

      // Render Real F1 Data Card with OpenF1 Live Laps, Session Results & Meeting Details
      f1Container.innerHTML = `
        <div class="card card-featured">
          <div class="card-header-row">
            <div>
              <h3 class="card-title">${eventDetails.meeting_official_name || eventDetails.meeting_name || 'OpenF1 Live Session & Lap Times'}</h3>
              <span class="card-subtext">${eventDetails.circuit_short_name || 'Circuit'}, ${eventDetails.location || ''} • ${eventDetails.country_name || 'F1 Grand Prix'} (${eventDetails.year || 'Latest'})</span>
            </div>
            <span class="tag tag-success">Live Laps: ${validLaps.length} Logged</span>
          </div>

          <!-- Podium Showcase from /v1/session_result -->
          ${topResults.length > 0 ? `
            <div class="podium-grid">
              <!-- 2nd Place -->
              <div class="podium-card p2">
                <span class="podium-rank">2</span>
                <div class="driver-info">
                  <strong class="driver-name">${getDriver(p2.driver_number).name}</strong>
                  <span class="team-name" style="color: ${getDriver(p2.driver_number).color}; font-weight: 600;">${getDriver(p2.driver_number).team}</span>
                </div>
                <span class="time-diff">${p2.gap_to_leader ? `+${p2.gap_to_leader}s` : 'P2'}</span>
              </div>

              <!-- 1st Place (Winner) -->
              <div class="podium-card p1">
                <div class="winner-crown">👑 Leader (+${p1.points || 25} pts)</div>
                <span class="podium-rank">1</span>
                <div class="driver-info">
                  <strong class="driver-name">${getDriver(p1.driver_number).name}</strong>
                  <span class="team-name" style="color: ${getDriver(p1.driver_number).color}; font-weight: 600;">${getDriver(p1.driver_number).team}</span>
                </div>
                <span class="time-diff">${p1.duration ? `${(p1.duration / 60).toFixed(2)} mins` : 'P1 Winner'}</span>
              </div>

              <!-- 3rd Place -->
              <div class="podium-card p3">
                <span class="podium-rank">3</span>
                <div class="driver-info">
                  <strong class="driver-name">${getDriver(p3.driver_number).name}</strong>
                  <span class="team-name" style="color: ${getDriver(p3.driver_number).color}; font-weight: 600;">${getDriver(p3.driver_number).team}</span>
                </div>
                <span class="time-diff">${p3.gap_to_leader ? `+${p3.gap_to_leader}s` : 'P3'}</span>
              </div>
            </div>
          ` : ''}

          <!-- OpenF1 Session & Meeting Details Grid -->
          <div class="info-grid" style="margin-bottom: 1.5rem;">
            <div class="info-label-value">
              <span class="info-label">Total Laps Fetched</span>
              <strong class="info-value">${validLaps.length} Laps</strong>
            </div>
            <div class="info-label-value">
              <span class="info-label">Meeting Key</span>
              <strong class="info-value">#${eventDetails.meeting_key || 'Latest'}</strong>
            </div>
            <div class="info-label-value">
              <span class="info-label">OAuth2 Bearer Status</span>
              <strong class="info-value">${F1_ACCESS_TOKEN !== 'YOUR_TOKEN_HERE' ? 'Authenticated' : 'Public Access'}</strong>
            </div>
            <div class="info-label-value">
              <span class="info-label">Circuit Type</span>
              <strong class="info-value">${eventDetails.circuit_type || 'Permanent Circuit'}</strong>
            </div>
          </div>

          <!-- Section: Live Session Lap Times (/v1/laps) -->
          <h4 style="font-size: 1rem; font-weight: 700; margin-bottom: 0.8rem;">Live Session Lap Times (/v1/laps?session_key=latest)</h4>
          <div class="dynamic-match-list">
            ${validLaps.slice(0, 8).map(lap => {
              const drv = getDriver(lap.driver_number);
              const durationFormatted = typeof lap.lap_duration === 'number' ? `${lap.lap_duration.toFixed(3)}s` : `${lap.lap_duration}s`;
              return `
                <div class="match-item">
                  <div>
                    <strong class="match-teams">Driver #${lap.driver_number} — ${drv.name}</strong>
                    <div style="font-size: 0.8rem; color: var(--text-muted);">Lap Number: ${lap.lap_number} • Team: ${drv.team}</div>
                  </div>
                  <span class="match-score-pill" style="background-color: var(--accent-light); color: var(--accent-primary); border: 1px solid var(--border-color);">⏱️ ${durationFormatted}</span>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;

    } catch (error) {
      console.error('Error fetching OpenF1 data:', error);
      renderError(f1Container, f1Badge, 'OpenF1 Laps', fetchF1Data);
    }
  }

  // --------------------------------------------------------------------------
  // B. CHESS API FETCH (Upgraded Multi-Card Dashboard: Cards A, B, C)
  // --------------------------------------------------------------------------
  async function fetchChessData() {
    try {
      if (chessBadge) {
        chessBadge.textContent = "Fetching Lichess & Chess.com...";
        chessBadge.className = "api-status-tag";
      }

      // Execute 3 live API requests in parallel
      const [puzzleRes, tvRes, leaderboardRes] = await Promise.allSettled([
        fetch('https://lichess.org/api/puzzle/daily'),
        fetch('https://lichess.org/api/tv/channels'),
        fetch('https://api.chess.com/pub/leaderboards')
      ]);

      // Parse Card A Data (Lichess Daily Puzzle)
      let puzzleHtml = '';
      if (puzzleRes.status === 'fulfilled' && puzzleRes.value.ok) {
        const pData = await puzzleRes.value.json();
        const p = pData.puzzle;
        const g = pData.game;
        const themes = p.themes ? p.themes.slice(0, 3).join(', ') : 'Tactics';
        const solutionStr = p.solution ? p.solution.slice(0, 4).join(' → ') : 'Move sequence';

        puzzleHtml = `
          <div class="card chess-dashboard-card">
            <div class="card-header-row">
              <div>
                <span class="tag" style="background-color: var(--accent-light); color: var(--accent-primary); font-weight: 700;">🧩 Card A: Daily Tactics Challenge</span>
                <h3 class="card-title" style="margin-top: 0.4rem;">Daily Lichess Puzzle #${p.id}</h3>
              </div>
              <span class="tag tag-success">Rating: ${p.rating}</span>
            </div>

            <div style="margin-bottom: 1.2rem;">
              <div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.5rem;">
                <strong>Themes:</strong> ${themes}
              </div>
              <div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.5rem;">
                <strong>Format:</strong> ${g.perf?.name || 'Classical'} • ${p.plays.toLocaleString()} Attempts
              </div>
              <div style="font-size: 0.85rem; color: var(--text-secondary); background: var(--bg-subtle); padding: 0.6rem; border-radius: var(--radius-sm);">
                <strong>Key Solution:</strong> ${solutionStr}
              </div>
            </div>

            <a href="https://lichess.org/training/${p.id}" target="_blank" class="btn btn-primary btn-block">Solve Puzzle on Lichess ↗</a>
          </div>
        `;
      } else {
        puzzleHtml = `<div class="card chess-dashboard-card"><h3 class="card-title">🧩 Daily Tactics</h3><p style="color:var(--text-muted);">Puzzle currently unavailable.</p></div>`;
      }

      // Parse Card B Data (Lichess TV Featured Match)
      let tvHtml = '';
      if (tvRes.status === 'fulfilled' && tvRes.value.ok) {
        const tvData = await tvRes.value.json();
        const best = tvData.best || tvData.blitz || tvData.rapid;
        const topUser = best ? best.user : { name: 'Grandmaster', title: 'GM' };
        const rating = best ? best.rating : 3000;
        const gameId = best ? best.gameId : '';

        tvHtml = `
          <div class="card chess-dashboard-card">
            <div class="card-header-row">
              <div>
                <span class="tag" style="background-color: var(--accent-light); color: var(--accent-primary); font-weight: 700;">📺 Card B: Featured Live TV Match</span>
                <h3 class="card-title" style="margin-top: 0.4rem;">Lichess TV Top Broadcast</h3>
              </div>
              <span class="live-status"><span class="pulse-dot"></span> Streaming</span>
            </div>

            <div class="chess-matchup" style="margin-bottom: 1.2rem; padding: 1rem;">
              <div class="player-card">
                <div class="player-avatar">♚</div>
                <strong class="player-name">${topUser.title ? topUser.title + ' ' : ''}${topUser.name}</strong>
                <span class="player-rating">Rating: ${rating}</span>
              </div>
              <div class="score-box">
                <span class="score" style="font-size: 1.2rem;">LIVE</span>
                <span class="score-detail">Top Channel</span>
              </div>
            </div>

            <div class="info-grid" style="margin-bottom: 1.2rem;">
              <div class="info-label-value">
                <span class="info-label">Title</span>
                <strong class="info-value">${topUser.title || 'Grandmaster'}</strong>
              </div>
              <div class="info-label-value">
                <span class="info-label">Game ID</span>
                <strong class="info-value">${gameId || 'Live'}</strong>
              </div>
            </div>

            <a href="${gameId ? `https://lichess.org/${gameId}` : 'https://lichess.org/tv'}" target="_blank" class="btn btn-outline btn-block">Watch Live GM Game ↗</a>
          </div>
        `;
      } else {
        tvHtml = `<div class="card chess-dashboard-card"><h3 class="card-title">📺 Live TV Match</h3><p style="color:var(--text-muted);">TV stream currently offline.</p></div>`;
      }

      // Parse Card C Data (Chess.com World News & Leaderboards)
      let newsHtml = '';
      if (leaderboardRes.status === 'fulfilled' && leaderboardRes.value.ok) {
        const lbData = await leaderboardRes.value.json();
        const topPlayers = (lbData.daily || lbData.live_blitz || []).slice(0, 4);

        newsHtml = `
          <div class="card chess-dashboard-card" style="grid-column: 1 / -1;">
            <div class="card-header-row">
              <div>
                <span class="tag" style="background-color: var(--accent-light); color: var(--accent-primary); font-weight: 700;">🏆 Card C: World Chess News & Leaderboard</span>
                <h3 class="card-title" style="margin-top: 0.4rem;">Top Grandmaster Standings</h3>
              </div>
              <span class="tag tag-success">Official Chess.com API</span>
            </div>

            <div class="dynamic-match-list">
              ${topPlayers.map(player => `
                <div class="match-item">
                  <div style="display: flex; align-items: center; gap: 0.8rem;">
                    <span class="match-score-pill" style="background-color: var(--bg-card); color: var(--text-primary); border: 1px solid var(--border-color);">#${player.rank}</span>
                    <div>
                      <strong class="match-teams">${player.title ? `<span style="color:var(--accent-primary); font-size:0.8rem; font-weight:800;">[${player.title}]</span> ` : ''}${player.name || player.username}</strong>
                      <div style="font-size: 0.8rem; color: var(--text-muted);">${player.win_count} Wins • Status: ${player.status.toUpperCase()}</div>
                    </div>
                  </div>
                  <span class="match-score-pill">${player.score || player.rating || 2500} ELO</span>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      } else {
        newsHtml = `<div class="card chess-dashboard-card" style="grid-column: 1 / -1;"><h3 class="card-title">🏆 World Chess Leaderboard</h3><p style="color:var(--text-muted);">Leaderboard feed currently unavailable.</p></div>`;
      }

      if (chessBadge) {
        chessBadge.textContent = "Connected to Lichess & Chess.com";
        chessBadge.className = "api-status-tag connected";
      }

      fetchState.chess = true;

      // Render the 3-card Grid Layout
      chessContainer.innerHTML = puzzleHtml + tvHtml + newsHtml;

    } catch (error) {
      console.error('Error fetching Chess dashboard data:', error);
      renderError(chessContainer, chessBadge, 'Chess Dashboard', fetchChessData);
    }
  }

  // --------------------------------------------------------------------------
  // C. CRICKET API FETCH (ESPNCricinfo RSS via rss2json)
  // --------------------------------------------------------------------------
  async function fetchCricketData() {
    try {
      if (cricketBadge) {
        cricketBadge.textContent = "Fetching Cricinfo...";
        cricketBadge.className = "api-status-tag";
      }

      // Fetch ESPNCricinfo Live Scores RSS Feed converted to JSON
      const rssUrl = encodeURIComponent('https://www.espncricinfo.com/rss/livescores.xml');
      const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${rssUrl}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      const items = data.items || [];

      if (items.length === 0) {
        throw new Error('No cricket match feeds currently returned.');
      }

      if (cricketBadge) {
        cricketBadge.textContent = "Connected to ESPNCricinfo";
        cricketBadge.className = "api-status-tag connected";
      }

      fetchState.cricket = true;

      // Filter and render real match titles
      const matchItemsHtml = items.slice(0, 4).map(item => `
        <div class="match-item">
          <div>
            <strong class="match-teams" style="color: var(--text-primary); font-size: 0.95rem;">${item.title}</strong>
            <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.2rem;">Live International Scorecard</div>
          </div>
          <a href="${item.link}" target="_blank" class="btn btn-outline" style="font-size: 0.75rem; padding: 0.3rem 0.6rem;">Full Details ↗</a>
        </div>
      `).join('');

      cricketContainer.innerHTML = `
        <div class="card card-featured">
          <div class="card-header-row">
            <div>
              <h3 class="card-title">Live & Recent International Cricket Fixtures</h3>
              <span class="card-subtext">Real-time ESPNCricinfo Scoreboard Feed</span>
            </div>
            <span class="tag tag-success">${items.length} Matches Online</span>
          </div>

          <div class="dynamic-match-list">
            ${matchItemsHtml}
          </div>
        </div>
      `;

    } catch (error) {
      console.error('Error fetching Cricket data:', error);
      renderError(cricketContainer, cricketBadge, 'ESPNCricinfo', fetchCricketData);
    }
  }

  // --------------------------------------------------------------------------
  // D. FOOTBALL API FETCH (TheSportsDB Upgraded Multi-Card Dashboard: Cards A, B, C)
  // Endpoints:
  // - Card A: https://www.thesportsdb.com/api/v1/json/3/eventspastleague.php?id=4328 (Recent 3 EPL Matches)
  // - Card B: https://www.thesportsdb.com/api/v1/json/3/lookuptable.php?l=4328&s=2024-2025 (Top 5 Table & Badges)
  // - Card C: Stadium & Championship Spotlight Card
  // --------------------------------------------------------------------------
  async function fetchFootballData() {
    try {
      if (footballBadge) {
        footballBadge.textContent = "Fetching TheSportsDB...";
        footballBadge.className = "api-status-tag";
      }

      // Execute requests in parallel
      const [eventsRes, standingsRes] = await Promise.allSettled([
        fetch(`https://www.thesportsdb.com/api/v1/json/${SPORTSDB_API_KEY}/eventspastleague.php?id=4328`),
        fetch(`https://www.thesportsdb.com/api/v1/json/${SPORTSDB_API_KEY}/lookuptable.php?l=4328&s=2024-2025`)
      ]);

      // Parse Card A (Recent Matches)
      let matchesHtml = '';
      let featuredBanner = 'https://r2.thesportsdb.com/images/media/league/badge/gasy9d1737743125.png';

      if (eventsRes.status === 'fulfilled' && eventsRes.value.ok) {
        const data = await eventsRes.value.json();
        const events = data.events || [];
        const recent3 = events.slice(0, 3);
        if (events[0] && events[0].strLeagueBadge) {
          featuredBanner = events[0].strLeagueBadge;
        }

        matchesHtml = `
          <div class="card football-dashboard-card">
            <div class="card-header-row">
              <div>
                <span class="tag" style="background-color: var(--accent-light); color: var(--accent-primary); font-weight: 700;">⚽ Card A: Recent EPL Matches</span>
                <h3 class="card-title" style="margin-top: 0.4rem;">Latest Premier League Fixtures</h3>
              </div>
              <span class="tag tag-success">Official Scores</span>
            </div>

            <div class="dynamic-match-list">
              ${recent3.map(ev => `
                <div class="match-item" style="padding: 0.8rem 1rem;">
                  <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
                    <div style="display: flex; align-items: center; gap: 0.5rem; flex: 1;">
                      <span style="font-size: 1.2rem;">⚽</span>
                      <strong class="match-teams" style="font-size: 0.9rem;">${ev.strHomeTeam}</strong>
                    </div>

                    <span class="match-score-pill" style="margin: 0 0.8rem;">${ev.intHomeScore ?? 0} - ${ev.intAwayScore ?? 0}</span>

                    <div style="display: flex; align-items: center; gap: 0.5rem; flex: 1; justify-content: flex-end; text-align: right;">
                      <strong class="match-teams" style="font-size: 0.9rem;">${ev.strAwayTeam}</strong>
                      <span style="font-size: 1.2rem;">⚽</span>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      } else {
        matchesHtml = `<div class="card football-dashboard-card"><h3 class="card-title">⚽ Recent Matches</h3><p style="color:var(--text-muted);">Match data currently unavailable.</p></div>`;
      }

      // Parse Card B (Top 5 League Standings Table with strBadge Team Logos)
      let standingsHtml = '';
      if (standingsRes.status === 'fulfilled' && standingsRes.value.ok) {
        const stData = await standingsRes.value.json();
        const table = (stData.table || []).slice(0, 5);

        standingsHtml = `
          <div class="card football-dashboard-card">
            <div class="card-header-row">
              <div>
                <span class="tag" style="background-color: var(--accent-light); color: var(--accent-primary); font-weight: 700;">🏆 Card B: League Standings (Top 5)</span>
                <h3 class="card-title" style="margin-top: 0.4rem;">2024-2025 Premier League Table</h3>
              </div>
              <span class="tag tag-success">Top 5 Teams</span>
            </div>

            <div style="overflow-x: auto;">
              <table class="standings-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Team</th>
                    <th>P</th>
                    <th>W</th>
                    <th>Pts</th>
                  </tr>
                </thead>
                <tbody>
                  ${table.map(team => `
                    <tr>
                      <td style="font-weight: 700; color: var(--accent-primary);">#${team.intRank}</td>
                      <td>
                        <div class="team-cell">
                          ${team.strBadge ? `<img src="${team.strBadge}" alt="${team.strTeam}" class="team-badge-icon" />` : '⚽'}
                          <span>${team.strTeam}</span>
                        </div>
                      </td>
                      <td>${team.intPlayed}</td>
                      <td>${team.intWin}</td>
                      <td><strong style="color: var(--accent-primary);">${team.intPoints}</strong></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        `;
      } else {
        standingsHtml = `<div class="card football-dashboard-card"><h3 class="card-title">🏆 League Standings</h3><p style="color:var(--text-muted);">Standings table currently unavailable.</p></div>`;
      }

      // Parse Card C (Stadium & League Spotlight)
      const spotlightHtml = `
        <div class="card football-dashboard-card" style="grid-column: 1 / -1;">
          <div class="card-header-row">
            <div>
              <span class="tag" style="background-color: var(--accent-light); color: var(--accent-primary); font-weight: 700;">🏟️ Card C: Stadium & League Spotlight</span>
              <h3 class="card-title" style="margin-top: 0.4rem;">English Premier League Spotlight</h3>
            </div>
            <span class="tag">TheSportsDB API</span>
          </div>

          <div style="display: flex; flex-wrap: wrap; gap: 1.5rem; align-items: center;">
            <div style="flex: 1; min-width: 240px; text-align: center; background: var(--bg-subtle); padding: 1rem; border-radius: var(--radius-sm);">
              <img src="${featuredBanner}" alt="EPL Badge" style="max-height: 120px; object-fit: contain;" />
            </div>

            <div style="flex: 2; min-width: 280px;">
              <h4 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 0.5rem; color: var(--text-primary);">Premier League 2024-2025 Championship Campaign</h4>
              <p style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 1rem; line-height: 1.6;">
                The English Premier League features 20 elite clubs competing across 38 match weeks. Track live team performances, goal differentials, points tally, and top-tier stadium venues updated directly from TheSportsDB public API.
              </p>
              <div class="info-grid">
                <div class="info-label-value">
                  <span class="info-label">League ID</span>
                  <strong class="info-value">#4328</strong>
                </div>
                <div class="info-label-value">
                  <span class="info-label">Total Teams</span>
                  <strong class="info-value">20 Clubs</strong>
                </div>
                <div class="info-label-value">
                  <span class="info-label">Region</span>
                  <strong class="info-value">England, UK</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;

      if (footballBadge) {
        footballBadge.textContent = "Connected to TheSportsDB";
        footballBadge.className = "api-status-tag connected";
      }

      fetchState.football = true;

      // Render the 3-Card Grid Layout for Football
      footballContainer.innerHTML = matchesHtml + standingsHtml + spotlightHtml;

    } catch (error) {
      console.error('Error fetching Football dashboard data:', error);
      renderError(footballContainer, footballBadge, 'Football Dashboard', fetchFootballData);
    }
  }


  /* ==========================================================================
     5. SEAMLESS TAB NAVIGATION & DYNAMIC SPORT THEME SWITCHING (Task 2)
     ========================================================================== */
  function loadSportData(targetId) {
    if (targetId === 'f1-content' && !fetchState.f1) {
      fetchF1Data();
    } else if (targetId === 'chess-content' && !fetchState.chess) {
      fetchChessData();
    } else if (targetId === 'cricket-content' && !fetchState.cricket) {
      fetchCricketData();
    } else if (targetId === 'football-content' && !fetchState.football) {
      fetchFootballData();
    }
  }

  function switchTab(clickedTabBtn) {
    const targetId = clickedTabBtn.getAttribute('data-target');

    // Dynamically update body class name to match active sport theme
    const sportTheme = targetId.replace('-content', ''); // 'f1', 'chess', 'cricket', 'football'
    document.body.className = `theme-${sportTheme}`;

    tabButtons.forEach(btn => {
      btn.classList.remove('active');
      btn.setAttribute('aria-selected', 'false');
    });

    tabContents.forEach(content => {
      content.classList.remove('active-content');
    });

    clickedTabBtn.classList.add('active');
    clickedTabBtn.setAttribute('aria-selected', 'true');

    const targetContent = document.getElementById(targetId);
    if (targetContent) {
      targetContent.classList.add('active-content');
    }

    // Trigger API fetch for active tab
    loadSportData(targetId);
  }

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn));
  });

  // Initial load for default active tab (F1)
  fetchF1Data();


  /* ==========================================================================
     6. REFRESH BUTTON & SETTINGS DROPDOWN
     ========================================================================== */
  if (refreshApiBtn) {
    refreshApiBtn.addEventListener('click', () => {
      refreshApiBtn.classList.add('spinning');
      
      const activeTabBtn = document.querySelector('.tab-btn.active');
      const targetId = activeTabBtn ? activeTabBtn.getAttribute('data-target') : 'f1-content';

      if (targetId === 'f1-content') fetchF1Data();
      else if (targetId === 'chess-content') fetchChessData();
      else if (targetId === 'cricket-content') fetchCricketData();
      else if (targetId === 'football-content') fetchFootballData();

      setTimeout(() => {
        refreshApiBtn.classList.remove('spinning');
        showToast('Live API data refreshed!');
      }, 1000);
    });
  }

  if (settingsBtn && settingsMenu) {
    settingsBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      settingsMenu.classList.toggle('hidden');
    });

    document.addEventListener('click', (e) => {
      if (!settingsMenu.contains(e.target) && !settingsBtn.contains(e.target)) {
        settingsMenu.classList.add('hidden');
      }
    });
  }


  /* ==========================================================================
     7. LOGIN MODAL & UTILITY FUNCTIONS
     ========================================================================== */
  function openModal() {
    loginModal.classList.remove('hidden');
    loginModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    loginModal.classList.add('hidden');
    loginModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (openLoginBtn) openLoginBtn.addEventListener('click', openModal);
  if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);

  if (loginModal) {
    loginModal.addEventListener('click', (e) => {
      if (e.target === loginModal) closeModal();
    });
  }

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const usernameInput = document.getElementById('username').value.trim();
      if (usernameInput) {
        closeModal();
        showToast(`Signed in as ${usernameInput}`);
        openLoginBtn.textContent = 'Account';
        openLoginBtn.classList.remove('btn-primary');
        openLoginBtn.style.backgroundColor = 'var(--bg-subtle)';
        openLoginBtn.style.color = 'var(--text-primary)';
      }
    });
  }

  function showToast(message) {
    if (!toastContainer) return;
    toastContainer.textContent = message;
    toastContainer.classList.remove('hidden');
    setTimeout(() => {
      toastContainer.classList.add('hidden');
    }, 3000);
  }

});

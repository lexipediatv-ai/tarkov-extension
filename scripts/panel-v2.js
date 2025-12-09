// Tarkov Stats Extension - Panel Script v2.0
// With Auto-Refresh from Twitch Configuration Service

let twitch = null;
let refreshInterval = null;
let turnstileToken = null;
// Hosted proxy base (set to the verified working deploy to avoid cross-deploy CORS issues)
// If you need to override for testing, set window.FORCE_HOSTED_PROXY_BASE before scripts run.
const HOSTED_PROXY_BASE = (typeof window !== 'undefined' && window.FORCE_HOSTED_PROXY_BASE)
    ? window.FORCE_HOSTED_PROXY_BASE
    : 'https://tarkov-stats-fl8kf6gcg-marcelos-projects-fb95b857.vercel.app';

// A small list of known hosted proxy deploys (try in order when same-origin proxy is missing or returns 404).
// Add or reorder entries as you deploy new versions. This helps when one deploy's `api/` is missing
// or has Deployment Protection enabled — the client will try the others.
const FALLBACK_HOSTED_PROXIES = [
    'https://tarkov-stats-fl8kf6gcg-marcelos-projects-fb95b857.vercel.app',
    'https://tarkov-stats-dt9lgoo7p-marcelos-projects-fb95b857.vercel.app',
    'https://tarkov-stats-fipod0cyj-marcelos-projects-fb95b857.vercel.app',
    'https://tarkov-stats-ccq9amoan-marcelos-projects-fb95b857.vercel.app'
];

// Initialize extension
function init() {
    if (window.Twitch && window.Twitch.ext) {
        twitch = window.Twitch.ext;
        
        twitch.onAuthorized((auth) => {
            console.log('✅ Extension authorized');
            loadConfiguration();
        });
        
        twitch.configuration.onChanged(() => {
            console.log('🔄 Configuration changed');
            loadConfiguration();
        });
    } else {
        console.log('⚠️ Twitch not available, loading demo data');
        loadDemoData();
    }

    // Also try to read a localStorage-synced config (written by config page when saving)
    try {
        const raw = localStorage.getItem('tarkov_ext_config');
        if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && parsed.config) {
                console.log('📥 Loaded local config from localStorage (init)');
                displayStats(parsed.config);
                // If the saved config contains a playerId, start auto-refresh so the
                // panel will fetch the public JSON profile immediately and on interval.
                if (parsed.config.playerId) {
                    setupAutoRefresh(parsed.config.playerId);
                }
            }
        }
    } catch (e) {
        console.warn('Could not read localStorage config on init:', e);
    }

    // Auto-refresh is handled by storage listener and Twitch config.onChanged
}

// Load configuration from Twitch
function loadConfiguration() {
    if (!twitch) return;
    
    const config = twitch.configuration.broadcaster?.content;
    
    if (config) {
        try {
            const data = JSON.parse(config);
            console.log('📥 Configuration loaded:', data);
            displayStats(data);
            
            // Setup auto-refresh if enabled
            if (data.autoRefresh && data.playerId) {
                setupAutoRefresh(data.playerId);
            }
        } catch (e) {
            console.error('❌ Error parsing config:', e);
            showError('Erro ao carregar configuração');
        }
    } else {
        console.log('⚠️ No configuration found');
        showError('Configure a extensão primeiro!');
    }
}

// Display stats on panel
function displayStats(data) {
    // Update player info (always set from config, fallback to placeholders)
    const nameEl = document.getElementById('player-name-header');
    if (nameEl) nameEl.textContent = data.nickname || '—';

    // Parse level and prestige robustly (handle numeric or string '43 (Prestígio 3)')
    let parsedLevel = null;
    if (typeof data.level === 'number') parsedLevel = data.level;
    else if (typeof data.level === 'string') {
        const m = data.level.match(/(\d+)/);
        parsedLevel = m ? parseInt(m[1], 10) : null;
    }
    if (parsedLevel === null) parsedLevel = '-';

    const prestigeFromData = (typeof data.prestigeLevel === 'number' && data.prestigeLevel > 0) ? data.prestigeLevel : (typeof data.prestige === 'number' ? data.prestige : 0);

    // Update level in header
    const levelBadge = document.querySelector('.level-badge');
    if (levelBadge) {
        levelBadge.textContent = parsedLevel !== '-' ? `Level ${parsedLevel}` : 'Level -';
    }
    
    // Update stats (use defaults when absent)
    const raids = parseInt(data.raids) || 0;
    const survived = parseInt(data.survived) || 0;
    const runthrough = parseInt(data.runthrough) || 0;
    const hours = parseInt(data.hours) || 0;
    
    console.log('📊 Panel stats:', { raids, survived, runthrough, hours, rawHours: data.hours });
    
    document.getElementById('stat-raids').textContent = raids.toLocaleString();
    document.getElementById('stat-kills').textContent = (parseInt(data.kills) || 0).toLocaleString();
    document.getElementById('stat-deaths').textContent = (parseInt(data.deaths) || 0).toLocaleString();
    document.getElementById('stat-survived').textContent = survived.toLocaleString();
    document.getElementById('stat-runthrough').textContent = runthrough.toLocaleString();
    document.getElementById('stat-hours').textContent = hours.toLocaleString();
    document.getElementById('stat-kd').textContent = data.kd || '0.00';
    document.getElementById('stat-sr').textContent = (data.sr || '0.0') + '%';

    // compact card removed — header and stat boxes updated directly above
    
    // profile link removed - we rely on saved config values for display
    
    // Render achievements on panel (if provided)
    if (data.achievements) {
        try {
            displayPanelAchievements(data.achievements);
        } catch (e) {
            console.warn('Erro ao renderizar conquistas no painel:', e);
        }
    }

    // Set prestige icon in header (removido faction icon)
    const prestigeIcon = document.getElementById('prestige-icon');
    if (prestigeIcon) {
        const prestigeN = (typeof data.prestigeLevel === 'number' && data.prestigeLevel > 0) ? data.prestigeLevel : 0;
        if (prestigeN > 0) {
            findPrestigeAchievementImage(prestigeN).then(url => {
                const imgUrl = url || `https://assets.tarkov.dev/prestige-${prestigeN}-image.webp`;
                prestigeIcon.src = imgUrl;
                prestigeIcon.style.display = 'block';
                prestigeIcon.onerror = function() { 
                    this.onerror = null; 
                    this.src = `images/prestige-${prestigeN}.svg`; 
                };
            }).catch(() => {
                prestigeIcon.src = `images/prestige-${prestigeN}.svg`;
                prestigeIcon.style.display = 'block';
            });
        } else {
            prestigeIcon.style.display = 'none';
        }
    }
}

// Render achievements icons on the panel
function displayPanelAchievements(achievements) {
    const container = document.getElementById('panel-achievements-container');
    if (!container) return;

    // Normalize achievement ids to strings (profile keys may be numbers)
    const ids = Object.keys(achievements || {}).map(id => String(id));
    if (ids.length === 0) {
        container.style.display = 'none';
        container.innerHTML = '';
        return;
    }

    container.style.display = 'block';
    container.innerHTML = `<div class="achievements-title">🏆 Achievements (${ids.length})</div><div class="achievements-grid" id="panel-ach-grid"></div>`;

    const grid = document.getElementById('panel-ach-grid');

    // Try to fetch achievement metadata from tarkov.dev GraphQL (best-effort)
    // Prefer hosted proxy for GraphQL (avoids CORS blocks). Online-only: no localhost usage.
    const graphQlQuery = JSON.stringify({ query: `{
            achievements { id name imageLink normalizedRarity }
        }` });

    (async () => {
        let json = null;

        // 1) Try hosted proxy candidates (prefer same-origin) for GraphQL metadata
        const proxies = [];
        if (HOSTED_PROXY_BASE && HOSTED_PROXY_BASE.length > 0) proxies.push(HOSTED_PROXY_BASE);
        for (const p of FALLBACK_HOSTED_PROXIES) if (!proxies.includes(p)) proxies.push(p);

        for (const base of proxies) {
            try {
                const h = await fetch(`${base}/api/graphql`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: graphQlQuery,
                    cache: 'no-store'
                });
                if (h.ok) {
                    json = await h.json();
                    break;
                } else {
                    console.debug('Hosted GraphQL proxy', base, 'returned', h.status);
                }
            } catch (he) {
                console.debug('Hosted GraphQL proxy failed for', base, he);
            }
        }

        // 2) Public CORS proxy (AllOrigins) — best-effort, may be rate-limited
        if (!json) {
            try {
                const all = `https://api.allorigins.win/raw?url=${encodeURIComponent('https://api.tarkov.dev/graphql')}`;
                const resp = await fetch(all, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: graphQlQuery,
                    cache: 'no-store'
                });
                if (resp.ok) json = await resp.json();
            } catch (e) {
                console.debug('AllOrigins GraphQL proxy failed or rate-limited:', e);
            }
        }

        // 3) Direct call as last resort (likely blocked by CORS in browser)
        if (!json) {
            try {
                const r = await fetch('https://api.tarkov.dev/graphql', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: graphQlQuery
                });
                json = await r.json();
            } catch (e) {
                console.debug('Direct GraphQL fetch failed:', e);
            }
        }

    const all = json?.data?.achievements || [];
    // Normalize metadata keys as strings as well
    const map = new Map(all.map(a => [String(a.id), a]));

    // Build an array of achievement objects for the requested ids; ensure string keys
    const found = ids.map(id => {
        const key = String(id);
        return map.get(key) || { id: key, name: key, imageLink: '', normalizedRarity: 'common' };
    });

        // Define rarity ordering (rarest first)
        const rarityOrder = ['legendary','epic','rare','uncommon','common'];

        // Sort by normalizedRarity using the ordering above; unknown => lowest priority
        found.sort((a, b) => {
            const ra = (a.normalizedRarity || 'common').toString().toLowerCase();
            const rb = (b.normalizedRarity || 'common').toString().toLowerCase();
            const ia = rarityOrder.indexOf(ra) >= 0 ? rarityOrder.indexOf(ra) : rarityOrder.length;
            const ib = rarityOrder.indexOf(rb) >= 0 ? rarityOrder.indexOf(rb) : rarityOrder.length;
            return ia - ib;
        });

        // Render sorted achievements
        found.forEach(a => {
            const img = a?.imageLink || '';
            const name = a?.name || a.id || '';
            const rarity = (a?.normalizedRarity || 'common').toString().toLowerCase();

            const div = document.createElement('div');
            div.className = `achievement-icon ${rarity}`;
            div.title = name;

            const image = document.createElement('img');
            // If imageLink is not present, use a small inline SVG placeholder (data URL)
            if (img && img.length > 0) {
                image.src = img;
            } else {
                // simple gray placeholder with a trophy mark
                image.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(
                    `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect rx="8" width="64" height="64" fill="#ddd"/><text x="50%" y="55%" font-size="28" text-anchor="middle" fill="#666" font-family="sans-serif">🏆</text></svg>`
                );
            }
            image.alt = name;
            // If remote image fails to load, replace with the placeholder inline SVG
            image.onerror = function() {
                this.onerror = null;
                this.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(
                    `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect rx="8" width="64" height="64" fill="#ddd"/><text x="50%" y="55%" font-size="28" text-anchor="middle" fill="#666" font-family="sans-serif">🏆</text></svg>`
                );
            };
            div.appendChild(image);
            grid.appendChild(div);
        });
    })();
    // If GraphQL failed entirely, show simple squares
    setTimeout(() => {
        if (!document.getElementById('panel-ach-grid') || document.getElementById('panel-ach-grid').children.length === 0) {
            ids.forEach(id => {
                const div = document.createElement('div');
                div.className = 'achievement-icon common';
                div.title = id;
                div.textContent = '🏆';
                grid.appendChild(div);
            });
        }
    }, 1200);
}

// Setup auto-refresh
function setupAutoRefresh(playerId) {
    // Clear existing interval
    if (refreshInterval) {
        clearInterval(refreshInterval);
    }
    
    console.log('🔄 Setting up auto-refresh for player:', playerId);
    
    // Immediately attempt a refresh now, then every 5 minutes
    const doRefresh = async () => {
        console.log('🔄 Auto-refreshing stats...');
        try {
            const timestamp = Date.now();

            // 1) Try hosted proxy candidates first (online-first strategy). Start with HOSTED_PROXY_BASE
            // (usually same-origin), then try known fallbacks if the first returns non-ok or is missing.
            const proxiesToTry = [];
            if (HOSTED_PROXY_BASE && HOSTED_PROXY_BASE.length > 0) proxiesToTry.push(HOSTED_PROXY_BASE);
            for (const p of FALLBACK_HOSTED_PROXIES) if (!proxiesToTry.includes(p)) proxiesToTry.push(p);

            for (const base of proxiesToTry) {
                try {
                    const hostedUrl = `${base}/api/profile/${encodeURIComponent(playerId)}?_=${timestamp}`;
                    const hostedResp = await fetch(hostedUrl, { cache: 'no-store' });
                    if (hostedResp.ok) {
                        const hdata = await hostedResp.json();
                        const stats = extractStats(hdata);
                        displayStats(stats);
                        try { localStorage.setItem('tarkov_ext_config', JSON.stringify({ config: { playerId, ...stats, lastUpdated: new Date().toISOString(), autoRefresh: true } })); } catch(e){}
                        return;
                    } else {
                        console.debug('Hosted proxy', base, 'returned', hostedResp.status);
                    }
                } catch (he) {
                    console.debug('Hosted proxy fetch failed for', base, ':', he);
                }
            }

            // 2) Try public CORS proxy (AllOrigins) — best-effort, may be rate-limited
            try {
                const allOrigins = `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://players.tarkov.dev/profile/${encodeURIComponent(playerId)}.json`)}`;
                const corsResp = await fetch(allOrigins, { cache: 'no-store' });
                if (corsResp.ok) {
                    const cdata = await corsResp.json();
                    const stats = extractStats(cdata);
                    displayStats(stats);
                    try { localStorage.setItem('tarkov_ext_config', JSON.stringify({ config: { playerId, ...stats, lastUpdated: new Date().toISOString(), autoRefresh: true } })); } catch(e){}
                    return;
                }
            } catch (ce) {
                console.debug('AllOrigins proxy failed or not available:', ce);
            }

            // 3) Try direct public players.tarkov.dev JSON (may be blocked by CORS)
            try {
                const publicUrl = `https://players.tarkov.dev/profile/${encodeURIComponent(playerId)}.json?_=${timestamp}`;
                const resp = await fetch(publicUrl, { cache: 'no-store' });
                if (resp.ok) {
                    const data = await resp.json();
                    const stats = extractStats(data);
                    displayStats(stats);
                    try { localStorage.setItem('tarkov_ext_config', JSON.stringify({ config: { playerId, ...stats, lastUpdated: new Date().toISOString(), autoRefresh: true } })); } catch(e){}
                    return;
                }
            } catch (e) {
                console.debug('Public profile fetch failed or blocked by CORS:', e);
            }

            // 4) Fallback: Turnstile-protected endpoint (requires token)
            if (!turnstileToken) {
                console.log('⚠️ No Turnstile token available, skipping Turnstile fallback');
                return;
            }

            const apiUrl = `https://player.tarkov.dev/account/${playerId}?gameMode=regular&token=${turnstileToken}&_=${timestamp}`;
            const response = await fetch(apiUrl);
            if (response.ok) {
                const freshData = await response.json();
                const stats = extractStats(freshData);
                displayStats(stats);
                try { localStorage.setItem('tarkov_ext_config', JSON.stringify({ config: { playerId, ...stats, lastUpdated: new Date().toISOString(), autoRefresh: true } })); } catch(e){}
            } else {
                console.warn('⚠️ Refresh failed (Turnstile):', response.status);
            }
        } catch (error) {
            console.error('❌ Auto-refresh error:', error);
        }
    };

    // Run immediately and then at interval
    doRefresh();
    refreshInterval = setInterval(doRefresh, 5 * 60 * 1000);
}

// Extract stats from API response (PMC only)
function extractStats(data) {
    const info = data.info || {};
    const pmcStats = data.pmcStats?.eft?.overAllCounters?.Items || [];

    function findStat(stats, keyParts) {
        const stat = stats.find(s => keyParts.every(part => s.Key.includes(part)));
        return stat?.Value || 0;
    }

    const pmcRaids = findStat(pmcStats, ['Sessions']);
    const pmcSurvived = findStat(pmcStats, ['ExitStatus', 'Survived']);
    const pmcKills = findStat(pmcStats, ['Kills']);
    const pmcDeaths = findStat(pmcStats, ['ExitStatus', 'Killed']);
    const pmcRunthrough = findStat(pmcStats, ['Runner']);
    // Extract hours from totalInGameTime (in seconds)
    let pmcHours = 0;
    if (data.pmcStats?.eft?.totalInGameTime) {
        pmcHours = Math.floor(data.pmcStats.eft.totalInGameTime / 3600);
    }

    const kd = pmcDeaths > 0 ? (pmcKills / pmcDeaths).toFixed(2) : pmcKills.toFixed(2);
    const sr = pmcRaids > 0 ? ((pmcSurvived / pmcRaids) * 100).toFixed(1) : '0.0';

    const baseLevel = (typeof info.level === 'number' && info.level > 0) ? info.level : calculateLevel(info.experience || 0);
    const prestige = typeof info.prestigeLevel === 'number' ? info.prestigeLevel : 0;
    const PRESTIGE_LEVEL_OFFSET = 6;
    const level = baseLevel + (prestige * PRESTIGE_LEVEL_OFFSET);

    return {
        nickname: info.nickname,
        // level returned includes prestige offset when applicable
        level: level,
        prestigeLevel: prestige,
        // include runthrough and hours so displayStats can show them
        runthrough: pmcRunthrough,
        hours: pmcHours,
        raids: pmcRaids,
        kills: pmcKills,
        deaths: pmcDeaths,
        survived: pmcSurvived,
        kd: kd,
        sr: sr,
        // traumatic removed
        profileUrl: `https://tarkov.dev/players/regular/${data.aid}`,
        achievements: data.achievements || {}
    };
}

// Calculate level from experience (Tarkov official formula)
function calculateLevel(exp) {
    if (exp === 0) return 1;
    
    // Tarkov level experience table (CUMULATIVE totals)
    // Source: tarkov.dev GraphQL API - handbook.playerLevels
    const levels = [
        0, 1000, 5017, 13449, 27705, 49182, 79205, 119010, 169706, 232329, 307807,
        396970, 500541, 619134, 753248, 903263, 1069436, 1251897, 1450644, 1665541, 1896317,
        2142563, 2403393, 2677775, 2964523, 3261631, 3566936, 3889112, 4219665, 4557928, 4903191,
        5246322, 5591298, 5932125, 6271954, 6611383, 6943182, 7265095, 7573434, 7843765, 8089125,
        8334485, 8550515, 8732551, 8875611, 8974386, 9023228, 9072070, 9187857, 9382463, 9664738,
        10042313, 10522438, 11112288, 11818823, 12648573, 13607648, 14701648, 15935648, 17314298, 18842098,
        20523298, 22361848, 24361348, 26524898, 28855148, 31353998, 34023048, 36863448, 39875848, 43060198,
        46416248, 49943398, 53640798, 57507298, 61541648, 65742098, 70106248, 74631298, 79313998, 84150048,
        89135598, 94266348, 99537648, 104944398, 110480998, 116141498, 121919348, 127807648, 133799148, 139886148,
        146060498, 152313548, 158636198, 165018948, 171451798, 177924148, 184424898, 190942348, 197464398, 203978698,
        210472448, 216932398, 223344898, 229695798, 235970498
    ];

    // Binary search for efficiency
    let level = 1;
    for (let i = 0; i < levels.length; i++) {
        if (exp >= levels[i]) {
            level = i + 1;
        } else {
            break;
        }
    }
    
    return level;
}

// Small HTML-escape helper for safe insertion
function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Achievements cache and helper (duplicate of config logic, kept local to panel)
let _panelAchievementsCache = null;
async function loadPanelAchievementsCache() {
    if (_panelAchievementsCache) return _panelAchievementsCache;
    try {
        const response = await fetch('https://api.tarkov.dev/graphql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: `{
                achievements { id name imageLink normalizedRarity }
            }` })
        });
        const json = await response.json();
        _panelAchievementsCache = json.data?.achievements || [];
    } catch (e) {
        console.warn('Could not load panel achievements metadata:', e);
        _panelAchievementsCache = [];
    }
    return _panelAchievementsCache;
}

async function findPrestigeAchievementImage(prestige) {
    if (!prestige) return null;
    // Prefer official assets if available
    const PRESTIGE_OFFICIAL_ASSETS = {
        1: 'https://assets.tarkov.dev/prestige-1-image.webp',
        2: 'https://assets.tarkov.dev/prestige-2-image.webp',
        3: 'https://assets.tarkov.dev/prestige-3-image.webp',
        4: 'https://assets.tarkov.dev/prestige-4-image.webp',
        5: 'https://assets.tarkov.dev/prestige-5-image.webp',
        6: 'https://assets.tarkov.dev/prestige-6-image.webp'
    };
    if (PRESTIGE_OFFICIAL_ASSETS[prestige]) return PRESTIGE_OFFICIAL_ASSETS[prestige];
    const n = prestige.toString();
    const list = await loadPanelAchievementsCache();
    if (!list || list.length === 0) return null;
    const lowerTarget = 'prestige';

    for (const a of list) {
        const id = (a.id || '').toString().toLowerCase();
        const name = (a.name || '').toString().toLowerCase();
        if (id.includes(lowerTarget) && id.includes(n)) return a.imageLink;
        if (name.includes(lowerTarget) && name.includes(n)) return a.imageLink;
        if (id.includes(`prestige-${n}`) || id.includes(`prestige_${n}`) || id.includes(`prestige${n}`)) return a.imageLink;
    }

    for (const a of list) {
        const name = (a.name || '').toLowerCase();
        if (name.includes(n) && (name.includes('prestig') || name.includes('prestígi') || name.includes('prestígio'))) return a.imageLink;
    }

    return null;
}

// Get time ago string
function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    if (seconds < 60) return 'agora mesmo';
    if (seconds < 3600) return `há ${Math.floor(seconds / 60)} minutos`;
    if (seconds < 86400) return `há ${Math.floor(seconds / 3600)} horas`;
    return `há ${Math.floor(seconds / 86400)} dias`;
}

// Show message
function showMessage(text) {
    const messageBox = document.getElementById('message-box');
    if (messageBox) {
        messageBox.textContent = text;
        messageBox.style.display = 'block';
        messageBox.className = 'message-box success';
    }
}

// Show error
function showError(text) {
    const messageBox = document.getElementById('message-box');
    if (messageBox) {
        messageBox.textContent = text;
        messageBox.style.display = 'block';
        messageBox.className = 'message-box error';
    }
}

// Load demo data for testing
function loadDemoData() {
    const demoData = {
        nickname: 'KarolMartynsTV',
        level: 79,
        raids: 243,
        kills: 633,
        deaths: 106,
        survived: 125,
        kd: '5.97',
        sr: '51.4',
        // traumatic removed
        profileUrl: 'https://tarkov.dev/players/regular/12220692'
    };
    
    displayStats(demoData);
    showMessage('Modo demonstração - Configure a extensão!');
}

// Cleanup on unload
window.addEventListener('beforeunload', () => {
    if (refreshInterval) {
        clearInterval(refreshInterval);
    }
});

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Wire up debug controls (if present) to allow pasting a config JSON locally
// Note: Manual refresh removed - panel auto-updates via storage listener and Twitch config.onChanged

// Listen for localStorage changes so panel updates automatically when config is saved in the config page
window.addEventListener('storage', (e) => {
    if (!e || !e.key) return;
    if (e.key === 'tarkov_ext_config') {
        try {
            const payload = JSON.parse(e.newValue);
            if (payload && payload.config) {
                console.log('🔁 Detected config change via localStorage, updating panel');
                displayStats(payload.config);
                // If the new config contains a playerId, ensure auto-refresh is
                // active for that player so the panel fetches fresh data.
                if (payload.config.playerId) {
                    setupAutoRefresh(payload.config.playerId);
                }
            }
        } catch (err) {
            console.warn('Error parsing localStorage payload for tarkov_ext_config:', err);
        }
    }
});

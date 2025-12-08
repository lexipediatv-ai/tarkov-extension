// Tarkov Stats Extension - Panel Script v2.0
// With Auto-Refresh from Twitch Configuration Service

let twitch = null;
let refreshInterval = null;
let turnstileToken = null;

// Helper: Calculate level from experience points
function calculateLevel(exp) {
    if (!exp || exp <= 0) return 1;
    
    const xpTable = [
        0, 1000, 4017, 8432, 14256, 21477, 30023, 39936, 51204, 63723,
        77563, 92713, 109174, 126946, 146029, 166423, 188129, 211147, 235477, 261119,
        288073, 316339, 345917, 376807, 409009, 442523, 477349, 513487, 550937, 589699,
        629773, 671159, 713857, 757867, 803189, 849823, 897769, 947027, 997597, 1049479,
        1102673, 1157179, 1212997, 1270127, 1328569, 1388323, 1449389, 1511767, 1575457, 1640459,
        1706773, 1774399, 1843337, 1913587, 1985149, 2058023, 2132209, 2207707, 2284517, 2362639,
        2442073, 2522819, 2604877, 2688247, 2772929, 2858923, 2946229, 3034847, 3124777, 3216019
    ];
    
    let level = 1;
    for (let i = 0; i < xpTable.length; i++) {
        if (exp >= xpTable[i]) {
            level = i + 1;
        } else {
            break;
        }
    }
    
    return Math.min(level, 79);
}

// Helper: Extract stat from overAllCounters array
function findStat(items, key) {
    const item = items.find(i => 
        Array.isArray(i.Key) && i.Key.length === 1 && i.Key[0] === key
    );
    return item?.Value || 0;
}

// Helper: Extract nested stat from overAllCounters array
function findNestedStat(items, key1, key2, key3) {
    const item = items.find(i => 
        Array.isArray(i.Key) && 
        i.Key[0] === key1 && 
        i.Key[1] === key2 &&
        (!key3 || i.Key[2] === key3)
    );
    return item?.Value || 0;
}

// Helper: Process raw JSON data from tarkov.dev
function processRawData(rawData, playerId) {
    const items = rawData.pmcStats?.eft?.overAllCounters?.Items || [];
    
    const raids = findNestedStat(items, 'Sessions', 'Pmc');
    const kills = findStat(items, 'Kills');
    const deaths = findStat(items, 'Deaths');
    const survived = findNestedStat(items, 'ExitStatus', 'Survived', 'Pmc');
    const runthrough = findNestedStat(items, 'ExitStatus', 'Runner', 'Pmc');
    
    const kd = deaths > 0 ? (kills / deaths).toFixed(2) : kills.toFixed(2);
    const sr = raids > 0 ? ((survived / raids) * 100).toFixed(2) : '0.00';
    
    return {
        success: true,
        nickname: rawData.info?.nickname || 'Unknown',
        id: playerId,
        stats: {
            level: calculateLevel(rawData.info?.experience || 0),
            faction: rawData.info?.side || 'Unknown',
            prestige: rawData.info?.prestigeLevel || 0,
            raids: raids,
            kills: kills,
            deaths: deaths,
            kd: parseFloat(kd),
            sr: parseFloat(sr),
            survived: survived,
            runthrough: runthrough,
            hours: Math.floor((rawData.pmcStats?.eft?.totalInGameTime || 0) / 3600)
        }
    };
}

// Fetch stats with hybrid approach (backend + JSON fallback)
async function fetchStatsHybrid(playerId) {
    let result = null;
    
    try {
        // Try backend first
        const backendUrl = `https://tarkov-stats-bdojw4788-marcelos-projects-fb95b857.vercel.app/api/player/id/${playerId}`;
        const backendResponse = await fetch(backendUrl, {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
            signal: AbortSignal.timeout(3000)
        });

        if (backendResponse.ok) {
            result = await backendResponse.json();
            console.log('✅ Stats from backend');
            return result;
        }
    } catch (error) {
        console.warn('⚠️ Backend unavailable, using JSON direct');
    }
    
    // Fallback to JSON
    const jsonUrl = `https://players.tarkov.dev/profile/${playerId}.json`;
    const jsonResponse = await fetch(jsonUrl);
    
    if (!jsonResponse.ok) {
        throw new Error('Player not found');
    }
    
    const rawData = await jsonResponse.json();
    return processRawData(rawData, playerId);
}

// Fetch and display stats (new function)
async function fetchAndDisplayStats(playerId) {
    try {
        showLoading();
        
        const result = await fetchStatsHybrid(playerId);
        
        if (result && result.success) {
            // Adapt backend format to display format
            const displayData = {
                nickname: result.nickname,
                playerId: playerId,
                level: result.stats.level,
                prestigeLevel: result.stats.prestige,
                side: result.stats.faction,
                raids: result.stats.raids,
                kills: result.stats.kills,
                deaths: result.stats.deaths,
                survived: result.stats.survived,
                runthrough: result.stats.runthrough,
                hours: result.stats.hours,
                kd: result.stats.kd,
                sr: result.stats.sr,
                achievements: result.achievements || {}
            };
            
            displayStats(displayData);
            hideError();
        } else {
            throw new Error('Invalid stats format');
        }
    } catch (error) {
        console.error('❌ Error fetching stats:', error);
        showError('Erro ao carregar stats: ' + error.message);
    }
}

// Show loading state
function showLoading() {
    const nameEl = document.getElementById('player-name-header');
    if (nameEl) nameEl.textContent = '⏳ Loading...';
}

// Hide error message
function hideError() {
    const errorEl = document.querySelector('.error-message');
    if (errorEl) errorEl.style.display = 'none';
}

// Initialize extension
function init() {
    console.log('🚀 Panel initializing...');
    console.log('📍 window.Twitch available:', !!window.Twitch);
    console.log('📍 window.Twitch.ext available:', !!(window.Twitch && window.Twitch.ext));
    
    if (window.Twitch && window.Twitch.ext) {
        twitch = window.Twitch.ext;
        console.log('✅ Using Twitch Extension API');
        
        twitch.onAuthorized((auth) => {
            console.log('✅ Extension authorized');
            loadConfiguration();
        });
        
        twitch.configuration.onChanged(() => {
            console.log('🔄 Configuration changed');
            loadConfiguration();
        });
    } else {
        console.log('⚠️ Twitch not available - loading from localStorage');
        
        // Try to read localStorage config (written by config page)
        try {
            const raw = localStorage.getItem('tarkov_ext_config');
            console.log('📦 localStorage content:', raw);
            
            if (raw) {
                const parsed = JSON.parse(raw);
                console.log('📥 Parsed config:', parsed);
                
                if (parsed && parsed.config) {
                    const config = parsed.config;
                    
                    // Check if new format (just playerId) or old format (full stats)
                    if (config.playerId && !config.nickname) {
                        console.log('🆕 New format detected - fetching stats for:', config.playerId);
                        fetchAndDisplayStats(config.playerId);
                        
                        // Setup auto-refresh (30 seconds)
                        if (config.autoRefresh !== false) {
                            setupAutoRefresh(config.playerId);
                        }
                    } else if (config.nickname) {
                        console.log('📊 Old format detected - displaying saved stats');
                        displayStats(config);
                    } else {
                        console.warn('⚠️ Unknown config format');
                        showError('Configure a extensão primeiro!');
                    }
                } else {
                    console.warn('⚠️ No config in localStorage');
                    showError('Configure a extensão primeiro!');
                }
            } else {
                console.warn('⚠️ localStorage is empty');
                showError('Configure a extensão primeiro!');
            }
        } catch (e) {
            console.error('❌ Error reading localStorage:', e);
            showError('Erro ao carregar configuração');
        }
    }

    // Listen for storage changes (when config page saves)
    window.addEventListener('storage', (e) => {
        if (e.key === 'tarkov_ext_config' && e.newValue) {
            console.log('🔄 Storage changed, reloading config...');
            try {
                const parsed = JSON.parse(e.newValue);
                if (parsed && parsed.config && parsed.config.playerId) {
                    fetchAndDisplayStats(parsed.config.playerId);
                    
                    // Restart auto-refresh with new config
                    if (parsed.config.autoRefresh !== false) {
                        setupAutoRefresh(parsed.config.playerId);
                    }
                }
            } catch (err) {
                console.error('Error handling storage change:', err);
            }
        }
    });
}

// Load configuration from Twitch
async function loadConfiguration() {
    if (!twitch) {
        console.warn('⚠️ loadConfiguration called but twitch is null');
        return;
    }
    
    console.log('📡 Reading broadcaster config...');
    console.log('📦 Raw config:', twitch.configuration.broadcaster);
    
    const config = twitch.configuration.broadcaster?.content;
    
    console.log('📝 Config content:', config);
    
    if (config) {
        try {
            const data = JSON.parse(config);
            console.log('📥 Twitch configuration loaded:', data);
            console.log('📍 Has playerId:', !!data.playerId);
            console.log('📍 Has nickname:', !!data.nickname);
            
            // Check if we have a playerId - if yes, fetch stats automatically
            if (data.playerId) {
                console.log('🚀 Fetching stats for Player ID:', data.playerId);
                await fetchAndDisplayStats(data.playerId);
                
                // Setup auto-refresh if enabled (30 seconds)
                if (data.autoRefresh !== false) {
                    setupAutoRefresh(data.playerId);
                }
            } else if (data.nickname) {
                // Old format with full stats - display them
                console.log('📊 Old format with full stats');
                displayStats(data);
            } else {
                console.warn('⚠️ Config has no playerId or nickname');
                showError('Configure a extensão primeiro!');
            }
        } catch (e) {
            console.error('❌ Error parsing config:', e);
            console.error('❌ Config string was:', config);
            showError('Erro ao carregar configuração');
        }
    } else {
        console.log('⚠️ No Twitch configuration found');
        console.log('📍 Broadcaster object:', twitch.configuration.broadcaster);
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

    const ids = Object.keys(achievements || {});
    if (ids.length === 0) {
        container.style.display = 'none';
        container.innerHTML = '';
        return;
    }

    container.style.display = 'block';
    container.innerHTML = `<div class="achievements-title">🏆 Achievements (${ids.length})</div><div class="achievements-grid" id="panel-ach-grid"></div>`;

    const grid = document.getElementById('panel-ach-grid');

    // Try to fetch achievement metadata from tarkov.dev GraphQL (best-effort)
    fetch('https://api.tarkov.dev/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: `{
            achievements { id name imageLink normalizedRarity }
        }` })
    }).then(r => r.json()).then(json => {
        const all = json.data?.achievements || [];
        const map = new Map(all.map(a => [a.id, a]));

        // Rarity order: legendary > epic > rare > uncommon > common
        const rarityOrder = { 'legendary': 0, 'epic': 1, 'rare': 2, 'uncommon': 3, 'common': 4 };

        // Create array with achievement data and sort by rarity (rarest first)
        const achievementsData = ids.map(id => {
            const a = map.get(id);
            return {
                id: id,
                img: a?.imageLink || '',
                name: a?.name || id,
                rarity: a?.normalizedRarity || 'common',
                rarityScore: rarityOrder[a?.normalizedRarity] ?? 4
            };
        }).sort((a, b) => a.rarityScore - b.rarityScore);

        // Render sorted achievements
        achievementsData.forEach(achievement => {
            const div = document.createElement('div');
            div.className = `achievement-icon ${achievement.rarity}`;
            div.title = `${achievement.name} (${achievement.rarity})`;
            const image = document.createElement('img');
            image.src = achievement.img;
            image.alt = achievement.name;
            div.appendChild(image);
            grid.appendChild(div);
        });
    }).catch(() => {
        // Fallback: show simple squares with IDs
        ids.forEach(id => {
            const div = document.createElement('div');
            div.className = 'achievement-icon common';
            div.title = id;
            div.textContent = '🏆';
            grid.appendChild(div);
        });
    });
}

// Setup auto-refresh
function setupAutoRefresh(playerId) {
    // Clear existing interval
    if (refreshInterval) {
        clearInterval(refreshInterval);
    }
    
    console.log('🔄 Setting up auto-refresh for player:', playerId);
    
    // Refresh every 5 minutes
    refreshInterval = setInterval(async () => {
        console.log('🔄 Auto-refreshing stats...');
        
        try {
            // Get fresh Turnstile token if needed
            if (!turnstileToken) {
                console.log('⚠️ No Turnstile token, skipping refresh');
                return;
            }
            
            const apiUrl = `https://player.tarkov.dev/account/${playerId}?gameMode=regular&token=${turnstileToken}`;
            const response = await fetch(apiUrl);
            
            if (response.ok) {
                const freshData = await response.json();
                console.log('✅ Fresh data received');
                
                // Update display with fresh data
                const stats = extractStats(freshData);
                displayStats(stats);
                
                // Optionally update Twitch config
                if (twitch) {
                    const config = {
                        ...stats,
                        playerId,
                        lastUpdated: new Date().toISOString(),
                        autoRefresh: true
                    };
                    twitch.configuration.set('broadcaster', '1', JSON.stringify(config));
                }
            } else {
                console.warn('⚠️ Refresh failed:', response.status);
            }
        } catch (error) {
            console.error('❌ Auto-refresh error:', error);
        }
    }, 5 * 60 * 1000); // 5 minutes
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

// Setup auto-refresh
function setupAutoRefresh(playerId) {
    // Clear existing interval
    if (refreshInterval) {
        clearInterval(refreshInterval);
        refreshInterval = null;
    }
    
    if (!playerId) {
        console.warn('⚠️ No playerId provided for auto-refresh');
        return;
    }
    
    console.log('🔄 Setting up auto-refresh every 30 seconds for Player ID:', playerId);
    
    // Refresh every 30 seconds
    refreshInterval = setInterval(() => {
        console.log('🔄 Auto-refreshing stats...');
        fetchAndDisplayStats(playerId).catch(err => {
            console.error('❌ Auto-refresh error:', err);
        });
    }, 30000); // 30 seconds
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
            }
        } catch (err) {
            console.warn('Error parsing localStorage payload for tarkov_ext_config:', err);
        }
    }
});

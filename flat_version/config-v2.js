// Tarkov Stats Extension - Configuration Page
// API Version 2.0 - Using official tarkov.dev API

let twitch = window.Twitch ? window.Twitch.ext : null;
let turnstileToken = null;
let playerData = null;
let autoRefreshInterval = null;
let _achievementsCache = null; // cached achievements metadata

// Known official prestige asset URLs (preferred)
const PRESTIGE_OFFICIAL_ASSETS = {
    1: 'https://assets.tarkov.dev/prestige-1-image.webp',
    2: 'https://assets.tarkov.dev/prestige-2-image.webp',
    3: 'https://assets.tarkov.dev/prestige-3-image.webp',
    4: 'https://assets.tarkov.dev/prestige-4-image.webp',
    5: 'https://assets.tarkov.dev/prestige-5-image.webp',
    6: 'https://assets.tarkov.dev/prestige-6-image.webp'
};

// Initialize Twitch Extension
if (twitch) {
    twitch.onAuthorized((auth) => {
        console.log('✅ Twitch extension authorized');
        document.getElementById('extension-status').textContent = 'Connected';
        loadSavedConfig();
    });
}

// No Turnstile initialization - direct API access
window.onload = function() {
    console.log('✅ Config page loaded - ready to fetch stats');
    // Enable button immediately
    updateFetchButtonState();
};

// Update fetch button state
function updateFetchButtonState() {
    const playerId = document.getElementById('player-id').value.trim();
    const fetchButton = document.getElementById('fetch-button');
    // Allow fetch even without Turnstile token (optional verification)
    const isValid = playerId.length >= 4;
    fetchButton.disabled = !isValid;
}

// Wait for DOM to be ready before attaching event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Listen to input changes
    const playerIdInput = document.getElementById('player-id');
    const fetchButton = document.getElementById('fetch-button');
    const configForm = document.getElementById('config-form');
    
    if (playerIdInput) {
        playerIdInput.addEventListener('input', updateFetchButtonState);
        // Initial check
        updateFetchButtonState();
    }
    
    // Fetch button click handler
    if (fetchButton) {
        fetchButton.addEventListener('click', fetchPlayerStats);
    }
    
    // Form submit handler
    if (configForm) {
        configForm.addEventListener('submit', saveConfiguration);
    }
});

// Fetch player stats from tarkov.dev API
async function fetchPlayerStats() {
    console.log('🔍 fetchPlayerStats called');
    
    const playerId = document.getElementById('player-id').value.trim();
    console.log('📝 Player ID:', playerId);
    
    if (!playerId || playerId.length < 4) {
        showMessage('❌ Please enter a valid Player ID (min 4 digits)', 'error');
        return;
    }

    // No Turnstile check - proceed directly
    console.log('🚀 Proceeding without Turnstile verification');

    const fetchButton = document.getElementById('fetch-button');
    const buttonText = document.getElementById('button-text');
    fetchButton.disabled = true;
    buttonText.textContent = '⏳ Fetching...';
    showMessage('🔍 Fetching stats from tarkov.dev...', 'info');

    try {
        // Try direct API call without token first
        const timestamp = new Date().getTime();
        const apiUrl = `https://player.tarkov.dev/account/${playerId}?gameMode=regular&_=${timestamp}`;
        
        console.log('🌐 Fetching stats:', apiUrl);
        
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: { 
                'Accept': 'application/json',
                'User-Agent': 'TwitchExtension/2.0'
            },
            cache: 'no-store',
            mode: 'cors'
        });

        console.log('📡 Status:', response.status);

        if (!response.ok) {
            if (response.status === 429) {
                throw new Error('Rate limit reached. Please wait 1 minute and try again.');
            }
            if (response.status === 401 || response.status === 403) {
                throw new Error('API access denied. The tarkov.dev API may require authentication. Try again in a few moments.');
            }
            if (response.status === 404) {
                throw new Error('Player not found. Please check the Player ID.');
            }
            
            const errorText = await response.text();
            throw new Error(errorText || `HTTP Error ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ Stats received:', data);

        if (data.aid && data.info) {
            playerData = data;
            playerData.playerId = playerId;
            displayStats(data);
            showMessage('✅ Stats loaded successfully!', 'success');
            
            // Enable save button
            document.getElementById('save-button').disabled = false;
        } else {
            throw new Error('Invalid API response data');
        }

    } catch (error) {
        console.error('❌ Error fetching stats:', error);
        
        // Show detailed error message
        let errorMsg = error.message || 'Unknown error occurred';
        if (error.message && error.message.includes('Failed to fetch')) {
            errorMsg = 'Network error. Check your internet connection or try again.';
        }
        
        showMessage(`❌ Error: ${errorMsg}`, 'error');
        
        // Reset Turnstile
        if (typeof turnstile !== 'undefined' && turnstile.reset) {
            try {
                turnstile.reset();
            } catch (e) {
                console.warn('Could not reset Turnstile:', e);
            }
        }
        turnstileToken = null;
        
    } finally {
        fetchButton.disabled = false;
        buttonText.textContent = '🚀 Fetch Stats';
    }
}

// Display stats on page
function displayStats(data) {
    const info = data.info || {};
    const pmcStats = data.pmcStats?.eft?.overAllCounters?.Items || [];

    // Helper function to find stat value
    function findStat(stats, keyParts) {
        const stat = stats.find(s => keyParts.every(part => s.Key.includes(part)));
        return stat?.Value || 0;
    }

    // Calculate PMC-only stats
    const pmcRaids = findStat(pmcStats, ['Sessions']);
    const pmcSurvived = findStat(pmcStats, ['ExitStatus', 'Survived']);
    const pmcKills = findStat(pmcStats, ['Kills']);
    const pmcDeaths = findStat(pmcStats, ['ExitStatus', 'Killed']);
    const pmcRunthrough = findStat(pmcStats, ['Runner']);
    
    // Extract hours from totalInGameTime (in seconds)
    let pmcHours = 0;
    if (data.pmcStats?.eft?.totalInGameTime) {
        pmcHours = Math.floor(data.pmcStats.eft.totalInGameTime / 3600);
        console.log('⏰ Hours calculated:', pmcHours, 'from', data.pmcStats.eft.totalInGameTime, 'seconds');
    } else {
        console.warn('⚠️ totalInGameTime not found in:', data.pmcStats?.eft);
    }

    const kd = pmcDeaths > 0 ? (pmcKills / pmcDeaths).toFixed(2) : pmcKills.toFixed(2);
    const sr = pmcRaids > 0 ? ((pmcSurvived / pmcRaids) * 100).toFixed(1) : '0.0';

    // Get level and prestige from API
    const prestige = typeof info.prestigeLevel === 'number' ? info.prestigeLevel : 0;
    const exp = info.experience || 0;
    
    // Calculate level from experience using official Tarkov table
    const level = calculateLevel(exp);

    // Update display (PMC-only)
    document.getElementById('display-raids').textContent = pmcRaids.toLocaleString();
    document.getElementById('display-kills').textContent = pmcKills.toLocaleString();
    document.getElementById('display-deaths').textContent = pmcDeaths.toLocaleString();
    document.getElementById('display-survived').textContent = pmcSurvived.toLocaleString();
    document.getElementById('display-kd').textContent = kd;
    document.getElementById('display-sr').textContent = sr + '%';
    // Show level with prestige marker when present
    document.getElementById('display-level').textContent = prestige > 0 ? `${level} (Prestígio ${prestige})` : `${level}`;
    document.getElementById('display-runthrough').textContent = pmcRunthrough.toLocaleString();
    document.getElementById('display-hours').textContent = pmcHours.toLocaleString();

    // Update hidden fields
    document.getElementById('stats-raids').value = pmcRaids;
    document.getElementById('stats-kills').value = pmcKills;
    document.getElementById('stats-deaths').value = pmcDeaths;
    document.getElementById('stats-survived').value = pmcSurvived;
    document.getElementById('stats-runthrough').value = pmcRunthrough;
    document.getElementById('stats-hours').value = pmcHours;
    document.getElementById('stats-kd').value = kd;
    document.getElementById('stats-sr').value = sr;
    document.getElementById('stats-level').value = level;
    document.getElementById('player-id').value = data.aid;

    // Populate compact summary card (includes faction and prestige icons when available)
    const compact = document.getElementById('compact-card');
    if (compact) {
        const side = (info.side || info.faction || '').toString().toLowerCase();
        const factionSrc = side.includes('bear') ? 'images/bear.svg' : side.includes('usec') ? 'images/usec.svg' : '';
        compact.style.display = 'block';
        compact.innerHTML = `
            <div style="display:flex; align-items:center; gap:8px;">
                ${factionSrc ? `<img src="${factionSrc}" class="faction-icon" alt="${escapeHtml(info.side||'')}" />` : ''}
                <div class="compact-left">
                    <div class="compact-name">${escapeHtml(info.nickname || '—')}</div>
                    <div class="compact-level">Nível ${level}${prestige>0 ? ' (Prestígio '+prestige+')' : ''}</div>
                </div>
                <span id="compact-prestige-slot"></span>
            </div>
            <div class="compact-stats">
                <div>Raids: <strong>${pmcRaids.toLocaleString()}</strong></div>
                <div>Kills: <strong>${pmcKills.toLocaleString()}</strong></div>
                <div>Deaths: <strong>${pmcDeaths.toLocaleString()}</strong></div>
                <div>Survived: <strong>${pmcSurvived.toLocaleString()}</strong></div>
                <div>K/D: <strong>${kd}</strong> • S/R: <strong>${sr}%</strong></div>
            </div>
        `;

        // Try to load prestige icon from achievements metadata; fallback to local images/prestige-{n}.svg
        if (prestige > 0) {
            findPrestigeAchievementImage(prestige).then(url => {
                const slot = document.getElementById('compact-prestige-slot');
                if (!slot) return;
                const img = document.createElement('img');
                img.className = 'prestige-icon';
                img.alt = 'prestige';
                const remote = url || `https://assets.tarkov.dev/prestige-${prestige}-image.webp`;
                img.src = remote;
                // if remote fails, fallback to local file
                img.onerror = function() {
                    this.onerror = null;
                    this.src = `images/prestige-${prestige}.svg`;
                };
                slot.appendChild(img);
            }).catch(() => {
                const slot = document.getElementById('compact-prestige-slot');
                if (!slot) return;
                const img = document.createElement('img');
                img.className = 'prestige-icon';
                img.alt = 'prestige';
                img.src = `images/prestige-${prestige}.svg`;
                slot.appendChild(img);
            });
        }
    }

    // Render achievements (best-effort)
    if (data.achievements) {
        displayAchievements(data.achievements);
    }

    // Show stats section
    document.getElementById('stats-section').style.display = 'block';
}

// Achievements helper: fetch and cache achievements metadata
async function loadAchievementsCache() {
    if (_achievementsCache) return _achievementsCache;
    try {
        const response = await fetch('https://api.tarkov.dev/graphql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: `{
                achievements { id name imageLink normalizedRarity }
            }` })
        });
        const json = await response.json();
        _achievementsCache = json.data?.achievements || [];
    } catch (e) {
        console.warn('Could not load achievements metadata:', e);
        _achievementsCache = [];
    }
    return _achievementsCache;
}

// Try to find a prestige icon among achievement images using heuristics
async function findPrestigeAchievementImage(prestige) {
    if (!prestige) return null;
    // Prefer official assets if available
    if (PRESTIGE_OFFICIAL_ASSETS[prestige]) return PRESTIGE_OFFICIAL_ASSETS[prestige];
    const n = prestige.toString();
    const list = await loadAchievementsCache();
    if (!list || list.length === 0) return null;
    const lowerTarget = `prestige`.toLowerCase();

    // Heuristic search
    for (const a of list) {
        const id = (a.id || '').toString().toLowerCase();
        const name = (a.name || '').toString().toLowerCase();
        if (id.includes(lowerTarget) && id.includes(n)) return a.imageLink;
        if (name.includes(lowerTarget) && name.includes(n)) return a.imageLink;
        if (id.includes(`prestige-${n}`) || id.includes(`prestige_${n}`) || id.includes(`prestige${n}`)) return a.imageLink;
    }

    // Fallback: try to find by name containing the number and a 'prestig' substring
    for (const a of list) {
        const name = (a.name || '').toLowerCase();
        if (name.includes(n) && (name.includes('prestig') || name.includes('prestígi') || name.includes('prestígio'))) return a.imageLink;
    }

    return null;
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

// Display achievements as horizontal icons
async function displayAchievements(achievements) {
    const achievementsContainer = document.getElementById('achievements-container');
    if (!achievementsContainer) return;

    achievementsContainer.innerHTML = '<div class="loading">🔍 Carregando conquistas...</div>';

    try {
        // Fetch achievements data from tarkov.dev API
        const response = await fetch('https://api.tarkov.dev/graphql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: `{
                    achievements {
                        id
                        name
                        description
                        imageLink
                        normalizedRarity
                    }
                }`
            })
        });

        const result = await response.json();
        const allAchievements = result.data?.achievements || [];

        // Filter completed achievements
        const completedIds = Object.keys(achievements);
        const completed = allAchievements.filter(a => completedIds.includes(a.id));

        if (completed.length === 0) {
            achievementsContainer.innerHTML = '<div class="no-achievements">Nenhuma conquista ainda</div>';
            return;
        }

        // Build icons HTML
        let html = `<div class="achievements-title">🏆 Conquistas (${completed.length})</div>`;
        html += '<div class="achievements-grid">';
        
        completed.forEach(achievement => {
            const rarityClass = achievement.normalizedRarity || 'common';
            html += `
                <div class="achievement-icon ${rarityClass}" title="${achievement.name} - ${achievement.description}">
                    <img src="${achievement.imageLink}" alt="${achievement.name}" />
                </div>
            `;
        });
        
        html += '</div>';
        achievementsContainer.innerHTML = html;

    } catch (error) {
        console.error('Error loading achievements:', error);
        achievementsContainer.innerHTML = '<div class="achievements-error">Erro ao carregar conquistas</div>';
    }
}

// Note: Debug JSON viewer removed for production/testing clarity

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

    // Find the highest level where experience requirement is met
    // Note: The table is offset - index 0 represents level 1, but we need to add 12 to match tarkov.dev
    let level = 1;
    for (let i = levels.length - 1; i >= 0; i--) {
        if (exp >= levels[i]) {
            level = i + 13; // Adjusted offset to match tarkov.dev level calculation
            break;
        }
    }
    
    return level;
}

// Save configuration to Twitch
async function saveConfiguration(event) {
    event.preventDefault();

    if (!playerData) {
        showMessage('❌ Fetch your stats first!', 'error');
        return;
    }

    const config = {
        playerId: playerData.playerId || playerData.aid,
        nickname: playerData.info.nickname,
        raids: document.getElementById('stats-raids').value,
        kills: document.getElementById('stats-kills').value,
        deaths: document.getElementById('stats-deaths').value,
        survived: document.getElementById('stats-survived').value,
        runthrough: document.getElementById('stats-runthrough').value,
        hours: document.getElementById('stats-hours').value,
        kd: document.getElementById('stats-kd').value,
        sr: document.getElementById('stats-sr').value,
        level: parseInt(document.getElementById('stats-level').value, 10) || 0,
        prestigeLevel: playerData.info.prestigeLevel || 0,
        side: playerData.info.side || playerData.info.faction || '',
        achievements: playerData.achievements || {},
        lastUpdated: new Date().toISOString(),
        autoRefresh: document.getElementById('auto-refresh').checked
    };
    
    console.log('💾 Saving config:', config);

    try {
        if (twitch) {
            twitch.configuration.set('broadcaster', '1', JSON.stringify(config));
            showMessage('✅ Configuration saved successfully!', 'success');
            console.log('💾 Config saved:', config);
            
            // Setup auto-refresh if enabled
            setupAutoRefresh(config.autoRefresh);
            // Also write to localStorage so a locally-open panel page can pick up the change
            try {
                const payload = { config, ts: Date.now() };
                localStorage.setItem('tarkov_ext_config', JSON.stringify(payload));
            } catch (e) {
                console.warn('Could not write localStorage for config sync:', e);
            }
        } else {
            console.log('📝 Config (no Twitch):', config);
            showMessage('✅ Configuration ready! (Twitch not detected in test)', 'success');
            // In non-Twitch local testing, still write to localStorage for the panel to detect
            try {
                const payload = { config, ts: Date.now() };
                localStorage.setItem('tarkov_ext_config', JSON.stringify(payload));
            } catch (e) {
                console.warn('Could not write localStorage for config sync:', e);
            }
        }
    } catch (error) {
        console.error('❌ Save error:', error);
        showMessage('❌ Error saving: ' + error.message, 'error');
    }
}

// Load saved configuration
function loadSavedConfig() {
    if (!twitch) return;

    twitch.configuration.onChanged(() => {
        const config = twitch.configuration.broadcaster?.content;
        if (config) {
            try {
                const data = JSON.parse(config);
                console.log('📥 Loaded config:', data);
                
                document.getElementById('player-id').value = data.playerId || '';
                document.getElementById('auto-refresh').checked = data.autoRefresh !== false;
                
                // If we have stats, display them
                if (data.raids) {
                    document.getElementById('display-raids').textContent = data.raids;
                    document.getElementById('display-kills').textContent = data.kills;
                    document.getElementById('display-deaths').textContent = data.deaths;
                    document.getElementById('display-survived').textContent = data.survived;
                    document.getElementById('display-kd').textContent = data.kd;
                    document.getElementById('display-sr').textContent = data.sr + '%';
                    document.getElementById('display-level').textContent = data.level;
                    document.getElementById('display-runthrough').textContent = data.runthrough || '0';
                    document.getElementById('display-hours').textContent = data.hours || '0';
                    
                    document.getElementById('stats-section').style.display = 'block';
                }
                
                setupAutoRefresh(data.autoRefresh);
            } catch (e) {
                console.error('❌ Parse config error:', e);
            }
        }
    });
}

// Setup auto-refresh
function setupAutoRefresh(enabled) {
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
        autoRefreshInterval = null;
    }

    if (enabled) {
        console.log('🔄 Auto-refresh enabled (5 minutes)');
        autoRefreshInterval = setInterval(() => {
            console.log('🔄 Auto-refreshing stats...');
            const playerId = document.getElementById('player-id').value;
            if (playerId && turnstileToken) {
                fetchPlayerStats();
            }
        }, 5 * 60 * 1000); // 5 minutes
    }
}

// Show status message
function showMessage(message, type) {
    const messageDiv = document.getElementById('status-message');
    messageDiv.textContent = message;
    messageDiv.className = `status-message ${type}`;
    messageDiv.style.display = 'block';

    if (type === 'success') {
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 5000);
    }
}

// Cleanup on unload
window.addEventListener('beforeunload', () => {
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
    }
});

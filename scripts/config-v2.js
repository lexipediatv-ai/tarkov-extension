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

// Config page initialization
window.onload = function() {
    console.log('✅ Config page loaded - ready to save Player ID');
    updateSaveButtonState();
};

// Update save button state
function updateSaveButtonState() {
    const playerId = document.getElementById('player-id').value.trim();
    const saveButton = document.getElementById('save-button');
    if (saveButton) {
        const isValid = playerId.length >= 4;
        saveButton.disabled = !isValid;
    }
}

// Wait for DOM to be ready before attaching event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Listen to input changes
    const playerIdInput = document.getElementById('player-id');
    const configForm = document.getElementById('config-form');
    
    if (playerIdInput) {
        playerIdInput.addEventListener('input', updateSaveButtonState);
        // Initial check
        updateSaveButtonState();
    }
    
    // Form submit handler - save directly without fetching
    if (configForm) {
        configForm.addEventListener('submit', saveConfigurationDirect);
    }
});
// Helper: Calculate level from experience points
function calculateLevel(exp) {
    if (!exp || exp <= 0) return 1;
    
    // Tarkov XP table (CUMULATIVE totals - official from Wiki)
    // Source: https://escapefromtarkov.fandom.com/wiki/Experience
    const xpTable = [
        0, 1000, 4017, 8432, 14256, 21477, 30023, 39936, 51204, 63723,           // 1-10
        77563, 93279, 115302, 143253, 177337, 217885, 264432, 316851, 374400, 437465,  // 11-20
        505161, 577978, 656347, 741150, 836066, 944133, 1066259, 1199423, 1343743, 1499338, // 21-30
        1666320, 1846664, 2043449, 2258436, 2492126, 2750217, 3032022, 3337766, 3663831, 4010481, // 31-40
        4377862, 4785793, 5182399, 5627732, 6102063, 6690287, 7189442, 7779792, 8401607, 9455144, // 41-50
        9740666, 10458431, 11219666, 12024744, 12874041, 13767918, 14706741, 15690872, 16720667, 17816442, // 51-60
        19041492, 20360945, 21792266, 23350443, 25098462, 27100775, 29581231, 33028574, 37953544, 44260543, // 61-70
        51901513, 60887711, 71228846, 82933459, 96009180, 110462910, 126300949, 144924572, 172016256 // 71-79
    ];
    
    let level = 1;
    for (let i = xpTable.length - 1; i >= 0; i--) {
        if (exp >= xpTable[i]) {
            level = i + 1;
            break;
        }
    }
    
    return level;
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
        profileUrl: `https://tarkov.dev/players/regular/${playerId}`,
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
        },
        timestamp: new Date().toISOString()
    };
}

// Fetch player stats - HYBRID approach (Backend with JSON fallback)
async function fetchPlayerStats() {
    console.log('🔍 fetchPlayerStats called');
    
    const playerId = document.getElementById('player-id').value.trim();
    console.log('📝 Player ID:', playerId);
    
    if (!playerId || playerId.length < 4) {
        showMessage('❌ Please enter a valid Player ID (min 4 digits)', 'error');
        return;
    }

    const fetchButton = document.getElementById('fetch-button');
    const buttonText = document.getElementById('button-text');
    fetchButton.disabled = true;
    buttonText.textContent = '⏳ Fetching...';
    showMessage('🔍 Fetching stats...', 'info');

    let result = null;
    let source = 'unknown';

    try {
        // STEP 1: Try backend first (fast with cache)
        try {
            console.log('🚀 [1/2] Trying backend API...');
            const backendUrl = `https://tarkov-stats-bdojw4788-marcelos-projects-fb95b857.vercel.app/api/player/id/${playerId}`;
            
            const backendResponse = await fetch(backendUrl, {
                method: 'GET',
                headers: { 'Accept': 'application/json' },
                cache: 'no-store',
                signal: AbortSignal.timeout(5000) // 5s timeout
            });

            if (backendResponse.ok) {
                result = await backendResponse.json();
                source = 'backend';
                console.log('✅ Backend success:', result);
            } else {
                throw new Error(`Backend returned ${backendResponse.status}`);
            }
            
        } catch (backendError) {
            console.warn('⚠️ Backend failed:', backendError.message);
            console.log('Stack:', backendError.stack);
            
            // STEP 2: Fallback to direct JSON (no backend needed)
            console.log('🔄 [2/2] Falling back to direct JSON API...');
            const jsonUrl = `https://players.tarkov.dev/profile/${playerId}.json`;
            console.log('JSON URL:', jsonUrl);
            
            try {
                const jsonResponse = await fetch(jsonUrl, {
                    method: 'GET',
                    headers: { 'Accept': 'application/json' },
                    cache: 'no-store'
                });

                console.log('JSON Response status:', jsonResponse.status);

                if (!jsonResponse.ok) {
                    throw new Error(`Player not found (${jsonResponse.status})`);
                }

                const rawData = await jsonResponse.json();
                console.log('Raw data received:', rawData);
                
                result = processRawData(rawData, playerId);
                source = 'json-direct';
                console.log('✅ JSON direct success:', result);
                
            } catch (jsonError) {
                console.error('❌ JSON fallback also failed:', jsonError);
                throw new Error(`Both backend and direct JSON failed: ${jsonError.message}`);
            }
        }

        // Validate result
        if (!result || !result.success) {
            throw new Error('Failed to fetch player stats from any source');
        }
        
        const data = result;
        console.log(`✅ Stats received from ${source}:`, data);

        // Adaptar nova estrutura do backend para formato esperado
        if (data.id && data.nickname && data.stats) {
            playerData = {
                aid: data.id,
                playerId: playerId,
                info: {
                    nickname: data.nickname,
                    side: data.stats.faction,
                    level: data.stats.level,
                    prestigeLevel: data.stats.prestige || 0
                },
                pmcStats: {
                    eft: {
                        overAllCounters: {
                            Items: [
                                { Key: ['Sessions', 'Pmc'], Value: data.stats.raids },
                                { Key: ['Kills'], Value: data.stats.kills },
                                { Key: ['Deaths'], Value: data.stats.deaths },
                                { Key: ['ExitStatus', 'Survived', 'Pmc'], Value: data.stats.survived },
                                { Key: ['ExitStatus', 'Runner', 'Pmc'], Value: data.stats.runthrough }
                            ]
                        },
                        totalInGameTime: data.stats.hours * 3600
                    }
                },
                achievements: data.achievements || {}
            };
            
            // Enable save button
            document.getElementById('save-button').disabled = false;
            
            // Show success message with source info
            const sourceIcon = source === 'backend' ? '⚡' : '🌐';
            const sourceText = source === 'backend' ? 'Backend (Cached)' : 'Direct JSON';
            showMessage(`${sourceIcon} Stats loaded from ${sourceText}`, 'success');
            
            // Display stats
            displayStats(playerData);
        } else {
            throw new Error('Invalid data format');
        }

    } catch (error) {
        console.error('❌ FINAL Error fetching stats:', error);
        console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        
        // Show detailed error message
        let errorMsg = error.message || 'Unknown error occurred';
        
        // Don't mask the real error - show it
        if (errorMsg.includes('Failed to fetch')) {
            errorMsg = 'Network error: Could not connect to tarkov.dev API';
        } else if (errorMsg.includes('timeout')) {
            errorMsg = 'Request timeout - tarkov.dev is slow or unreachable';
        } else if (errorMsg.includes('404') || errorMsg.includes('not found')) {
            errorMsg = 'Player not found. Check the Player ID.';
        }
        
        showMessage(`❌ ${errorMsg}`, 'error');
        
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
    const pmcDeaths = findStat(pmcStats, ['Deaths']); // Deaths tem chave simples, não nested
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
    
    // Use level directly from info if available (already calculated by backend),
    // otherwise calculate from experience
    const level = info.level || calculateLevel(info.experience || 0);

    // Get faction info for icon display
    const side = (info.side || info.faction || '').toString().toLowerCase();
    const factionIcon = side.includes('bear') ? '🐻' : side.includes('usec') ? '🦅' : '';
    const factionName = side.includes('bear') ? 'BEAR' : side.includes('usec') ? 'USEC' : side;

    // Update display (PMC-only)
    document.getElementById('display-raids').textContent = pmcRaids.toLocaleString();
    document.getElementById('display-kills').textContent = pmcKills.toLocaleString();
    document.getElementById('display-deaths').textContent = pmcDeaths.toLocaleString();
    document.getElementById('display-survived').textContent = pmcSurvived.toLocaleString();
    document.getElementById('display-kd').textContent = kd;
    document.getElementById('display-sr').textContent = sr + '%';
    // Show level with prestige marker and faction icon
    const levelText = prestige > 0 ? `${factionIcon} ${level} (Prestígio ${prestige}) - ${factionName}` : `${factionIcon} ${level} - ${factionName}`;
    document.getElementById('display-level').textContent = levelText;
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
    // Source: https://escapefromtarkov.fandom.com/wiki/Experience
    const levels = [
        0, 1000, 4017, 8432, 14256, 21477, 30023, 39936, 51204, 63723,           // 1-10
        77563, 93279, 115302, 143253, 177337, 217885, 264432, 316851, 374400, 437465,  // 11-20
        505161, 577978, 656347, 741150, 836066, 944133, 1066259, 1199423, 1343743, 1499338, // 21-30
        1666320, 1846664, 2043449, 2258436, 2492126, 2750217, 3032022, 3337766, 3663831, 4010481, // 31-40
        4377862, 4785793, 5182399, 5627732, 6102063, 6690287, 7189442, 7779792, 8401607, 9455144, // 41-50
        9740666, 10458431, 11219666, 12024744, 12874041, 13767918, 14706741, 15690872, 16720667, 17816442, // 51-60
        19041492, 20360945, 21792266, 23350443, 25098462, 27100775, 29581231, 33028574, 37953544, 44260543, // 61-70
        51901513, 60887711, 71228846, 82933459, 96009180, 110462910, 126300949, 144924572, 172016256 // 71-79
    ];

    // Find the highest level where experience requirement is met
    // Note: Index 0 represents level 1, so we add 1
    let level = 1;
    for (let i = levels.length - 1; i >= 0; i--) {
        if (exp >= levels[i]) {
            level = i + 1; // Index 0 = Level 1
            break;
        }
    }
    
    return level;
}

// Save configuration directly (without fetching stats first)
async function saveConfigurationDirect(event) {
    event.preventDefault();

    const playerId = document.getElementById('player-id').value.trim();
    
    if (!playerId || playerId.length < 4) {
        showMessage('❌ Please enter a valid Player ID (min 4 digits)', 'error');
        return;
    }

    const config = {
        playerId: playerId,
        autoRefresh: document.getElementById('auto-refresh').checked,
        lastUpdated: new Date().toISOString()
    };
    
    console.log('💾 Saving config (ID only):', config);

    try {
        if (twitch) {
            twitch.configuration.set('broadcaster', '1', JSON.stringify(config));
            showMessage('✅ Player ID saved! Stats will load automatically in the panel.', 'success');
            console.log('💾 Config saved:', config);
            
            // Write to localStorage so panel can detect change
            try {
                const payload = { config, ts: Date.now() };
                localStorage.setItem('tarkov_ext_config', JSON.stringify(payload));
            } catch (e) {
                console.warn('Could not write localStorage for config sync:', e);
            }
        } else {
            console.log('📝 Config (no Twitch):', config);
            showMessage('✅ Player ID saved! Open the panel to see your stats.', 'success');
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
                
                updateSaveButtonState();
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

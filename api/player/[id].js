// Vercel Serverless Function - Tarkov Stats API
// Endpoint: /api/player/:id

const axios = require('axios');

// Simple in-memory cache (survives during function lifetime)
const cache = new Map();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

// Calculate level from experience (official Tarkov XP table)
function calculateLevel(exp) {
    if (!exp || exp <= 0) return 1;
    
    const xpTable = [
        0, 1000, 4017, 8432, 14256, 21477, 30023, 39936, 51204, 63723,
        77563, 93279, 115302, 143253, 177337, 217885, 264432, 316851, 374400, 437465,
        505161, 577978, 656347, 741150, 836066, 944133, 1066259, 1199423, 1343743, 1499338,
        1666320, 1846664, 2043449, 2258436, 2492126, 2750217, 3032022, 3337766, 3663831, 4010481,
        4377862, 4785793, 5182399, 5627732, 6102063, 6690287, 7189442, 7779792, 8401607, 9455144,
        9740666, 10458431, 11219666, 12024744, 12874041, 13767918, 14706741, 15690872, 16720667, 17816442,
        19041492, 20360945, 21792266, 23350443, 25098462, 27100775, 29581231, 33028574, 37953544, 44260543,
        51901513, 60887711, 71228846, 82933459, 96009180, 110462910, 126300949, 144924572, 172016256
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

// Extract stat from overAllCounters array
function findStat(items, key) {
    const item = items.find(i => 
        Array.isArray(i.Key) && i.Key.length === 1 && i.Key[0] === key
    );
    return item?.Value || 0;
}

// Extract nested stat from overAllCounters array
function findNestedStat(items, key1, key2, key3) {
    const item = items.find(i => 
        Array.isArray(i.Key) && 
        i.Key[0] === key1 && 
        i.Key[1] === key2 &&
        (!key3 || i.Key[2] === key3)
    );
    return item?.Value || 0;
}

// Process raw data from tarkov.dev
function processPlayerData(rawData, accountId) {
    const items = rawData.pmcStats?.eft?.overAllCounters?.Items || [];
    
    const raids = findNestedStat(items, 'Sessions', 'Pmc');
    const kills = findStat(items, 'Kills');
    const deaths = findStat(items, 'Deaths');
    const survived = findNestedStat(items, 'ExitStatus', 'Survived', 'Pmc');
    const runthrough = findNestedStat(items, 'ExitStatus', 'Runner', 'Pmc');
    const experience = rawData.info?.experience || 0;
    
    const kd = deaths > 0 ? parseFloat((kills / deaths).toFixed(2)) : parseFloat(kills.toFixed(2));
    const sr = raids > 0 ? parseFloat(((survived / raids) * 100).toFixed(2)) : 0.0;
    
    return {
        success: true,
        nickname: rawData.info?.nickname || 'Unknown',
        id: accountId,
        stats: {
            level: calculateLevel(experience),
            experience: experience,
            faction: rawData.info?.side || 'Unknown',
            prestige: rawData.info?.prestigeLevel || 0,
            raids: raids,
            kills: kills,
            deaths: deaths,
            kd: kd,
            sr: sr,
            survived: survived,
            runthrough: runthrough,
            hours: Math.floor((rawData.pmcStats?.eft?.totalInGameTime || 0) / 3600)
        },
        achievements: rawData.achievements || {},
        timestamp: new Date().toISOString()
    };
}

// Main handler
module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
    
    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    // Only allow GET
    if (req.method !== 'GET') {
        return res.status(405).json({ 
            success: false, 
            error: 'Method not allowed' 
        });
    }
    
    try {
        // Extract player ID from URL
        const { id } = req.query;
        
        if (!id) {
            return res.status(400).json({
                success: false,
                error: 'Player ID is required'
            });
        }
        
        console.log(`[API] Fetching stats for player ID: ${id}`);
        
        // Check cache first
        const cacheKey = `player_${id}`;
        const cached = cache.get(cacheKey);
        
        if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
            console.log(`[API] Cache HIT for ${id}`);
            return res.status(200).json({
                ...cached.data,
                cached: true,
                cacheAge: Math.floor((Date.now() - cached.timestamp) / 1000)
            });
        }
        
        console.log(`[API] Cache MISS for ${id} - fetching from tarkov.dev`);
        
        // Fetch from tarkov.dev
        const url = `https://players.tarkov.dev/profile/${id}.json`;
        const response = await axios.get(url, {
            timeout: 10000,
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Twitch-Extension/1.0'
            }
        });
        
        if (!response.data) {
            throw new Error('No data received from tarkov.dev');
        }
        
        // Process data
        const processedData = processPlayerData(response.data, id);
        
        // Cache result
        cache.set(cacheKey, {
            data: processedData,
            timestamp: Date.now()
        });
        
        console.log(`[API] Successfully fetched stats for ${processedData.nickname} (Level ${processedData.stats.level})`);
        
        return res.status(200).json({
            ...processedData,
            cached: false
        });
        
    } catch (error) {
        console.error('[API] Error:', error.message);
        
        // Handle specific errors
        if (error.response?.status === 404) {
            return res.status(404).json({
                success: false,
                error: 'Player not found'
            });
        }
        
        if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
            return res.status(504).json({
                success: false,
                error: 'Request timeout - tarkov.dev is slow or unreachable'
            });
        }
        
        return res.status(500).json({
            success: false,
            error: error.message || 'Internal server error'
        });
    }
};

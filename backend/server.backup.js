const express = require('express');
const cors = require('cors');
const NodeCache = require('node-cache');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Cache configurado para 10 minutos
const cache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

// Middleware
app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Health check
app.get('/', (req, res) => {
    res.json({
        status: 'online',
        message: 'Tarkov Stats API - Backend para Twitch Extension',
        version: '1.0.0',
        endpoints: {
            player: '/api/player/:nickname/:id',
            search: '/api/search/:nickname'
        }
    });
});

// ⚠️ IMPORTANTE: Este endpoint DEVE vir ANTES de /api/player/:nickname/:id
// Buscar player por ID usando API JSON pública (SEM CAPTCHA!)
app.get('/api/player/id/:id', async (req, res) => {
    console.log('🔍 Request received for player ID:', req.params.id);
    const { id } = req.params;
    const cacheKey = `player_id_${id}`;
    
    console.log('\n' + '█'.repeat(80));
    console.log('🎯 BUSCANDO PLAYER VIA API JSON');
    console.log(`📋 Player ID: ${id}`);
    console.log('█'.repeat(80) + '\n');

    try {
        // Verificar cache primeiro
        const cached = cache.get(cacheKey);
        if (cached) {
            console.log(`✅ Cache hit for ID ${id}`);
            return res.json({
                success: true,
                cached: true,
                data: cached
            });
        }

        console.log(`🔄 Fetching data from JSON API...`);

        // Buscar dados do JSON público (SEM CAPTCHA!)
        const jsonUrl = `https://players.tarkov.dev/profile/${id}.json`;
        console.log(`📡 URL: ${jsonUrl}`);
        
        const response = await axios.get(jsonUrl, {
            timeout: 10000,
            headers: {
                'User-Agent': 'Twitch-Extension-Tarkov-Stats/1.0'
            }
        });

        const profileData = response.data;
        
        // Helper para encontrar valores no array de overAllCounters
        const findStat = (key) => {
            const items = profileData.pmcStats?.eft?.overAllCounters?.Items || [];
            const item = items.find(i => 
                Array.isArray(i.Key) && i.Key.length === 1 && i.Key[0] === key
            );
            return item?.Value || 0;
        };
        
        const findNestedStat = (key1, key2, key3) => {
            const items = profileData.pmcStats?.eft?.overAllCounters?.Items || [];
            const item = items.find(i => 
                Array.isArray(i.Key) && 
                i.Key[0] === key1 && 
                i.Key[1] === key2 &&
                (!key3 || i.Key[2] === key3)
            );
            return item?.Value || 0;
        };
        
        // Extrair stats
        const raids = findNestedStat('Sessions', 'Pmc');
        const kills = findStat('Kills');
        const deaths = findStat('Deaths');
        const survived = findNestedStat('ExitStatus', 'Survived', 'Pmc');
        const runthrough = findNestedStat('ExitStatus', 'Runner', 'Pmc');
        
        console.log('=== DEBUG STATS ===');
        console.log('Raids:', raids);
        console.log('Kills:', kills);
        console.log('Deaths:', deaths);
        console.log('Survived:', survived);
        
        const kd = deaths > 0 ? (kills / deaths).toFixed(2) : kills.toFixed(2);
        const sr = raids > 0 ? ((survived / raids) * 100).toFixed(2) : '0.00';
        
        console.log('K/D calculated:', kd);
        console.log('SR calculated:', sr);
        
        // Função para calcular level baseado em experiência (aproximação)
        // Tarkov usa progressão exponencial, esta é uma aproximação baseada em dados reais
        function calculateLevel(exp) {
            if (!exp || exp <= 0) return 1;
            
            // Tabela simplificada de XP por level (aproximada)
            const xpTable = [
                0, 1000, 4017, 8432, 14256, 21477, 30023, 39936, 51204, 63723, // 1-10
                77563, 92713, 109174, 126946, 146029, 166423, 188129, 211147, 235477, 261119, // 11-20
                288073, 316339, 345917, 376807, 409009, 442523, 477349, 513487, 550937, 589699, // 21-30
                629773, 671159, 713857, 757867, 803189, 849823, 897769, 947027, 997597, 1049479, // 31-40
                1102673, 1157179, 1212997, 1270127, 1328569, 1388323, 1449389, 1511767, 1575457, 1640459, // 41-50
                1706773, 1774399, 1843337, 1913587, 1985149, 2058023, 2132209, 2207707, 2284517, 2362639, // 51-60
                2442073, 2522819, 2604877, 2688247, 2772929, 2858923, 2946229, 3034847, 3124777, 3216019 // 61-70
            ];
            
            // Encontrar o level correspondente
            let level = 1;
            for (let i = 0; i < xpTable.length; i++) {
                if (exp >= xpTable[i]) {
                    level = i + 1;
                } else {
                    break;
                }
            }
            
            return Math.min(level, 79); // Max level sem prestigio é 79
        }
        
        const result = {
            success: true,
            nickname: profileData.info?.nickname || 'Unknown',
            id: id,
            profileUrl: `https://tarkov.dev/players/regular/${id}`,
            stats: {
                level: calculateLevel(profileData.info?.experience || 0),
                faction: profileData.info?.side || 'Unknown',
                prestige: profileData.info?.prestigeLevel || 0,
                raids: raids,
                kills: kills,
                deaths: deaths,
                kd: parseFloat(kd),
                sr: parseFloat(sr),
                survived: survived,
                runthrough: runthrough,
                hours: Math.floor((profileData.pmcStats?.eft?.totalInGameTime || 0) / 3600)
            },
            timestamp: new Date().toISOString()
        };

        if (result.stats.raids === 0 && result.stats.kills === 0) {
            return res.status(404).json({
                success: false,
                error: 'Player not found or no stats available',
                message: 'Verifique se o Player ID está correto'
            });
        }

        cache.set(cacheKey, result);
        console.log(`✅ Stats fetched successfully for ${result.nickname} (${id})`);
        console.log(`📊 Raids: ${result.stats.raids}, Kills: ${result.stats.kills}, K/D: ${result.stats.kd}`);
        
        res.json({
            success: true,
            cached: false,
            data: result
        });

    } catch (error) {
        console.error(`❌ Error fetching stats for ID ${id}:`, error.message);
        
        if (error.response?.status === 404) {
            return res.status(404).json({
                success: false,
                error: 'Player not found',
                message: 'Player ID não encontrado no tarkov.dev'
            });
        }
        
        res.status(500).json({
            success: false,
            error: error.message,
            message: 'Erro ao buscar stats do tarkov.dev'
        });
    }
});

// Buscar stats de um player específico (COM nickname)
app.get('/api/player/:nickname/:id', async (req, res) => {
    const { nickname, id } = req.params;
    const cacheKey = `player_${nickname}_${id}`;

    try {
        // Verificar cache primeiro
        const cached = cache.get(cacheKey);
        if (cached) {
            console.log(`✅ Cache hit for ${nickname}`);
            return res.json({
                success: true,
                cached: true,
                stats: cached.stats,
                nickname: cached.nickname,
                id: cached.id,
                profileUrl: cached.profileUrl
            });
        }

        console.log(`🔄 Fetching data for ${nickname} (${id})`);

        // Usar o scraper para buscar dados
        const result = await scraper.getPlayerStats(nickname, id);

        if (!result.success || !result.stats || result.stats.raids === 0) {
            return res.status(404).json({
                success: false,
                error: 'Player stats not found',
                message: 'Verifique se o nickname e ID estão corretos'
            });
        }

        // Salvar no cache
        cache.set(cacheKey, result);

        console.log(`✅ Stats fetched successfully for ${nickname}`);
        console.log(`📊 Returning stats:`, result.stats);
        
        res.json({
            success: true,
            cached: false,
            stats: result.stats,
            nickname: result.nickname,
            id: result.id,
            profileUrl: result.profileUrl
        });

    } catch (error) {
        console.error(`❌ Error fetching stats for ${nickname}:`, error.message);
        
        res.status(500).json({
            success: false,
            error: error.message,
            message: 'Erro ao buscar stats do tarkov.dev'
        });
    }
});

// Buscar player apenas por nickname (sem ID)
app.get('/api/search/:nickname', async (req, res) => {
    const { nickname } = req.params;

    try {
        const url = `https://tarkov.dev/players?search=${encodeURIComponent(nickname)}`;
        
        res.json({
            success: true,
            message: 'Para buscar stats completas, use /api/player/:nickname/:id',
            searchUrl: url,
            hint: 'Acesse o searchUrl para encontrar o ID do player'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Testar o scraper
app.get('/api/test', async (req, res) => {
    try {
        console.log('🧪 Running scraper test...');
        const result = await scraper.test();
        res.json({
            success: true,
            message: 'Scraper test completed',
            result: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Limpar cache manualmente
app.post('/api/cache/clear', (req, res) => {
    const { nickname, id } = req.body;
    
    if (nickname && id) {
        const cacheKey = `player_${nickname}_${id}`;
        cache.del(cacheKey);
        res.json({ success: true, message: `Cache cleared for ${nickname}` });
    } else {
        cache.flushAll();
        res.json({ success: true, message: 'All cache cleared' });
    }
});

// Stats do cache
app.get('/api/cache/stats', (req, res) => {
    const stats = cache.getStats();
    const keys = cache.keys();
    
    res.json({
        success: true,
        stats: stats,
        cachedPlayers: keys.length,
        keys: keys
    });
});

// Error handler
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// Start server
const server = app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════╗
║   🎮 Tarkov Stats API Server                 ║
║                                               ║
║   🚀 Server running on port ${PORT}            ║
║   📡 Endpoint: http://localhost:${PORT}        ║
║                                               ║
║   📊 Ready to fetch Tarkov stats!            ║
╚═══════════════════════════════════════════════╝
    `);
});

server.on('error', (error) => {
    console.error('❌ Erro ao iniciar servidor:', error.message);
    if (error.code === 'EADDRINUSE') {
        console.error(`❌ Porta ${PORT} já está em uso!`);
    }
    process.exit(1);
});

module.exports = app;

const express = require('express');
const cors = require('cors');
const NodeCache = require('node-cache');
const TarkovScraper = require('./scraper-manual-captcha'); // CAPTCHA manual
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Cache configurado para 10 minutos
const cache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

// Inicializar scraper
const scraper = new TarkovScraper();

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

// Buscar stats de um player específico
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
app.listen(PORT, () => {
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

module.exports = app;

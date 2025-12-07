const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Scraper otimizado para tarkov.dev
 * Extrai stats de players da página HTML
 */
class TarkovScraper {
    constructor() {
        this.baseUrl = 'https://tarkov.dev';
        this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    }

    /**
     * Busca stats completas de um player
     */
    async getPlayerStats(nickname, id) {
        try {
            const url = `${this.baseUrl}/players/${nickname}/${id}`;
            console.log(`📥 Fetching: ${url}`);

            const response = await axios.get(url, {
                headers: {
                    'User-Agent': this.userAgent,
                    'Accept': 'text/html,application/xhtml+xml',
                    'Accept-Language': 'en-US,en;q=0.9,pt;q=0.8',
                    'Cache-Control': 'no-cache'
                },
                timeout: 15000
            });

            if (response.status !== 200) {
                throw new Error(`HTTP ${response.status}`);
            }

            const $ = cheerio.load(response.data);
            const stats = this.parseStats($);

            return {
                success: true,
                nickname: nickname,
                id: id,
                profileUrl: url,
                stats: stats,
                scrapedAt: new Date().toISOString()
            };

        } catch (error) {
            console.error(`❌ Scraping error:`, error.message);
            throw error;
        }
    }

    /**
     * Parse stats do HTML
     */
    parseStats($) {
        const stats = {
            // PMC Stats
            raids: 0,
            kills: 0,
            deaths: 0,
            survived: 0,
            kd: 0,
            sr: 0,
            
            // Additional Stats
            traumatic: 0,
            level: 1,
            faction: 'USEC',
            
            // Meta
            found: false
        };

        try {
            // Estratégia 1: Procurar por labels e valores
            $('*').each((i, elem) => {
                const $elem = $(elem);
                const text = $elem.text().trim();
                
                // PMC Stats
                if (text === 'PMC Stats' || text.includes('PMC Stats')) {
                    const container = $elem.parent().parent();
                    stats.found = true;
                    
                    // Procurar valores no container
                    this.extractFromContainer(container, stats, $);
                }
                
                // Raids
                if (text === 'Raids') {
                    const value = this.findNextValue($elem, $);
                    if (value) stats.raids = this.parseNumber(value);
                }
                
                // Kills
                if (text === 'Kills') {
                    const value = this.findNextValue($elem, $);
                    if (value) stats.kills = this.parseNumber(value);
                }
                
                // Deaths
                if (text === 'Deaths') {
                    const value = this.findNextValue($elem, $);
                    if (value) stats.deaths = this.parseNumber(value);
                }
                
                // K/D Ratio
                if (text === 'K/D Ratio' || text.includes('K/D')) {
                    const value = this.findNextValue($elem, $);
                    if (value) stats.kd = this.parseFloat(value);
                }
                
                // S/R Ratio
                if (text === 'S/R Ratio' || text.includes('S/R')) {
                    const value = this.findNextValue($elem, $);
                    if (value) stats.sr = this.parseFloat(value);
                }
                
                // Survived
                if (text === 'Survived') {
                    const value = this.findNextValue($elem, $);
                    if (value) stats.survived = this.parseNumber(value);
                }
                
                // Traumatic
                if (text === 'Traumatic') {
                    const value = this.findNextValue($elem, $);
                    if (value) stats.traumatic = this.parseNumber(value);
                }
            });

            // Calcular valores derivados se não encontrados
            if (stats.raids > 0) {
                if (stats.survived === 0 && stats.sr > 0) {
                    stats.survived = Math.round(stats.raids * (stats.sr / 100));
                }
                
                if (stats.deaths === 0 && stats.survived > 0) {
                    stats.deaths = stats.raids - stats.survived;
                }
                
                if (stats.kd === 0 && stats.kills > 0 && stats.deaths > 0) {
                    stats.kd = parseFloat((stats.kills / stats.deaths).toFixed(2));
                }
                
                if (stats.sr === 0 && stats.survived > 0) {
                    stats.sr = parseFloat(((stats.survived / stats.raids) * 100).toFixed(2));
                }
            }

            // Extrair level do título ou header
            const title = $('h1, h2, .player-name, [class*="title"]').text();
            const levelMatch = title.match(/level\s*(\d+)/i) || title.match(/nível\s*(\d+)/i);
            if (levelMatch) {
                stats.level = parseInt(levelMatch[1]);
            }

            console.log('📊 Parsed stats:', stats);
            return stats;

        } catch (error) {
            console.error('Parse error:', error);
            return stats;
        }
    }

    /**
     * Extrai valores de um container
     */
    extractFromContainer(container, stats, $) {
        const rows = container.find('div, tr, li');
        
        rows.each((i, row) => {
            const $row = $(row);
            const text = $row.text();
            
            // Tentar extrair pares label:value
            const parts = text.split(/\s+/);
            
            for (let i = 0; i < parts.length - 1; i++) {
                const label = parts[i].toLowerCase();
                const value = parts[i + 1];
                
                if (label.includes('raid')) stats.raids = this.parseNumber(value);
                if (label.includes('kill')) stats.kills = this.parseNumber(value);
                if (label.includes('death')) stats.deaths = this.parseNumber(value);
                if (label.includes('survive')) stats.survived = this.parseNumber(value);
                if (label.includes('k/d')) stats.kd = this.parseFloat(value);
                if (label.includes('s/r')) stats.sr = this.parseFloat(value);
                if (label.includes('traumatic')) stats.traumatic = this.parseNumber(value);
            }
        });
    }

    /**
     * Encontra o próximo valor após um elemento
     */
    findNextValue($elem, $) {
        // Tentar próximo elemento irmão
        let next = $elem.next();
        if (next.length && next.text().trim()) {
            return next.text().trim();
        }
        
        // Tentar dentro do pai
        const parent = $elem.parent();
        const siblings = parent.children();
        const index = siblings.index($elem);
        
        if (index >= 0 && index < siblings.length - 1) {
            return $(siblings[index + 1]).text().trim();
        }
        
        return null;
    }

    /**
     * Parse número (remove vírgulas, etc)
     */
    parseNumber(str) {
        if (!str) return 0;
        const cleaned = str.toString().replace(/[,\s]/g, '');
        const num = parseInt(cleaned);
        return isNaN(num) ? 0 : num;
    }

    /**
     * Parse float (remove %, etc)
     */
    parseFloat(str) {
        if (!str) return 0;
        const cleaned = str.toString().replace(/[%,\s]/g, '');
        const num = parseFloat(cleaned);
        return isNaN(num) ? 0 : num;
    }

    /**
     * Testa o scraper com um player conhecido
     */
    async test() {
        console.log('🧪 Testing scraper...');
        
        try {
            const result = await this.getPlayerStats('regular', '10590762');
            console.log('✅ Test successful:', result);
            return result;
        } catch (error) {
            console.error('❌ Test failed:', error.message);
            throw error;
        }
    }
}

module.exports = TarkovScraper;

// Teste direto se executado
if (require.main === module) {
    const scraper = new TarkovScraper();
    scraper.test().then(() => {
        console.log('Test completed!');
        process.exit(0);
    }).catch(err => {
        console.error('Test failed:', err);
        process.exit(1);
    });
}

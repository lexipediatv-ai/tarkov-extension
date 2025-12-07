const puppeteer = require('puppeteer');

/**
 * Scraper com Puppeteer para sites React/JavaScript
 * Extrai stats de players do tarkov.dev
 */
class TarkovScraperPuppeteer {
    constructor() {
        this.baseUrl = 'https://tarkov.dev';
        this.browser = null;
    }

    /**
     * Inicializa o browser
     */
    async init() {
        if (!this.browser) {
            console.log('🚀 Iniciando Puppeteer...');
            this.browser = await puppeteer.launch({
                headless: 'new',
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--disable-gpu'
                ]
            });
        }
        return this.browser;
    }

    /**
     * Busca stats completas de um player
     */
    async getPlayerStats(nickname, id) {
        let page;
        try {
            await this.init();
            
            const url = `${this.baseUrl}/players/${nickname}/${id}`;
            console.log(`📥 Opening: ${url}`);

            page = await this.browser.newPage();
            
            // Configurar viewport
            await page.setViewport({ width: 1920, height: 1080 });
            
            // Navegar para a página
            await page.goto(url, {
                waitUntil: 'networkidle2',
                timeout: 60000
            });

            // Aguardar o conteúdo carregar - aumentado para 15s para páginas lentas
            console.log('⏳ Aguardando página carregar completamente...');
            await page.waitForTimeout(15000);
            
            // Verificar se a página ainda está em estado "Loading"
            const pageContent = await page.evaluate(() => {
                const h1 = document.querySelector('h1');
                const body = document.body.innerText;
                return {
                    h1Text: h1?.textContent?.trim() || '',
                    bodyPreview: body.substring(0, 200),
                    hasStats: !!document.querySelector('[class*="stat"]') || body.includes('Raids')
                };
            });
            
            console.log('📄 Conteúdo da página:', pageContent);
            
            // Mesmo com "Loading", vamos tentar extrair stats
            // às vezes o conteúdo já está lá mas o h1 não mudou
            if (pageContent.h1Text === 'Loading' && !pageContent.hasStats) {
                console.log('⚠️ Página em Loading e sem stats - provável CAPTCHA ou perfil inválido');
                
                // Tirar screenshot para debug
                try {
                    await page.screenshot({ path: 'debug-loading.png', fullPage: true });
                    console.log('📸 Screenshot salvo: debug-loading.png');
                } catch (e) {}
                
                // Verificar se tem CAPTCHA
                const hasCaptcha = await page.evaluate(() => {
                    return document.body.innerHTML.includes('captcha') || 
                           document.body.innerHTML.includes('Cloudflare') ||
                           document.body.innerHTML.includes('challenge');
                });
                
                return {
                    success: false,
                    error: hasCaptcha ? 'CAPTCHA_REQUIRED' : 'PROFILE_NOT_FOUND',
                    message: hasCaptcha ? 
                        'CAPTCHA detectado. Use o modo manual.' : 
                        'Perfil não encontrado. Verifique o ID.',
                    nickname: nickname,
                    id: id,
                    profileUrl: url
                };
            }
            
            console.log('✅ Página carregou, tentando extrair stats...');

            // Extrair stats usando JavaScript no contexto da página
            const stats = await page.evaluate(() => {
                const stats = {
                    raids: 0,
                    kills: 0,
                    deaths: 0,
                    survived: 0,
                    kd: 0,
                    sr: 0,
                    traumatic: 0,
                    level: 1,
                    faction: 'USEC',
                    found: false
                };

                // Função helper para encontrar stat por texto
                const findStat = (labelText) => {
                    const elements = Array.from(document.querySelectorAll('*'));
                    for (const elem of elements) {
                        const text = elem.textContent?.trim();
                        if (text === labelText) {
                            // Procurar valor próximo
                            const siblings = Array.from(elem.parentElement?.children || []);
                            const index = siblings.indexOf(elem);
                            if (index >= 0 && index < siblings.length - 1) {
                                const valueElem = siblings[index + 1];
                                return valueElem.textContent?.trim();
                            }
                            // Tentar próximo elemento
                            const next = elem.nextElementSibling;
                            if (next) {
                                return next.textContent?.trim();
                            }
                        }
                    }
                    return null;
                };

                // Extrair cada stat
                const raidsValue = findStat('Raids');
                if (raidsValue) {
                    stats.raids = parseInt(raidsValue.replace(/,/g, '')) || 0;
                    stats.found = true;
                }

                const killsValue = findStat('Kills');
                if (killsValue) {
                    stats.kills = parseInt(killsValue.replace(/,/g, '')) || 0;
                }

                const deathsValue = findStat('Deaths');
                if (deathsValue) {
                    stats.deaths = parseInt(deathsValue.replace(/,/g, '')) || 0;
                }

                const kdValue = findStat('K/D Ratio');
                if (kdValue) {
                    stats.kd = parseFloat(kdValue) || 0;
                }

                const srValue = findStat('S/R Ratio');
                if (srValue) {
                    stats.sr = parseFloat(srValue.replace('%', '')) || 0;
                }

                const survivedValue = findStat('Survived');
                if (survivedValue) {
                    stats.survived = parseInt(survivedValue.replace(/,/g, '')) || 0;
                }

                const traumaticValue = findStat('Traumatic');
                if (traumaticValue) {
                    stats.traumatic = parseInt(traumaticValue.replace(/,/g, '')) || 0;
                }

                // Calcular valores derivados
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

                return stats;
            });

            console.log('📊 Stats extracted:', stats);

            await page.close();

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
            if (page) await page.close();
            throw error;
        }
    }

    /**
     * Fecha o browser
     */
    async close() {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
        }
    }

    /**
     * Testa o scraper
     */
    async test() {
        console.log('🧪 Testing Puppeteer scraper...');
        
        try {
            const result = await this.getPlayerStats('regular', '10590762');
            console.log('✅ Test successful:', JSON.stringify(result, null, 2));
            return result;
        } catch (error) {
            console.error('❌ Test failed:', error.message);
            throw error;
        } finally {
            await this.close();
        }
    }
}

module.exports = TarkovScraperPuppeteer;

// Teste direto se executado
if (require.main === module) {
    const scraper = new TarkovScraperPuppeteer();
    scraper.test().then(() => {
        console.log('Test completed!');
        process.exit(0);
    }).catch(err => {
        console.error('Test failed:', err);
        process.exit(1);
    });
}

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

/**
 * Scraper com autenticação via cookies salvos
 * Permite buscar stats sem resolver CAPTCHA toda vez
 */
class TarkovScraperWithAuth {
    constructor() {
        this.baseUrl = 'https://tarkov.dev';
        this.browser = null;
        this.cookiesPath = path.join(__dirname, 'cookies.json');
    }

    async init() {
        if (this.browser) return;

        console.log('🚀 Iniciando Puppeteer com cookies salvos...');
        
        this.browser = await puppeteer.launch({
            headless: false, // Mostrar navegador para debug
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-blink-features=AutomationControlled'
            ]
        });
    }

    /**
     * Salvar cookies da sessão atual
     */
    async saveCookies(page) {
        const cookies = await page.cookies();
        fs.writeFileSync(this.cookiesPath, JSON.stringify(cookies, null, 2));
        console.log('🍪 Cookies salvos em:', this.cookiesPath);
    }

    /**
     * Carregar cookies salvos
     */
    async loadCookies(page) {
        if (fs.existsSync(this.cookiesPath)) {
            const cookies = JSON.parse(fs.readFileSync(this.cookiesPath, 'utf8'));
            await page.setCookie(...cookies);
            console.log('🍪 Cookies carregados!');
            return true;
        }
        return false;
    }

    /**
     * Configuração inicial - Usuário resolve CAPTCHA uma vez
     */
    async setupAuth() {
        await this.init();
        const page = await this.browser.newPage();
        
        await page.setViewport({ width: 1920, height: 1080 });
        
        console.log('📥 Abrindo tarkov.dev/players...');
        await page.goto(`${this.baseUrl}/players`, {
            waitUntil: 'networkidle2',
            timeout: 60000
        });

        console.log('');
        console.log('╔══════════════════════════════════════════════════════╗');
        console.log('║  ⚠️  RESOLVA O CAPTCHA MANUALMENTE NO NAVEGADOR    ║');
        console.log('║                                                      ║');
        console.log('║  1. Resolva o CAPTCHA que apareceu                  ║');
        console.log('║  2. Busque qualquer perfil (ex: "regular")          ║');
        console.log('║  3. Aguarde a página carregar completamente         ║');
        console.log('║  4. Pressione ENTER aqui no terminal               ║');
        console.log('╚══════════════════════════════════════════════════════╝');
        console.log('');

        // Aguardar usuário resolver CAPTCHA
        await new Promise(resolve => {
            process.stdin.once('data', resolve);
        });

        // Salvar cookies
        await this.saveCookies(page);
        
        console.log('✅ Autenticação configurada com sucesso!');
        console.log('💡 Agora você pode buscar stats automaticamente!');
        
        await page.close();
    }

    /**
     * Buscar stats usando cookies salvos
     */
    async getPlayerStats(nickname, id) {
        let page;
        try {
            await this.init();
            
            const url = `${this.baseUrl}/players/${nickname}/${id}`;
            console.log(`📥 Abrindo: ${url}`);

            page = await this.browser.newPage();
            await page.setViewport({ width: 1920, height: 1080 });
            
            // Carregar cookies salvos
            const hasCookies = await this.loadCookies(page);
            if (!hasCookies) {
                console.log('⚠️ Sem cookies salvos. Execute setupAuth() primeiro!');
                return {
                    success: false,
                    error: 'NO_AUTH',
                    message: 'Execute node scraper-auth.js setup'
                };
            }

            // Navegar para a página
            await page.goto(url, {
                waitUntil: 'networkidle2',
                timeout: 60000
            });

            // Aguardar carregar
            console.log('⏳ Aguardando página carregar...');
            await page.waitForTimeout(5000); // Menos tempo já que temos cookies

            // Verificar se ainda pede CAPTCHA
            const needsCaptcha = await page.evaluate(() => {
                const h1 = document.querySelector('h1');
                return h1?.textContent?.trim() === 'Loading';
            });

            if (needsCaptcha) {
                console.log('⚠️ Cookies expiraram ou CAPTCHA necessário');
                console.log('💡 Execute: node scraper-auth.js setup');
                
                return {
                    success: false,
                    error: 'AUTH_EXPIRED',
                    message: 'Cookies expiraram. Execute setup novamente.'
                };
            }

            // Extrair stats
            const stats = await page.evaluate(() => {
                const stats = {
                    raids: 0,
                    kills: 0,
                    deaths: 0,
                    survived: 0,
                    kd: 0,
                    sr: 0,
                    traumatic: 0,
                    level: 1
                };

                function findStat(label) {
                    const elements = Array.from(document.querySelectorAll('*'));
                    for (const el of elements) {
                        if (el.textContent?.includes(label)) {
                            const parent = el.parentElement;
                            if (parent) {
                                const value = parent.textContent.replace(label, '').trim();
                                return value;
                            }
                        }
                    }
                    return null;
                }

                const raidsValue = findStat('Raids');
                if (raidsValue) {
                    stats.raids = parseInt(raidsValue.replace(/,/g, '')) || 0;
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

                return stats;
            });

            console.log('📊 Stats extraídas:', stats);

            await page.close();

            return {
                success: true,
                nickname,
                id,
                profileUrl: url,
                stats
            };

        } catch (error) {
            console.error('❌ Erro:', error.message);
            if (page) await page.close();
            
            return {
                success: false,
                error: error.message
            };
        }
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
        }
    }
}

// CLI para configurar autenticação
if (require.main === module) {
    const scraper = new TarkovScraperWithAuth();
    
    const command = process.argv[2];
    
    if (command === 'setup') {
        console.log('🔐 Iniciando configuração de autenticação...\n');
        scraper.setupAuth().then(() => {
            console.log('\n✅ Pronto! Agora inicie o servidor normalmente.');
            process.exit(0);
        }).catch(err => {
            console.error('❌ Erro:', err);
            process.exit(1);
        });
    } else {
        console.log('');
        console.log('╔══════════════════════════════════════════════╗');
        console.log('║  Tarkov Scraper com Autenticação             ║');
        console.log('╚══════════════════════════════════════════════╝');
        console.log('');
        console.log('Uso:');
        console.log('  node scraper-auth.js setup     Configure autenticação');
        console.log('');
        console.log('Depois use no server.js normalmente!');
        console.log('');
        process.exit(0);
    }
}

module.exports = TarkovScraperWithAuth;

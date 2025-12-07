const puppeteer = require('puppeteer');

class TarkovScraperWithManualCaptcha {
    constructor() {
        this.browser = null;
        this.baseUrl = 'https://tarkov.dev';
    }

    async init() {
        if (!this.browser) {
            console.log('🚀 Iniciando navegador (VISÍVEL para resolver CAPTCHA)...');
            this.browser = await puppeteer.launch({
                headless: false, // Visível
                defaultViewport: null,
                args: [
                    '--start-maximized',
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-blink-features=AutomationControlled'
                ],
                ignoreDefaultArgs: ['--enable-automation']
            });
        }
    }

    async waitForCaptchaResolution(page) {
        console.log('⚠️ CAPTCHA detectado! Por favor, resolva manualmente no navegador...');
        console.log('👉 Clique na caixa do CAPTCHA para resolver');
        console.log('⏳ Aguardando você resolver o CAPTCHA...');
        
        // Aguardar até o h1 não ser mais "Loading"
        await page.waitForFunction(
            () => {
                const h1 = document.querySelector('h1');
                return h1 && h1.textContent?.trim() !== 'Loading';
            },
            { timeout: 120000 } // 2 minutos para resolver
        );
        
        console.log('✅ CAPTCHA resolvido! Continuando...');
    }

    async getPlayerStats(nickname, id) {
        let page;
        try {
            await this.init();
            
            const url = `${this.baseUrl}/players/${nickname}/${id}`;
            console.log(`📥 Abrindo: ${url}`);

            page = await this.browser.newPage();
            
            // Remover detecção de automation
            await page.evaluateOnNewDocument(() => {
                Object.defineProperty(navigator, 'webdriver', {
                    get: () => false,
                });
            });
            
            await page.setViewport({ width: 1920, height: 1080 });
            
            // Navegar
            await page.goto(url, {
                waitUntil: 'networkidle2',
                timeout: 60000
            });

            // Aguardar página carregar
            console.log('⏳ Aguardando página carregar...');
            
            // Tentar aguardar stats aparecerem (até 5 segundos)
            try {
                await page.waitForFunction(
                    () => {
                        const bodyText = document.body.innerText;
                        return bodyText.includes('Raid Stats') || bodyText.includes('Raids');
                    },
                    { timeout: 5000 }
                );
                console.log('✅ Stats encontradas na página!');
            } catch (e) {
                console.log('⏳ Stats não apareceram ainda, aguardando mais...');
                await page.waitForTimeout(3000);
            }
            
            // Verificar se ainda está em Loading (CAPTCHA não resolvido)
            const pageState = await page.evaluate(() => {
                const h1 = document.querySelector('h1');
                const hasRaidStats = document.body.innerText.includes('Raid Stats');
                return {
                    h1Text: h1?.textContent?.trim() || '',
                    hasRaidStats: hasRaidStats
                };
            });
            
            console.log('📄 Estado da página:', pageState);
            
            if (pageState.h1Text === 'Loading' && !pageState.hasRaidStats) {
                // Tem CAPTCHA - aguardar resolução manual
                await this.waitForCaptchaResolution(page);
                await page.waitForTimeout(2000);
            } else if (pageState.hasRaidStats) {
                console.log('✅ Página já carregou com stats!');
            }

            console.log('📊 Extraindo stats da página...');

            // Extrair stats
            const stats = await page.evaluate(() => {
                const stats = {
                    raids: 0,
                    kills: 0,
                    deaths: 0,
                    kd: 0,
                    sr: 0,
                    survived: 0,
                    traumatic: 0,
                    level: 0
                };

                // Procurar na tabela Raid Stats (linha PMC ou Total)
                function findInTable() {
                    const tables = document.querySelectorAll('table');
                    for (const table of tables) {
                        const rows = table.querySelectorAll('tr');
                        for (const row of rows) {
                            const cells = row.querySelectorAll('td');
                            if (cells.length > 0) {
                                const firstCell = cells[0].textContent?.trim();
                                
                                // Procurar linha PMC ou Total
                                if (firstCell === 'PMC' || firstCell === 'Total') {
                                    console.log('Linha encontrada:', firstCell);
                                    
                                    // Mapear colunas (pode variar)
                                    // Geralmente: Side, Raids, Survived, Runthrough, MIA, KIA, Kills, K/D, Win Streak
                                    if (cells[1]) stats.raids = parseInt(cells[1].textContent?.replace(/,/g, '')) || 0;
                                    if (cells[2]) stats.survived = parseInt(cells[2].textContent?.replace(/,/g, '')) || 0;
                                    if (cells[6]) stats.kills = parseInt(cells[6].textContent?.replace(/,/g, '')) || 0;
                                    if (cells[7]) stats.kd = parseFloat(cells[7].textContent) || 0;
                                    
                                    // Calcular S/R se temos raids e survived
                                    if (stats.raids > 0) {
                                        stats.sr = parseFloat(((stats.survived / stats.raids) * 100).toFixed(2));
                                    }
                                    
                                    // Deaths = KIA coluna
                                    if (cells[5]) stats.deaths = parseInt(cells[5].textContent?.replace(/,/g, '')) || 0;
                                    
                                    return true;
                                }
                            }
                        }
                    }
                    return false;
                }

                // Função auxiliar para encontrar stat (fallback)
                function findStat(label) {
                    const elements = Array.from(document.querySelectorAll('*'));
                    for (const el of elements) {
                        const text = el.textContent?.trim();
                        if (text && text.includes(label)) {
                            const parent = el.parentElement;
                            if (parent) {
                                const siblings = Array.from(parent.children);
                                for (const sibling of siblings) {
                                    const sibText = sibling.textContent?.trim();
                                    if (sibText && sibText !== label && sibText.match(/[\d,\.]+/)) {
                                        return sibText;
                                    }
                                }
                            }
                        }
                    }
                    return null;
                }
                
                // Tentar extrair da tabela primeiro
                const foundInTable = findInTable();
                
                if (!foundInTable) {
                    console.log('Tabela não encontrada, usando fallback...');
                    
                    // Extrair cada stat
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
                }

                // Level geralmente está no topo
                const levelElements = Array.from(document.querySelectorAll('*'));
                for (const el of levelElements) {
                    const text = el.textContent?.trim();
                    if (text && text.match(/Level\s+(\d+)/i)) {
                        const match = text.match(/Level\s+(\d+)/i);
                        if (match) {
                            stats.level = parseInt(match[1]) || 0;
                        }
                        break;
                    }
                }

                return stats;
            });

            console.log('📊 Stats extraídas:', stats);

            await page.close();

            // Verificar se conseguiu extrair dados
            if (stats.raids === 0 && stats.kills === 0) {
                return {
                    success: false,
                    error: 'NO_STATS_FOUND',
                    message: 'Não foi possível extrair stats da página',
                    stats: stats
                };
            }

            return {
                success: true,
                nickname: nickname,
                id: id,
                profileUrl: url,
                stats: stats,
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            console.error('❌ Erro:', error.message);
            
            if (page) {
                try {
                    await page.screenshot({ path: 'error-screenshot.png', fullPage: true });
                    console.log('📸 Screenshot de erro salvo: error-screenshot.png');
                } catch (e) {}
                await page.close();
            }

            return {
                success: false,
                error: error.message,
                nickname: nickname,
                id: id
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

module.exports = TarkovScraperWithManualCaptcha;

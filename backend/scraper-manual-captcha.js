const puppeteer = require('puppeteer');

class TarkovScraperWithManualCaptcha {
    constructor() {
        this.browser = null;
        this.baseUrl = 'https://tarkov.dev';
    }

    async init() {
        if (!this.browser) {
            console.log('🚀 Iniciando navegador stealth (evitando detecção de bot)...');
            this.browser = await puppeteer.launch({
                headless: false,
                defaultViewport: null,
                args: [
                    '--start-maximized',
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-blink-features=AutomationControlled',
                    '--disable-web-security',
                    '--disable-features=IsolateOrigins,site-per-process',
                    '--disable-dev-shm-usage',
                    '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
                ],
                ignoreDefaultArgs: ['--enable-automation'],
                ignoreHTTPSErrors: true
            });
        }
    }

    async waitForCaptchaResolution(page) {
        console.log('\n' + '='.repeat(60));
        console.log('⚠️  CAPTCHA DETECTADO! AÇÃO NECESSÁRIA');
        console.log('='.repeat(60));
        console.log('👉 Por favor, resolva o CAPTCHA no navegador que acabou de abrir');
        console.log('👉 Clique na caixa "Verify you are human"');
        console.log('⏳ Aguardando resolução (timeout: 2 minutos)...');
        console.log('='.repeat(60) + '\n');
        
        const startTime = Date.now();
        
        // Aguardar até o conteúdo carregar OU stats aparecerem
        try {
            await page.waitForFunction(
                () => {
                    const bodyText = document.body.innerText;
                    const h1 = document.querySelector('h1');
                    
                    // Verificar se não está mais no loading/captcha
                    const hasStats = bodyText.includes('Raids') || 
                                    bodyText.includes('Kills') || 
                                    bodyText.includes('Deaths');
                    const notLoading = h1 && h1.textContent?.trim() !== 'Loading';
                    const notJustAMoment = !bodyText.includes('Just a moment');
                    
                    return hasStats && notLoading && notJustAMoment;
                },
                { timeout: 120000 } // 2 minutos
            );
            
            const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
            console.log(`✅ CAPTCHA resolvido em ${elapsed}s! Continuando...`);
            
        } catch (error) {
            console.error('❌ Timeout aguardando resolução do CAPTCHA');
            throw new Error('CAPTCHA não foi resolvido no tempo limite');
        }
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

    async getPlayerStatsByUrl(url) {
        let page;
        try {
            console.log('\n' + '='.repeat(80));
            console.log('🔥🔥🔥 MÉTODO getPlayerStatsByUrl CHAMADO 🔥🔥🔥');
            console.log(`📥 URL RECEBIDA: ${url}`);
            console.log('='.repeat(80) + '\n');
            
            await this.init();
            
            if (!this.browser) {
                throw new Error('Falha ao inicializar browser');
            }

            console.log(`✅ Browser inicializado, abrindo página...`);
            page = await this.browser.newPage();
            
            // Configurar user agent e outros headers
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36');
            
            // Esconder que é Puppeteer/automação
            await page.evaluateOnNewDocument(() => {
                // Remover navigator.webdriver
                Object.defineProperty(navigator, 'webdriver', {
                    get: () => false,
                });
                
                // Fingir que tem plugins
                Object.defineProperty(navigator, 'plugins', {
                    get: () => [1, 2, 3, 4, 5],
                });
                
                // Fingir que tem languages
                Object.defineProperty(navigator, 'languages', {
                    get: () => ['en-US', 'en'],
                });
                
                // Remover indicadores de headless Chrome
                window.chrome = {
                    runtime: {},
                };
            });
            
            console.log(`🌐 Navegando para: ${url}`);
            
            // Primeira navegação
            await page.goto(url, { 
                waitUntil: 'domcontentloaded',
                timeout: 60000 
            });

            console.log(`✅ Página HTML carregada`);
            
            // Aguardar React/JavaScript renderizar
            console.log(`⏳ Aguardando JavaScript renderizar (10s)...`);
            await page.waitForTimeout(10000);

            // Verificar se Cloudflare bloqueou
            const pageText = await page.evaluate(() => document.body.innerText);
            if (pageText.includes('Verify you are human') || pageText.includes('Just a moment')) {
                console.log(`❌ Cloudflare/CAPTCHA detectado!`);
                console.log(`⏳ Aguardando 15s para ver se passa automaticamente...`);
                await page.waitForTimeout(15000);
            }

            // Aguardar stats carregarem
            console.log(`⏳ Aguardando stats aparecerem na página...`);
            
            await page.waitForFunction(
                () => {
                    const h1 = document.querySelector('h1');
                    const bodyText = document.body.innerText;
                    
                    return h1 && 
                           h1.innerText.trim() !== 'Loading' && 
                           (bodyText.includes('Raids') || bodyText.includes('Kills'));
                },
                { timeout: 30000 } // 30 segundos para stats carregarem
            );
            
            console.log(`✅ Stats carregadas!`);
            
            // Aguardar mais 2 segundos para garantir que tudo renderizou
            await page.waitForTimeout(2000);

            // Salvar screenshot e HTML para debug
            await page.screenshot({ path: 'debug-page.png', fullPage: true });
            const html = await page.content();
            require('fs').writeFileSync('debug-page.html', html);
            console.log(`📸 Screenshot e HTML salvos`);

            // Extrair stats da mesma forma
            const stats = await page.evaluate(() => {
                const stats = {
                    level: 0,
                    raids: 0,
                    kd: 0,
                    sr: 0,
                    kills: 0,
                    deaths: 0,
                    survived: 0,
                    runthrough: 0,
                    traumatic: 0,
                    hours: 0
                };

                // DEBUG: Salvar todo o texto da página
                const allText = document.body.innerText;
                console.log('📝 Primeiros 500 caracteres da página:', allText.substring(0, 500));
                
                // Raids
                const raidsMatch = allText.match(/Raids[:\s]+([0-9,]+)/i);
                if (raidsMatch) {
                    stats.raids = parseInt(raidsMatch[1].replace(/,/g, '')) || 0;
                }

                // Kills
                const killsMatch = allText.match(/Kills[:\s]+([0-9,]+)/i);
                if (killsMatch) {
                    stats.kills = parseInt(killsMatch[1].replace(/,/g, '')) || 0;
                }

                // Deaths
                const deathsMatch = allText.match(/Deaths[:\s]+([0-9,]+)/i);
                if (deathsMatch) {
                    stats.deaths = parseInt(deathsMatch[1].replace(/,/g, '')) || 0;
                }

                // K/D
                const kdMatch = allText.match(/K\/D Ratio[:\s]+([0-9.]+)/i);
                if (kdMatch) {
                    stats.kd = parseFloat(kdMatch[1]) || 0;
                }

                // S/R
                const srMatch = allText.match(/S\/R Ratio[:\s]+([0-9.]+)%?/i);
                if (srMatch) {
                    stats.sr = parseFloat(srMatch[1]) || 0;
                }

                // Survived
                const survivedMatch = allText.match(/Survived[:\s]+([0-9,]+)/i);
                if (survivedMatch) {
                    stats.survived = parseInt(survivedMatch[1].replace(/,/g, '')) || 0;
                }

                // Runthrough
                const runthroughMatch = allText.match(/(?:Run-?through|Runthrough)[:\s]+([0-9,]+)/i);
                if (runthroughMatch) {
                    stats.runthrough = parseInt(runthroughMatch[1].replace(/,/g, '')) || 0;
                }

                // Hours
                const hoursMatch = allText.match(/(?:Hours|Time)[:\s]+([0-9,]+)/i);
                if (hoursMatch) {
                    stats.hours = parseInt(hoursMatch[1].replace(/,/g, '')) || 0;
                }

                // Level
                const levelMatch = allText.match(/Level[:\s]+(\d+)/i);
                if (levelMatch) {
                    stats.level = parseInt(levelMatch[1]) || 0;
                }

                return stats;
            });

            console.log('📊 Stats extraídas:', stats);

            // Extrair nickname da página antes de fechar
            const nickname = await page.evaluate(() => {
                // Tentar encontrar o nickname no H1 ou título
                const h1 = document.querySelector('h1');
                if (h1) {
                    return h1.innerText.trim();
                }
                return 'Unknown';
            });

            await page.close();

            // Extrair ID da URL
            const urlParts = url.split('/');
            const id = urlParts[urlParts.length - 1];

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

module.exports = TarkovScraperWithManualCaptcha;

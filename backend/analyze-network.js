const puppeteer = require('puppeteer');

async function analyzeNetworkRequests() {
    console.log('🔍 Analisando requisições de rede do tarkov.dev...\n');
    
    const browser = await puppeteer.launch({
        headless: false, // Visível para você ver
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-blink-features=AutomationControlled'
        ]
    });

    const page = await browser.newPage();
    
    // Capturar todas as requisições
    const requests = [];
    
    page.on('request', request => {
        requests.push({
            type: 'REQUEST',
            method: request.method(),
            url: request.url(),
            resourceType: request.resourceType(),
            headers: request.headers(),
            postData: request.postData()
        });
    });

    page.on('response', async response => {
        const url = response.url();
        const status = response.status();
        
        // Focar em APIs/JSON
        if (url.includes('api') || url.includes('graphql') || response.headers()['content-type']?.includes('json')) {
            console.log(`\n📡 API REQUEST FOUND:`);
            console.log(`   URL: ${url}`);
            console.log(`   Status: ${status}`);
            console.log(`   Content-Type: ${response.headers()['content-type']}`);
            
            try {
                const body = await response.text();
                if (body && body.length < 5000) {
                    console.log(`   Response: ${body.substring(0, 500)}...`);
                }
            } catch (e) {
                console.log(`   (Não foi possível ler o body)`);
            }
        }
    });

    console.log('🌐 Abrindo: https://tarkov.dev/players/regular/12220692\n');
    await page.goto('https://tarkov.dev/players/regular/12220692', {
        waitUntil: 'networkidle2',
        timeout: 60000
    });

    console.log('\n⏳ Aguardando 20 segundos para capturar todas as requisições...\n');
    await page.waitForTimeout(20000);

    console.log('\n📊 RESUMO DAS REQUISIÇÕES:\n');
    
    // Filtrar requisições interessantes
    const apiRequests = requests.filter(r => 
        r.url.includes('api') || 
        r.url.includes('graphql') ||
        r.url.includes('player') ||
        r.url.includes('stats')
    );

    apiRequests.forEach((req, i) => {
        console.log(`\n${i + 1}. ${req.method} ${req.url}`);
        if (req.postData) {
            console.log(`   POST Data: ${req.postData}`);
        }
    });

    // Salvar HTML final
    const html = await page.content();
    const fs = require('fs');
    fs.writeFileSync('player-page-final.html', html);
    console.log('\n💾 HTML salvo em: player-page-final.html');

    // Extrair dados do JavaScript
    const pageData = await page.evaluate(() => {
        return {
            // Procurar dados em variáveis globais
            windowKeys: Object.keys(window).filter(k => k.includes('data') || k.includes('player') || k.includes('stats')),
            
            // Procurar scripts com dados
            scripts: Array.from(document.querySelectorAll('script')).map(s => s.textContent).filter(t => 
                t.includes('player') || t.includes('stats') || t.includes('12220692')
            ).map(t => t.substring(0, 500)),
            
            // Procurar elementos com dados
            dataAttributes: Array.from(document.querySelectorAll('[data-*]')).map(el => ({
                tag: el.tagName,
                attributes: Array.from(el.attributes).map(a => `${a.name}=${a.value}`)
            }))
        };
    });

    console.log('\n🔍 Dados encontrados na página:');
    console.log(JSON.stringify(pageData, null, 2));

    await browser.close();
    
    console.log('\n✅ Análise completa!');
    console.log('📄 Verifique o arquivo player-page-final.html para ver o HTML completo');
}

analyzeNetworkRequests().catch(console.error);

const puppeteer = require('puppeteer');
const fs = require('fs');

async function interceptGraphQL() {
    console.log('🔍 Interceptando requisições GraphQL do tarkov.dev...\n');
    
    const browser = await puppeteer.launch({
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    
    const graphqlRequests = [];
    
    // Interceptar requisições
    await page.setRequestInterception(true);
    
    page.on('request', request => {
        const url = request.url();
        
        if (url.includes('graphql')) {
            const postData = request.postData();
            console.log(`\n📤 GraphQL REQUEST:`);
            console.log(`   URL: ${url}`);
            console.log(`   Method: ${request.method()}`);
            
            if (postData) {
                try {
                    const parsed = JSON.parse(postData);
                    console.log(`   Query:`, parsed.query?.substring(0, 200));
                    console.log(`   Variables:`, JSON.stringify(parsed.variables, null, 2));
                    
                    graphqlRequests.push({
                        url,
                        method: request.method(),
                        postData: parsed
                    });
                } catch (e) {
                    console.log(`   PostData (raw):`, postData);
                }
            }
        }
        
        request.continue();
    });
    
    // Capturar respostas
    page.on('response', async response => {
        const url = response.url();
        
        if (url.includes('graphql')) {
            try {
                const json = await response.json();
                console.log(`\n📥 GraphQL RESPONSE:`);
                console.log(`   Status: ${response.status()}`);
                console.log(`   Data keys:`, Object.keys(json.data || {}));
                
                // Se tiver dados de player, mostrar
                if (json.data && JSON.stringify(json.data).includes('12220692')) {
                    console.log(`\n🎯 DADOS DO PLAYER ENCONTRADOS!`);
                    console.log(JSON.stringify(json, null, 2));
                    
                    fs.writeFileSync('player-data-response.json', JSON.stringify(json, null, 2));
                    console.log(`💾 Resposta salva em: player-data-response.json`);
                }
            } catch (e) {
                // Não é JSON
            }
        }
    });

    console.log('🌐 Abrindo: https://tarkov.dev/players/regular/12220692\n');
    await page.goto('https://tarkov.dev/players/regular/12220692', {
        waitUntil: 'networkidle0',
        timeout: 60000
    });

    console.log('\n⏳ Aguardando 15 segundos...\n');
    await page.waitForTimeout(15000);

    // Salvar todas as requisições GraphQL
    fs.writeFileSync('graphql-requests.json', JSON.stringify(graphqlRequests, null, 2));
    console.log(`\n💾 ${graphqlRequests.length} requisições GraphQL salvas em: graphql-requests.json`);

    await browser.close();
    
    console.log('\n✅ Análise completa!');
}

interceptGraphQL().catch(console.error);

const puppeteer = require('puppeteer');

/**
 * Script para tirar screenshot e ver o estado real da página
 */
async function captureScreenshot() {
    console.log('📸 Capturando screenshot da página...\n');
    
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    const url = 'https://tarkov.dev/players/regular/10590762';
    console.log(`📥 Opening: ${url}`);

    await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 60000
    });

    // Aguardar 5 segundos
    console.log('⏳ Aguardando 5 segundos...');
    await page.waitForTimeout(5000);

    // Tirar screenshot
    await page.screenshot({ path: 'screenshot-5s.png', fullPage: true });
    console.log('✅ Screenshot salva: screenshot-5s.png');

    // Aguardar mais 10 segundos
    console.log('⏳ Aguardando mais 10 segundos...');
    await page.waitForTimeout(10000);

    // Tirar segunda screenshot
    await page.screenshot({ path: 'screenshot-15s.png', fullPage: true });
    console.log('✅ Screenshot salva: screenshot-15s.png');

    // Verificar o título da página
    const title = await page.title();
    console.log(`📄 Título: ${title}`);

    // Verificar o h1
    const h1Text = await page.evaluate(() => {
        const h1 = document.querySelector('h1');
        return h1 ? h1.textContent : 'nenhum h1 encontrado';
    });
    console.log(`📝 H1: ${h1Text}`);

    // Verificar se tem mensagem de erro
    const pageText = await page.evaluate(() => document.body.textContent);
    if (pageText.includes('not found') || pageText.includes('404') || pageText.includes('error')) {
        console.log('❌ Página contém mensagem de erro');
    }

    await browser.close();
}

captureScreenshot().catch(err => {
    console.error('❌ Erro:', err);
});

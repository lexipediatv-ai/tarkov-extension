const puppeteer = require('puppeteer');

/**
 * Buscar lista de players válidos no tarkov.dev
 */
async function findPlayers() {
    console.log('🔍 Buscando lista de players...\n');
    
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    // Ir para página de busca de players
    const url = 'https://tarkov.dev/players';
    console.log(`📥 Opening: ${url}`);

    await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 60000
    });

    await page.waitForTimeout(5000);

    // Procurar links de players
    const players = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a[href^="/players/"]'));
        return links.slice(0, 10).map(link => ({
            text: link.textContent?.trim(),
            href: link.getAttribute('href')
        }));
    });

    console.log('👥 Players encontrados:');
    players.forEach(p => console.log(`  ${p.href} - ${p.text}`));

    // Salvar HTML
    const html = await page.content();
    require('fs').writeFileSync('players-page.html', html);
    console.log('\n✅ HTML salvo: players-page.html');

    await page.screenshot({ path: 'players-page.png', fullPage: true });
    console.log('✅ Screenshot salvo: players-page.png');

    await browser.close();
}

findPlayers().catch(err => {
    console.error('❌ Erro:', err);
});

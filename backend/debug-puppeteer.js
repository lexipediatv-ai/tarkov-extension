const puppeteer = require('puppeteer');
const fs = require('fs');

/**
 * Script para debugar a estrutura HTML renderizada pelo React
 */
async function debugPage() {
    console.log('🔍 Analisando página renderizada...\n');
    
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
        timeout: 30000
    });

    await page.waitForTimeout(5000); // Aguardar React renderizar

    // Salvar HTML renderizado
    const html = await page.content();
    fs.writeFileSync('rendered-page.html', html);
    console.log('✅ HTML renderizado salvo em: rendered-page.html\n');

    // Analisar estrutura
    const analysis = await page.evaluate(() => {
        const result = {
            allText: [],
            statsElements: [],
            classes: new Set(),
            ids: new Set()
        };

        // Pegar todo texto visível
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );

        let node;
        while (node = walker.nextNode()) {
            const text = node.textContent?.trim();
            if (text && text.length > 0 && text.length < 100) {
                result.allText.push(text);
            }
        }

        // Buscar elementos com texto de stats
        const keywords = ['Raids', 'Kills', 'Deaths', 'K/D', 'S/R', 'Survived', 'Traumatic'];
        document.querySelectorAll('*').forEach(elem => {
            const text = elem.textContent?.trim();
            if (keywords.some(kw => text?.includes(kw))) {
                result.statsElements.push({
                    tag: elem.tagName,
                    class: elem.className,
                    id: elem.id,
                    text: text?.substring(0, 100)
                });
                
                if (elem.className) result.classes.add(elem.className);
                if (elem.id) result.ids.add(elem.id);
            }
        });

        return {
            allText: result.allText,
            statsElements: result.statsElements,
            classes: Array.from(result.classes),
            ids: Array.from(result.ids)
        };
    });

    console.log('📊 ANÁLISE DO CONTEÚDO:\n');
    
    console.log('Classes CSS relacionadas a stats:');
    console.log(analysis.classes);
    console.log('');

    console.log('IDs relacionados a stats:');
    console.log(analysis.ids);
    console.log('');

    console.log('Elementos com texto de stats:');
    analysis.statsElements.forEach(elem => {
        console.log(`  ${elem.tag}.${elem.class} - "${elem.text}"`);
    });
    console.log('');

    console.log('Todo texto encontrado (primeiros 50):');
    analysis.allText.slice(0, 50).forEach(text => {
        console.log(`  "${text}"`);
    });

    await browser.close();
}

debugPage().then(() => {
    console.log('\n✅ Análise completa!');
}).catch(err => {
    console.error('❌ Erro:', err);
});

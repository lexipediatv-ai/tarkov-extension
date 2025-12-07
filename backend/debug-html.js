const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

async function downloadPage() {
    console.log('📥 Baixando página HTML do tarkov.dev...\n');
    
    const url = 'https://tarkov.dev/players/regular/10590762';
    
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        // Salvar HTML completo
        fs.writeFileSync('page.html', response.data);
        console.log('✅ HTML salvo em: page.html\n');
        
        // Carregar com cheerio
        const $ = cheerio.load(response.data);
        
        // Extrair todos os textos para análise
        console.log('📊 Procurando por palavras-chave...\n');
        
        const keywords = ['raids', 'kills', 'deaths', 'k/d', 's/r', 'pmc', 'stats', 'survived', 'traumatic'];
        const found = {};
        
        $('*').each((i, elem) => {
            const text = $(elem).text().toLowerCase().trim();
            const html = $(elem).html();
            
            keywords.forEach(keyword => {
                if (text.includes(keyword)) {
                    if (!found[keyword]) {
                        found[keyword] = [];
                    }
                    found[keyword].push({
                        tag: elem.name,
                        class: $(elem).attr('class'),
                        text: text.substring(0, 100),
                        html: html ? html.substring(0, 200) : ''
                    });
                }
            });
        });
        
        console.log('🔍 Elementos encontrados:\n');
        Object.keys(found).forEach(keyword => {
            console.log(`\n${keyword.toUpperCase()}:`);
            found[keyword].slice(0, 3).forEach((item, i) => {
                console.log(`  ${i+1}. Tag: <${item.tag}> Class: "${item.class}"`);
                console.log(`     Text: ${item.text.substring(0, 80)}...`);
            });
        });
        
        // Salvar análise
        fs.writeFileSync('analysis.json', JSON.stringify(found, null, 2));
        console.log('\n✅ Análise salva em: analysis.json');
        
        // Extrair estrutura de classes
        console.log('\n📋 Classes CSS usadas na página:\n');
        const classes = new Set();
        $('[class]').each((i, elem) => {
            const cls = $(elem).attr('class');
            if (cls) {
                cls.split(' ').forEach(c => classes.add(c));
            }
        });
        
        const classesList = Array.from(classes).sort();
        const relevantClasses = classesList.filter(c => 
            c.includes('stat') || 
            c.includes('value') || 
            c.includes('player') ||
            c.includes('pmc') ||
            c.includes('data')
        );
        
        console.log('Classes relevantes encontradas:');
        relevantClasses.slice(0, 20).forEach(c => console.log(`  - ${c}`));
        
    } catch (error) {
        console.error('❌ Erro:', error.message);
    }
}

downloadPage().then(() => {
    console.log('\n✅ Debug completo! Analise os arquivos page.html e analysis.json');
});

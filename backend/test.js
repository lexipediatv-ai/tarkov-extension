const TarkovScraper = require('./scraper');

console.log('🧪 Iniciando testes do scraper...\n');

async function runTests() {
    const scraper = new TarkovScraper();
    
    console.log('═══════════════════════════════════════════════════');
    console.log('Test 1: Buscar player Regular (ID: 10590762)');
    console.log('═══════════════════════════════════════════════════\n');
    
    try {
        const result = await scraper.getPlayerStats('regular', '10590762');
        
        console.log('✅ Sucesso!');
        console.log('\nDados retornados:');
        console.log(JSON.stringify(result, null, 2));
        
        console.log('\n📊 Stats encontradas:');
        console.log(`  Raids: ${result.stats.raids}`);
        console.log(`  Kills: ${result.stats.kills}`);
        console.log(`  Deaths: ${result.stats.deaths}`);
        console.log(`  K/D: ${result.stats.kd}`);
        console.log(`  S/R: ${result.stats.sr}%`);
        console.log(`  Survived: ${result.stats.survived}`);
        console.log(`  Traumatic: ${result.stats.traumatic}`);
        console.log(`  Level: ${result.stats.level}`);
        
        if (result.stats.raids === 0) {
            console.log('\n⚠️ AVISO: Nenhuma stat foi encontrada!');
            console.log('O scraper pode precisar de ajustes nos seletores CSS.');
        }
        
    } catch (error) {
        console.error('❌ Erro no teste:', error.message);
        console.error('\nStack:', error.stack);
    }
    
    console.log('\n═══════════════════════════════════════════════════');
    console.log('Testes concluídos!');
    console.log('═══════════════════════════════════════════════════\n');
}

runTests().then(() => {
    console.log('✅ Script finalizado');
    process.exit(0);
}).catch(err => {
    console.error('❌ Script falhou:', err);
    process.exit(1);
});

# ⚠️ Tarkov Stats Backend - IMPORTANTE

## Status do Projeto

Este backend foi desenvolvido para fazer scraping automático de stats de players do tarkov.dev, mas **NÃO É VIÁVEL** devido a limitações técnicas insuperáveis.

## ❌ Por que não funciona?

Após investigação completa com Puppeteer, descobrimos que:

### 1. **Cloudflare Turnstile (CAPTCHA)**
- Todas as páginas do tarkov.dev requerem validação CAPTCHA
- Puppeteer e ferramentas de automação não conseguem resolver
- Mesmo com `headless: 'new'` e timeouts longos, a página fica em "Loading"

### 2. **Perfis Não-Públicos**
- A URL `/players/{nickname}/{id}` não carrega diretamente
- Requer busca manual através do formulário
- Sistema valida se o perfil existe antes de exibir

### 3. **React SPA Complexo**
- Todo conteúdo carrega via JavaScript assíncrono
- Múltiplas validações client-side
- Dependências de estado global React

### 4. **Evidências dos Testes**

```bash
# Teste 1: Scraper básico
node test.js
# Resultado: Todos os stats retornam 0

# Teste 2: HTML estático
node debug-html.js  
# Resultado: Apenas <div id="root"> sem conteúdo

# Teste 3: Puppeteer com JavaScript
node scraper-puppeteer.js
# Resultado: Página permanece em "Loading" indefinidamente

# Teste 4: Screenshots
node capture-screenshot.js
# Resultado: H1 permanece "Loading" mesmo após 15 segundos

# Teste 5: Busca de players
node find-players.js
# Resultado: Nenhum player encontrado na página de busca
```

## ✅ Solução Atual (RECOMENDADA)

Use o **sistema de stats manuais** já implementado e funcional:

1. **Streamer**: Acessa https://tarkov.dev/players
2. **Streamer**: Busca seu perfil manualmente
3. **Streamer**: Copia os 8 stats principais
4. **Streamer**: Cola na configuração da extensão Twitch
5. **Sistema**: Salva no Twitch Configuration Service
6. **Viewers**: Veem os stats atualizados no painel

### Vantagens do Sistema Manual

- ✅ **Funciona 100%** - Sem dependências externas
- ✅ **Rápido** - Sem timeouts de scraping
- ✅ **Confiável** - Sem quebras por mudanças no site
- ✅ **Sem bloqueios** - Não viola ToS de nenhum serviço
- ✅ **Simples** - Streamer atualiza quando quiser

## 📁 Estrutura do Código

```
backend/
├── scraper-puppeteer.js      # Tentativa com Puppeteer (não funciona)
├── scraper.js                # Tentativa com Axios/Cheerio (não funciona)
├── server.js                 # Express API (pronto mas bloqueado)
├── test.js                   # Testes do scraper
├── debug-puppeteer.js        # Debug com screenshots
├── debug-html.js             # Análise HTML estático
├── capture-screenshot.js     # Captura de telas
├── find-players.js           # Busca de perfis
├── page.html                 # HTML baixado (só tem React stub)
├── rendered-page.html        # HTML renderizado (ainda em Loading)
├── screenshot-*.png          # Screenshots mostrando Loading
└── package.json              # Dependências (puppeteer, express, etc)
```

## 🔮 Possíveis Soluções Futuras

### Se o tarkov.dev mudar:

1. **API Oficial** - Se criarem endpoint público
2. **Remover CAPTCHA** - Se mudarem política de segurança  
3. **OAuth Integration** - Se implementarem autenticação
4. **Parceria** - Contato direto com desenvolvedores

### Se Battlestate Games disponibilizar:

1. **Official API** - API pública da BSG
2. **Game Client Integration** - Dados direto do jogo
3. **Launcher API** - Integração com Battlestate launcher

### Opções comerciais (não recomendadas):

1. **CAPTCHA Solving Services** - Caro ($$$) e contra ToS
2. **Proxy Farms** - Complexo e não confiável
3. **Browser Automation Farms** - Muito caro e lento

## 📊 Análise Técnica Completa

### Tentativa 1: Axios + Cheerio
```javascript
// scraper.js (FALHOU)
const html = await axios.get(url);
const $ = cheerio.load(html.data);
// Problema: HTML tem apenas <div id="root"> sem dados
```

### Tentativa 2: Puppeteer
```javascript
// scraper-puppeteer.js (FALHOU)
const browser = await puppeteer.launch();
await page.goto(url, { waitUntil: 'networkidle2' });
await page.waitForTimeout(15000);
// Problema: Página fica em "Loading" por CAPTCHA
```

### Evidência Final
```html
<!-- rendered-page.html após 15 segundos -->
<h1>Loading</h1>
<img src="profile-loading.webp" alt="Loading">
<div id="cf-turnstile" class="turnstile-widget">
  <!-- Cloudflare CAPTCHA Widget -->
</div>
```

## 💡 Recomendação

**Mantenha o sistema de stats manuais atual**. É a solução mais pragmática, confiável e sustentável para este projeto.

O código de backend está documentado e preservado caso surjam oportunidades futuras (API oficial, mudanças no tarkov.dev, etc).

## 📚 Documentação Relacionada

- `../config.html` - Interface de configuração manual (FUNCIONAL)
- `../panel.html` - Painel de exibição de stats (FUNCIONAL)
- `TARKOV-API.md` - Análise da API GraphQL do tarkov.dev
- `DEPLOY.md` - Instruções de deploy (para uso futuro)

## 🎯 Conclusão

Este backend demonstra uma tentativa completa e bem documentada de integração automática. As limitações encontradas são **técnicas e insuperáveis** com as ferramentas disponíveis atualmente.

O **sistema manual é a solução correta** para este caso de uso.

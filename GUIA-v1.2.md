# 📖 Guia Completo - Tarkov Stats v1.2

## 🎯 O Que É Esta Extensão?

Uma extensão para Twitch que exibe suas estatísticas de Escape From Tarkov (PMC) no painel lateral do seu canal, com:
- ✅ Busca automática de stats (quando possível)
- ✅ Interface simples: nickname + Player ID
- ✅ Fallback manual inteligente
- ✅ Visual tema Tarkov militar
- ✅ Link direto para seu perfil no tarkov.dev

---

## 🚀 Quick Start (Para Streamers)

### Passo 1: Encontrar seu Player ID

1. Acesse: https://tarkov.dev/players
2. Digite seu **nickname** no campo de busca
3. **Resolva o CAPTCHA** (segurança do site)
4. Quando a página carregar com seu perfil, olhe a URL:
   ```
   https://tarkov.dev/players/regular/10590762
                             ^^^^^^^^  ^^^^^^^^
                             nickname  Player ID
   ```
5. **Copie o número final** (Player ID)

### Passo 2: Configurar a Extensão

1. Abra a **configuração da extensão** no Twitch Dashboard
2. Preencha os campos:
   - **Nickname**: Seu nome no Tarkov (ex: `regular`)
   - **Player ID**: O número que você copiou (ex: `10590762`)
3. Clique em **"🚀 Buscar Stats Automaticamente"**

### Passo 3: Sistema Faz o Resto

**Cenário A - Auto-fetch funciona:**
- ✅ Sistema busca suas stats automaticamente
- ✅ Todos os campos são preenchidos
- ✅ Você só precisa clicar em "Salvar"

**Cenário B - Manual (se CAPTCHA bloquear):**
- 🌐 Sistema abre seu perfil no tarkov.dev
- 📋 Você copia os números manualmente
- ⌨️ Cola nos campos da extensão
- 💾 Clica em "Salvar"

---

## 🎮 Para Viewers (Espectadores)

Quando um streamer configura a extensão:
1. Aparece um painel lateral no canal
2. Mostra 8 estatísticas principais:
   - **Raids** - Total de raids realizadas
   - **Kills** - Abates totais
   - **Deaths** - Mortes totais
   - **Survived** - Raids sobrevividas
   - **K/D** - Taxa Kills/Deaths
   - **S/R** - Taxa de sobrevivência (%)
   - **Traumatic** - Eventos traumáticos
   - **Level** - Nível do PMC
3. Botão **"Ver Perfil Completo"** → abre tarkov.dev

---

## 🔧 Detalhes Técnicos

### Como Funciona o Auto-Fetch?

```
1. Você digita: nickname + Player ID
2. Sistema constrói URL: tarkov.dev/players/{nickname}/{id}
3. Tenta buscar via backend (se disponível)
   ├─ ✅ Sucesso → Preenche campos automaticamente
   └─ ❌ Falha → Abre URL para entrada manual
4. Você salva a configuração
5. Stats aparecem no painel para viewers
```

### Backend Opcional

A extensão pode funcionar de **duas formas**:

**Modo 1: Com Backend (Auto-fetch)**
- Backend Node.js com Puppeteer rodando em `localhost:3000`
- Sistema tenta buscar stats automaticamente
- Pode ainda encontrar CAPTCHA em alguns casos

**Modo 2: Manual (Sempre Funciona)**
- Sem necessidade de backend
- Sistema abre o perfil direto
- Você copia/cola manualmente
- **100% confiável**

---

## 📊 Campos de Estatísticas

| Campo | O Que É | Onde Encontrar |
|-------|---------|----------------|
| **Raids** | Total de raids | Seção "Overview" |
| **Kills** | Total de PMC/Scav abatidos | Seção "Kills" |
| **Deaths** | Total de mortes | Seção "Overview" |
| **Survived** | Raids que você sobreviveu | Seção "Overview" |
| **K/D Ratio** | Kills ÷ Deaths | Calculado automaticamente |
| **S/R %** | (Survived ÷ Raids) × 100 | Calculado automaticamente |
| **Traumatic** | Eventos traumáticos | Seção específica |
| **Level** | Nível do PMC | Visível no topo do perfil |

---

## 🆚 Comparação de Versões

| Recurso | v1.0 | v1.1 | v1.2 |
|---------|------|------|------|
| Stats manuais | ✅ | ✅ | ✅ |
| Campos necessários | 8 campos | Nickname | Nickname + ID |
| Auto-fetch | ❌ | ❌ | ✅ (com backend) |
| URL aberta | - | Busca | Perfil direto |
| Instruções no UI | ❌ | ✅ | ✅ |
| Backend opcional | ❌ | ❌ | ✅ |

---

## ❓ FAQ

### Por que preciso do Player ID?

A página de busca do tarkov.dev sempre pede CAPTCHA. Mas se você fornecer o Player ID, o sistema pode abrir seu perfil **diretamente**, evitando a busca.

### O auto-fetch sempre funciona?

**Não.** tarkov.dev usa proteções anti-bot (CAPTCHA). O sistema **tenta** buscar automaticamente, mas pode falhar. Quando isso acontece, você entra com os dados manualmente.

### Preciso rodar o backend?

**Não!** O backend é **opcional**. Se você não rodar, o sistema funciona 100% em modo manual (você copia/cola os números).

### Como atualizar minhas stats?

1. Entre na configuração da extensão
2. Clique em "🔄 Buscar Novamente"
3. Sistema tenta auto-fetch ou abre seu perfil
4. Atualize os números
5. Salve

### Posso usar sem programar nada?

**Sim!** A extensão está pronta para uso. Você só precisa:
1. Instalar no Twitch
2. Configurar com seu nickname + ID
3. Copiar seus stats (manual ou automático)

---

## 🐛 Problemas Comuns

### "Botão está desabilitado"
- ✅ Certifique-se de preencher **ambos** os campos:
  - Nickname (mínimo 2 caracteres)
  - Player ID (mínimo 4 caracteres)

### "Stats não carregaram automaticamente"
- ✅ **Normal!** CAPTCHA pode bloquear
- ✅ Use o modo manual: copie/cole os números

### "Erro ao salvar configuração"
- ✅ Preencha pelo menos o campo **Raids**
- ✅ Verifique se todos os números são válidos

### "Perfil não abre"
- ✅ Verifique se o Player ID está correto
- ✅ Teste a URL manualmente: `tarkov.dev/players/{nickname}/{id}`

---

## 🛠️ Para Desenvolvedores

### Estrutura de Arquivos

```
twitch-extension/
├── manifest.json           # Configuração Twitch
├── panel.html             # Interface para viewers
├── config.html            # Interface para streamer
├── styles/
│   ├── panel.css          # Estilos do painel
│   └── config.css         # Estilos da config
├── scripts/
│   ├── panel.js           # Lógica do painel
│   └── config.js          # Lógica da config
├── images/
│   └── icon-*.png         # Ícones (24, 100, 300px)
└── backend/               # Backend opcional
    ├── server.js          # Express API
    └── scraper-puppeteer.js
```

### API do Backend (Opcional)

**Endpoint:**
```
GET /api/player/:nickname/:id
```

**Resposta de Sucesso:**
```json
{
  "success": true,
  "stats": {
    "raids": 645,
    "kills": 3535,
    "deaths": 275,
    "survived": 353,
    "kd": 12.86,
    "sr": 54.71,
    "traumatic": 57,
    "level": 42
  }
}
```

**Resposta de Erro:**
```json
{
  "success": false,
  "error": "CAPTCHA detected",
  "message": "Manual entry required"
}
```

### Testando Localmente

1. **Frontend:**
   - Abra `config.html` no navegador
   - Teste o formulário
   - Verifique validação dos campos

2. **Backend (opcional):**
   ```bash
   cd backend
   npm install
   npm start
   ```
   - Acesse: http://localhost:3000/api/player/regular/10590762
   - Verifique resposta JSON

3. **Twitch Developer Rig:**
   - Configure o projeto no Rig
   - Teste como extensão real

---

## 📝 Changelog Resumido

**v1.2.0** (Atual)
- ✨ Auto-fetch com Player ID
- 🔄 Fallback inteligente
- 📝 UI melhorada com instruções

**v1.1.0**
- ✨ Simplificado para nickname único
- 📋 Instruções visuais

**v1.0.0**
- 🎉 Release inicial
- ✅ 8 stats manuais
- 🎨 Tema Tarkov militar

---

## 📄 Licença

Este projeto é fornecido "como está" para uso pessoal.

---

## 🙏 Créditos

- **Dados:** [tarkov.dev](https://tarkov.dev) - Database comunitário de Tarkov
- **Plataforma:** [Twitch Extensions](https://dev.twitch.tv/docs/extensions)
- **Tema:** Inspirado em Escape From Tarkov (Battlestate Games)

---

**Dúvidas?** Consulte:
- 📖 `CHANGELOG-v1.2.md` - Detalhes técnicos da versão
- 📚 `PROJETO-FINAL.md` - Documentação completa do projeto
- 🔍 `backend/README-LIMITATIONS.md` - Por que scraping é difícil

---

**Versão:** 1.2.0
**Última Atualização:** 2024
**Status:** ✅ Produção

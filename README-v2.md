# Tarkov Stats Extension v2.0

## 🎉 NOVO! Integração com API Oficial do tarkov.dev

### ✨ O QUE MUDOU:

**Antes (v1.0-1.2):**
- ❌ Entrada manual de stats
- ❌ Scraping HTML com Puppeteer
- ❌ Backend Node.js necessário
- ❌ CAPTCHA manual toda vez

**Agora (v2.0):**
- ✅ **API oficial do tarkov.dev**
- ✅ **Busca automática de stats**
- ✅ **Auto-refresh a cada 5 minutos**
- ✅ **Cloudflare Turnstile** (CAPTCHA leve)
- ✅ **100% frontend** - Sem backend necessário!
- ✅ **Atualização em tempo real** no painel

---

## 🚀 FUNCIONALIDADES:

### config.html (Configuração)
1. **Digite o Player ID** (Account ID do tarkov.dev)
2. **Complete o Turnstile** (verificação de segurança)
3. **Clique em "Buscar Stats"** - Dados aparecem automaticamente!
4. **Salve a configuração** - Dados sincronizam com o painel
5. **Auto-refresh opcional** - Atualiza a cada 5 minutos

### panel.html (Painel para Viewers)
- **Exibe stats em tempo real** do streamer
- **Auto-atualização** a cada 5 minutos (se habilitado)
- **Design Tarkov temático** com cores militares
- **Link para perfil completo** no tarkov.dev

---

## 📋 COMO USAR:

### 1. Encontrar seu Player ID:
```
1. Acesse: https://tarkov.dev/players
2. Digite seu nickname e resolva o CAPTCHA
3. URL ficará: tarkov.dev/players/SEU_NICK/[12345678]
4. Copie os números (Player ID)
```

### 2. Configurar a Extensão:
```
1. Abra config.html na página de configuração Twitch
2. Cole seu Player ID
3. Complete a verificação Turnstile
4. Clique "Buscar Stats Automaticamente"
5. Revise os dados e clique "Salvar Configuração"
```

### 3. Ativar Auto-Refresh (Opcional):
```
☑ Marque "Atualizar stats automaticamente a cada 5 minutos"
```

---

## 🔒 SEGURANÇA:

A extensão usa **Cloudflare Turnstile** para autenticação:
- Site Key: `0x4AAAAAAAVVIHGZCr2PPwrR`
- Verificação leve (não aquele CAPTCHA chato!)
- Token válido por alguns minutos
- Necessário apenas 1x por sessão

---

## 🌐 API UTILIZADA:

```javascript
// Endpoint oficial do tarkov.dev
https://player.tarkov.dev/account/{playerId}?gameMode=regular&token={turnstileToken}

// Retorna:
{
  "aid": 12220692,
  "info": {
    "nickname": "KarolMartynsTV",
    "side": "Bear",
    "experience": 3500000
  },
  "pmcStats": { ... },
  "scavStats": { ... },
  "skills": { ... }
}
```

---

## 📊 DADOS EXIBIDOS:

- **Nickname**: Nome do jogador
- **Level**: Calculado pela experiência
- **Side**: USEC/BEAR/SAVAGE
- **Raids**: Total (PMC + Scav)
- **Survived**: Raids sobrevividas
- **Survival Rate**: Percentual
- **Kills**: Total de kills
- **K/D Ratio**: Kills por Death
- **Deaths**: Total de mortes
- **Traumatic**: Run-through exits
- **Link**: Perfil completo no tarkov.dev

---

## 🔄 AUTO-REFRESH:

Quando habilitado:
1. **A cada 5 minutos** a extensão busca novos dados
2. **Atualiza automaticamente** o painel
3. **Salva no Twitch Config** para sincronização
4. **Viewers veem stats atualizados** em tempo real

```javascript
// Configuração
refreshInterval = setInterval(() => {
    fetchFreshStats();
}, 5 * 60 * 1000); // 5 minutos
```

---

## 🛠️ ARQUIVOS PRINCIPAIS:

```
twitch-extension/
├── config.html           # Página de configuração (atualizada)
├── panel.html            # Painel de visualização (atualizado)
├── scripts/
│   ├── config-v2.js      # Lógica da API + Turnstile
│   └── panel-v2.js       # Auto-refresh + Display
├── config-api.html       # Versão standalone para testes
└── serve.js              # Servidor HTTP local (apenas testes)
```

---

## 🧪 TESTAR LOCALMENTE:

### Opção 1: Versão Standalone
```bash
# Iniciar servidor HTTP
node serve.js

# Abrir no navegador:
http://localhost:8080/config-api.html
```

### Opção 2: Twitch Developer Rig
```
1. Abra o Twitch Developer Rig
2. Carregue config.html e panel.html
3. Configure com seu Player ID
4. Teste o auto-refresh
```

---

## 📝 CHANGELOG:

### v2.0.0 (Dezembro 2025)
- ✨ **NOVO**: Integração com API oficial do tarkov.dev
- ✨ **NOVO**: Cloudflare Turnstile para autenticação
- ✨ **NOVO**: Auto-refresh a cada 5 minutos
- ✨ **NOVO**: Atualização em tempo real no painel
- ♻️ **REMOVIDO**: Backend Node.js (não mais necessário)
- ♻️ **REMOVIDO**: Scraping HTML com Puppeteer
- ♻️ **REMOVIDO**: Entrada manual de stats
- 🐛 **CORRIGIDO**: Cálculo de level por experiência
- 🐛 **CORRIGIDO**: Stats combinadas (PMC + Scav)

### v1.2.0
- ➕ Adicionado Player ID field
- ➕ Backend Puppeteer para scraping

### v1.1.0
- 🎨 Interface simplificada
- ➕ Campo único de nickname

### v1.0.0
- 🎉 Release inicial
- 📝 Entrada manual de 8 campos

---

## 🤝 CRÉDITOS:

- **API**: [tarkov.dev](https://tarkov.dev) - Dados oficiais do jogo
- **Segurança**: [Cloudflare Turnstile](https://challenges.cloudflare.com/)
- **Plataforma**: [Twitch Extensions](https://dev.twitch.tv/docs/extensions/)

---

## 📞 SUPORTE:

Problemas comuns:

**"Turnstile cannot run in file:// url"**
→ Use servidor HTTP (node serve.js) ou Twitch Dev Rig

**"Rate limit atingido"**
→ Aguarde 1 minuto entre requisições

**"Verificação de segurança falhou"**
→ Recarregue a página e resolva o Turnstile novamente

**"Perfil não encontrado"**
→ Verifique se o Player ID está correto

---

## 🚀 PRÓXIMOS PASSOS:

- [ ] Suporte para múltiplos game modes (PvE)
- [ ] Cache local de stats
- [ ] Gráficos de progressão
- [ ] Comparação com outros players
- [ ] Integração com Twitch chat commands

---

**Versão**: 2.0.0  
**Data**: Dezembro 2025  
**Licença**: MIT

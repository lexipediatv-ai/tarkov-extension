# 📝 Changelog - Versão 1.2

**Data de Lançamento:** 2024
**Tipo:** Feature Update - Auto-fetch com Player ID

---

## ✨ Novidades

### 🚀 Auto-Fetch com Player ID
- **Nova funcionalidade:** Busca automática de stats usando nickname + Player ID
- **URL direta:** Usa o padrão `https://tarkov.dev/players/{nickname}/{id}` para acesso direto ao perfil
- **Integração com backend:** Tenta buscar stats automaticamente via API local (se disponível)
- **Fallback inteligente:** Se backend não estiver rodando ou CAPTCHA bloquear, abre o perfil e permite entrada manual

### 📋 Melhorias na Interface

**Configuração mais simples:**
- ✅ Dois campos: Nickname + Player ID
- ✅ Instruções claras de como encontrar o Player ID
- ✅ Validação em tempo real (nickname ≥2 chars, ID ≥4 chars)
- ✅ Botão desabilitado até ambos os campos serem preenchidos

**Fluxo de trabalho melhorado:**
1. Digite seu nickname (ex: `regular`)
2. Digite seu Player ID (encontrado na URL do tarkov.dev)
3. Clique em "🚀 Buscar Stats Automaticamente"
4. Sistema tenta buscar automaticamente
5. Se necessário, abre o perfil para entrada manual

### 🔧 Mudanças Técnicas

**Frontend:**
- `config.html`: Adicionado campo `player-id-input`
- `scripts/config.js`: 
  - Nova função `checkFormInputs()` (substitui `onNicknameChange`)
  - Nova função `displayStats()` para preencher formulário automaticamente
  - Atualizado `fetchStats()` para usar URL direta e tentar backend
  - Atualizado `showManualStatsForm()` para aceitar playerId

**Backend (opcional):**
- Endpoint esperado: `GET /api/player/:nickname/:id`
- Retorno esperado: `{ success: true, stats: {...} }`
- Se backend não estiver rodando, sistema funciona em modo manual

---

## 🎯 Como Usar

### Encontrar seu Player ID:

1. Acesse: https://tarkov.dev/players
2. Digite seu nickname e resolva o CAPTCHA
3. Quando a página carregar, copie a **ID** da URL
   - Exemplo: `https://tarkov.dev/players/regular/10590762`
   - Sua ID é: `10590762`

### Configurar a Extensão:

1. Abra a configuração da extensão no Twitch
2. Digite seu **nickname** (ex: `regular`)
3. Digite seu **Player ID** (ex: `10590762`)
4. Clique em **"🚀 Buscar Stats Automaticamente"**
5. Se o sistema conseguir buscar automaticamente, seus campos serão preenchidos
6. Se não, copie manualmente os valores do site
7. Clique em **"💾 Salvar Configuração"**

---

## 🔄 Diferenças da v1.1

| Recurso | v1.1 | v1.2 |
|---------|------|------|
| Campos necessários | Apenas nickname | Nickname + Player ID |
| Busca automática | ❌ Não | ✅ Sim (com backend) |
| URL aberta | Página de busca | Perfil direto |
| Fallback manual | ✅ Sim | ✅ Sim |
| Backend opcional | ❌ Não | ✅ Sim |

---

## 📦 Arquivos Modificados

```
config.html          - Adicionado campo player-id-input
scripts/config.js    - Implementado auto-fetch + displayStats()
styles/config.css    - Sem mudanças (compatível)
panel.html           - Sem mudanças
panel.js             - Sem mudanças
manifest.json        - Sem mudanças
```

---

## 🐛 Limitações Conhecidas

1. **CAPTCHA ainda pode bloquear:** URLs diretas podem ainda exigir CAPTCHA em algumas situações
2. **Backend opcional:** Auto-fetch só funciona se backend estiver rodando em `localhost:3000`
3. **Entrada manual sempre disponível:** Se auto-fetch falhar, sistema abre o perfil e permite entrada manual

---

## 🚀 Próximos Passos (v1.3+)

- [ ] Hospedar backend em servidor público
- [ ] Implementar cache de stats
- [ ] Auto-refresh de stats a cada X horas
- [ ] Adicionar mais estatísticas (headshots, longest shot, etc)
- [ ] Modo "tema claro/escuro"

---

## 📝 Notas de Desenvolvimento

**Por que Player ID é necessário?**
- A página de busca (tarkov.dev/players) sempre pede CAPTCHA
- URLs diretas (tarkov.dev/players/nickname/ID) podem acessar o perfil diretamente
- Isso reduz a necessidade de resolver CAPTCHA toda vez

**Por que backend é opcional?**
- Backend com Puppeteer pode contornar algumas limitações
- Mas CAPTCHA ainda pode bloquear em casos específicos
- Sistema funciona 100% manual se backend não estiver disponível

**Como backend tenta buscar:**
```javascript
const backendUrl = 'http://localhost:3000/api/player/{nickname}/{id}';
fetch(backendUrl) → tenta buscar stats
  ✅ Success → displayStats() preenche automaticamente
  ❌ Error → showManualStatsForm() permite entrada manual
```

---

**Versão:** 1.2.0
**Status:** ✅ Pronto para testes
**Compatibilidade:** Twitch Extensions API v1

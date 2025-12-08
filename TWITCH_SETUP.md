# 🎮 Twitch Extension Setup Guide

## ✅ Pré-requisitos Completos
- [x] Backend deployed no Vercel (HTTPS ativo)
- [x] URL de produção: `https://tarkov-stats-bdojw4788-marcelos-projects-fb95b857.vercel.app`
- [x] API testada e funcionando
- [x] Frontend atualizado com URLs de produção
- [x] manifest.json configurado

---

## 📋 Passo 1: Twitch Developer Console

### 1.1 Acesse o Console
1. Vá para: https://dev.twitch.tv/console/extensions
2. Faça login com sua conta Twitch
3. Clique em **"Create Extension"**

### 1.2 Informações Básicas
- **Name**: `Tarkov Stats`
- **Description**: 
  ```
  Display your Escape From Tarkov PMC stats with auto-refresh. 
  Shows level, K/D, survival rate, raids, and more from tarkov.dev API!
  ```
- **Type**: `Panel`
- **Category**: `Games` > `Escape from Tarkov`

---

## 🔗 Passo 2: Asset Hosting

### 2.1 Método 1: Upload Direto (Recomendado)
1. No Twitch Developer Console, vá em **"Files"**
2. Faça upload dos seguintes arquivos:
   - `panel.html`
   - `config.html`
   - `styles/panel.css`
   - `styles/config.css`
   - `scripts/panel-v2.js`
   - `scripts/config-v2.js`
   - `images/bear.svg`
   - `images/usec.svg`

### 2.2 Método 2: CDN/Vercel (Alternativo)
Se preferir hospedar tudo no Vercel:
1. Adicione os arquivos HTML/CSS/JS no seu repositório Vercel
2. Configure `vercel.json` para servir arquivos estáticos
3. Use os URLs completos no manifest

---

## 🌐 Passo 3: Whitelisted Domains

### 3.1 Adicionar Domínios
No Twitch Developer Console, em **"Asset Hosting" > "Allowlisted Domains"**, adicione:

**Panel URLs** (allowlisted_panel_urls):
```
https://tarkov-stats-bdojw4788-marcelos-projects-fb95b857.vercel.app
https://players.tarkov.dev
https://api.tarkov.dev
https://assets.tarkov.dev
```

**Config URLs** (allowlisted_config_urls):
```
https://tarkov-stats-bdojw4788-marcelos-projects-fb95b857.vercel.app
https://players.tarkov.dev
https://api.tarkov.dev
https://assets.tarkov.dev
```

### ⚠️ IMPORTANTE
- Esses domínios permitem que sua extensão faça chamadas CORS
- Sem isso, as APIs de stats não funcionarão
- O Vercel URL é obrigatório para o backend funcionar

---

## 🖼️ Passo 4: Ícones da Extensão

### 4.1 Tamanhos Necessários
Você precisa criar 3 ícones PNG:
- **24x24px** - Ícone pequeno (menu)
- **100x100px** - Ícone médio (discovery)
- **300x200px** - Banner (discovery page)

### 4.2 Criação Rápida
**Opção A - Usar favicon existente:**
```powershell
# Se você tiver um favicon.ico, pode converter para PNG
# Use um editor online: https://favicon.io/favicon-converter/
```

**Opção B - Criar com texto:**
1. Use Canva: https://www.canva.com
2. Crie um design simples com:
   - Fundo preto/escuro (tema Tarkov)
   - Texto "TARKOV STATS" ou logo EFT
   - Cores: Verde militar (#4A6741) ou Amarelo (#D4AF37)

**Opção C - IA Generator:**
```
Prompt para Midjourney/DALL-E:
"Simple gaming logo for Escape from Tarkov stats extension, 
military green and black, minimalist icon, transparent background"
```

### 4.3 Upload dos Ícones
No Twitch Developer Console:
1. Vá em **"Extensions" > "Assets"**
2. Upload cada ícone no tamanho correspondente
3. Salve as alterações

---

## ⚙️ Passo 5: Configuração da Extensão

### 5.1 Extension Capabilities
No Developer Console, configure:

**Views:**
- ✅ Panel (habilitado)
  - Viewer URL: `panel.html`
  - Height: 500px
  
- ✅ Config (habilitado)
  - Viewer URL: `config.html`

**Permissions:**
- ✅ Can link external content: `true` (para ambos panel e config)

**Configuration:**
- ✅ Required Configuration: `true`
- ✅ Broadcaster Configuration: `true`

### 5.2 Testing & Review
- **State**: Deixe como `Testing` por enquanto
- **Bits Enabled**: `false` (não usa Bits)
- **Subscription Support**: `none`

---

## 🧪 Passo 6: Testar a Extensão

### 6.1 Local Extension Testing
1. No Twitch Developer Console, clique em **"Local Test"**
2. Copie o **Extension ID**
3. Instale no seu canal de teste

### 6.2 Usando Twitch Developer Rig (Opcional)
```powershell
# Instalar Developer Rig
# https://dev.twitch.tv/docs/extensions/rig/

# Baixe e instale:
# - Windows: TwitchDeveloperRig-Setup.exe
# - macOS/Linux: Use o Electron app
```

### 6.3 Teste Manual no Canal
1. Vá no seu canal: `https://www.twitch.tv/{seu_canal}`
2. Clique em **"Editar Painéis"** (abaixo do player)
3. Adicione a extensão **"Tarkov Stats"**
4. Configure o Player ID na aba Config
5. Veja se os stats carregam no Panel

---

## 🚀 Passo 7: Submeter para Review

### 7.1 Antes de Submeter
✅ Checklist final:
- [ ] Testou localmente e funciona 100%
- [ ] API backend responde em <3s
- [ ] Ícones criados e uploaded (24px, 100px, 300px)
- [ ] Description completa e em inglês
- [ ] Screenshots da extensão funcionando (3-5 imagens)
- [ ] Support email configurado
- [ ] Domains whitelisted corretamente

### 7.2 Screenshots Necessários
Capture telas de:
1. **Config page** - Mostrando como salvar Player ID
2. **Panel com stats** - Exibindo K/D, raids, level
3. **Panel com faction icon** - BEAR ou USEC
4. **Auto-refresh working** - Stats atualizando
5. **Different player** - Outro Player ID de teste

### 7.3 Submeter
1. No Developer Console, clique em **"Submit for Review"**
2. Preencha o formulário:
   - **Testing Instructions**: 
     ```
     1. Open Config page
     2. Enter Player ID: 10590762
     3. Click Save
     4. Open Panel view
     5. Stats should load automatically (Level 37, BEAR faction)
     6. Wait 30 seconds - stats will auto-refresh
     ```
   - **Privacy Policy URL**: (se não tiver, use: "No personal data collected")
   - **Terms of Service URL**: (opcional)

3. Aguarde review (7-14 dias úteis)

---

## 📊 Monitoramento Pós-Deploy

### Vercel Analytics
```powershell
# Acessar logs do Vercel
vercel logs --follow

# Ver métricas de performance
# https://vercel.com/marcelos-projects-fb95b857/tarkov-stats/analytics
```

### Twitch Extension Analytics
- Acesse: https://dev.twitch.tv/console/extensions/{extension_id}/analytics
- Monitore:
  - Instalações ativas
  - Views por dia
  - Erros reportados

---

## 🐛 Troubleshooting

### Erro: "Failed to load resource"
**Causa**: Domain não whitelisted
**Solução**: Verifique se todos os domínios estão em `allowlisted_panel_urls`

### Erro: "CORS policy blocked"
**Causa**: Vercel URL não configurado
**Solução**: Adicione o domínio Vercel completo no whitelist

### Erro: "Player ID not found"
**Causa**: Player ID inválido ou API tarkov.dev fora
**Solução**: Teste o endpoint direto no navegador

### Stats não atualizam
**Causa**: Auto-refresh desabilitado ou cache preso
**Solução**: 
1. Limpe cache do navegador
2. Verifique console (F12) por erros
3. Confirme que auto-refresh está habilitado no config

---

## 📞 Suporte

### Recursos Oficiais
- Twitch Dev Docs: https://dev.twitch.tv/docs/extensions
- Twitch Dev Forums: https://discuss.dev.twitch.tv
- Tarkov.dev API: https://tarkov.dev/api-docs

### Contato
- GitHub: https://github.com/lexipediatv-ai/tarkov-extension
- Email: (adicione seu email aqui)

---

## 🎉 Conclusão

Sua extensão está pronta para produção! 🚀

**Próximos passos:**
1. ✅ Teste a API no navegador
2. ⏳ Crie os 3 ícones PNG
3. ⏳ Faça upload no Twitch Developer Console
4. ⏳ Configure domains whitelisted
5. ⏳ Submeta para review

**Boa sorte com a review da Twitch!** 💪

# Guia de Testes - Tarkov Stats Extension

## 📋 Pré-requisitos

1. **Conta Twitch**: Você precisa ter uma conta na Twitch
2. **Twitch Developer Console**: Acesso ao [Twitch Developer Console](https://dev.twitch.tv/console)
3. **Arquivos da Extensão**: Todos os arquivos deste projeto

---

## 🚀 Método 1: Teste Local com Twitch Developer Rig (Recomendado)

### Passo 1: Instalar o Twitch Developer Rig

1. Baixe o Twitch Developer Rig: https://dev.twitch.tv/docs/extensions/rig/
2. Instale no seu computador (Windows/Mac/Linux)
3. Abra o Developer Rig

### Passo 2: Criar uma Extensão no Console da Twitch

1. Acesse: https://dev.twitch.tv/console/extensions
2. Clique em **"Register Your Extension"** ou **"Create Extension"**
3. Preencha:
   - **Name**: Tarkov Stats
   - **Extension Type**: Panel
   - **Author**: Seu nome
   - **Description**: Display Escape From Tarkov PMC stats
   - **Support Email**: Seu email

4. Anote o **Extension Client ID** que será gerado

### Passo 3: Configurar Assets e Views

#### Na seção "Asset Hosting":
Você tem 2 opções:

**Opção A - Testing (Mais Fácil)**:
1. Mantenha o servidor local rodando: `python -m http.server 8080`
2. Em "Testing Base URI", coloque: `http://localhost:8080`
3. Clique em "Save"

**Opção B - Upload de Assets (Produção)**:
1. Comprima todos os arquivos em um ZIP:
   ```powershell
   Compress-Archive -Path * -DestinationPath extension.zip
   ```
2. Faça upload do ZIP na seção "Asset Hosting"
3. Aguarde processamento (pode levar alguns minutos)

#### Na seção "Views":
Configure as views:
- **Panel Viewer Path**: `panel.html`
- **Configuration Path**: `config.html`
- **Panel Height**: 535 (ou 300 mínimo)

### Passo 4: Configurar no Developer Rig

1. Abra o Developer Rig
2. Clique em **"Create Project"** → **"Extension Project"**
3. Selecione sua extensão da lista (pelo nome ou Client ID)
4. Em **"Views"**, ative:
   - ✅ Panel
   - ✅ Config
5. Escolha **"Local Mode"** ou **"Online Mode"**:
   - **Local Mode**: Usa `http://localhost:8080`
   - **Online Mode**: Usa assets hospedados na Twitch

### Passo 5: Testar

1. No Developer Rig, clique em **"Start"**
2. Você verá 3 janelas:
   - **Panel View**: Visualização do painel (como viewer vê)
   - **Config View**: Página de configuração (streamer)
   - **Video Overlay**: Overlay (se tiver)

3. **No Config View**:
   - Digite seu Player ID do Tarkov
   - Complete o Turnstile
   - Clique em "Buscar Stats"
   - Clique em "Salvar Configuração"

4. **No Panel View**:
   - Veja se os stats aparecem automaticamente
   - Teste o botão "🔁 Atualizar"
   - Verifique se nível e ícone de prestígio aparecem corretamente

---

## 🌐 Método 2: Teste em Produção (Canal Real)

### Passo 1: Mover Extensão para "Hosted Test"

1. No [Developer Console](https://dev.twitch.tv/console/extensions)
2. Selecione sua extensão
3. Na aba **"Status"**, clique em **"Move to Hosted Test"**
4. Você precisará fazer upload dos assets (não pode usar localhost)

### Passo 2: Fazer Upload dos Assets

```powershell
# No diretório da extensão
Compress-Archive -Path *.html,*.json,styles,scripts,images -DestinationPath tarkov-extension.zip -Force
```

1. Vá para **"Files"** → **"Asset Hosting"**
2. Faça upload do `tarkov-extension.zip`
3. Aguarde processamento (5-15 minutos)
4. Anote a **Asset Version** gerada

### Passo 3: Configurar Versão de Teste

1. Em **"Versions"**, clique na versão ativa
2. Configure:
   - **Testing Base URI**: Deixe em branco (usará assets hospedados)
   - **Panel Viewer Path**: `panel.html`
   - **Config Path**: `config.html`
   - **Panel Height**: 535
3. Clique em **"Save"**

### Passo 4: Instalar no Seu Canal

1. Vá para **"Status"** → **"Invite Only"** ou **"Public Test"**
2. Para Invite Only:
   - Clique em **"Add User"**
   - Digite seu username da Twitch
   - Clique em **"Invite"**

3. **Instale a extensão no seu canal**:
   - Acesse: https://dashboard.twitch.tv/extensions
   - Procure sua extensão pelo nome
   - Clique em **"Install"**
   - Ative como **Panel** no slot desejado
   - Clique em **"Configure"** para abrir a página de configuração

### Passo 5: Configurar e Testar

1. **Na página de configuração**:
   - Digite seu Player ID
   - Complete o Turnstile
   - Busque e Salve

2. **Veja no seu canal**:
   - Acesse `twitch.tv/SEU_USERNAME`
   - Olhe no painel abaixo do player
   - Verifique se os stats aparecem

---

## 🔧 Método 3: Teste Rápido Local (Desenvolvimento)

Este é o método que você já está usando:

```powershell
# 1. Inicie o servidor (se não estiver rodando)
python -m http.server 8080

# 2. Abra em um navegador real (Chrome/Firefox/Edge)
# http://localhost:8080/config.html
# http://localhost:8080/panel.html
```

**Limitações**:
- ❌ Não simula ambiente Twitch real
- ❌ `window.Twitch.ext` não está disponível
- ✅ Usa localStorage para sincronização (implementamos isso)
- ✅ Bom para testar UI e lógica básica

---

## 🐛 Troubleshooting

### Problema: Turnstile não carrega

**Solução**:
- Turnstile só funciona em domínio real ou localhost
- No Developer Rig, use "Local Mode" com `http://localhost:8080`
- Certifique-se que o sitekey está correto no código

### Problema: Stats não aparecem no painel

**Checklist**:
1. ✅ Configuração foi salva? (veja console do navegador)
2. ✅ localStorage tem dados? (F12 → Application → Local Storage)
3. ✅ Erros no console? (F12 → Console)
4. ✅ Clique no botão "🔁 Atualizar" manualmente

### Problema: "Extension not authorized"

**Solução**:
- Verifique se a extensão está no estado correto (Testing/Hosted Test)
- No Developer Rig, certifique-se que selecionou a extensão correta
- Tente recarregar o Rig

### Problema: Player ID não encontrado

**Solução**:
- Certifique-se que o ID está correto (números apenas)
- Teste diretamente em: `https://tarkov.dev/players`
- Verifique se o perfil é público

### Problema: CORS errors

**Solução**:
- APIs externas (`player.tarkov.dev`, `api.tarkov.dev`) devem permitir CORS
- No Developer Rig, isso geralmente não é problema
- Em produção, Twitch faz proxy de algumas requisições

---

## 📊 Validação Final

Antes de publicar, teste:

- [ ] Config carrega corretamente
- [ ] Turnstile funciona
- [ ] Stats são buscados com sucesso
- [ ] Painel exibe todos os dados:
  - [ ] Nome do jogador
  - [ ] Nível (número)
  - [ ] Ícone de prestígio (sem texto)
  - [ ] Ícone de facção (BEAR/USEC)
  - [ ] 6 estatísticas principais (Raids, Kills, Deaths, Survived, K/D, S/R)
  - [ ] Conquistas (ícones pequenos)
- [ ] Botão "🔁 Atualizar" funciona
- [ ] Layout 320×535 não tem scroll/overflow
- [ ] Auto-refresh (5 min) funciona (opcional: aguarde)

---

## 🚢 Publicação (Quando pronto)

1. **No Developer Console**:
   - Vá para **"Status"**
   - Clique em **"Submit for Review"**
   - Aguarde aprovação da Twitch (7-14 dias)

2. **Requisitos para aprovação**:
   - Ícones em todos os tamanhos (24×24, 100×100, 300×200)
   - Screenshots da extensão funcionando
   - Descrição completa e precisa
   - Privacy Policy (se coletar dados)
   - Terms of Service
   - Todos os assets hospedados na Twitch (não localhost)

---

## 📚 Links Úteis

- **Twitch Developer Docs**: https://dev.twitch.tv/docs/extensions/
- **Developer Rig**: https://dev.twitch.tv/docs/extensions/rig/
- **Extension Console**: https://dev.twitch.tv/console/extensions
- **Tarkov.dev API**: https://tarkov.dev/api/
- **Cloudflare Turnstile Docs**: https://developers.cloudflare.com/turnstile/

---

## 💡 Dicas

1. **Use o Developer Rig** para testes iniciais - é muito mais rápido que fazer upload toda vez
2. **Console do navegador** (F12) é seu melhor amigo - veja logs e erros
3. **localStorage** permite testar sem Twitch config service
4. **Versões** - Twitch mantém histórico, você pode reverter se algo quebrar
5. **Cache** - Limpe cache do navegador (Ctrl+F5) se mudanças não aparecerem

---

**Status do Servidor Local**: ✅ Rodando em http://localhost:8080
**Próximo Passo Recomendado**: Instalar Twitch Developer Rig e testar em ambiente controlado

# 🚀 Checklist de Deploy - Tarkov Stats Extension

## ✅ Preparação (Completo)

- [x] Pacote ZIP criado: `tarkov-extension.zip` (59.7 KB)
- [x] Manifest.json atualizado (v2.1.0)
- [x] Ícones incluídos (24x24, 100x100, 300x200)
- [x] Servidor local testado

---

## 📋 Passo a Passo para Deploy

### 1️⃣ Criar/Acessar Extensão no Twitch Developer Console

**URL**: https://dev.twitch.tv/console/extensions

#### Se é sua primeira extensão:
1. Clique em **"Register Your Extension"**
2. Preencha:
   - **Name**: `Tarkov Stats`
   - **Extension Type**: `Panel`
   - **Author**: Seu nome
   - **Description**: `Display your Escape From Tarkov PMC stats with auto-refresh from tarkov.dev API`
   - **Support Email**: Seu email
3. Clique em **"Create"**
4. **Anote o Extension Client ID** (você vai precisar)

#### Se já tem a extensão criada:
1. Encontre "Tarkov Stats" na lista
2. Clique nela para abrir

---

### 2️⃣ Fazer Upload dos Assets

1. Na extensão, vá para aba **"Files"**
2. Clique em **"Asset Hosting"**
3. Clique em **"Upload Assets"**
4. Selecione o arquivo: `tarkov-extension.zip`
5. Aguarde upload (pode levar 1-5 minutos)
6. Quando terminar, você verá uma **"Asset Version"** (ex: 0.0.1, 0.0.2, etc.)
7. **Anote essa versão**

---

### 3️⃣ Configurar a Versão

1. Vá para aba **"Versions"**
2. Clique em **"Create Version"** ou edite a versão existente
3. Configure:

#### Basic Information:
- **Version**: 2.1.0
- **Version Name**: Production v2.1
- **Version Description**: PMC stats with prestige icons and achievements

#### Extension Views:
- **Panel Viewer Path**: `panel.html`
- **Panel Height**: `535`
- **Configuration Path**: `config.html`

#### Capabilities:
- ✅ **Can Link to External Content**: `Enabled`
- (Necessário para APIs: player.tarkov.dev, api.tarkov.dev, assets.tarkov.dev)

#### Allowlisted Domains (Adicione estes):
```
player.tarkov.dev
api.tarkov.dev
assets.tarkov.dev
challenges.cloudflare.com
tarkov.dev
```

4. Clique em **"Save Version"**

---

### 4️⃣ Mover para Hosted Test

1. Na aba **"Status"**
2. Clique em **"Move to Hosted Test"**
3. Confirme a ação
4. Aguarde processamento (1-2 minutos)

---

### 5️⃣ Instalar no Seu Canal

#### Opção A - Via Developer Console:
1. Na aba **"Status"**, na seção **"Test Accounts"**
2. Clique em **"Add Test Account"**
3. Digite seu username da Twitch
4. Clique em **"Add"**

#### Opção B - Via Twitch Dashboard (Mais fácil):
1. Acesse: https://dashboard.twitch.tv/extensions
2. No topo, clique em **"Discover"** ou busque por "Tarkov Stats"
3. Se não aparecer na busca, use o **Extension Client ID** na URL:
   ```
   https://dashboard.twitch.tv/extensions/[SEU-CLIENT-ID]
   ```
4. Clique em **"Install"**

---

### 6️⃣ Ativar e Configurar

1. Ainda em https://dashboard.twitch.tv/extensions
2. Vá para aba **"My Extensions"**
3. Encontre "Tarkov Stats"
4. Clique em **"Activate"**
5. Escolha slot: **Panel 1, 2 ou 3**
6. Clique em **"Save"**

7. **Configure seus stats**:
   - Clique em **"Configure"** (ao lado do nome da extensão)
   - OU acesse seu dashboard e clique no ícone de configuração da extensão
   - Digite seu Player ID do Tarkov
   - Complete o Turnstile
   - Clique em "Buscar Stats"
   - Clique em "Salvar Configuração"

---

### 7️⃣ Testar no Seu Canal

1. Abra seu canal: `https://twitch.tv/SEU_USERNAME`
2. Role para baixo até os painéis (abaixo do player)
3. Veja se "Tarkov Stats" aparece
4. Verifique:
   - ✅ Nome do jogador aparece
   - ✅ Nível numérico (sem texto)
   - ✅ Ícone de prestígio (se tiver)
   - ✅ Ícone de facção (BEAR/USEC)
   - ✅ 6 estatísticas principais
   - ✅ Conquistas (ícones pequenos)
   - ✅ Botão "🔁 Atualizar" funciona

---

## 🐛 Troubleshooting

### Problema: Extensão não aparece no canal
**Solução**:
- Certifique-se que ativou em um slot de Panel
- Recarregue a página (Ctrl+F5)
- Verifique se salvou as mudanças no dashboard
- Aguarde 1-2 minutos (pode ter cache)

### Problema: Turnstile não carrega
**Solução**:
- Certifique-se que `challenges.cloudflare.com` está nos allowlisted domains
- Verifique se "Can Link to External Content" está habilitado
- Limpe cache do navegador

### Problema: Stats não carregam
**Solução**:
- Abra o console do navegador (F12)
- Veja se há erros de CORS
- Certifique-se que todos os domínios estão allowlisted:
  - player.tarkov.dev
  - api.tarkov.dev
  - assets.tarkov.dev
- Verifique se o Player ID está correto

### Problema: "Extension not found"
**Solução**:
- Verifique se moveu para "Hosted Test"
- Adicione sua conta aos Test Accounts
- Aguarde alguns minutos para propagar

### Problema: Ícones não aparecem
**Solução**:
- Certifique-se que o ZIP incluiu a pasta `images/`
- Recarregue a versão com novo upload
- Verifique no console se há erros 404

---

## 📝 Notas Importantes

### Limitações do Hosted Test:
- ⚠️ Somente você e contas de teste podem ver
- ⚠️ Não aparece para viewers normais
- ⚠️ Não aparece em buscas públicas

### Para Disponibilizar Publicamente:
1. Teste completamente em Hosted Test
2. Prepare materiais adicionais:
   - Screenshots (mínimo 3)
   - Privacy Policy URL
   - Terms of Service URL (opcional)
3. Vá para **"Status"** → **"Submit for Review"**
4. Aguarde 7-14 dias para revisão da Twitch

---

## 🎯 URLs Rápidas

- **Developer Console**: https://dev.twitch.tv/console/extensions
- **Extensions Dashboard**: https://dashboard.twitch.tv/extensions
- **Seu Canal**: https://twitch.tv/SEU_USERNAME
- **Tarkov.dev API Docs**: https://tarkov.dev/api/

---

## ✨ Status Atual

- ✅ Código pronto
- ✅ Assets prontos
- ✅ ZIP criado
- ⏳ Aguardando upload
- ⏳ Aguardando instalação
- ⏳ Aguardando teste

**Próximo Passo**: Fazer upload do `tarkov-extension.zip` no Developer Console

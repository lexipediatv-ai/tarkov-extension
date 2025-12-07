# 🎮 Extensão Twitch - Guia de Teste Local

## ✅ Status Atual

- Servidor HTTPS rodando em `https://localhost:8080`
- Certificado instalado no Windows
- Arquivos criados e prontos

## 🔧 Passos para Fazer a Extensão Carregar na Twitch

### 1. Verifique o Servidor
O servidor deve estar rodando. No terminal você deve ver:
```
✅ Servidor HTTPS rodando em https://localhost:8080
```

### 2. Teste Diretamente no Chrome
Abra: `https://localhost:8080/panel.html`
- Deve carregar a página completa sem aviso de certificado
- Você deve ver emojis, botões, contador de cliques
- Se aparecer aviso de certificado, clique em "Avançado" → "Continuar"

### 3. Configure no Developer Console da Twitch

Acesse: https://dev.twitch.tv/console/extensions

**Na sua extensão "Tarkov Loadout Ext":**

a) Clique na aba **"Extension Version"** (barra lateral esquerda)

b) Clique na sub-aba **"Version Status"** (menu superior)

c) **IMPORTANTE**: Certifique-se que o status está em **"Local Test"** (primeira bolinha)
   - Se estiver em outro status, procure um botão "Move to Local Test" ou similar

d) Clique na aba **"Asset Hosting"** (menu superior)

e) Confirme que está configurado:
   - **Testing Base URI**: `https://localhost:8080/`
   - **Panel Viewer Path**: `panel.html`
   - Clique em **"Save Changes"**

### 4. Instale a Extensão no Seu Canal

a) Na página da extensão no Developer Console, procure por:
   - Botão **"View on Twitch and Install"** OU
   - Link para instalar a extensão

b) Isso vai abrir uma janela para instalar a extensão no seu canal

c) Ative a extensão em um **slot de painel**

### 5. Teste no Seu Canal

a) Acesse: `https://twitch.tv/SEU_USERNAME`

b) Role para baixo até a seção de painéis (abaixo do vídeo)

c) Você deve ver o painel "Tarkov Loadout Ext"

d) Pressione **Ctrl + Shift + R** para forçar reload sem cache

e) Abra o Console (F12) e procure por mensagens começando com:
   - "Panel script carregando..."
   - "Tentativa X de carregar..."
   - "✅ Twitch Extension Helper carregado!"

## 🐛 Troubleshooting

### O painel aparece mas está vazio/preto

1. Abra o Console do Chrome (F12)
2. Procure por erros em vermelho
3. Verifique se há erros de CORS ou Mixed Content
4. Confirme que o servidor está rodando

### "Extension Helper Not Loaded"

Isso é parcialmente normal em desenvolvimento local. A extensão deve funcionar mesmo assim em modo demo.

### O painel não aparece na lista

1. Verifique se está em "Local Test" no Developer Console
2. Reinstale a extensão no seu canal
3. Certifique-se de ativar em um slot de painel

### Servidor pára sozinho

Reinicie com: `node https-server.js`

## 📝 Comandos Úteis

### Reiniciar servidor
```powershell
node https-server.js
```

### Ver se está rodando
```powershell
curl https://localhost:8080/panel.html
```

### Parar servidor
Pressione **Ctrl + C** no terminal

## 🎯 Checklist Final

- [ ] Servidor HTTPS rodando
- [ ] `https://localhost:8080/panel.html` carrega no Chrome
- [ ] Developer Console configurado com https://localhost:8080/
- [ ] Status da extensão em "Local Test"
- [ ] Extensão instalada e ativada no canal
- [ ] Canal aberto e atualizado (Ctrl + Shift + R)
- [ ] Console do Chrome aberto (F12) para ver logs

## 🚀 Próximos Passos

Quando a extensão estiver funcionando localmente:
1. Customize o `panel.html` com seu conteúdo
2. Edite `styles/panel.css` para mudar o design
3. Modifique `scripts/panel.js` para adicionar funcionalidades
4. Teste `config.html` e `video_overlay.html`
5. Faça upload dos arquivos para Hosted Test quando estiver pronto

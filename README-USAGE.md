# 🚀 Tarkov Extension - Guia de Uso

## 📋 Scripts Disponíveis

### ✅ START-ALL.bat
**USE ESTE PARA INICIAR TUDO!**

Inicia automaticamente:
- Backend (porta 8080)
- Frontend (porta 8081)
- Abre o navegador automaticamente

**Como usar:**
1. Dê duplo clique em `START-ALL.bat`
2. Aguarde as janelas abrirem
3. O navegador abrirá automaticamente em http://localhost:8081/config.html

---

### 🔴 STOP-ALL.bat
**USE ESTE PARA PARAR TUDO!**

Para todos os servidores Node.js de uma vez.

**Como usar:**
1. Dê duplo clique em `STOP-ALL.bat`
2. Todos os processos serão encerrados

---

### 🔧 Scripts Individuais

#### START-BACKEND.bat
Inicia apenas o servidor backend na porta 8080.

#### START-FRONTEND.bat
Inicia apenas o servidor frontend na porta 8081 e abre o navegador.

---

## 🎯 Uso Rápido

1. **Primeira vez:**
   - Execute `START-ALL.bat`
   - Os servidores iniciarão automaticamente
   - O navegador abrirá em http://localhost:8081/config.html

2. **Testar:**
   - Digite um Player ID (ex: 10590762 ou 12220692)
   - Clique em "🚀 Fetch Stats"
   - Verifique se os dados aparecem corretamente

3. **Parar tudo:**
   - Execute `STOP-ALL.bat`
   - Ou feche as janelas manualmente

---

## 📊 Status dos Servidores

Quando estiver rodando corretamente:

- **Backend API**: http://localhost:8080/api/player/id/{PLAYER_ID}
- **Frontend Config**: http://localhost:8081/config.html
- **Frontend Panel**: http://localhost:8081/panel.html

---

## ⚠️ Problemas Comuns

### "Porta já em uso"
- Execute `STOP-ALL.bat` primeiro
- Aguarde 5 segundos
- Execute `START-ALL.bat` novamente

### "Frontend não abre"
- Verifique se o http-server está instalado: `npm install -g http-server`
- Execute `START-FRONTEND.bat` manualmente

### "Backend crashando"
- As janelas PowerShell separadas previnem crashes
- Se continuar caindo, verifique os logs na janela do backend

---

## 🔍 Teste de Exemplo

Player IDs para testar:
- **PokaronaTTV**: 10590762 (Level 25)
- **KarolMartynsTV**: 12220692 (Level 23)

---

## 📝 Notas Técnicas

- **Backend**: Node.js + Express + Axios + NodeCache (10-min TTL)
- **Frontend**: http-server com CORS habilitado
- **API Source**: https://players.tarkov.dev/profile/{id}.json
- **Caching**: Respostas cacheadas por 10 minutos

---

## 🎮 Para Desenvolvimento

Se precisar fazer alterações:

1. Pare os servidores: `STOP-ALL.bat`
2. Faça suas alterações nos arquivos
3. Reinicie: `START-ALL.bat`

Os servidores recarregarão automaticamente os arquivos atualizados.

---

**Criado por:** Lexipedia TV AI  
**Data:** Dezembro 2025  
**Versão:** 2.0 (Level calculation fixed)

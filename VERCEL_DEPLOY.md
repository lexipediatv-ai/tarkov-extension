# Vercel Deploy Guide - Tarkov Stats Extension

## 🚀 Deploy para Vercel (Gratuito com HTTPS!)

### Passo 1: Instalar dependências
```bash
npm install
```

### Passo 2: Instalar Vercel CLI (se não tiver)
```bash
npm install -g vercel
```

### Passo 3: Login no Vercel
```bash
vercel login
```

### Passo 4: Deploy!
```bash
vercel --prod
```

## 📝 O que acontece no deploy:

1. ✅ **Serverless Function criada** em `/api/player/[id]`
2. ✅ **HTTPS automático** (domínio `.vercel.app`)
3. ✅ **Cache configurado** (10 minutos)
4. ✅ **CORS habilitado** para Twitch

## 🌐 Sua URL será:
```
https://seu-projeto.vercel.app/api/player/id/10590762
```

## 🔧 Depois do deploy:

### Atualizar URLs no frontend:

**scripts/panel-v2.js** (linha ~93-117):
```javascript
// Trocar:
const backendUrl = `http://localhost:8080/api/player/id/${playerId}`;

// Por:
const backendUrl = `https://seu-projeto.vercel.app/api/player/id/${playerId}`;
```

**scripts/config-v2.js** (linha ~175):
```javascript
// Trocar:
const backendUrl = `http://localhost:8080/api/player/id/${playerId}`;

// Por:
const backendUrl = `https://seu-projeto.vercel.app/api/player/id/${playerId}`;
```

## 🧪 Testar depois do deploy:

1. Abrir: `https://seu-projeto.vercel.app/api/player/id/10590762`
2. Deve retornar JSON com stats do jogador
3. Verificar `cached: false` na primeira chamada
4. Verificar `cached: true` nas próximas (10 min)

## 📊 Limites do plano gratuito:

- ✅ 100GB banda/mês
- ✅ Serverless Functions ilimitadas
- ✅ 10s timeout por função
- ✅ 1GB memória por função
- ✅ HTTPS gratuito

## 🔄 Atualizações futuras:

Qualquer commit no GitHub dispara deploy automático!

```bash
git add .
git commit -m "Update stats logic"
git push
# Vercel deploya automaticamente! 🎉
```

## 🐛 Troubleshooting:

**Erro "axios not found"**:
```bash
npm install
vercel --prod
```

**CORS error**:
- Já configurado no `vercel.json`
- Headers automáticos para todas rotas `/api/*`

**Cache não funciona**:
- Normal! In-memory cache só dura enquanto função está "quente"
- Vercel pode "congelar" funções inativas
- Cache funciona para requests consecutivos (30s-5min)

## 📱 Integração com Twitch:

1. Copie sua URL Vercel
2. Vá em Twitch Developer Console
3. Cole em "Whitelisted Domains"
4. Upload dos arquivos HTML/CSS/JS
5. Submeta para review! ✨

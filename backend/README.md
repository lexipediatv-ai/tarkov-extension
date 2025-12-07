# 🎮 Tarkov Stats Backend API

Backend para fazer web scraping dos stats de players do tarkov.dev e fornecer via API REST.

## 🚀 Instalação

```bash
cd backend
npm install
```

## ▶️ Executar

```bash
# Desenvolvimento (com auto-reload)
npm run dev

# Produção
npm start
```

Servidor rodará em: `http://localhost:3000`

## 📡 Endpoints da API

### 1. Health Check
```bash
GET /
```

Resposta:
```json
{
  "status": "online",
  "message": "Tarkov Stats API",
  "version": "1.0.0"
}
```

### 2. Buscar Stats de Player
```bash
GET /api/player/:nickname/:id
```

Exemplo:
```bash
curl http://localhost:3000/api/player/regular/10590762
```

Resposta:
```json
{
  "success": true,
  "cached": false,
  "data": {
    "nickname": "Regular",
    "id": "10590762",
    "profileUrl": "https://tarkov.dev/players/regular/10590762",
    "stats": {
      "raids": 645,
      "kills": 3535,
      "deaths": 275,
      "survived": 353,
      "kd": 12.86,
      "sr": 54.71,
      "traumatic": 57,
      "level": 42,
      "faction": "USEC"
    },
    "lastUpdated": "2025-12-06T..."
  }
}
```

### 3. Buscar Player (sem ID)
```bash
GET /api/search/:nickname
```

### 4. Limpar Cache
```bash
POST /api/cache/clear
Content-Type: application/json

{
  "nickname": "regular",
  "id": "10590762"
}
```

### 5. Stats do Cache
```bash
GET /api/cache/stats
```

## 🔧 Configuração

Edite o arquivo `.env`:

```env
PORT=3000
CACHE_TTL=600  # 10 minutos
```

## 📦 Cache

- Cache automático de **10 minutos** por player
- Reduz carga no tarkov.dev
- Respostas mais rápidas

## 🌐 Deploy em Produção

### Opção 1: Heroku

1. Criar app no Heroku
2. Push o código:
```bash
git init
git add .
git commit -m "Initial commit"
heroku git:remote -a seu-app
git push heroku main
```

### Opção 2: Railway.app

1. Conectar repositório GitHub
2. Deploy automático

### Opção 3: Seu VPS/Servidor

```bash
# Com PM2
npm install -g pm2
pm2 start server.js --name tarkov-api
pm2 save
pm2 startup
```

## 🔒 CORS

CORS está habilitado para todas as origens. Em produção, configure para aceitar apenas:
```javascript
app.use(cors({
  origin: ['https://seu-dominio.com', 'https://*.ext-twitch.tv']
}));
```

## 📝 Notas

- O scraping pode quebrar se o tarkov.dev mudar o layout
- Use cache para evitar rate limiting
- Teste os seletores CSS regularmente

## 🐛 Debug

Logs aparecem no console:
```
✅ Cache hit for regular
🔄 Fetching data for regular (10590762)
✅ Stats fetched successfully for regular
```

## 🔗 Integração com Extension

No `panel.js`:
```javascript
const API_URL = 'http://localhost:3000'; // ou seu domínio

async function fetchTarkovData(nickname, id) {
  const response = await fetch(`${API_URL}/api/player/${nickname}/${id}`);
  const data = await response.json();
  
  if (data.success) {
    playerData.stats = data.data.stats;
    updateLoadout();
  }
}
```

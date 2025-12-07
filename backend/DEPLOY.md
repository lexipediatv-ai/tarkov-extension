# 🚀 Guia Completo - Deploy do Backend

## 📋 Índice
1. [Instalação Local](#instalação-local)
2. [Deploy em Produção](#deploy-em-produção)
3. [Configuração da Extension](#configuração-da-extension)
4. [Troubleshooting](#troubleshooting)

---

## 🏠 Instalação Local

### Passo 1: Instalar Dependências

```bash
cd backend
npm install
```

### Passo 2: Configurar Environment

Edite `.env`:
```env
PORT=3000
CACHE_TTL=600
```

### Passo 3: Iniciar Servidor

```bash
# Desenvolvimento (auto-reload)
npm run dev

# Produção
npm start
```

Servidor estará em: `http://localhost:3000`

### Passo 4: Testar

```bash
# Health check
curl http://localhost:3000

# Testar scraper
curl http://localhost:3000/api/test

# Buscar player
curl http://localhost:3000/api/player/regular/10590762
```

---

## 🌐 Deploy em Produção

### Opção 1: Heroku (Grátis)

1. **Criar conta:** https://heroku.com
2. **Instalar Heroku CLI:**
   ```bash
   # Windows
   choco install heroku-cli
   
   # Ou download: https://devcenter.heroku.com/articles/heroku-cli
   ```

3. **Deploy:**
   ```bash
   cd backend
   
   # Login
   heroku login
   
   # Criar app
   heroku create tarkov-stats-api
   
   # Deploy
   git init
   git add .
   git commit -m "Initial deploy"
   heroku git:remote -a tarkov-stats-api
   git push heroku main
   
   # Ver logs
   heroku logs --tail
   ```

4. **Sua API estará em:** `https://tarkov-stats-api.herokuapp.com`

### Opção 2: Railway.app (Recomendado)

1. **Criar conta:** https://railway.app
2. **Novo Projeto → Deploy from GitHub**
3. **Conectar repositório**
4. **Configurar variáveis:**
   - `PORT`: 3000
   - `CACHE_TTL`: 600
5. **Deploy automático!**

Sua API: `https://tarkov-stats-api.up.railway.app`

### Opção 3: Render.com (Grátis)

1. **Criar conta:** https://render.com
2. **New Web Service**
3. **Conectar GitHub repo**
4. **Configurar:**
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment: `PORT=3000`
5. **Create Web Service**

### Opção 4: Seu VPS/Servidor

```bash
# SSH no servidor
ssh user@seu-servidor.com

# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clonar código
git clone seu-repo.git
cd backend
npm install

# Instalar PM2
sudo npm install -g pm2

# Iniciar servidor
pm2 start server.js --name tarkov-api

# Auto-restart no boot
pm2 save
pm2 startup

# Configurar Nginx (opcional)
sudo apt install nginx
sudo nano /etc/nginx/sites-available/tarkov-api

# Adicionar:
server {
    listen 80;
    server_name api.seudominio.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Ativar site
sudo ln -s /etc/nginx/sites-available/tarkov-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🔧 Configuração da Extension

### Atualizar URL da API

Edite `panel.js`:

```javascript
// Local (desenvolvimento)
const API_URL = 'http://localhost:3000';

// Produção (após deploy)
const API_URL = 'https://seu-dominio.herokuapp.com';
```

### Ativar Backend

No `panel.js`, linha ~90:

```javascript
const hasBackend = true; // Mude para true
```

### CORS em Produção

No `server.js`, configure CORS:

```javascript
app.use(cors({
  origin: [
    'https://seu-dominio.com',
    'https://*.ext-twitch.tv',
    'http://localhost:*'
  ]
}));
```

---

## 📦 Criar ZIP para Upload

Depois de configurar a URL da API:

```bash
cd D:\xampp2\htdocs\twitch-extension
Compress-Archive -Path panel.html,config.html,video_overlay.html,scripts,styles,images -DestinationPath "C:\Users\Administrator\Desktop\tarkov-extension-prod.zip" -Force
```

---

## 🐛 Troubleshooting

### Backend não inicia

```bash
# Verificar Node.js
node --version  # Deve ser >= 16

# Verificar dependências
npm install

# Ver erros
npm start
```

### Scraper não funciona

```bash
# Testar endpoint
curl http://localhost:3000/api/test

# Ver logs
npm start  # e observe o console
```

### Extension não conecta

1. **Verificar URL da API** no `panel.js`
2. **Verificar CORS** - console do browser mostra erros
3. **Testar API diretamente:**
   ```bash
   curl https://sua-api.com/api/player/regular/10590762
   ```

### Stats não aparecem

1. **Abrir console do browser** (F12)
2. **Ver erros de rede** na aba Network
3. **Verificar response da API**
4. **Testar com nickname/ID válidos**

---

## 📊 Monitoramento

### Ver stats do cache

```bash
curl http://sua-api.com/api/cache/stats
```

### Limpar cache

```bash
curl -X POST http://sua-api.com/api/cache/clear \
  -H "Content-Type: application/json" \
  -d '{"nickname": "regular", "id": "10590762"}'
```

### Logs em Produção

**Heroku:**
```bash
heroku logs --tail -a tarkov-stats-api
```

**Railway:**
Ver logs no dashboard

**VPS com PM2:**
```bash
pm2 logs tarkov-api
pm2 monit
```

---

## 🔒 Segurança

### Rate Limiting (opcional)

```bash
npm install express-rate-limit
```

Em `server.js`:
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 30 // 30 requests por minuto
});

app.use('/api/', limiter);
```

### API Key (opcional)

Para produção, adicione autenticação:

```javascript
app.use('/api/', (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});
```

---

## ✅ Checklist de Deploy

- [ ] Backend instalado e testado localmente
- [ ] Deploy feito em plataforma escolhida
- [ ] URL da API atualizada no `panel.js`
- [ ] `hasBackend = true` no código
- [ ] CORS configurado corretamente
- [ ] Testado endpoint `/api/test`
- [ ] Testado com player real
- [ ] ZIP criado e testado
- [ ] Upload na Twitch feito
- [ ] Extensão funcionando no canal

---

## 🆘 Suporte

Se precisar de ajuda:
1. Verificar logs do servidor
2. Testar API diretamente com curl/Postman
3. Ver console do browser para erros de CORS
4. Confirmar que nickname/ID estão corretos

---

**Última atualização:** 06/12/2025

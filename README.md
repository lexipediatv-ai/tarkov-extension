# Tarkov Stats Twitch Extension# 🎮 Tarkov Stats - Extensão para Twitch



Extensão para Twitch que exibe estatísticas do Escape from Tarkov.Extensão para exibir suas estatísticas de Escape From Tarkov no painel da Twitch, com visual estilo militar e **busca automática de stats**.



## Estrutura![Version](https://img.shields.io/badge/version-1.2.0-blue)

![Status](https://img.shields.io/badge/status-production-green)

```![Twitch](https://img.shields.io/badge/platform-Twitch-purple)

twitch-extension/

├── backend/              # Backend scraper## 🆕 Novidades v1.2

│   ├── server.js        # API server (porta 3000)

│   └── scraper-manual-captcha.js✨ **Auto-fetch de Stats** - Sistema inteligente que tenta buscar suas stats automaticamente

├── config.html          # Página de configuração📝 **Player ID Integration** - Use nickname + Player ID para acesso direto ao perfil

├── panel.html           # Painel principal🔄 **Fallback Manual** - Se auto-fetch falhar, sistema permite entrada manual

├── scripts/🎯 **URL Direta** - Abre `tarkov.dev/players/{nickname}/{id}` diretamente

│   ├── config-v2.js     # Lógica da config

│   └── panel-v2.js      # Lógica do painel## 📋 Estrutura do Projeto```

└── styles/              # CSS files

```twitch-extension/



## Como usar## ✅ O Que Está Pronto├── manifest.json           # Configuração principal da extensão



1. **Iniciar Backend:**├── panel.html             # Painel para visualizadores

```powershell

cd backend### Funcional e Testado├── config.html            # Página de configuração para streamers

npm start

```- ✅ Painel de visualização para espectadores├── video_overlay.html     # Overlay exibido no vídeo



2. **Configurar Player ID:**- ✅ Interface de configuração para streamer├── styles/                # Arquivos CSS

   - Abrir `config.html`

   - Inserir Player ID do tarkov.dev- ✅ Sistema de stats manuais (8 campos)│   ├── panel.css

   - Resolver CAPTCHA quando aparecer

   - Salvar configuração- ✅ Design tema Tarkov (tan/dourado/militar)│   ├── config.css



3. **Ver Painel:**- ✅ Salvamento automático no Twitch│   └── video_overlay.css

   - Abrir `panel.html`

   - Stats aparecem automaticamente- ✅ Link para perfil tarkov.dev├── scripts/               # Arquivos JavaScript


- ✅ Layout responsivo│   ├── panel.js

- ✅ Documentação completa│   ├── config.js

│   └── video_overlay.js

## 📦 Arquivos Importantes└── images/                # Ícones da extensão

    ├── icon-24.png

### Para Upload na Twitch    ├── icon-100.png

```    └── icon-300.png

📄 tarkov-stats-production-v1.0.zip  ← USE ESTE ARQUIVO!```

```

## 🚀 Funcionalidades

### Para Desenvolvimento

```### Painel (Panel)

📁 twitch-extension/- Interface interativa para visualizadores

├── 📄 manifest.json           # Metadata da extensão- Exibição de informações do usuário

├── 📄 panel.html              # Painel dos viewers- Botão de ação com feedback visual

├── 📄 config.html             # Configuração do streamer- Tema personalizável

├── 📁 styles/                 # CSS da extensão

│   ├── panel.css### Configuração (Config)

│   └── config.css- Página de configuração para streamers

├── 📁 scripts/                # JavaScript- Mensagem de boas-vindas personalizável

│   ├── panel.js- Toggle para habilitar/desabilitar recursos

│   └── config.js- Seleção de tema de cores (Roxo, Azul, Verde)

├── 📁 images/                 # Ícones

│   └── icon.png (1024x1024)### Overlay de Vídeo (Video Overlay)

└── 📁 backend/                # ⚠️ Não necessário!- Overlay exibido sobre o vídeo

    └── README-LIMITATIONS.md- Animação de entrada suave

```- Auto-ocultar após 10 segundos

- Sincronização com configurações do streamer

### Documentação

- `PROJETO-FINAL.md` - 📚 Guia completo do projeto## 🛠️ Configuração e Desenvolvimento

- `backend/README-LIMITATIONS.md` - 🔍 Por que não fizemos scraping automático

### Pré-requisitos

## 🚀 Como Publicar na Twitch- Conta de desenvolvedor na Twitch

- [Twitch Developer Rig](https://dev.twitch.tv/docs/extensions/rig/) instalado

### 1. Acesse o Developer Console

🔗 https://dev.twitch.tv/console/extensions### Passos para Configuração



### 2. Crie Nova Extensão1. **Criar a Extensão no Twitch**

- Clique em **"Create Extension"**   - Acesse o [Twitch Developer Console](https://dev.twitch.tv/console)

- Nome: `Tarkov Stats`   - Clique em "Extensions" → "Create Extension"

- Tipo: `Panel`   - Preencha as informações básicas



### 3. Configure a Extensão2. **Configurar o manifest.json**

   ```json

**Aba "Extension Configuration"**:   {

```yaml     "id": "seu-extension-id-aqui",

Name: Tarkov Stats     "name": "Nome da Sua Extensão",

Summary: Exibe suas estatísticas de Escape From Tarkov     "author": "Seu Nome",

Description: |     "support_email": "seu-email@example.com"

  Mostra suas stats de PMC (Raids, K/D, S/R, Traumatic, etc)    }

  em tempo real com design militar estilo Tarkov.   ```

  

  Features:3. **Substituir os Ícones**

  - 8 stats principais (Raids, Kills, Deaths, K/D, S/R, etc)   - Crie ícones PNG nas seguintes dimensões:

  - Link direto para perfil tarkov.dev     - 24x24 pixels

  - Design tema militar Tarkov     - 100x100 pixels

  - Atualização manual pelo streamer     - 300x200 pixels

```   - Substitua os arquivos na pasta `images/`



**Aba "Assets"**:4. **Testar Localmente**

- 📤 Upload `tarkov-stats-production-v1.0.zip`   - Abra o Twitch Developer Rig

- 🖼️ Icon: Use `images/icon.png` (1024x1024)   - Crie um novo projeto e aponte para esta pasta

   - Configure o ambiente de teste

**Aba "Capabilities"**:   - Teste todas as views (Panel, Config, Video Overlay)

- ✅ Panel (300px height)

- ✅ Config (broadcaster configuration)5. **Fazer Upload**

- ❌ Video Overlay (opcional - não usado)   - No Developer Console, vá para sua extensão

   - Clique em "Files" → "Upload Assets"

### 4. Submit para Revisão   - Faça upload de todos os arquivos

- Preencha todos os campos obrigatórios   - Configure as Asset URLs no manifest

- ⏱️ Aguarde aprovação da Twitch (1-5 dias úteis)

## 📝 Personalização

## 📝 Como Usar (Para Streamers)

### Cores

### Primeira ConfiguraçãoEdite as variáveis CSS em cada arquivo de estilo:

```css

1. **Instale a extensão** no seu canal Twitch:root {

2. **Acesse tarkov.dev/players** e busque seu perfil    --primary-color: #9146FF;

   ```    --secondary-color: #772CE8;

   Exemplo: https://tarkov.dev/players/regular/10590762    --background-color: #18181B;

   ```    /* ... outras cores */

3. **Abra a configuração** da extensão no Twitch Dashboard}

4. **Preencha os campos**:```



| Campo | Descrição | Exemplo |### Funcionalidades

|-------|-----------|---------|- **panel.js**: Adicione lógica para o painel

| Nickname | Seu nome no Tarkov | `regular` |- **config.js**: Customize opções de configuração

| Player ID | ID do perfil (opcional) | `10590762` |- **video_overlay.js**: Modifique comportamento do overlay

| Raids | Número total de raids | `645` |

| Kills | Total de abates | `3535` |## 🔒 Autenticação e Segurança

| Deaths | Total de mortes | `275` |

| Survived | Raids sobrevividas | `353` |A extensão usa o Twitch Extension Helper para autenticação:

| K/D | Taxa kills/deaths | `12.86` |```javascript

| S/R | Taxa de sobrevivência % | `54.71` |twitch.onAuthorized(function(auth) {

| Traumatic | Eventos traumáticos | `57` |    // Acesse auth.token, auth.userId, auth.channelId

| Level | Seu nível PMC | `42` |});

```

5. **Teste** o link do perfil clicando no botão **"Test Profile"**

6. **Salve** a configuração## 📦 Publicação



### Atualizar Stats1. **Teste Completo**: Teste todas as funcionalidades

2. **Asset Hosting**: Faça upload dos arquivos para o Twitch

Quando quiser atualizar suas estatísticas:3. **Revisão**: Envie para revisão da Twitch

4. **Aprovação**: Aguarde aprovação (pode levar alguns dias)

1. 🎮 Jogue Tarkov5. **Release**: Publique após aprovação

2. 🌐 Acesse novamente tarkov.dev/players

3. 📋 Copie os novos números## 🔗 Recursos Úteis

4. ⚙️ Cole na configuração da extensão

5. 💾 Salve- [Documentação Oficial da Twitch](https://dev.twitch.tv/docs/extensions)

- [Extension Helper Library](https://dev.twitch.tv/docs/extensions/reference#helper-extensions)

**⏰ Recomendação**: Atualize após cada sessão de jogo ou semanalmente.- [Developer Rig GitHub](https://github.com/twitchdev/developer-rig)

- [Extension Guidelines](https://dev.twitch.tv/docs/extensions/guidelines-and-policies)

## 👀 Como Funciona (Para Viewers)

## 📄 Licença

1. Viewer entra na sua live

2. Clica no painel **"Tarkov Stats"** na sidebarEste projeto é um template de exemplo. Customize e use conforme necessário.

3. Vê suas stats formatadas:

   - **PMC Stats**: Raids, Kills, K/D, S/R, Traumatic## 🤝 Contribuição

   - **Combat Stats**: Deaths, Survived

   - 🔗 Link para perfil completoSinta-se à vontade para modificar e melhorar este template conforme suas necessidades!

4. 🎨 Design militar estilo Tarkov!

## 📧 Suporte

## 🎨 Personalização

Para dúvidas sobre desenvolvimento de extensões Twitch:

### Cores Atuais (Tema Tarkov)- [Twitch Developer Forums](https://discuss.dev.twitch.tv/)

```css- [Discord da Twitch Dev](https://discord.gg/twitchdev)

--bg-color: #0f0f0f;       /* Preto profundo */

--text-color: #c7c5b3;     /* Bege claro */---

--accent-color: #9a8866;   /* Tan militar */

--gold-color: #d4af37;     /* Dourado */**Nota**: Lembre-se de substituir todos os placeholders (ícones, IDs, emails) com seus dados reais antes de publicar!

```

### Para Modificar Cores
Edite `styles/panel.css`:
```css
:root {
    --bg-color: #0f0f0f;
    --text-color: #c7c5b3;
    --accent-color: #9a8866;
    --gold-color: #d4af37;
}
```

## 🔧 Desenvolvimento Local

### Requisitos
- ✅ Navegador moderno (Chrome/Firefox/Edge)
- ✅ Twitch Developer Account
- ✅ Live Server (VS Code extension recomendado)

### Testar Localmente

1. Abra `panel.html` no navegador
2. Abra DevTools Console (F12)
3. Simule dados de teste no `scripts/panel.js`:
```javascript
const mockData = {
    'player-nickname': 'TestPlayer',
    'player-id': '12345',
    'stats-raids': '100',
    'stats-kills': '500',
    'stats-deaths': '50',
    'stats-survived': '70',
    'stats-kd': '10.00',
    'stats-sr': '70.00',
    'stats-traumatic': '5',
    'stats-level': '25'
};
```

### Testar no Twitch

Use o **Twitch Extension Developer Rig**:
```bash
# Clone o rig
git clone https://github.com/twitchdev/developer-rig

# Instale e execute
cd developer-rig
npm install
npm start
```

## ⚠️ Sobre o Backend

Você verá uma pasta `backend/` no projeto. **Ela NÃO é necessária** para usar a extensão!

### 🤔 Por Que Existe?
Tentamos implementar scraping automático do tarkov.dev, mas:
- ❌ **Cloudflare CAPTCHA** bloqueia automação
- ❌ **Perfis não-públicos** requerem busca manual
- ❌ **Sistema complexo** de validação

### ✅ Por Que Stats Manuais São Melhores?
- ✅ **Mais confiável** - 100% funcional
- ✅ **Mais rápido** - Sem delays de scraping
- ✅ **Mais simples** - Você controla quando atualizar
- ✅ **Dentro do ToS** - Não viola regras de nenhum serviço
- ✅ **Sem dependências** - Funciona sempre

**📖 Leia**: `backend/README-LIMITATIONS.md` para detalhes técnicos completos.

## 🐛 Troubleshooting

### Stats não aparecem?
1. ✓ Verifique se salvou a configuração
2. ✓ Recarregue o painel do viewer (F5)
3. ✓ Verifique console do navegador (F12)
4. ✓ Confirme que preencheu pelo menos o nickname

### Link do perfil quebrado?
1. ✓ Confirme que nickname está correto (sem espaços)
2. ✓ Player ID é opcional, mas ajuda na precisão
3. ✓ Teste o link clicando em **"Test Profile"**

### Configuração não salva?
1. ✓ Preencha pelo menos o campo nickname (obrigatório)
2. ✓ Verifique se tem permissão de broadcaster
3. ✓ Tente deslogar e logar novamente no Twitch
4. ✓ Limpe cache do navegador (Ctrl+Shift+Del)

## 💡 Dicas

### Para Streamers
- 📅 Atualize stats antes de ir ao ar
- 💬 Mencione a extensão no chat
- 🎯 Use como conversa com viewers ("Veja minhas stats no painel!")
- 📊 Compare stats antes/depois do wipe

### Para Desenvolvimento
- 📝 Use Git para versionamento
- 💾 Faça backup antes de modificar
- 🌐 Teste em múltiplos navegadores
- 📚 Documente mudanças importantes

## 📊 Stats Explicados

| Stat | Descrição | Como Calcular |
|------|-----------|---------------|
| **Raids** | Total de raids jogadas | Direto do tarkov.dev |
| **Kills** | Total de PMCs/Scavs eliminados | Soma de todas kills |
| **Deaths** | Quantas vezes morreu | Total de mortes |
| **Survived** | Raids com extração bem-sucedida | Raids - Deaths |
| **K/D** | Taxa de kills por morte | Kills ÷ Deaths |
| **S/R** | % de raids sobrevividas | (Survived ÷ Raids) × 100 |
| **Traumatic** | Eventos traumáticos sofridos | Direto do tarkov.dev |
| **Level** | Nível atual do PMC | Seu nível de personagem |

## 🤝 Contribuir

Quer melhorar a extensão?

1. 🍴 Fork o repositório
2. 🌿 Crie uma branch: `git checkout -b minha-feature`
3. ✏️ Faça suas mudanças
4. 💬 Commit: `git commit -m 'Add: minha feature'`
5. 🚀 Push: `git push origin minha-feature`
6. 📬 Abra Pull Request

### Ideias Para Contribuir
- [ ] Gráficos de progressão temporal
- [ ] Comparação com média de players
- [ ] Temas customizáveis (claro/escuro)
- [ ] Suporte a múltiplos idiomas
- [ ] Integração com Twitch Predictions
- [ ] Animações CSS avançadas

## 📄 Licença

MIT License - Use livremente!

```
Copyright (c) 2024 Tarkov Stats Extension

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction.
```

## 🎯 Próximos Passos

- [ ] 1. Upload no Twitch Developer Console
- [ ] 2. Submit para revisão
- [ ] 3. Aguardar aprovação (1-5 dias)
- [ ] 4. Ativar no seu canal
- [ ] 5. Configurar suas stats
- [ ] 6. Anunciar para seus viewers!

## 🆘 Precisa de Ajuda?

- 📖 **Documentação Completa**: Leia `PROJETO-FINAL.md`
- 🔍 **Sobre Scraping**: Confira `backend/README-LIMITATIONS.md`
- 💬 **Issues**: Abra uma Issue no GitHub
- 📧 **Contato**: [Seu email aqui]
- 💭 **Discord**: [Seu servidor aqui]

## 🙏 Agradecimentos

- **Twitch** - Pela plataforma e APIs incríveis
- **tarkov.dev** - Pelos dados de referência
- **Battlestate Games** - Por Escape From Tarkov
- **Comunidade Tarkov** - Pelo feedback e suporte

---

<div align="center">

**Versão**: 1.0.0  
**Última Atualização**: Dezembro 2024  
**Status**: ✅ Pronto para Produção

Boa sorte com sua extensão! 🚀🎮

[⬆ Voltar ao topo](#-tarkov-stats---extensão-para-twitch)

</div>

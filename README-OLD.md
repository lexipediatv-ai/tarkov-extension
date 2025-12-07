# Extensão para Twitch

Uma extensão completa para Twitch com painel, página de configuração e overlay de vídeo.

## 📋 Estrutura do Projeto

```
twitch-extension/
├── manifest.json           # Configuração principal da extensão
├── panel.html             # Painel para visualizadores
├── config.html            # Página de configuração para streamers
├── video_overlay.html     # Overlay exibido no vídeo
├── styles/                # Arquivos CSS
│   ├── panel.css
│   ├── config.css
│   └── video_overlay.css
├── scripts/               # Arquivos JavaScript
│   ├── panel.js
│   ├── config.js
│   └── video_overlay.js
└── images/                # Ícones da extensão
    ├── icon-24.png
    ├── icon-100.png
    └── icon-300.png
```

## 🚀 Funcionalidades

### Painel (Panel)
- Interface interativa para visualizadores
- Exibição de informações do usuário
- Botão de ação com feedback visual
- Tema personalizável

### Configuração (Config)
- Página de configuração para streamers
- Mensagem de boas-vindas personalizável
- Toggle para habilitar/desabilitar recursos
- Seleção de tema de cores (Roxo, Azul, Verde)

### Overlay de Vídeo (Video Overlay)
- Overlay exibido sobre o vídeo
- Animação de entrada suave
- Auto-ocultar após 10 segundos
- Sincronização com configurações do streamer

## 🛠️ Configuração e Desenvolvimento

### Pré-requisitos
- Conta de desenvolvedor na Twitch
- [Twitch Developer Rig](https://dev.twitch.tv/docs/extensions/rig/) instalado

### Passos para Configuração

1. **Criar a Extensão no Twitch**
   - Acesse o [Twitch Developer Console](https://dev.twitch.tv/console)
   - Clique em "Extensions" → "Create Extension"
   - Preencha as informações básicas

2. **Configurar o manifest.json**
   ```json
   {
     "id": "seu-extension-id-aqui",
     "name": "Nome da Sua Extensão",
     "author": "Seu Nome",
     "support_email": "seu-email@example.com"
   }
   ```

3. **Substituir os Ícones**
   - Crie ícones PNG nas seguintes dimensões:
     - 24x24 pixels
     - 100x100 pixels
     - 300x200 pixels
   - Substitua os arquivos na pasta `images/`

4. **Testar Localmente**
   - Abra o Twitch Developer Rig
   - Crie um novo projeto e aponte para esta pasta
   - Configure o ambiente de teste
   - Teste todas as views (Panel, Config, Video Overlay)

5. **Fazer Upload**
   - No Developer Console, vá para sua extensão
   - Clique em "Files" → "Upload Assets"
   - Faça upload de todos os arquivos
   - Configure as Asset URLs no manifest

## 📝 Personalização

### Cores
Edite as variáveis CSS em cada arquivo de estilo:
```css
:root {
    --primary-color: #9146FF;
    --secondary-color: #772CE8;
    --background-color: #18181B;
    /* ... outras cores */
}
```

### Funcionalidades
- **panel.js**: Adicione lógica para o painel
- **config.js**: Customize opções de configuração
- **video_overlay.js**: Modifique comportamento do overlay

## 🔒 Autenticação e Segurança

A extensão usa o Twitch Extension Helper para autenticação:
```javascript
twitch.onAuthorized(function(auth) {
    // Acesse auth.token, auth.userId, auth.channelId
});
```

## 📦 Publicação

1. **Teste Completo**: Teste todas as funcionalidades
2. **Asset Hosting**: Faça upload dos arquivos para o Twitch
3. **Revisão**: Envie para revisão da Twitch
4. **Aprovação**: Aguarde aprovação (pode levar alguns dias)
5. **Release**: Publique após aprovação

## 🔗 Recursos Úteis

- [Documentação Oficial da Twitch](https://dev.twitch.tv/docs/extensions)
- [Extension Helper Library](https://dev.twitch.tv/docs/extensions/reference#helper-extensions)
- [Developer Rig GitHub](https://github.com/twitchdev/developer-rig)
- [Extension Guidelines](https://dev.twitch.tv/docs/extensions/guidelines-and-policies)

## 📄 Licença

Este projeto é um template de exemplo. Customize e use conforme necessário.

## 🤝 Contribuição

Sinta-se à vontade para modificar e melhorar este template conforme suas necessidades!

## 📧 Suporte

Para dúvidas sobre desenvolvimento de extensões Twitch:
- [Twitch Developer Forums](https://discuss.dev.twitch.tv/)
- [Discord da Twitch Dev](https://discord.gg/twitchdev)

---

**Nota**: Lembre-se de substituir todos os placeholders (ícones, IDs, emails) com seus dados reais antes de publicar!

# ⚔️ Tarkov Loadout Extension - Guia de Configuração

## 📋 Como Configurar a Extensão

### 1️⃣ Primeira Instalação

Quando você adicionar a extensão ao seu canal, será solicitado:

**Player ID (Obrigatório)**
- Seu identificador único do Escape From Tarkov
- Exemplo: `5f8b3c4e2d9a1b3c4d5e6f7a`
- Este ID é usado para buscar seus dados do tarkov.dev

### 2️⃣ Obtendo seu Player ID

1. Acesse [tarkov.dev](https://tarkov.dev)
2. Faça login com sua conta do Tarkov
3. Acesse seu perfil
4. Copie seu Player ID único
5. Cole na configuração da extensão

### 3️⃣ Configurações Disponíveis

**👤 Nome de Exibição** (Opcional)
- Nome que aparecerá na extensão
- Se não preenchido, usa o nome do seu perfil Tarkov

**🎯 Facção**
- USEC
- BEAR
- SCAV

**🔄 Atualização Automática**
- Atualiza seu loadout a cada 5 minutos
- Mantém os dados sempre sincronizados

**📊 Mostrar Estatísticas**
- Exibe taxa de sobrevivência
- Mostra K/D ratio
- Valor total do loadout

### 4️⃣ Testando a Configuração

1. Insira seu Player ID
2. Clique em **🔍 Testar Conexão**
3. Aguarde a validação
4. Se aparecer ✅, clique em **💾 Salvar Configurações**

## 🎮 O Que Será Exibido

### Panel (Abaixo do Chat)
- **Cabeçalho:** Nome, nível e facção do jogador
- **Loadout Atual:** Arma primária com mods e valor
- **Equipamentos:** Armadura, capacete, mochila, medkit
- **Estatísticas:** Taxa de sobrevivência, K/D, valor total
- **Mapas Favoritos:** Top 3 mapas com número de raids

### Para os Viewers
Os espectadores verão:
- Seu loadout atual em tempo real
- Suas estatísticas de jogo
- Seus mapas favoritos
- Valor total do equipamento

## 🔧 Integração com tarkov.dev

A extensão usa a API GraphQL do tarkov.dev para buscar:
- ✅ Dados do jogador (nome, nível, facção)
- ✅ Loadout atual (armas, equipamentos)
- ✅ Estatísticas de raids
- ✅ Histórico de mapas
- ✅ Valores de itens em Roubles

## 🚀 Recursos Futuros

- [ ] Alertas de wipe
- [ ] Histórico de mortes
- [ ] Integração com tracker de quests
- [ ] Comparação com outros streamers
- [ ] Notificações de loot raro

## 💡 Dicas

1. **Configure antes de stremar:** Teste a conexão antes de ir ao vivo
2. **Atualize regularmente:** Salve novas configurações após mudanças no loadout
3. **Use nome personalizado:** Facilita reconhecimento dos viewers
4. **Ative auto-update:** Mantém tudo sincronizado automaticamente

## 🆘 Problemas Comuns

**❌ "Player ID inválido"**
- Verifique se copiou o ID completo do tarkov.dev
- O ID deve ter pelo menos 10 caracteres

**❌ "Erro ao conectar"**
- Verifique sua conexão com internet
- Tente novamente em alguns segundos
- Confirme que o ID está correto

**⚠️ "Configure seu Player ID"**
- Acesse as configurações da extensão
- Insira seu Player ID e salve

## 📞 Suporte

Para suporte ou sugestões:
- GitHub: [seu-repo]
- Discord: [seu-discord]
- Email: [seu-email]

---

**Versão:** 2.0  
**Última atualização:** Dezembro 2025  
**API:** tarkov.dev GraphQL API

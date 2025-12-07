# 🎮 Tarkov.dev API - Guia de Integração

## 📡 Endpoint da API

**URL:** `https://api.tarkov.dev/graphql`  
**Tipo:** GraphQL API  
**Autenticação:** Não requerida (API pública)

## 🔍 O Que a API Oferece

A API pública do tarkov.dev fornece dados do **jogo**, não dados de **jogadores**:

### ✅ Dados Disponíveis:
- **Items** (armas, equipamentos, munição, etc)
- **Maps** (mapas do jogo)
- **Traders** (comerciantes)
- **Quests** (missões)
- **Crafts** (receitas de craft)
- **Barters** (trocas)
- **Hideout** (hideout modules)
- **Ammo** (tipos de munição)

### ❌ Dados NÃO Disponíveis via API:
- **Player Stats** (estatísticas de jogadores)
- **Player Loadouts** (equipamento atual)
- **Player Level** (nível do jogador)
- **K/D Ratio, Survival Rate** (dados de perfil)

## 📊 Como Obter Stats de Jogadores

Para obter stats de jogadores específicos, você precisa:

### Opção 1: Web Scraping (Recomendado para Extension)
```javascript
// URL do perfil: https://tarkov.dev/players/regular/10590762
// Você precisaria de um backend que:
// 1. Faça scraping da página HTML
// 2. Extraia as stats (Raids, Kills, K/D, etc)
// 3. Cache os dados
// 4. Retorne JSON para a extensão
```

### Opção 2: Battle State Games API (Oficial)
- Requer autenticação do jogador
- Acesso limitado
- Mais complexo de implementar

## 🛠️ Exemplos de Queries GraphQL

### 1. Buscar Armas Populares
```graphql
query {
  items(type: weapon, limit: 10) {
    name
    shortName
    types
    avg24hPrice
    wikiLink
    iconLink
  }
}
```

### 2. Buscar Mapas
```graphql
query {
  maps {
    name
    wiki
    description
    enemies
  }
}
```

### 3. Buscar Item Específico
```graphql
query {
  item(name: "M4A1") {
    name
    shortName
    types
    avg24hPrice
    basePrice
    sellFor {
      vendor {
        name
      }
      price
    }
  }
}
```

### 4. Buscar Munição
```graphql
query {
  ammo(caliber: "5.56x45mm") {
    item {
      name
      shortName
    }
    damage
    penetrationPower
    armorDamage
  }
}
```

## 💡 Solução para a Extensão

Dado que a API não fornece stats de jogadores, temos 3 opções:

### **Opção A: Modo Demo (Atual)**
- Stats hardcoded/configuráveis
- Streamer atualiza manualmente
- Simples, sem backend necessário
- ✅ **Recomendado para MVP**

### **Opção B: Backend + Web Scraping**
```
Extensão → Seu Backend → tarkov.dev/players → Parse HTML → JSON → Extensão
```

Exemplo de backend (Node.js):
```javascript
// backend/server.js
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

app.get('/api/player/:nickname/:id', async (req, res) => {
  const { nickname, id } = req.params;
  const url = `https://tarkov.dev/players/${nickname}/${id}`;
  
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);
  
  const stats = {
    raids: $('.stat-raids').text(),
    kills: $('.stat-kills').text(),
    deaths: $('.stat-deaths').text(),
    kd: $('.stat-kd').text(),
    // ... parse outros campos
  };
  
  res.json({ success: true, stats });
});
```

### **Opção C: Configuração Manual + API de Items**
- Streamer configura stats manualmente no config
- API do tarkov.dev para mostrar preços de items
- Híbrido: stats manuais + dados reais de items

## 🚀 Implementação Recomendada

Para a extensão Twitch, sugiro:

1. **Configuração Manual de Stats**
   - Streamer adiciona suas próprias stats no config
   - Campos: Raids, Kills, Deaths, K/D, S/R, etc
   - Atualiza quando quiser

2. **API para Dados de Items** (Opcional)
   - Mostrar preços de items em tempo real
   - Informações sobre armas/equipamentos
   - Adiciona valor sem precisar de backend

3. **Link para Perfil Completo**
   - Botão que abre tarkov.dev/players/...
   - Viewers veem stats detalhadas lá

## 📝 Exemplo de Config Estendido

```javascript
// config.js - Salvar stats manualmente
const config = {
  playerNickname: 'Regular',
  playerId: '10590762',
  profileUrl: 'https://tarkov.dev/players/regular/10590762',
  
  // Stats manuais
  manualStats: {
    raids: 645,
    kills: 3535,
    deaths: 275,
    survived: 353,
    kd: 12.86,
    sr: 54.71,
    traumatic: 57
  },
  
  // Atualizar da API?
  autoUpdate: false,
  showStats: true
};
```

## 🔗 Links Úteis

- **API Playground:** https://api.tarkov.dev/graphql
- **Documentação:** https://tarkov.dev/api/
- **GitHub:** https://github.com/the-hideout/tarkov-dev
- **Discord:** Para suporte sobre a API

## ⚠️ Limitações

- **Rate Limiting:** Respeite os limites da API
- **Cache:** Faça cache de dados que não mudam frequentemente
- **Player Stats:** Não disponíveis diretamente via API
- **Autenticação:** API pública, mas rate limits podem aplicar

## 🎯 Próximos Passos

1. ✅ Testar queries GraphQL no playground
2. ✅ Decidir entre stats manuais ou backend
3. ⏳ Implementar integração escolhida
4. ⏳ Adicionar cache se usar API
5. ⏳ Testar com dados reais

---

**Nota:** Este documento foi criado em 05/12/2025. Verifique a documentação oficial para updates.

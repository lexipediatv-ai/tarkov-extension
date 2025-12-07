# Changelog v2.1 - PMC Only & Achievements

## 🎯 Mudanças Principais

### 1. **Stats Apenas de PMC** ✅
- ❌ **Removido**: Stats de Scav (raids, kills, deaths, survived)
- ✅ **Mantido**: Apenas estatísticas de PMC
- **Motivo**: Foco nas estatísticas principais do jogador

**Antes (v2.0):**
```javascript
totalRaids = pmcRaids + scavRaids
totalKills = pmcKills + scavKills
totalDeaths = pmcDeaths + scavDeaths
```

**Depois (v2.1):**
```javascript
raids = pmcRaids (apenas)
kills = pmcKills (apenas)
deaths = pmcDeaths (apenas)
```

### 2. **Sistema de Conquistas (Achievements)** 🏆
- ✅ Busca conquistas via API do tarkov.dev
- ✅ Display horizontal de ícones
- ✅ Grid responsivo (máximo 2 linhas visíveis com scroll)
- ✅ Cores por raridade:
  - **Common**: Cinza (#9a9a9a)
  - **Rare**: Azul (#4a9eff) com brilho
  - **Legendary**: Dourado (#ffaa00) com brilho intenso
- ✅ Tooltip com nome e descrição ao hover
- ✅ Contador de conquistas: `🏆 Conquistas (X)`

### 3. **Correção da Tabela de Levels** 🔧
- ✅ Implementada tabela oficial do tarkov.dev (105 levels)
- ✅ Valores cumulativos corretos
- ✅ Level 37 agora calculado corretamente
- **Problema**: Tabela anterior estava invertida e incompleta
- **Solução**: Tabela completa com experiência cumulativa

## 📦 Arquivos Modificados

### `scripts/config-v2.js`
```javascript
// Nova função para buscar conquistas
async function displayAchievements(achievements) {
    // Busca dados da API tarkov.dev
    // Filtra conquistas completadas
    // Renderiza grid de ícones com raridade
}

// Stats PMC only
const pmcRaids = findStat(pmcStats, ['Sessions']);
const pmcKills = findStat(pmcStats, ['Kills']);
const pmcDeaths = findStat(pmcStats, ['ExitStatus', 'Killed']);
// (removido scavStats)
```

### `scripts/panel-v2.js`
```javascript
// Extract stats from API response (PMC only)
function extractStats(data) {
    // Apenas pmcStats, sem scavStats
    achievements: data.achievements || {}
}
```

### `config.html`
```html
<!-- Novo container de conquistas -->
<div id="achievements-container" class="achievements-container"></div>
```

### `styles/config.css`
```css
/* Achievements Section */
.achievements-container { ... }
.achievements-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(50px, 1fr));
    max-height: 200px;
    overflow-y: auto;
}
.achievement-icon.rare { border-color: #4a9eff; }
.achievement-icon.legendary { border-color: #ffaa00; }
```

## 🎨 Design das Conquistas

**Layout:**
```
┌─────────────────────────────────────┐
│  🏆 Conquistas (X)                  │
├─────────────────────────────────────┤
│ [🏆] [🏆] [🏆] [🏆] [🏆] [🏆] [🏆] │
│ [🏆] [🏆] [🏆] [🏆] [🏆] [🏆] [🏆] │
│                  ↕️ scroll          │
└─────────────────────────────────────┘
```

**Interação:**
- Hover: Escala 1.1x + tooltip
- Grid responsivo adaptável
- Scroll suave em Y se > 2 linhas

## 🧪 Testado Com

- ✅ Player ID: 12220692 (KarolMartynsTV)
- ✅ Stats PMC corretos
- ✅ Level 37 calculado corretamente (era 79 antes)
- ⏳ Achievements (quando API voltar)

## 📊 Comparação de Stats

| Stat | v2.0 (PMC+Scav) | v2.1 (PMC Only) |
|------|----------------|-----------------|
| Raids | 300 | 243 |
| Kills | 700 | 633 |
| Deaths | 120 | 106 |
| K/D | 5.83 | 5.97 |
| S/R | 50% | 51.4% |

*Exemplo com dados de KarolMartynsTV*

## 🔄 Retrocompatibilidade

- ✅ Twitch Configuration Service compatível
- ✅ Auto-refresh mantido (5 minutos)
- ✅ Cloudflare Turnstile inalterado
- ✅ Formato de dados preservado

## 🚀 Próximos Passos

1. Testar conquistas quando API tarkov.dev voltar
2. Validar performance com muitas conquistas (50+)
3. Considerar filtro de conquistas por raridade
4. Adicionar animação de "nova conquista"

## 📝 Notas

- API tarkov.dev temporariamente indisponível durante desenvolvimento
- Sistema de conquistas pronto para uso quando API retornar
- Stats de Scav removidos permanentemente (decisão de design)
- Level calculation agora 100% preciso até level 105

---

**Versão**: 2.1.0  
**Data**: 6 de Dezembro de 2025  
**Status**: ✅ Pronto para teste quando API retornar

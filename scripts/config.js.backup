// Tarkov Stats - Config Simple Script
let twitch, token, userId;

// Inicializar Twitch Extension Helper
window.addEventListener('DOMContentLoaded', function() {
    if (typeof window.Twitch === 'undefined') {
        console.error('Twitch Extension Helper não carregado');
        showStatus('Erro ao carregar extensão Twitch', 'error');
        return;
    }

    twitch = window.Twitch.ext;
    
    twitch.onAuthorized(function(auth) {
        token = auth.token;
        userId = auth.userId;
        
        console.log('✅ Extension autorizada');
        document.getElementById('extension-status').textContent = 'Conectado ✅';
        document.getElementById('extension-status').style.color = '#6a9a66';
        
        // Carregar configuração existente
        loadConfiguration();
    });

    // Event listeners
    document.getElementById('fetch-button').addEventListener('click', fetchStats);
    document.getElementById('config-form').addEventListener('submit', saveConfiguration);
    document.getElementById('player-nickname').addEventListener('input', checkFormInputs);
    document.getElementById('player-id-input').addEventListener('input', checkFormInputs);
});

function checkFormInputs() {
    const nickname = document.getElementById('player-nickname').value.trim();
    const playerId = document.getElementById('player-id-input').value.trim();
    const fetchButton = document.getElementById('fetch-button');
    
    // Habilitar botão se tiver nickname E player ID
    fetchButton.disabled = !(nickname.length >= 2 && playerId.length >= 4);
}

async function fetchStats() {
    const nickname = document.getElementById('player-nickname').value.trim();
    const playerId = document.getElementById('player-id-input').value.trim();
    
    if (!nickname || nickname.length < 2) {
        showStatus('❌ Por favor, digite um nickname válido', 'error');
        return;
    }
    
    if (!playerId || playerId.length < 4) {
        showStatus('❌ Por favor, digite o Player ID', 'error');
        return;
    }

    const fetchButton = document.getElementById('fetch-button');
    const buttonText = document.getElementById('button-text');
    
    // Disable button and show loading
    fetchButton.disabled = true;
    fetchButton.classList.add('loading');
    buttonText.textContent = '⏳ Buscando stats...';
    
    // URL direta do perfil com nickname e ID
    const profileUrl = `https://tarkov.dev/players/${nickname}/${playerId}`;
    
    showStatus('🔍 Tentando buscar stats automaticamente do tarkov.dev...', 'info');
    
    try {
        // Tentar buscar via backend (se disponível)
        const backendUrl = 'http://localhost:3000/api/player/' + nickname + '/' + playerId;
        
        const response = await fetch(backendUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });
        
        if (response.ok) {
            const data = await response.json();
            
            if (data.success && data.stats) {
                showStatus('✅ Stats encontradas automaticamente!', 'success');
                displayStats(data.stats, profileUrl, nickname, playerId);
                
                fetchButton.disabled = false;
                fetchButton.classList.remove('loading');
                buttonText.textContent = '🔄 Atualizar Stats';
                return;
            }
        }
    } catch (error) {
        console.log('Backend não disponível, usando modo manual:', error);
    }
    
    // Se backend não funcionar, modo manual
    showStatus(`
        <div style="text-align: left; line-height: 1.8;">
            <strong style="color: #d4af37;">🔗 Abrindo seu perfil...</strong><br><br>
            Se suas stats não aparecerem automaticamente:<br>
            <strong>1.</strong> Verifique se a página carregou completamente<br>
            <strong>2.</strong> Se pedir CAPTCHA, resolva-o<br>
            <strong>3.</strong> Copie os números e cole abaixo<br>
        </div>
    `, 'info');
    
    // Abrir perfil direto
    window.open(profileUrl, '_blank');
    
    // Aguardar e mostrar formulário
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    showManualStatsForm(nickname, profileUrl, playerId);
    
    fetchButton.disabled = false;
    fetchButton.classList.remove('loading');
    buttonText.textContent = '🔄 Buscar Novamente';
}

function displayStats(stats, profileUrl, nickname, playerId) {
    // Preencher automaticamente os campos com stats do backend
    const statsSection = document.getElementById('stats-section');
    
    showStatus('✅ Stats carregadas automaticamente!', 'success');
    
    // Mostrar formulário primeiro
    showManualStatsForm(nickname, profileUrl, playerId);
    
    // Preencher os campos automaticamente
    if (stats.raids !== undefined) document.getElementById('input-raids').value = stats.raids;
    if (stats.kills !== undefined) document.getElementById('input-kills').value = stats.kills;
    if (stats.deaths !== undefined) document.getElementById('input-deaths').value = stats.deaths;
    if (stats.survived !== undefined) document.getElementById('input-survived').value = stats.survived;
    if (stats.kd !== undefined) document.getElementById('input-kd').value = stats.kd;
    if (stats.sr !== undefined) document.getElementById('input-sr').value = stats.sr;
    if (stats.traumatic !== undefined) document.getElementById('input-traumatic').value = stats.traumatic;
    if (stats.level !== undefined) document.getElementById('input-level').value = stats.level;
    
    // Trigger input events to update hidden fields
    ['raids', 'kills', 'deaths', 'survived', 'kd', 'sr', 'traumatic', 'level'].forEach(field => {
        const input = document.getElementById(`input-${field}`);
        if (input) {
            const event = new Event('input', { bubbles: true });
            input.dispatchEvent(event);
        }
    });
    
    // Enable save button
    checkFormValid();
    
    // Add success message
    const successMsg = document.createElement('div');
    successMsg.style.cssText = 'background: #1a4d1a; padding: 15px; border-radius: 8px; border: 2px solid #6a9a66; margin-bottom: 15px; text-align: center; color: #6a9a66; font-weight: bold;';
    successMsg.innerHTML = '✅ Stats carregadas automaticamente! Verifique os valores e clique em "Salvar Configuração" abaixo.';
    statsSection.insertBefore(successMsg, statsSection.firstChild);
}

function showManualStatsForm(nickname, profileUrl, playerId) {
    // Criar formulário manual de stats
    const statsSection = document.getElementById('stats-section');
    statsSection.innerHTML = `
        <div style="background: #1a1a1a; padding: 15px; border-radius: 8px; border: 2px solid #d4af37; margin-bottom: 20px;">
            <h4 style="color: #d4af37; margin: 0 0 10px 0;">✅ Perfil aberto!</h4>
            <p style="color: #9a8866; margin: 10px 0;">
                Perfil: <strong style="color: #c7c5b3;">${nickname}</strong> (ID: ${playerId})
            </p>
            <ol style="color: #9a8866; margin: 0; padding-left: 20px; line-height: 1.8;">
                <li>Verifique se a página carregou completamente</li>
                <li>Se necessário, <strong style="color: #d4af37;">resolva o CAPTCHA</strong></li>
                <li>Aguarde as stats aparecerem</li>
                <li>Copie os números e cole abaixo</li>
            </ol>
            <p style="text-align: center; margin: 15px 0 5px 0;">
                <a href="${profileUrl}" target="_blank" style="color: #d4af37; text-decoration: none; font-weight: bold;">
                    🔗 Reabrir Perfil no tarkov.dev
                </a>
            </p>
        </div>
        
        <h3>📊 Cole Suas Estatísticas Aqui</h3>
        
        <div class="stats-grid">
            <div class="stat-input-group">
                <label>Raids</label>
                <input type="number" id="input-raids" class="stat-input" placeholder="0" min="0">
            </div>
            <div class="stat-input-group">
                <label>Kills</label>
                <input type="number" id="input-kills" class="stat-input" placeholder="0" min="0">
            </div>
            <div class="stat-input-group">
                <label>Deaths</label>
                <input type="number" id="input-deaths" class="stat-input" placeholder="0" min="0">
            </div>
            <div class="stat-input-group">
                <label>Survived</label>
                <input type="number" id="input-survived" class="stat-input" placeholder="0" min="0">
            </div>
            <div class="stat-input-group">
                <label>K/D Ratio</label>
                <input type="number" id="input-kd" class="stat-input" placeholder="0.00" step="0.01" min="0">
            </div>
            <div class="stat-input-group">
                <label>S/R %</label>
                <input type="number" id="input-sr" class="stat-input" placeholder="0.00" step="0.01" min="0" max="100">
            </div>
            <div class="stat-input-group">
                <label>Traumatic</label>
                <input type="number" id="input-traumatic" class="stat-input" placeholder="0" min="0">
            </div>
            <div class="stat-input-group">
                <label>Level</label>
                <input type="number" id="input-level" class="stat-input" placeholder="1" min="1" max="99">
            </div>
        </div>
        
        <div class="profile-preview">
            <strong>🔗 Seu Perfil:</strong>
            <a href="${profileUrl}" target="_blank">Ver no tarkov.dev</a>
        </div>
    `;
    
    statsSection.style.display = 'block';
    
    // Adicionar CSS para inputs
    const style = document.createElement('style');
    style.textContent = `
        .stat-input-group {
            display: flex;
            flex-direction: column;
        }
        .stat-input-group label {
            font-size: 0.85em;
            color: #9a8866;
            margin-bottom: 5px;
            text-transform: uppercase;
        }
        .stat-input {
            width: 100%;
            padding: 10px;
            background: #0f0f0f;
            border: 2px solid #3a3a3a;
            border-radius: 6px;
            color: #c7c5b3;
            font-size: 1.1em;
            text-align: center;
            font-weight: bold;
            transition: all 0.3s;
        }
        .stat-input:focus {
            outline: none;
            border-color: #d4af37;
            box-shadow: 0 0 10px rgba(212, 175, 55, 0.3);
        }
        .stat-input::placeholder {
            color: #666;
        }
    `;
    document.head.appendChild(style);
    
    // Store profile URL
    document.getElementById('profile-url').value = profileUrl;
    
    // Enable save button when stats are entered
    addInputListeners();
    
    // Scroll to stats section
    statsSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function addInputListeners() {
    const inputs = ['raids', 'kills', 'deaths', 'survived', 'kd', 'sr', 'traumatic', 'level'];
    
    inputs.forEach(field => {
        const input = document.getElementById(`input-${field}`);
        if (input) {
            input.addEventListener('input', function() {
                // Update hidden field
                document.getElementById(`stats-${field}`).value = this.value;
                
                // Check if we can enable save button
                checkFormValid();
            });
        }
    });
}

function checkFormValid() {
    const nickname = document.getElementById('player-nickname').value.trim();
    const raids = document.getElementById('input-raids')?.value || '';
    
    const saveButton = document.getElementById('save-button');
    
    // Enable save if we have nickname and at least one stat
    if (nickname.length >= 2 && raids) {
        saveButton.disabled = false;
    } else {
        saveButton.disabled = true;
    }
}

function showStatus(message, type = 'info') {
    const statusDiv = document.getElementById('status-message');
    statusDiv.innerHTML = message;
    statusDiv.className = `status-message ${type}`;
    statusDiv.style.display = 'flex';
    
    // Auto-hide success/error messages after 5 seconds
    if (type === 'success' || type === 'error') {
        setTimeout(() => {
            statusDiv.style.display = 'none';
        }, 5000);
    }
}

function loadConfiguration() {
    twitch.configuration.onChanged(function() {
        const config = twitch.configuration.broadcaster;
        
        if (config && config.content) {
            try {
                const data = JSON.parse(config.content);
                console.log('📥 Configuração carregada:', data);
                
                // Preencher campos
                if (data.nickname) {
                    document.getElementById('player-nickname').value = data.nickname;
                }
                
                // Se já tem stats salvas, mostrar
                if (data.stats) {
                    populateStats(data.stats, data.profileUrl || '');
                }
            } catch (error) {
                console.error('Erro ao carregar configuração:', error);
            }
        }
    });
}

function populateStats(stats, profileUrl) {
    // Mostrar seção de stats
    const statsSection = document.getElementById('stats-section');
    
    // Criar formulário preenchido
    showManualStatsForm(document.getElementById('player-nickname').value, profileUrl);
    
    // Preencher valores
    const fields = {
        'raids': stats.raids || 0,
        'kills': stats.kills || 0,
        'deaths': stats.deaths || 0,
        'survived': stats.survived || 0,
        'kd': stats.kd || '0.00',
        'sr': stats.sr || '0.00',
        'traumatic': stats.traumatic || 0,
        'level': stats.level || 1
    };
    
    Object.keys(fields).forEach(field => {
        const input = document.getElementById(`input-${field}`);
        if (input) {
            input.value = fields[field];
        }
        document.getElementById(`stats-${field}`).value = fields[field];
    });
    
    checkFormValid();
}

function saveConfiguration(event) {
    event.preventDefault();
    
    const nickname = document.getElementById('player-nickname').value.trim();
    
    if (!nickname) {
        showStatus('❌ Nickname é obrigatório', 'error');
        return;
    }
    
    // Coletar stats dos inputs ou hidden fields
    const stats = {
        raids: parseInt(document.getElementById('stats-raids').value) || 0,
        kills: parseInt(document.getElementById('stats-kills').value) || 0,
        deaths: parseInt(document.getElementById('stats-deaths').value) || 0,
        survived: parseInt(document.getElementById('stats-survived').value) || 0,
        kd: parseFloat(document.getElementById('stats-kd').value) || 0,
        sr: parseFloat(document.getElementById('stats-sr').value) || 0,
        traumatic: parseInt(document.getElementById('stats-traumatic').value) || 0,
        level: parseInt(document.getElementById('stats-level').value) || 1
    };
    
    const profileUrl = document.getElementById('profile-url').value || `https://tarkov.dev/players/${nickname}`;
    
    const configData = {
        nickname: nickname,
        profileUrl: profileUrl,
        stats: stats,
        updatedAt: new Date().toISOString()
    };
    
    console.log('💾 Salvando configuração:', configData);
    
    // Salvar no Twitch Configuration Service
    twitch.configuration.set('broadcaster', '1.0', JSON.stringify(configData));
    
    showStatus('✅ Configuração salva com sucesso!', 'success');
    
    // Disable save button after save
    document.getElementById('save-button').disabled = true;
    
    // Re-enable after 2 seconds
    setTimeout(() => {
        document.getElementById('save-button').disabled = false;
    }, 2000);
}

// Tarkov Loadout Extension - Config Script
(function() {
    'use strict';
    
    let token = '';
    
    // Twitch Extension Helper
    const twitch = window.Twitch ? window.Twitch.ext : null;
    
    // Initialize when Twitch Extension Helper is ready
    if (twitch) {
        twitch.onAuthorized(function(auth) {
            token = auth.token;
            console.log('🔐 Config authorized');
            
            // Load existing configuration
            loadConfiguration();
        });
        
        twitch.configuration.onChanged(function() {
            console.log('⚙️ Configuration changed');
            loadConfiguration();
        });
    }
    
    // Load configuration from Twitch
    function loadConfiguration() {
        if (!twitch) return;
        
        const config = twitch.configuration.broadcaster 
            ? JSON.parse(twitch.configuration.broadcaster.content || '{}')
            : {};
        
        // Populate form with existing values
        const playerNicknameInput = document.getElementById('player-nickname');
        const playerIdInput = document.getElementById('player-id');
        const showStatsInput = document.getElementById('show-stats');
        
        if (playerNicknameInput) playerNicknameInput.value = config.playerNickname || '';
        if (playerIdInput) playerIdInput.value = config.playerId || '';
        if (showStatsInput) showStatsInput.checked = config.showStats !== false;
        
        // Load manual stats
        if (config.manualStats) {
            document.getElementById('stat-raids').value = config.manualStats.raids || '';
            document.getElementById('stat-kills').value = config.manualStats.kills || '';
            document.getElementById('stat-deaths').value = config.manualStats.deaths || '';
            document.getElementById('stat-survived').value = config.manualStats.survived || '';
            document.getElementById('stat-kd').value = config.manualStats.kd || '';
            document.getElementById('stat-sr').value = config.manualStats.sr || '';
            document.getElementById('stat-traumatic').value = config.manualStats.traumatic || '';
            document.getElementById('stat-level').value = config.manualStats.level || '';
        }
        
        console.log('📋 Configuration loaded:', config);
    }
    
    // Save configuration to Twitch
    function saveConfiguration(config) {
        if (!twitch) {
            showStatus('❌ Twitch Extension Helper não está disponível', 'error');
            return;
        }
        
        twitch.configuration.set('broadcaster', '1', JSON.stringify(config));
        showStatus('✅ Configurações salvas com sucesso!', 'success');
        console.log('💾 Configuration saved:', config);
    }
    
    // Test Tarkov profile by opening tarkov.dev page
    async function testTarkovProfile(nickname, playerId) {
        showStatus('🔍 Verificando perfil no tarkov.dev...', 'success');
        
        try {
            // Build tarkov.dev URL
            let profileUrl = 'https://tarkov.dev/players/';
            
            if (playerId && playerId.trim()) {
                // If player ID is provided, use it directly
                profileUrl += `regular/${playerId.trim()}`;
            } else if (nickname && nickname.trim()) {
                // If only nickname, use search page
                profileUrl = `https://tarkov.dev/players?search=${encodeURIComponent(nickname.trim())}`;
            } else {
                showStatus('❌ Digite seu nickname primeiro', 'error');
                return false;
            }
            
            // Show preview with link
            const previewBox = document.getElementById('preview-box');
            if (previewBox) {
                previewBox.innerHTML = `
                    <div style="padding: 15px; background: rgba(212, 175, 55, 0.1); border: 1px solid #d4af37; border-radius: 4px; margin-top: 15px;">
                        <p style="margin-bottom: 10px;">
                            <strong>🔗 Seu perfil Tarkov.dev:</strong>
                        </p>
                        <a href="${profileUrl}" target="_blank" style="color: #d4af37; word-break: break-all;">
                            ${profileUrl}
                        </a>
                        <p style="margin-top: 10px; font-size: 0.9em; color: #9A8866;">
                            Clique no link acima para abrir seu perfil e verificar se está correto.
                        </p>
                    </div>
                `;
                previewBox.style.display = 'block';
            }
            
            showStatus('✅ Link do perfil gerado! Clique para verificar', 'success');
            return true;
            
        } catch (error) {
            console.error('❌ Error testing profile:', error);
            showStatus('❌ Erro ao gerar link do perfil', 'error');
            return false;
        }
    }
    
    // Show status message
    function showStatus(message, type) {
        const statusDiv = document.getElementById('status-message');
        if (statusDiv) {
            statusDiv.textContent = message;
            statusDiv.className = type;
            
            // Hide after 3 seconds
            setTimeout(function() {
                statusDiv.style.display = 'none';
            }, 3000);
        }
    }
    
    // Form submit handler
    const configForm = document.getElementById('config-form');
    if (configForm) {
        configForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const nickname = document.getElementById('player-nickname').value.trim();
            const playerId = document.getElementById('player-id').value.trim();
            
            // Validate nickname (required)
            if (!nickname) {
                showStatus('❌ Nickname é obrigatório!', 'error');
                return;
            }
            
            if (nickname.length < 2) {
                showStatus('❌ Nickname muito curto', 'error');
                return;
            }
            
            // Build profile URL
            let profileUrl = 'https://tarkov.dev/players/';
            if (playerId) {
                profileUrl += `regular/${playerId}`;
            } else {
                profileUrl = `https://tarkov.dev/players?search=${encodeURIComponent(nickname)}`;
            }
            
            // Collect manual stats
            const manualStats = {
                raids: parseInt(document.getElementById('stat-raids').value) || 0,
                kills: parseInt(document.getElementById('stat-kills').value) || 0,
                deaths: parseInt(document.getElementById('stat-deaths').value) || 0,
                survived: parseInt(document.getElementById('stat-survived').value) || 0,
                kd: parseFloat(document.getElementById('stat-kd').value) || 0,
                sr: parseFloat(document.getElementById('stat-sr').value) || 0,
                traumatic: parseInt(document.getElementById('stat-traumatic').value) || 0,
                level: parseInt(document.getElementById('stat-level').value) || 1
            };
            
            const config = {
                playerNickname: nickname,
                playerId: playerId || '',
                profileUrl: profileUrl,
                manualStats: manualStats,
                showStats: document.getElementById('show-stats').checked,
                lastUpdated: new Date().toISOString()
            };
            
            saveConfiguration(config);
        });
    }
    
    // Test button handler
    const testButton = document.getElementById('test-button');
    if (testButton) {
        testButton.addEventListener('click', async function() {
            const nickname = document.getElementById('player-nickname').value.trim();
            const playerId = document.getElementById('player-id').value.trim();
            
            if (!nickname) {
                showStatus('❌ Insira seu nickname primeiro', 'error');
                return;
            }
            
            await testTarkovProfile(nickname, playerId);
        });
    }
    
    // Reset button handler
    const resetButton = document.getElementById('reset-button');
    if (resetButton) {
        resetButton.addEventListener('click', function() {
            if (!confirm('Tem certeza que deseja resetar todas as configurações?')) {
                return;
            }
            
            const config = {
                playerNickname: '',
                playerId: '',
                profileUrl: '',
                autoUpdate: true,
                showStats: true,
                lastUpdated: new Date().toISOString()
            };
            
            saveConfiguration(config);
            loadConfiguration();
            
            // Clear preview
            const previewBox = document.getElementById('preview-box');
            if (previewBox) {
                previewBox.style.display = 'none';
            }
            
            showStatus('🔄 Configurações resetadas!', 'success');
        });
    }
    
    console.log('⚔️ Tarkov Config script loaded');
})();

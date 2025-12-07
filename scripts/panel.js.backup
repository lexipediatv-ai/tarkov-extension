// Tarkov Loadout Extension - Panel Script

let twitchExtension = null;
let playerData = {
    nickname: 'Regular',
    level: 42,
    faction: 'USEC',
    profileUrl: 'https://tarkov.dev/players/regular/10590762',
    stats: {
        raids: 645,
        kills: 3535,
        deaths: 275,
        kd: 12.86,
        survived: 353,
        sr: 54.71,
        traumatic: 57
    }
};

function waitForTwitch() {
    let attempts = 0;
    const maxAttempts = 50;
    
    const checkTwitch = setInterval(() => {
        attempts++;
        
        if (window.Twitch && window.Twitch.ext) {
            clearInterval(checkTwitch);
            console.log(' Twitch Extension Helper loaded successfully!');
            initializeExtension();
        } else if (attempts >= maxAttempts) {
            clearInterval(checkTwitch);
            console.warn(' Twitch Extension Helper failed to load. Running in demo mode.');
            runDemoMode();
        }
    }, 100);
}

function initializeExtension() {
    twitchExtension = window.Twitch.ext;
    
    twitchExtension.onAuthorized((auth) => {
        console.log(' Extension authorized:', auth);
        updateLoadout();
    });
    
    twitchExtension.onContext((context, changed) => {
        console.log(' Context updated:', context);
    });
    
    twitchExtension.configuration.onChanged(() => {
        console.log(' Configuration changed');
        loadConfiguration();
    });
    
    updateLoadout();
}

function runDemoMode() {
    console.log(' Running in DEMO mode');
    updateLoadout();
    showMessage('Modo demonstração - Conecte à Twitch para dados reais');
}

function updateLoadout() {
    // Update player header
    document.getElementById('player-name').textContent = playerData.nickname;
    document.querySelector('.level-badge').textContent = `Nível ${playerData.level}`;
    document.querySelector('.faction').textContent = playerData.faction;
    
    // Update stats
    document.getElementById('stat-raids').textContent = playerData.stats.raids.toLocaleString();
    document.getElementById('stat-kills').textContent = playerData.stats.kills.toLocaleString();
    document.getElementById('stat-kd').textContent = playerData.stats.kd.toFixed(2);
    document.getElementById('stat-sr').textContent = playerData.stats.sr.toFixed(2) + '%';
    document.getElementById('stat-traumatic').textContent = playerData.stats.traumatic;
    document.getElementById('stat-deaths').textContent = playerData.stats.deaths.toLocaleString();
    document.getElementById('stat-survived').textContent = playerData.stats.survived.toLocaleString();
    
    // Update profile link
    const profileLink = document.getElementById('profile-link');
    if (profileLink && playerData.profileUrl) {
        profileLink.href = playerData.profileUrl;
    }
    
    console.log('📦 Player data loaded');
}

async function loadConfiguration() {
    if (!twitchExtension) return;
    
    try {
        const config = twitchExtension.configuration.broadcaster;
        if (config && config.content) {
            const settings = JSON.parse(config.content);
            console.log('📋 Loaded configuration:', settings);
            
            // Update player info from config
            if (settings.playerNickname) {
                console.log('🎮 Player nickname configured:', settings.playerNickname);
                
                // Update player data with configured values
                playerData.nickname = settings.playerNickname;
                document.getElementById('player-name').textContent = settings.playerNickname;
                
                // Update profile URL
                if (settings.profileUrl) {
                    playerData.profileUrl = settings.profileUrl;
                    const profileLink = document.getElementById('profile-link');
                    if (profileLink) {
                        profileLink.href = settings.profileUrl;
                    }
                }
                
                // Tentar buscar stats da API automaticamente
                const hasBackend = true; // Mude para true quando backend estiver rodando
                
                if (hasBackend && settings.playerId) {
                    console.log('🔄 Attempting to fetch from backend API...');
                    const fetched = await fetchTarkovData(settings.playerNickname, settings.playerId);
                    
                    if (!fetched) {
                        // Fallback para stats manuais
                        if (settings.manualStats) {
                            playerData.stats = settings.manualStats;
                            playerData.level = settings.manualStats.level || 42;
                            console.log('📊 Using manual stats as fallback');
                        }
                    }
                } else {
                    // Usar stats manuais se backend não disponível
                    if (settings.manualStats) {
                        playerData.stats = settings.manualStats;
                        playerData.level = settings.manualStats.level || 42;
                        console.log('📊 Manual stats loaded:', settings.manualStats);
                    }
                }
                
                // Update UI with configured data
                updateLoadout();
                
                if (playerData.stats.raids > 0) {
                    showMessage('✅ Stats carregadas!');
                } else {
                    showMessage('✅ Perfil configurado! Adicione suas stats na configuração');
                }
            } else {
                showMessage('⚠️ Configure seu nickname nas configurações da extensão');
            }
        } else {
            showMessage('⚠️ Configure seu nickname nas configurações da extensão');
        }
    } catch (error) {
        console.error('❌ Error loading configuration:', error);
        showMessage('❌ Erro ao carregar configurações');
    }
}

// Fetch player data from backend API
async function fetchTarkovData(nickname, playerId) {
    try {
        console.log('🔄 Fetching data from backend API for:', nickname);
        
        // URL do seu backend (ajuste conforme necessário)
        const API_URL = 'http://localhost:3000'; // ou seu domínio em produção
        
        if (!playerId) {
            console.warn('⚠️ Player ID not provided, cannot fetch stats');
            return;
        }
        
        showMessage('🔄 Carregando stats do Tarkov...');
        
        const response = await fetch(`${API_URL}/api/player/${nickname}/${playerId}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('✅ Backend API Response:', result);
        
        if (result.success && result.data && result.data.stats) {
            // Atualizar dados com resposta da API
            playerData.stats = result.data.stats;
            playerData.level = result.data.stats.level || 42;
            playerData.faction = result.data.stats.faction || 'USEC';
            
            // Atualizar UI
            updateLoadout();
            
            const cacheInfo = result.cached ? ' (cache)' : ' (atualizado)';
            showMessage('✅ Stats carregadas do Tarkov!' + cacheInfo);
            
            return true;
        } else {
            throw new Error('Invalid API response');
        }
        
    } catch (error) {
        console.error('❌ Error fetching Tarkov data:', error);
        showMessage('⚠️ Erro ao carregar stats. Usando dados configurados');
        return false;
    }
}

function showMessage(text) {
    const messageBox = document.getElementById('message-box');
    messageBox.textContent = text;
    messageBox.style.display = 'block';
    
    setTimeout(() => {
        messageBox.style.display = 'none';
    }, 5000);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForTwitch);
} else {
    waitForTwitch();
}

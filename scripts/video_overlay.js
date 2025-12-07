// Video Overlay JavaScript
(function() {
    'use strict';
    
    let token = '';
    
    // Twitch Extension Helper
    const twitch = window.Twitch ? window.Twitch.ext : null;
    
    // Initialize when Twitch Extension Helper is ready
    if (twitch) {
        twitch.onAuthorized(function(auth) {
            token = auth.token;
            
            // Listen for configuration changes
            twitch.configuration.onChanged(function() {
                const config = twitch.configuration.broadcaster 
                    ? JSON.parse(twitch.configuration.broadcaster.content || '{}')
                    : {};
                updateOverlay(config);
            });
        });
        
        twitch.onContext(function(context) {
            console.log('Overlay Context:', context);
        });
    }
    
    // Update overlay based on configuration
    function updateOverlay(config) {
        const overlayContent = document.getElementById('overlay-content');
        const overlayTitle = document.getElementById('overlay-title');
        const overlayMessage = document.getElementById('overlay-message');
        
        // Update visibility based on feature toggle
        if (config.enableFeature) {
            overlayContent.classList.remove('hidden');
        } else {
            overlayContent.classList.add('hidden');
        }
        
        // Update message
        if (config.welcomeMessage && overlayMessage) {
            overlayMessage.textContent = config.welcomeMessage;
        }
        
        // Update theme color
        if (config.colorTheme) {
            const color = getThemeColor(config.colorTheme);
            overlayContent.style.borderColor = color;
            if (overlayTitle) {
                overlayTitle.style.color = color;
            }
        }
    }
    
    // Get color based on theme
    function getThemeColor(theme) {
        const colors = {
            'purple': '#9146FF',
            'blue': '#4169E1',
            'green': '#00C851'
        };
        return colors[theme] || colors['purple'];
    }
    
    // Example: Auto-hide overlay after 10 seconds
    setTimeout(function() {
        const overlayContent = document.getElementById('overlay-content');
        if (overlayContent) {
            overlayContent.style.opacity = '0';
            overlayContent.style.transition = 'opacity 1s ease-out';
            
            setTimeout(function() {
                overlayContent.classList.add('hidden');
            }, 1000);
        }
    }, 10000);
    
    console.log('Video overlay script loaded');
})();

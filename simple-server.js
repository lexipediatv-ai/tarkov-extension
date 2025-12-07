const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;

// Try HTTPS first, fallback to HTTP
let useHTTPS = false;

const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const requestHandler = (req, res) => {
    let filePath = '.' + req.url;
    if (filePath === './') {
        filePath = './panel.html';
    }

    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('404 - Not Found', 'utf-8');
            } else {
                res.writeHead(500);
                res.end('500 - Internal Server Error: ' + error.code, 'utf-8');
            }
        } else {
            res.writeHead(200, {
                'Content-Type': contentType,
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            });
            res.end(content, 'utf-8');
        }
    });
};

// Start HTTP server
const server = http.createServer(requestHandler);

server.listen(PORT, () => {
    console.log(`\n✅ Servidor HTTP rodando em http://localhost:${PORT}`);
    console.log(`\n⚠️  IMPORTANTE: A Twitch pode bloquear HTTP.`);
    console.log(`   Se o painel não carregar, você precisará configurar HTTPS.\n`);
    console.log(`📝 Acesse no Chrome: http://localhost:${PORT}/panel.html`);
    console.log(`\n🛑 Pressione Ctrl+C para parar\n`);
});

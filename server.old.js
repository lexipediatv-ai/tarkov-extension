// Simple HTTPS Server for Twitch Extensions
// Install: npm install http-server -g
// Run: http-server -p 8080 --ssl --cors

// Or use this Node.js script directly
const https = require('https');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PORT = 8080;

// Generate self-signed certificate if not exists
if (!fs.existsSync('cert.pem') || !fs.existsSync('key.pem')) {
    console.log('Gerando certificado auto-assinado...');
    try {
        execSync('openssl req -new -x509 -keyout key.pem -out cert.pem -days 365 -nodes -subj "/CN=localhost"');
        console.log('✅ Certificado gerado!');
    } catch (err) {
        console.error('❌ Erro ao gerar certificado. Instale OpenSSL.');
        process.exit(1);
    }
}

const options = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
};

const server = https.createServer(options, (req, res) => {
    let filePath = '.' + req.url;
    if (filePath === './') filePath = './panel.html';

    const extname = String(path.extname(filePath)).toLowerCase();
    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
    };

    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404);
                res.end('404 - File Not Found');
            } else {
                res.writeHead(500);
                res.end('500 - Internal Server Error');
            }
        } else {
            res.writeHead(200, {
                'Content-Type': contentType,
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'no-cache'
            });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`✅ Servidor HTTPS rodando em https://localhost:${PORT}`);
    console.log('Pressione Ctrl+C para parar');
});

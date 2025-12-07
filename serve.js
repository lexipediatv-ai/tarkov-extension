const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;

const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    console.log(`📥 ${req.method} ${req.url}`);

    let filePath = '.' + req.url;
    if (filePath === './' || filePath === './') {
        filePath = './config-api.html';
    }

    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                console.log(`❌ File not found: ${filePath}`);
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 - File Not Found</h1>', 'utf-8');
            } else {
                console.log(`❌ Error: ${error.code}`);
                res.writeHead(500);
                res.end(`Server Error: ${error.code}`, 'utf-8');
            }
        } else {
            res.writeHead(200, { 
                'Content-Type': contentType,
                'Access-Control-Allow-Origin': '*'
            });
            res.end(content, 'utf-8');
            console.log(`✅ Served: ${filePath}`);
        }
    });
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.log(`❌ Port ${PORT} is already in use!`);
        process.exit(1);
    } else {
        console.log('❌ Server error:', err);
    }
});

server.listen(PORT, '127.0.0.1', () => {
    console.log(`
╔═══════════════════════════════════════════════╗
║   🌐 HTTP Server                             ║
║                                               ║
║   🚀 Server running on port ${PORT}           ║
║   📡 URL: http://localhost:${PORT}            ║
║   📡 URL: http://127.0.0.1:${PORT}            ║
║                                               ║
║   📄 Serving config-api.html                 ║
║   ✅ Turnstile will work here!               ║
║                                               ║
║   Press Ctrl+C to stop                       ║
╚═══════════════════════════════════════════════╝
`);
});

// Keep process alive
process.on('SIGINT', () => {
    console.log('\n👋 Shutting down server...');
    server.close();
    process.exit(0);
});

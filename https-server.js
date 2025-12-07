const https = require('https');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PORT = 8080;

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

// Generate self-signed certificate using Node.js crypto
function generateCertificate() {
    const forge = require('node-forge');
    const pki = forge.pki;
    
    // Generate a keypair
    const keys = pki.rsa.generateKeyPair(2048);
    
    // Create a certificate
    const cert = pki.createCertificate();
    cert.publicKey = keys.publicKey;
    cert.serialNumber = '01';
    cert.validity.notBefore = new Date();
    cert.validity.notAfter = new Date();
    cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);
    
    const attrs = [{
        name: 'commonName',
        value: 'localhost'
    }];
    
    cert.setSubject(attrs);
    cert.setIssuer(attrs);
    cert.sign(keys.privateKey);
    
    return {
        key: pki.privateKeyToPem(keys.privateKey),
        cert: pki.certificateToPem(cert)
    };
}

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

// Try to load or generate certificate
let options;
if (fs.existsSync('key.pem') && fs.existsSync('cert.pem')) {
    options = {
        key: fs.readFileSync('key.pem'),
        cert: fs.readFileSync('cert.pem')
    };
    console.log('✅ Usando certificados existentes');
} else {
    console.log('📝 Gerando certificado auto-assinado...');
    try {
        const certs = generateCertificate();
        fs.writeFileSync('key.pem', certs.key);
        fs.writeFileSync('cert.pem', certs.cert);
        options = {
            key: certs.key,
            cert: certs.cert
        };
        console.log('✅ Certificado gerado com sucesso!');
    } catch (err) {
        console.log('❌ Erro ao gerar certificado. Verifique se node-forge está instalado.');
        console.log('Execute: npm install node-forge');
        process.exit(1);
    }
}

const server = https.createServer(options, requestHandler);

server.listen(PORT, () => {
    console.log(`\n✅ Servidor HTTPS rodando em https://localhost:${PORT}`);
    console.log(`\n📝 Passos para usar:`);
    console.log(`   1. Acesse no Chrome: https://localhost:${PORT}/panel.html`);
    console.log(`   2. Clique em "Avançado" e depois "Continuar para localhost"`);
    console.log(`   3. Configure a extensão da Twitch com: https://localhost:${PORT}/`);
    console.log(`\n🛑 Pressione Ctrl+C para parar\n`);
});

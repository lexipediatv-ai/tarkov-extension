# Simple Python HTTPS Server with Self-Signed Certificate
# Run with: python server.py

import http.server
import ssl
import socketserver
import os

PORT = 8080

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

Handler = MyHTTPRequestHandler

# Check if certificate files exist
if not os.path.exists('cert.pem') or not os.path.exists('key.pem'):
    print("Gerando certificado auto-assinado...")
    import subprocess
    # Generate self-signed certificate
    subprocess.run([
        'openssl', 'req', '-new', '-x509', '-keyout', 'key.pem', '-out', 'cert.pem',
        '-days', '365', '-nodes', '-subj', '/CN=localhost'
    ], check=True)
    print("Certificado gerado com sucesso!")

try:
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        # Wrap with SSL
        context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
        context.load_cert_chain('cert.pem', 'key.pem')
        httpd.socket = context.wrap_socket(httpd.socket, server_side=True)
        
        print(f"✅ Servidor HTTPS rodando em https://localhost:{PORT}")
        print("Pressione Ctrl+C para parar")
        httpd.serve_forever()
except FileNotFoundError:
    # Fallback to HTTP if OpenSSL not available
    print("⚠️  OpenSSL não encontrado. Rodando em HTTP...")
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"Servidor HTTP rodando em http://localhost:{PORT}")
        print("Pressione Ctrl+C para parar")
        httpd.serve_forever()

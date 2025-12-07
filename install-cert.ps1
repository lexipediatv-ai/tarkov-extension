# Instalar certificado como confiável no Windows
# Execute este script como Administrador

$certPath = ".\cert.pem"

if (Test-Path $certPath) {
    Write-Host "Instalando certificado como confiável..."
    
    # Importar certificado para o armazenamento de certificados confiáveis
    Import-Certificate -FilePath $certPath -CertStoreLocation Cert:\LocalMachine\Root
    
    Write-Host "✅ Certificado instalado com sucesso!"
    Write-Host "Agora a Twitch deve aceitar o certificado."
    Write-Host "Atualize a página da Twitch e teste novamente."
} else {
    Write-Host "❌ Certificado cert.pem não encontrado!"
    Write-Host "Certifique-se de que o servidor HTTPS está rodando e gerou o certificado."
}

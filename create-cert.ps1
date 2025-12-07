# Generate Self-Signed Certificate for localhost
$cert = New-SelfSignedCertificate -DnsName "localhost" -CertStoreLocation "cert:\LocalMachine\My" -NotAfter (Get-Date).AddYears(1)
$password = ConvertTo-SecureString -String "password" -Force -AsPlainText
Export-PfxCertificate -Cert $cert -FilePath "localhost.pfx" -Password $password
Write-Host "Certificate created: localhost.pfx"
Write-Host "Password: password"

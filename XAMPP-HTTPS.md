# Guia Rápido: Habilitar HTTPS no XAMPP

## Passo 1: Habilite SSL no Apache

1. Abra o **XAMPP Control Panel**
2. Clique em **"Config"** ao lado de **Apache**
3. Selecione **"httpd.conf"**
4. Procure por estas linhas e descomente (remova o #):
   ```
   #LoadModule ssl_module modules/mod_ssl.so
   #Include conf/extra/httpd-ssl.conf
   ```
   Remova o `#` no início de cada linha

5. Salve e feche

## Passo 2: Reinicie o Apache

1. No XAMPP Control Panel
2. Clique em **"Stop"** no Apache
3. Depois clique em **"Start"**

## Passo 3: Teste HTTPS

Acesse: `https://karolmartins.ddns.net/twitch-extension/panel.html`

Provavelmente vai dar aviso de certificado auto-assinado, mas funcionará!

## Passo 4: Configure na Twitch

URI de base: `https://karolmartins.ddns.net/twitch-extension/`

---

## Se já tiver HTTPS configurado:

Apenas use `https://` ao invés de `http://` na configuração da Twitch!

#!/bin/bash

# Create required directories
mkdir -p nginx/conf.d
mkdir -p nginx/sites-enabled
mkdir -p nginx/ssl
mkdir -p nginx/auto-ssl

# Generate fallback SSL certificate
openssl req -new -newkey rsa:2048 -days 3650 -nodes -x509 \
    -subj '/CN=sni-support-required-for-valid-ssl' \
    -keyout nginx/ssl/resty-auto-ssl-fallback.key \
    -out nginx/ssl/resty-auto-ssl-fallback.crt

# Set proper permissions
chmod 755 nginx/conf.d
chmod 755 nginx/sites-enabled
chmod 755 nginx/ssl
chmod 700 nginx/auto-ssl

# Create default nginx configuration
cat > nginx/conf.d/default.conf << 'EOF'
# Default server configuration
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://app:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Install lua-resty-auto-ssl if not already installed
if [ ! -f /usr/local/openresty/lualib/resty/auto-ssl.lua ]; then
    echo "Installing lua-resty-auto-ssl..."
    /usr/local/openresty/luajit/bin/luarocks install lua-resty-auto-ssl
    mkdir -p /etc/resty-auto-ssl
    chown www-data /etc/resty-auto-ssl
fi

echo "Nginx setup completed successfully!"
echo "Make sure to set the following environment variables:"
echo "- DOMAIN: Your domain name"
echo "- SERVER_IP: Your server's public IP address"
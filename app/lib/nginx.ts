import { writeFile } from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';
import { CustomDomain } from '@prisma/client';
import path from 'path';

const execAsync = promisify(exec);

export class NginxManager {
  private sslPath: string;
  private sitesPath: string;
  private nginxUser: string;
  private nginxContainer: string;

  constructor() {
    this.sslPath = process.env.NGINX_SSL_PATH || '/etc/nginx/ssl';
    this.sitesPath = process.env.NGINX_SITES_PATH || '/etc/nginx/sites-available';
    this.nginxUser = process.env.NGINX_USER || 'nginx';
    this.nginxContainer = process.env.NGINX_CONTAINER || 'sailmail_nginx';
  }

  async deployCertificate(domain: CustomDomain) {
    try {
      // Create SSL directory for the domain
      const domainSslPath = path.join(this.sslPath, domain.domain);
      await execAsync(`mkdir -p ${domainSslPath}`);

      // Write certificate files
      await Promise.all([
        writeFile(
          path.join(domainSslPath, 'fullchain.pem'),
          domain.sslCertificate!,
          { mode: 0o644 }
        ),
        writeFile(
          path.join(domainSslPath, 'privkey.pem'),
          domain.sslPrivateKey!,
          { mode: 0o600 }
        ),
      ]);

      // Generate Nginx configuration
      const nginxConfig = this.generateNginxConfig(domain);
      const configPath = path.join(this.sitesPath, `${domain.domain}.conf`);
      await writeFile(configPath, nginxConfig, { mode: 0o644 });

      // Create symlink in sites-enabled (inside the container)
      await this.execInContainer(
        `ln -sf /etc/nginx/sites-available/${domain.domain}.conf /etc/nginx/sites-enabled/`
      );

      // Test Nginx configuration
      await this.testConfig();

      // Reload Nginx
      await this.reload();

      return true;
    } catch (error) {
      console.error('[NGINX_DEPLOY_ERROR]', error);
      throw error;
    }
  }

  private generateNginxConfig(domain: CustomDomain): string {
    return `
server {
    listen 80;
    listen [::]:80;
    server_name ${domain.domain};
    
    # Redirect all HTTP traffic to HTTPS
    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name ${domain.domain};

    ssl_certificate ${path.join(this.sslPath, domain.domain, 'fullchain.pem')};
    ssl_certificate_key ${path.join(this.sslPath, domain.domain, 'privkey.pem')};
    
    # Modern SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # HSTS (uncomment if you're sure)
    # add_header Strict-Transport-Security "max-age=63072000" always;
    
    # OCSP Stapling
    ssl_stapling on;
    ssl_stapling_verify on;
    resolver 8.8.8.8 8.8.4.4 valid=300s;
    resolver_timeout 5s;

    # Proxy to your application
    location / {
        proxy_pass http://app:3000;  # Use Docker service name
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}`;
  }

  private async execInContainer(command: string): Promise<void> {
    try {
      await execAsync(`docker exec ${this.nginxContainer} ${command}`);
    } catch (error) {
      console.error('[NGINX_CONTAINER_EXEC_ERROR]', error);
      throw error;
    }
  }

  private async testConfig() {
    try {
      await this.execInContainer('nginx -t');
      return true;
    } catch (error) {
      console.error('[NGINX_CONFIG_TEST_ERROR]', error);
      throw new Error('Nginx configuration test failed');
    }
  }

  private async reload() {
    try {
      await this.execInContainer('nginx -s reload');
      return true;
    } catch (error) {
      console.error('[NGINX_RELOAD_ERROR]', error);
      throw new Error('Failed to reload Nginx');
    }
  }
} 
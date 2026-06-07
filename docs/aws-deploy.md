# AWS EC2 Deployment Guide — KiyimCRM

## 1. EC2 Instance sozlash

AWS Console → EC2 → Launch Instance:
- **AMI**: Ubuntu 22.04 LTS
- **Instance type**: t3.small (2 vCPU, 2GB RAM) yoki t3.medium
- **Storage**: 20 GB gp3
- **Security Group**:
  - SSH (22) — faqat sizning IP
  - HTTP (80) — 0.0.0.0/0
  - HTTPS (443) — 0.0.0.0/0

---

## 2. Server tayyorlash

```bash
# Server ga SSH orqali ulaning
ssh -i your-key.pem ubuntu@YOUR_EC2_IP

# Yangilanishlar
sudo apt update && sudo apt upgrade -y

# Python, Node, Nginx, Certbot, PostgreSQL
sudo apt install -y python3.12 python3.12-venv python3-pip \
  nodejs npm nginx certbot python3-certbot-nginx \
  postgresql postgresql-contrib git

# Node version manager (ixtiyoriy)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

---

## 3. PostgreSQL sozlash

```bash
sudo -u postgres psql

CREATE USER kiyim_user WITH PASSWORD 'StrongPassword123!';
CREATE DATABASE kiyim_kechak OWNER kiyim_user;
GRANT ALL PRIVILEGES ON DATABASE kiyim_kechak TO kiyim_user;
\q
```

---

## 4. Loyihani yuklash

```bash
cd /opt
sudo mkdir kiyim-crm
sudo chown ubuntu:ubuntu kiyim-crm
cd kiyim-crm

# ZIP ni ko'chirish (local dan)
# Local: scp kiyim-crm.zip ubuntu@YOUR_IP:/opt/kiyim-crm/
unzip kiyim-crm.zip
```

---

## 5. Backend sozlash

```bash
cd /opt/kiyim-crm/backend

python3.12 -m venv venv
source venv/bin/activate

pip install -r requirements.txt

# .env fayl yarating
cat > .env << 'EOF'
DATABASE_URL=postgresql://kiyim_user:StrongPassword123!@localhost:5432/kiyim_kechak
SECRET_KEY=your-super-secret-key-change-this-in-production-$(openssl rand -hex 32)
CORS_ORIGINS=["https://yourdomain.com"]
EOF

# Migratsiya
alembic upgrade head

# Seed
python seed.py
```

---

## 6. Frontend build

```bash
cd /opt/kiyim-crm/frontend

npm install

# .env.production faylini yarating
echo "VITE_API_BASE_URL=https://yourdomain.com" > .env.production

npm run build
# Build natijasi: frontend/dist/
```

---

## 7. Systemd service (Backend)

```bash
sudo nano /etc/systemd/system/kiyimcrm.service
```

```ini
[Unit]
Description=KiyimCRM FastAPI Backend
After=network.target postgresql.service

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/opt/kiyim-crm/backend
Environment="PATH=/opt/kiyim-crm/backend/venv/bin"
EnvironmentFile=/opt/kiyim-crm/backend/.env
ExecStart=/opt/kiyim-crm/backend/venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000 --workers 2
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable kiyimcrm
sudo systemctl start kiyimcrm
sudo systemctl status kiyimcrm
```

---

## 8. Nginx konfiguratsiyasi

```bash
sudo nano /etc/nginx/sites-available/kiyimcrm
```

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Frontend (React build)
    root /opt/kiyim-crm/frontend/dist;
    index index.html;

    # React Router — SPA support
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API proxy
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Swagger docs
    location /docs {
        proxy_pass http://127.0.0.1:8000/docs;
        proxy_set_header Host $host;
    }

    location /openapi.json {
        proxy_pass http://127.0.0.1:8000/openapi.json;
    }

    # Uploads (product images)
    location /uploads/ {
        proxy_pass http://127.0.0.1:8000/uploads/;
    }

    # File upload limit
    client_max_body_size 10M;

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
    gzip_min_length 1000;
}
```

```bash
sudo ln -s /etc/nginx/sites-available/kiyimcrm /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 9. HTTPS (SSL) — Let's Encrypt

```bash
# Domain DNS ni EC2 IP ga ko'rsating, keyin:
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal tekshirish
sudo certbot renew --dry-run

# Cron (agar kerak bo'lsa)
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
```

Certbot Nginx konfiguratsiyasini avtomatik HTTPS ga o'zgartiradi.

---

## 10. IP orqali ishlatish (domain yo'q bo'lsa)

Agar domain yo'q bo'lsa, IP orqali `http://YOUR_EC2_IP` da ishlaydi.

Frontend `.env` ni o'zgartiring:
```
VITE_API_BASE_URL=http://YOUR_EC2_IP
```

---

## 11. Monitoring & Logs

```bash
# Backend logs
sudo journalctl -u kiyimcrm -f

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Postgres logs
sudo tail -f /var/log/postgresql/postgresql-*.log

# Service holati
sudo systemctl status kiyimcrm
sudo systemctl status nginx
```

---

## 12. Yangilanish (Update)

```bash
# Yangi versiyani yuklash
scp kiyim-crm-new.zip ubuntu@YOUR_IP:/tmp/

# Server da
cd /tmp
unzip kiyim-crm-new.zip

# Backend yangilash
cp -r /tmp/kiyim-crm/backend/app /opt/kiyim-crm/backend/
source /opt/kiyim-crm/backend/venv/bin/activate
pip install -r /opt/kiyim-crm/backend/requirements.txt
alembic upgrade head
sudo systemctl restart kiyimcrm

# Frontend yangilash
cd /opt/kiyim-crm/frontend
npm install
npm run build
```

---

## 13. Xavfsizlik tavsiялари

```bash
# UFW firewall
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# PostgreSQL faqat local
sudo nano /etc/postgresql/*/main/pg_hba.conf
# host all all 0.0.0.0/0 reject  (boshqa hostlarni bloklash)

# Fail2ban
sudo apt install fail2ban -y
sudo systemctl enable fail2ban
```

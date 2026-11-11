#!/bin/bash
# EC2 launch template user data (Amazon Linux 2023)
# Replace the <PLACEHOLDERS> before pasting into the launch template.
set -e

dnf install -y nodejs git

# Get the code
cd /opt
git clone https://github.com/<YOUR-GITHUB-USER>/<YOUR-REPO>.git app
cd app
npm install --omit=dev

# Environment file (lab only; use SSM Parameter Store or Secrets Manager later)
cat > /opt/app/.env <<EOF
PORT=3000
DB_HOST=<RDS-ENDPOINT>
DB_PORT=5432
DB_USER=<DB-USERNAME>
DB_PASSWORD=<DB-PASSWORD>
DB_NAME=ecommerce
EOF
chmod 600 /opt/app/.env

# Run the app as a service so it starts on boot and restarts if it crashes
cat > /etc/systemd/system/ecommerce-api.service <<EOF
[Unit]
Description=Ecommerce API
After=network.target

[Service]
WorkingDirectory=/opt/app
ExecStart=/usr/bin/node /opt/app/server.js
Restart=always
User=root

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable --now ecommerce-api

---
description: Comprehensive workflow for deploying the SIMED application to a production environment.
---

# Production Deployment Workflow

This workflow outlines the steps to deploy the SIMED application (Frontend + Backend) to a production server (Windows/Linux).

## Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Process Manager (PM2 recommended) `npm install -g pm2`
- Web Server (Nginx or Apache) - Optional but recommended for reverse proxy

## Phase 1: Backend Setup

1. **Navigate to Backend Directory**
   ```bash
   cd backend
   ```

2. **Install Dependencies**
   ```bash
   npm install --production
   ```

3. **Environment Configuration**
   - Create/Edit `.env` file.
   - Set `NODE_ENV=production`.
   - Update `DATABASE_URL` if using a separate database.
   - Set `CORS_ORIGIN` to your frontend domain (e.g., `http://localhost:80` or `https://yourdomain.com`).

4. **Database Migration**
   ```bash
   npx prisma generate
   npx prisma migrate deploy
   ```

5. **Start Backend Service**
   Use PM2 to keep the process alive.
   ```bash
   pm2 start src/app.js --name "simed-backend"
   pm2 save
   ```

## Phase 2: Frontend Setup

1. **Navigate to Frontend Directory**
   ```bash
   cd ../frontend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Build the Application**
   ```bash
   npm run build
   ```
   *This creates a `dist` folder containing static files.*

## Phase 3: Serving the Application

### Option A: Using a Static File Server (Simple)
1. Install `serve` globally:
   ```bash
   npm install -g serve
   ```
2. Serve the build folder:
   ```bash
   pm2 start "serve -s dist -l 80" --name "simed-frontend"
   ```

### Option B: Using Nginx (Recommended)
Configure Nginx to ignore `/api` (proxy to backend port 3000) and serve static files for other requests.

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        root /path/to/frontend-simed-1/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Maintenance
- **Logs**: `pm2 logs`
- **Restart**: `pm2 restart all`
- **Update**: Pull code -> Install deps -> Rebuild frontend -> Restart PM2.

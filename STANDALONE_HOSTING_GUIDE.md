# ST. MICHAEL GREAT ACADEMY — OFFICIAL RESULT PORTAL
## Complete Standalone Hosting & Migration Guide

This guide provides instructions to deploy, host, and maintain the **St. Michael Great Academy Official Result Portal** independently on any server, hosting service, or local computer without reliance on Google AI Studio.

---

### Table of Contents
1. [Architecture Overview](#1-architecture-overview)
2. [Prerequisites](#2-prerequisites)
3. [Quick Start (Local or Server)](#3-quick-start-local-or-server)
4. [Deployment to Cloud Providers](#4-deployment-to-cloud-providers)
   - [Deploy on Render.com](#a-rendercom-recommended-easy)
   - [Deploy on Railway.app](#b-railwayapp)
   - [Deploy on a Linux VPS (DigitalOcean / AWS / Linode) with PM2](#c-linux-vps-with-pm2)
   - [Deploy on cPanel (Node.js Application Manager)](#d-cpanel-nodejs-app)
5. [Environment Variables Reference](#5-environment-variables-reference)
6. [Database & Storage Architecture](#6-database--storage-architecture)
7. [Backup & Restoration Procedure](#7-backup--restoration-procedure)

---

### 1. Architecture Overview
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, Canvas Confetti
- **Backend API**: Express.js (Node.js runtime)
- **Database Engine**: Dual-mode storage:
  - *Local Mode (Default, Zero-Config)*: High-performance atomic JSON file storage located at `data/db.json`.
  - *Relational Mode (Optional)*: PostgreSQL connection via Drizzle ORM when `DATABASE_URL` is provided.
- **Media & Assets**: Stored under `public/` and served directly with immutable caching.

---

### 2. Prerequisites
- **Node.js**: Version 18.x, 20.x, or 22.x (LTS recommended)
- **npm**: Version 9.x or higher (included with Node.js)
- **Git** (optional, if deploying via Git repository)

Verify installation in your terminal:
```bash
node -v
npm -v
```

---

### 3. Quick Start (Local or Server)

#### Step 1: Extract the Backup Package
Extract `st_michael_great_academy_complete_portal_backup.zip` to your desired directory:
```bash
unzip st_michael_great_academy_complete_portal_backup.zip -d smga-portal
cd smga-portal
```

#### Step 2: Install Dependencies
```bash
npm install
```

#### Step 3: Build the Application
```bash
npm run build
```

#### Step 4: Launch the Portal
```bash
npm start
```
The portal is now running on **`http://localhost:3000`**!

To run in development mode with live hot-reloading:
```bash
npm run dev
```

---

### 4. Deployment to Cloud Providers

#### A. Render.com (Recommended & Very Simple)
1. Sign up at [render.com](https://render.com).
2. Create a new **Web Service**.
3. Connect your Git repository or upload your files.
4. Set the following settings:
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free or Starter
5. Under **Disks** (optional but recommended for persistent file storage), attach a disk to path `/data` so file changes persist across restarts.
6. Click **Deploy Web Service**. Render will assign you a live HTTPS domain (e.g., `smga-portal.onrender.com`), and you can attach your own custom school domain (e.g., `results.stmichaelacademy.edu.ng`).

#### B. Railway.app
1. Sign up at [railway.app](https://railway.app).
2. Create a new project and select **Deploy from GitHub repo**.
3. Railway automatically detects Node.js.
4. Set the Start Command: `node dist/server.cjs` (or `npm start`).
5. Under **Variables**, add:
   - `NODE_ENV=production`
   - `PORT=3000`
6. Click **Generate Domain** or link your custom domain.

#### C. Linux VPS (Ubuntu / Debian / CentOS) with PM2
If hosting on a dedicated Virtual Private Server (VPS):
1. SSH into your VPS:
   ```bash
   ssh root@your_server_ip
   ```
2. Install Node.js 20 and PM2:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   sudo npm install -g pm2
   ```
3. Copy your project folder to `/var/www/smga-portal`.
4. Install dependencies and compile:
   ```bash
   cd /var/www/smga-portal
   npm install
   npm run build
   ```
5. Start the process with PM2 (automatic restart on reboot or crash):
   ```bash
   pm2 start dist/server.cjs --name "smga-portal"
   pm2 startup
   pm2 save
   ```
6. (Optional) Configure Nginx reverse proxy to point port 80/443 to `http://127.0.0.1:3000` with free Let's Encrypt SSL.

#### D. cPanel (Node.js Application Manager)
1. Log in to your school's cPanel.
2. Go to **Setup Node.js App**.
3. Click **Create Application**:
   - **Node.js version**: 18.x or 20.x
   - **Application mode**: Production
   - **Application root**: `public_html/results` or custom directory
   - **Application startup file**: `dist/server.cjs`
4. Upload all project files and run `npm install && npm run build`.
5. Click **Start App**.

---

### 5. Environment Variables Reference

Create a file named `.env` in the root folder if you need custom configurations:

| Variable | Required? | Default | Description |
| :--- | :--- | :--- | :--- |
| `PORT` | Optional | `3000` | Port the web server listens on. Most cloud hosts set this automatically. |
| `NODE_ENV` | Optional | `development` | Set to `production` for live deployments. |
| `DATABASE_URL` | Optional | *(none)* | PostgreSQL connection string (e.g., `postgresql://user:pass@host:5432/dbname`). If omitted, the portal automatically uses the robust file database in `data/db.json`. |
| `GEMINI_API_KEY` | Optional | *(none)* | Only required if you enable AI-assisted auto-remarks or summaries. |

---

### 6. Database & Storage Architecture

The portal stores all records inside `data/db.json` (and in PostgreSQL if configured):
1. **Students**: Registered students with full names, admission/student numbers, classes, and registration dates.
2. **Results**: Subject scores (CA1, CA2, Exam, Total, Grade, Remark), averages, overall grades, teacher remarks, principal remarks, signature names, and publishing status.
3. **PINs**: Result access scratch PINs with status (`UNUSED` / `USED`), student allocations, and activation dates.
4. **Settings**: Official school name, motto, established year, portal title, current academic session, current term, and high-resolution official crest.
5. **Grading Scale**: Score bounds, letter grades (A, B, C, D, E, F), and remarks.
6. **Backgrounds**: Watermark and card backgrounds for printed result sheets.
7. **Security**: Salted and hashed administrator credential.

---

### 7. Backup & Restoration Procedure

#### Creating Backups:
- Download the complete ZIP backup (`st_michael_great_academy_complete_portal_backup.zip`) or database JSON (`st_michael_academy_database_export.json`) anytime from the Admin Panel or directly from `/downloads/`.
- Alternatively, copy the single file `data/db.json` to any safe location (Google Drive, flash drive, external hard disk).

#### Restoring from a Backup:
1. If restoring on a fresh installation, replace the `data/db.json` file with your backup copy.
2. Or in the Admin Panel, go to **Admin Security / System Backup** and click **Restore Database**, selecting your `st_michael_academy_database_export.json` file.
3. All students, results, PINs, and portal configurations will instantly restore without missing a single byte.

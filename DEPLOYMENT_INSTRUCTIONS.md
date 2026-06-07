# 🚀 Joel's Kitchen — Deployment Instructions
## Frontend on Vercel, Backend on Render

This project contains two primary segments:
1. **Frontend (Vite/React)**: Hosted on Vercel as a Single Page Application.
2. **Backend (Node/Express)**: Hosted on Render as a Web Service.

---

## Part 1 — Prepare Your Gmail App Password
The backend sends catering and order emails using Gmail SMTP. You must create an **App Password** for your account:

1. Visit [Google Security Settings](https://myaccount.google.com/security).
2. Enable **2-Step Verification** if you haven't.
3. Search for **"App passwords"**.
4. Generate a new password under the app category **Mail** and device category **Other (Custom name)**: `Joel's Kitchen`.
5. Copy the 16-character code (you will input this as `SMTP_PASS` in your Render Environment Variables).

---

## Part 2 — Deploy Backend to Render

1. Go to [Render Dashboard](https://render.com) and click **New + → Web Service**.
2. Connect your GitHub repository.
3. Configure the following service settings:
   - **Name**: `joels-kitchen-api`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: `Free` (or `Starter` if you want a persistent disk to save database state across restarts).

### Environment Variables
Under the **Environment** tab, click **Add Environment Variable** and enter the following:

| Key | Value |
|---|---|
| `NODE_ENV` | `production` |
| `PORT` | `4000` |
| `FRONTEND_URL` | *(Paste your Vercel URL here once it is deployed in Part 3)* |
| `JWT_SECRET` | *(Click "Generate" to create a secure secret)* |
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | `joelamoh65@gmail.com` |
| `SMTP_PASS` | *(Your 16-character Gmail App Password)* |
| `SMTP_FROM` | `"Joel's Kitchen <joelamoh65@gmail.com>"` |
| `OWNER_EMAIL` | `joelamoh65@gmail.com` |

### Persistent Disk (Optional/Recommended)
Render's **Free Tier** uses ephemeral storage, which resets your `db.json` database files whenever the service sleeps or restarts. To prevent this, upgrade to the **Starter Plan ($7/month)** and configure a disk:
1. Click the **Disks** tab → **Add Disk**.
2. **Name**: `joels-kitchen-data`
3. **Mount Path**: `/opt/render/project/src/backend/data`
4. **Size**: `1 GiB`

Once deployed, copy your backend URL (e.g. `https://joels-kitchen-api.onrender.com`).

---

## Part 3 — Deploy Frontend to Vercel

1. Go to [Vercel](https://vercel.com) and click **Add New → Project**.
2. Import your GitHub repository.
3. Configure the following build settings:
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Vite` (automatically detected)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### Environment Variables
Add the following key-value pair under the variables section:

| Key | Value |
|---|---|
| `VITE_API_URL` | `https://joels-kitchen-api.onrender.com` *(Your Render backend URL)* |

Click **Deploy**. Once Vercel sets up your site, it will give you a live frontend URL (e.g. `https://joel-food-delivery.vercel.app`).

---

## Part 4 — Finalize CORS Configuration
1. Go back to your **Render Dashboard** for `joels-kitchen-api`.
2. Navigate to **Settings → Environment Variables**.
3. Update `FRONTEND_URL` to match your Vercel URL (e.g., `https://joel-food-delivery.vercel.app`).
4. Click **Save** and trigger a **Manual Deploy** on Render so the new security rules take effect.

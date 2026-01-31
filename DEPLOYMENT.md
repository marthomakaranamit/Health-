# Deployment Guide

This guide will help you deploy your Health Record Management System to:
- **Vercel** (Frontend - React/Vite)
- **Render** (Backend - Node.js/Express)
- **MongoDB Atlas** (Cloud Database)

---

## 📋 Prerequisites

1. GitHub account with your project repository
2. Vercel account (free tier available)
3. Render account (free tier available)
4. MongoDB Atlas account (free tier available)

---

## 🗄️ Step 1: Setup MongoDB Atlas

### 1.1 Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account
3. Create a new organization (or use default)
4. Create a new project (e.g., "Health Records Project")

### 1.2 Create a Cluster
1. Click **"Build a Database"**
2. Choose **FREE** (M0) tier
3. Select a cloud provider and region (choose closest to you)
4. Name your cluster (e.g., "Cluster0")
5. Click **"Create"** (takes 3-5 minutes)

### 1.3 Setup Database Access
1. Go to **"Database Access"** in the left sidebar
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Enter username and generate a secure password (SAVE THIS!)
5. Set privileges to **"Atlas admin"** or **"Read and write to any database"**
6. Click **"Add User"**

### 1.4 Setup Network Access
1. Go to **"Network Access"** in the left sidebar
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (for Render deployment)
   - Or add specific IPs: `0.0.0.0/0`
4. Click **"Confirm"**

### 1.5 Get Connection String
1. Go to **"Database"** in the left sidebar
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Copy the connection string (looks like):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<username>` and `<password>` with your database user credentials
6. Add your database name at the end:
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/health_records?retryWrites=true&w=majority
   ```
7. **SAVE THIS CONNECTION STRING** - you'll need it for Render

---

## 🚀 Step 2: Deploy Backend to Render

### 2.1 Prepare Your Repository
1. Make sure your `server` folder is in the root of your GitHub repository
2. Ensure `server/package.json` has a `start` script (already added)
3. Commit and push all changes to GitHub

### 2.2 Create Render Web Service
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account if not already connected
4. Select your repository
5. Configure the service:
   - **Name**: `health-records-api` (or any name you prefer)
   - **Region**: Choose closest to you
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: **Free** (or paid if you prefer)

### 2.3 Add Environment Variables in Render
Click on **"Environment"** tab and add these variables:

```
PORT=10000
MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/health_records?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
FRONTEND_URL=https://your-vercel-app.vercel.app
```

**Important Notes:**
- Replace `MONGO_URI` with your actual MongoDB Atlas connection string
- Replace `JWT_SECRET` with a strong random string (you can generate one online)
- **Don't set FRONTEND_URL yet** - we'll update it after deploying frontend
- For now, you can use: `FRONTEND_URL=http://localhost:5173` temporarily

### 2.4 Deploy
1. Click **"Create Web Service"**
2. Render will start building and deploying your backend
3. Wait for deployment to complete (usually 2-5 minutes)
4. Once deployed, you'll get a URL like: `https://health-records-api.onrender.com`
5. **Copy this URL** - you'll need it for frontend deployment

### 2.5 Test Your Backend
1. Visit `https://your-backend-url.onrender.com/` in your browser
2. You should see: `{"message":"API is running"}`
3. If you see this, your backend is live! ✅

---

## 🎨 Step 3: Deploy Frontend to Vercel

### 3.1 Prepare Your Frontend
1. Update `client/src/utils/api.js` to use environment variable (already done)
2. Make sure your `client` folder is in the root of your GitHub repository
3. Commit and push all changes to GitHub

### 3.2 Create Vercel Project
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### 3.3 Add Environment Variables in Vercel
Click on **"Environment Variables"** and add:

```
VITE_API_URL=https://your-backend-url.onrender.com/api
```

**Important:**
- Replace `your-backend-url.onrender.com` with your actual Render backend URL
- The `/api` at the end is important!

### 3.4 Deploy
1. Click **"Deploy"**
2. Vercel will build and deploy your frontend
3. Wait for deployment (usually 1-2 minutes)
4. Once deployed, you'll get a URL like: `https://health-records.vercel.app`
5. **Copy this URL** - you'll need it to update backend CORS

### 3.5 Update Backend CORS
1. Go back to **Render Dashboard**
2. Open your backend service
3. Go to **"Environment"** tab
4. Update `FRONTEND_URL` to your Vercel URL:
   ```
   FRONTEND_URL=https://health-records.vercel.app
   ```
5. Click **"Save Changes"**
6. Render will automatically redeploy with the new CORS settings

---

## 🔧 Step 4: Update Frontend API Configuration

### 4.1 Update API Utility
The `client/src/utils/api.js` should use environment variable:

```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
```

This is already configured! Vercel will automatically inject `VITE_API_URL` during build.

### 4.2 Verify Environment Variable
1. In Vercel, go to your project
2. Go to **Settings** → **Environment Variables**
3. Make sure `VITE_API_URL` is set correctly
4. If you change it, you need to **redeploy** (go to Deployments → Redeploy)

---

## ✅ Step 5: Final Verification

### 5.1 Test Your Deployed Application
1. Visit your Vercel frontend URL
2. Try to register a new user
3. Try to login
4. Test the dashboard functionality

### 5.2 Common Issues & Solutions

#### Issue: CORS Error
**Solution:**
- Make sure `FRONTEND_URL` in Render matches your Vercel URL exactly (including `https://`)
- No trailing slash in the URL
- Redeploy backend after changing CORS settings

#### Issue: API Not Found (404)
**Solution:**
- Check that `VITE_API_URL` in Vercel includes `/api` at the end
- Format: `https://your-backend.onrender.com/api`
- Redeploy frontend after changing environment variables

#### Issue: MongoDB Connection Error
**Solution:**
- Verify MongoDB Atlas Network Access allows `0.0.0.0/0`
- Check that username/password in connection string are correct
- Make sure database name is included in connection string

#### Issue: JWT Token Errors
**Solution:**
- Make sure `JWT_SECRET` is set in Render environment variables
- Use a long, random string (at least 32 characters)
- Redeploy backend after adding JWT_SECRET

---

## 📝 Environment Variables Summary

### Render (Backend) Environment Variables:
```
PORT=10000
MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/health_records?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
FRONTEND_URL=https://your-vercel-app.vercel.app
```

### Vercel (Frontend) Environment Variables:
```
VITE_API_URL=https://your-backend-url.onrender.com/api
```

---

## 🔄 Updating Your Deployment

### Backend Updates:
1. Push changes to GitHub
2. Render will automatically detect and redeploy
3. Or manually trigger redeploy from Render dashboard

### Frontend Updates:
1. Push changes to GitHub
2. Vercel will automatically detect and redeploy
3. Or manually trigger redeploy from Vercel dashboard

### Environment Variable Changes:
- **Render**: Update in Environment tab → Save → Auto-redeploys
- **Vercel**: Update in Environment Variables → Redeploy manually

---

## 🎉 You're Done!

Your Health Record Management System is now live on:
- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-api.onrender.com`
- **Database**: MongoDB Atlas (cloud)

### Important Notes:
- **Free tiers have limitations:**
  - Render free tier: Services spin down after 15 minutes of inactivity (first request may be slow)
  - Vercel free tier: Generous limits, usually no issues
  - MongoDB Atlas free tier: 512MB storage, sufficient for development/demo

- **For production use:**
  - Consider paid tiers for better performance
  - Add custom domain names
  - Set up monitoring and logging
  - Implement proper error tracking

---

## 🆘 Need Help?

If you encounter issues:
1. Check Render logs: Dashboard → Your Service → Logs
2. Check Vercel logs: Dashboard → Your Project → Deployments → View Function Logs
3. Check browser console for frontend errors
4. Verify all environment variables are set correctly

Good luck with your deployment! 🚀

# Deployment Guide

This guide explains how to deploy the Collaborative Coding Interview Platform to Render.

## Why Render?

- ✅ Excellent WebSocket support (critical for real-time collaboration)
- ✅ Free tier available (750 hours/month)
- ✅ Docker-native deployment
- ✅ Automatic HTTPS certificates
- ✅ Simple deployment from GitHub
- ✅ Better build performance for large npm packages
- ✅ Zero-downtime deployments

## Prerequisites

1. **Create a Render account**: https://render.com/register
2. **GitHub repository**: Your code must be pushed to GitHub
3. **Docker configuration**: The included `Dockerfile` and `render.yaml` are ready to use

## Deployment Steps

### Option 1: Blueprint Deployment (Recommended)

This method uses the included `render.yaml` configuration file.

1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "Prepare for Render deployment"
   git push
   ```

2. **Create Blueprint on Render**:
   - Go to https://render.com/dashboard
   - Click **"New"** → **"Blueprint"**
   - Connect your GitHub account if not already connected
   - Select your repository
   - Render will automatically detect `render.yaml`
   - Click **"Apply"**

3. **Wait for deployment**:
   - Render will build the Docker image
   - Deploy your application
   - Provision HTTPS certificate
   - Your app will be live at: `https://collaborative-coding-platform.onrender.com`

### Option 2: Manual Web Service Deployment

1. **Push your code to GitHub**

2. **Create a new Web Service**:
   - Go to https://render.com/dashboard
   - Click **"New"** → **"Web Service"**
   - Connect your GitHub repository

3. **Configure the service**:
   - **Name**: `collaborative-coding-platform` (or your choice)
   - **Environment**: `Docker`
   - **Region**: Choose closest to your users
   - **Branch**: `main` (or your default branch)
   - **Plan**: `Free`
   - **Docker Context**: `.` (root directory)
   - **Dockerfile Path**: `./Dockerfile`

4. **Advanced Settings** (optional):
   - **Environment Variables**: None required by default
   - **Auto-Deploy**: Enable for automatic deployments on git push

5. **Click "Create Web Service"**

## Configuration

### Blueprint Configuration (`render.yaml`)

The included `render.yaml` file contains:

```yaml
services:
  - type: web
    name: collaborative-coding-platform
    env: docker
    plan: free
    dockerfilePath: ./Dockerfile
    dockerContext: .
    envVars:
      - key: PORT
        value: 8000
```

**Key settings:**
- `type: web`: Web service with HTTP/WebSocket support
- `env: docker`: Uses Docker for deployment
- `plan: free`: Free tier (750 hours/month)
- `dockerfilePath`: Points to our Dockerfile
- `PORT: 8000`: FastAPI runs on port 8000

### Environment Variables

The app works out-of-the-box without additional environment variables. Render automatically:
- Sets the `PORT` environment variable
- Provides HTTPS
- Handles CORS for your domain

## Useful Commands

Since Render is web-based, most operations are done through the dashboard:

| Action | How To |
|--------|--------|
| View logs | Dashboard → Your Service → Logs tab |
| Redeploy | Dashboard → Manual Deploy → Deploy latest commit |
| View metrics | Dashboard → Your Service → Metrics tab |
| Shell access | Dashboard → Shell tab |
| Environment vars | Dashboard → Environment tab |

## Monitoring

### View Logs

1. Go to your service in the Render dashboard
2. Click the **"Logs"** tab
3. Logs update in real-time
4. Use the search box to filter logs

### Check Application Status

1. Dashboard shows service status (Live/Deploying/Failed)
2. **Metrics** tab shows:
   - CPU usage
   - Memory usage
   - Request count
   - Response times

### Health Checks

Render automatically monitors your service:
- Sends HTTP requests to verify the app is running
- Restarts if the app crashes
- Shows downtime in the dashboard

## Scaling

### Free Tier
- 512MB RAM
- 0.1 CPU
- Spins down after 15 minutes of inactivity
- Cold start: ~30 seconds

### Upgrade for Better Performance

```
Starter Plan ($7/month):
- 512MB RAM
- 0.5 CPU
- No spin down
- Zero-downtime deploys
```

To upgrade:
1. Go to your service settings
2. Click **"Plan"** tab
3. Select **"Starter"** or higher tier

## Troubleshooting

### App Won't Start

1. **Check build logs**:
   - Dashboard → Events tab
   - Look for Docker build errors

2. **Check runtime logs**:
   - Dashboard → Logs tab
   - Look for application errors

3. **Common issues**:
   - Missing dependencies in `package.json` or `pyproject.toml`
   - Port mismatch (ensure app uses `PORT` env var or defaults to 8000)
   - Build timeout (upgrade plan if needed)

### WebSocket Connection Issues

- Render fully supports WebSockets on all plans
- Ensure your frontend connects to the correct Render URL
- Check CORS settings if connecting from a different domain
- View browser DevTools → Network → WS tab for connection errors

### Slow Build Times

The first build may take 5-10 minutes due to:
- Installing npm packages (especially large ones like Pyodide ~100MB)
- Installing Python dependencies
- Building the frontend

**Subsequent builds are faster** due to Docker layer caching.

## Cost Optimization

**Free Tier:**
- 750 hours/month (enough for one service running 24/7)
- Automatic spin-down after 15 minutes of inactivity
- Free SSL certificates
- 100GB bandwidth/month

**Tips to stay within free tier:**
- Use only one web service
- Accept cold starts (15-30 seconds after inactivity)
- Monitor usage in Render dashboard

## Updating the Application

Render supports automatic deployments:

### Automatic Deployment (Recommended)

1. **Enable auto-deploy** (should be on by default):
   - Dashboard → Settings → Build & Deploy
   - Ensure "Auto-Deploy" is set to "Yes"

2. **Push changes**:
   ```bash
   git add .
   git commit -m "Update application"
   git push
   ```

3. **Render automatically**:
   - Detects the push
   - Builds new Docker image
   - Deploys with zero downtime (on paid plans)

### Manual Deployment

1. Dashboard → Your Service
2. Click **"Manual Deploy"**
3. Select **"Deploy latest commit"**

## Custom Domain

To use your own domain:

1. **Add domain in Render**:
   - Dashboard → Settings → Custom Domain
   - Click **"Add Custom Domain"**
   - Enter your domain (e.g., `app.yourdomain.com`)

2. **Update DNS**:
   - Add CNAME record pointing to Render URL
   - Render shows exact DNS records needed

3. **SSL Certificate**:
   - Render automatically provisions Let's Encrypt SSL
   - Usually takes 1-2 minutes after DNS propagates

## Production Considerations

**Current Limitations:**
- ⚠️ Uses in-memory storage (sessions lost on restart)
- ⚠️ Free tier spins down after 15 minutes of inactivity
- ⚠️ Single instance = single point of failure

**For Production:**
1. **Upgrade to Starter plan** ($7/month minimum):
   - No spin-down
   - Zero-downtime deploys
   - Better performance

2. **Add persistent storage**:
   - Add Render PostgreSQL or Redis for session storage
   - Modify backend to use database instead of in-memory storage

3. **Security enhancements**:
   - Add authentication/authorization
   - Implement rate limiting
   - Set up environment variables for secrets
   - Add CSP headers

4. **Monitoring & Logging**:
   - Set up alerts for downtime
   - Integrate with monitoring services (e.g., Sentry)
   - Enable detailed logging

5. **CI/CD**:
   - Auto-deploy is built-in
   - Add GitHub Actions for testing before deploy
   - Set up staging environment

## Comparison: Render vs Fly.io

| Feature | Render | Fly.io |
|---------|--------|--------|
| Free Tier | 750hrs/month | 3 VMs, 160GB bandwidth |
| Build Speed | Better for large npm packages | Can timeout on large packages |
| WebSockets | Full support | Full support |
| Deployment | GitHub integration | CLI-based |
| SSL | Automatic | Automatic |
| Ease of Use | Very simple | More complex |

## Support

- 📖 Render Documentation: https://render.com/docs
- 💬 Render Community: https://community.render.com
- 🐛 Report Issues: GitHub Issues

---

**Need Help?** Check the [Render documentation](https://render.com/docs) or reach out to their community forum.

# Deployment Guide

This guide explains how to deploy the Collaborative Coding Interview Platform to Fly.io.

## Why Fly.io?

- ✅ Excellent WebSocket support (critical for real-time collaboration)
- ✅ Free tier available (3 shared VMs, 160GB bandwidth/month)
- ✅ Docker-native deployment
- ✅ Automatic HTTPS certificates
- ✅ Global edge network
- ✅ Simple CLI-based deployment

## Prerequisites

1. **Create a Fly.io account**: https://fly.io/app/sign-up
2. **Install flyctl CLI**:
   ```bash
   # macOS/Linux
   curl -L https://fly.io/install.sh | sh

   # Windows (PowerShell)
   pwsh -Command "iwr https://fly.io/install.ps1 -useb | iex"
   ```

3. **Authenticate with Fly.io**:
   ```bash
   fly auth login
   ```

## Deployment Steps

### 1. Launch the Application

From the project root directory:

```bash
fly launch
```

**Important**: When prompted:
- ❌ **Do NOT** let Fly.io create a Dockerfile (we already have one)
- ✅ **Accept** the app name suggestion or provide your own
- ✅ **Choose** a region close to your users
- ❌ **Do NOT** add a PostgreSQL database (we use in-memory storage)
- ❌ **Do NOT** add a Redis database

### 2. Deploy the Application

```bash
fly deploy
```

This will:
1. Build the Docker image
2. Push it to Fly.io's registry
3. Deploy to your chosen region
4. Automatically provision HTTPS

### 3. Open Your Application

```bash
fly open
```

Your app will be available at: `https://your-app-name.fly.dev`

## Configuration

### App Configuration (`fly.toml`)

The `fly.toml` file contains the deployment configuration:

```toml
app = "collaborative-coding-interview"
primary_region = "iad"

[http_service]
  internal_port = 8000
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 0

[[vm]]
  memory = '1gb'
  cpu_kind = 'shared'
  cpus = 1
```

**Key settings:**
- `internal_port = 8000`: FastAPI runs on port 8000
- `force_https = true`: Redirects HTTP to HTTPS
- `auto_stop_machines = true`: Stops machines when idle (saves costs)
- `min_machines_running = 0`: Can scale down to zero on free tier

### Environment Variables

The app automatically detects Fly.io deployment via the `FLY_APP_NAME` environment variable and adjusts CORS settings accordingly.

## Useful Commands

| Command | Description |
|---------|-------------|
| `fly status` | Check app status |
| `fly logs` | View application logs |
| `fly logs -f` | Stream logs in real-time |
| `fly ssh console` | SSH into the container |
| `fly scale count 1` | Scale to 1 machine |
| `fly scale count 0` | Scale down to 0 (stop app) |
| `fly info` | Show app information |
| `fly dashboard` | Open Fly.io dashboard |

## Monitoring

### View Logs

```bash
# View recent logs
fly logs

# Stream logs in real-time
fly logs -f

# Filter logs
fly logs --region iad
```

### Check Application Status

```bash
fly status
```

## Scaling

### Scale Vertically (More Resources)

```bash
# Increase memory
fly scale memory 2048

# Change VM type
fly scale vm shared-cpu-2x
```

### Scale Horizontally (More Machines)

```bash
# Add more machines
fly scale count 2

# Scale to multiple regions
fly regions add lhr
fly scale count 2
```

## Troubleshooting

### App Won't Start

1. Check logs:
   ```bash
   fly logs
   ```

2. Verify health checks are passing:
   ```bash
   fly status
   ```

3. SSH into the container:
   ```bash
   fly ssh console
   ```

### WebSocket Connection Issues

- Ensure the Fly.io region is close to your users
- Check that `force_https = true` is set in `fly.toml`
- Verify WebSocket connections in browser DevTools

### Out of Memory

Increase VM memory:
```bash
fly scale memory 2048
```

## Cost Optimization

**Free Tier Limits:**
- 3 shared-cpu-1x VMs (256MB RAM)
- 160GB outbound data transfer/month
- Automatic HTTPS certificates

**Tips to stay within free tier:**
- Use `auto_stop_machines = true` to stop when idle
- Set `min_machines_running = 0` to scale down completely
- Monitor usage in the Fly.io dashboard

## Updating the Application

After making changes to your code:

```bash
# Commit your changes
git add .
git commit -m "Update application"

# Deploy updated version
fly deploy
```

## Custom Domain

To use your own domain:

```bash
# Add custom domain
fly certs create yourdomain.com

# Add DNS records (shown in output)
```

## Cleanup

To delete the application:

```bash
fly apps destroy your-app-name
```

## Production Considerations

**Current Limitations:**
- ⚠️ Uses in-memory storage (sessions lost on restart)
- ⚠️ Single machine = single point of failure

**For Production:**
1. Add persistent storage (Redis/PostgreSQL) for sessions
2. Scale to multiple machines for redundancy
3. Add monitoring and alerts
4. Implement rate limiting
5. Add authentication/authorization
6. Set up CI/CD pipeline

## Support

- 📖 Fly.io Documentation: https://fly.io/docs
- 💬 Fly.io Community: https://community.fly.io
- 🐛 Report Issues: GitHub Issues

---

**Need Help?** Check the [Fly.io documentation](https://fly.io/docs) or reach out to their community forum.

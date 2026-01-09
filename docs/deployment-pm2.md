# PM2 Production Setup Guide

## Overview
PM2 configuration for scalable, production-ready deployment of Task Flow API.

## Scalability Features

### Cluster Mode
- **Instances**: Set to `'max'` to use all available CPU cores
- **Load Balancing**: Automatic round-robin load balancing
- **Zero-Downtime**: Reload without dropping connections

### Performance Configuration
```javascript
instances: 'max',           // Use all CPU cores
exec_mode: 'cluster',       // Enable cluster mode
max_memory_restart: '1G',   // Auto-restart if memory exceeds 1GB
min_uptime: '10s',          // Minimum uptime before considering stable
max_restarts: 10,           // Maximum restart attempts
```

## Monitoring

### Real-time Monitoring
```bash
pm2 monit                   # Live monitoring dashboard
pm2 status                  # Quick status overview
pm2 list                    # Detailed process list
```

### Logs
```bash
pm2 logs                    # Stream all logs
pm2 logs --lines 100        # Last 100 lines
pm2 logs --err              # Only error logs
pm2 flush                   # Clear logs
```

### Metrics
```bash
pm2 describe task-flow-api  # Detailed metrics
pm2 show task-flow-api      # Full process info
```

## Scaling Commands

### Manual Scaling
```bash
# Scale to specific number of instances
pm2 scale task-flow-api 4

# Scale up by 2 instances
pm2 scale task-flow-api +2

# Scale down by 1 instance
pm2 scale task-flow-api -1
```

### Zero-Downtime Updates
```bash
# Deploy new version without downtime
npm run build
pm2 reload task-flow-api

# Graceful reload (wait for connections to close)
pm2 gracefulReload task-flow-api
```

## Performance Tips

1. **CPU Cores**: The API automatically uses all available cores
2. **Memory**: Each instance has 1GB memory limit (auto-restart if exceeded)
3. **Load Distribution**: PM2 distributes requests evenly across instances
4. **Health Checks**: Automatic restart on crashes (max 10 attempts)

## Troubleshooting

### High CPU Usage
```bash
# Check which instance is consuming resources
pm2 monit

# Reduce instances if needed
pm2 scale task-flow-api 2
```

### Memory Issues
```bash
# Check memory usage per instance
pm2 status

# Restart all instances
pm2 restart all
```

### Process Crashes
```bash
# View error logs
pm2 logs --err

# Check process details
pm2 describe task-flow-api
```

## Best Practices

1. **Always use cluster mode** for production (already configured)
2. **Monitor logs regularly** for early warning signs
3. **Set appropriate memory limits** based on your server capacity
4. **Use `pm2 reload`** instead of `restart` for zero-downtime updates
5. **Enable PM2 startup** to auto-start on server reboot (configured automatically)

## Advanced Configuration

Edit `ecosystem.config.js` to customize:

```javascript
{
  instances: 4,              // Fixed number of instances
  max_memory_restart: '2G',  // Higher memory limit
  cron_restart: '0 0 * * *', // Daily restart at midnight
  node_args: '--max-old-space-size=2048', // Node.js flags
}
```

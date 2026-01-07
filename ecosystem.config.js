module.exports = {
  apps: [{
    name: 'task-flow-api',
    script: './dist/server.js',
    
    // Use all available CPU cores for load balancing
    instances: 'max',
    exec_mode: 'cluster',
    
    // Performance & Reliability
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    min_uptime: '10s',
    max_restarts: 10,
    
    // Environment variables
    env: {
      NODE_ENV: 'development',
    },
    env_production: {
      NODE_ENV: 'production',
    },
    
    // Logging
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    merge_logs: true,
    
    // Advanced PM2 features
    listen_timeout: 10000,
    kill_timeout: 5000,
    wait_ready: true,
    
    // Graceful shutdown
    shutdown_with_message: true,
  }],
};


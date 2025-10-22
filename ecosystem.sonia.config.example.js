module.exports = {
  apps: [{
    name: 'sonia-platform',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/sonia',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3020,
    },
    env_file: '.env',
    error_file: '/root/.pm2/logs/sonia-platform-error.log',
    out_file: '/root/.pm2/logs/sonia-platform-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
}

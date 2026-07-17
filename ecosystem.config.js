module.exports = {
  apps: [
    {
      name: 'blog',
      script: 'node_modules/.bin/next',
      args: 'start',
      cwd: '/root/blog',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        SITE_URL: 'https://x1anyu.top',
      },
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      error_file: '/root/blog/logs/err.log',
      out_file: '/root/blog/logs/out.log',
      log_file: '/root/blog/logs/combined.log',
      time: true,
    },
  ],
};

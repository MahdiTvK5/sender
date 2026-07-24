/**
 * پیکربندی PM2 برای اجرای پایدار روی سرور.
 * اجرا:  pm2 start ecosystem.config.cjs
 * وضعیت: pm2 status   |   لاگ: pm2 logs config-share
 */
module.exports = {
  apps: [
    {
      name: "config-share",
      script: "node_modules/next/dist/bin/next",
      args: "start",
      cwd: __dirname,
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        PORT: process.env.PORT || 3000,
      },
    },
  ],
};

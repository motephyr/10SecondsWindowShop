module.exports = {
  apps: [
    {
      name: '10SecondsWindowShop',
      script: 'server.js',
      log_date_format: 'YYYY/MM/DD HH:mm:ss',
      watch: true,
      env: {
        NODE_OPTIONS: '--inspect'
      }
    }
  ]
}

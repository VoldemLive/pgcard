module.exports = {
  apps : [{
    name: 'istok',
    script: 'app.js',
    cwd:'/nodeapp/istok/',
    instances: 1,
    autorestart: true,
    watch: ["app_modules", "scripts", "app.js", "config.js"],
    max_memory_restart: '1500M',
    watch_delay:100,
  }],
};

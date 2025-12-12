module.exports = {
    apps: [{
        name: 'fallonava-backend',
        script: 'src/app.js',
        cwd: 'backend',
        instances: 1,
        autorestart: true,
        watch: false,
        max_memory_restart: '1G',
        env: {
            NODE_ENV: 'production',
            PORT: 3000
        }
    }]
};

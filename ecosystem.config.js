module.exports = {
    // PM2 Run Configuration
    apps: [
        {
            name: "GatherTSPTown",
            script: "./index.js",
            env: {
                NODE_PORT: 2002
            }
        }
    ],

    // Deployment Configuration
    deploy: {
        tsp: {
            user: 'fil',
            host: 'TSPServer',
            ref: 'origin/main',
            repo: 'git@github.com:thespielplatz/gather-tsp-town.git',
            path: '/home/pm2/gather-tsp-town',
            'post-deploy': 'npm install; PM2_HOME=/home/pm2/.pm2/ pm2 restart ecosystem.config.js',
        },
    }
}

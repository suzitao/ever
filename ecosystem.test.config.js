module.exports = {
    /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
    apps: [

    // pm2 start ecosystem.config.js --env production
        {
            name: 'everfast_test',
            script: './build/main.js',
            env: {
                HOST: '0.0.0.0',
                PORT: 3000,
                NODE_ENV: 'production',
                EVERFAST_ENV: 'test'
            }
        }
    ]
}

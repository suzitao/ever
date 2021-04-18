module.exports = {
    srcDir: 'client/',
    /*
     ** Headers of the page
     */
    head: {
        title: 'everfast',
        titleTemplate: '%s - EVERFAST极速快递',
        meta: [
            { charset: 'utf-8' },
            { hid: 'keywords', name: 'keywords', content: '极速快递,everfast' },
            { hid: 'description', name: 'description', content: '极速快递,everfast' }
        ],
        script: [
            { src: 'https://hm.baidu.com/hm.js?dfccccc89b199c73f38d99eaf5e3b81c' }
        ],
        link: [
            { rel: 'shortcut icon', type: 'image/x-icon', href: '/favicon.ico' },
            { rel: 'stylesheet', href: '/css/common.css' },
            { rel: 'stylesheet', href: 'https://unpkg.com/element-ui@2.0.11/lib/theme-chalk/index.css' }
        ]
    },
    css: [
        { src: '~assets/css/element-custom-style.less', lang: 'less' }
    ],
    loading: {
        color: '#20a0ff'
    },

    plugins: [
        '~/plugins/baiduTj', // 百度统计
        '~/plugins/element',
        '~/plugins/message',
        '~/plugins/area-alert'
    ],

    router: {
        middleware: ['ssr-cookie']
    },

    render: {
        resourceHints: false,
        bundleRenderer: {
            cache: require('lru-cache')({
                max: 1000,
                maxAge: 1000 * 60 * 15
            })
        }
    },

    build: {
        vendor: ['axios'],
        extractCSS: true,
        publicPath: '/_static/',
        /*
         ** Run ESLINT on save
         */
        extend (config, ctx) {
            if (ctx.isClient) {
                config.module.rules.push({
                    enforce: 'pre',
                    test: /\.(js|vue)$/,
                    loader: 'eslint-loader',
                    exclude: /(node_modules)/
                })
            }
        }
    }
}

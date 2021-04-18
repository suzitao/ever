
const getConfig = (EVERFAST_ENV) => {
    if (EVERFAST_ENV === 'production') return require('./config.pro').default
    else if (EVERFAST_ENV === 'test') return require('./config.test').default
    else if (EVERFAST_ENV === 'test2') return require('./config.test2').default
    else return require('./config.dev').default
}

export default getConfig(process.env.EVERFAST_ENV)


import redis from 'redis'
import bluebird from 'bluebird'
import config from '../../config'

bluebird.promisifyAll(redis.RedisClient.prototype)
bluebird.promisifyAll(redis.Multi.prototype)

const { host, port, password, prefix } = config.redis
const client = redis.createClient({ host, port, password, prefix })

client.on('error', function (err) {
    console.log('Redis Error ' + err)
})

export default client

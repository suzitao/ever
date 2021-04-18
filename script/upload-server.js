const path = require('path')
const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs'))
const Client = require('ssh2-sftp-client')

async function putDir (client, dir, remote) {
    remote = path.join(remote, path.basename(dir))

    const [list] = await Promise.all([
        fs.readdirAsync(dir),
        client.mkdir(remote, true)
    ])
    await Promise.all(list.map(async file => {
        const filePath = path.join(dir, file)
        const stats = await fs.statAsync(filePath)
        if (stats.isFile()) {
            const remoteFilePath = path.join(remote, file)
            const s = +new Date()
            await client.put(filePath, remoteFilePath, [true], 'utf8')
            console.log(new Date(), `put ${remoteFilePath} ${+new Date() - s}ms`)
        } else if (stats.isDirectory()) {
            await putDir(client, filePath, remote)
        }
    }))
}

async function main (params) {
    const sftp = new Client()
    await sftp.connect({
        host: '',
        port: '22',
        username: '',
        password: ''
    })

    try {
        await Promise.all([
            putDir(sftp, path.join(__dirname, '../.nuxt/'), '/root/everfast'),
            putDir(sftp, path.join(__dirname, '../build/'), '/root/everfast')
        ])
    } finally {
        await sftp.end()
    }
}

main()
    .catch(err => console.warn(err))

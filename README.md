# everfast

> Nuxt.js project

## Build Setup

``` bash
# install dependencies
$ npm install # Or yarn install

# serve with hot reload at localhost:3000
$ npm run dev

# build for production and launch server
$ npm start
```

For detailed explanation on how things work, checkout the [Nuxt.js docs](https://github.com/nuxt/nuxt.js).

## Backpack

We use [backpack](https://github.com/palmerhq/backpack) to watch and build the application, so you can use the latest ES6 features (module syntax, async/await, etc.).

## 服务器 [everfast.ca](47.88.51.245)

### nginx
配置文件 `/etc/nginx/nginx.conf`

*TODO https*

### pm2
`pm2 list` 查看当前pm2任务

`pm2 start taskName`

`pm2 restart taskName`

`pm2 stop taskName`

`pm2 save` 保存当前所有任务

| name | descption | 启动脚本 | 备注 |
| --- | --- | --- | --- |
| everfast | everfast正式 nodejs服务端 | 
| npm | everfast测试 nodejs服务端 |

### docker
`docker ps` 查看当前正在运行的容器

`docker ps -a` 查看所有容器

`docker start containerID` 启动docker容器

`docker stop containerID` 关闭docker容器

| name | descption | container ID | 创建命令 | 备注
| --- | --- | --- | --- | --- |
| some-redis4 | redis,内存式key-value数据库|0de49e62ebf0||重启后所有数据丢失(TODO: 数据持久化)
| some-mongo | mongo数据库 |73244c61cbdf||数据储存在`/data/mongo_data/`，若无法重启，请删除`/data/mongo_data/mongod.lock`

create redis instance in docker
`docker run -p 6379:6379 --name redis -d --restart=always redis redis-server --requirepass "suzitao"`
create mongo instance in docker
`docker run -p 27017:27017 --name mongo -d --restart=always -v /data/mongo/db:/data/db mongo --auth`

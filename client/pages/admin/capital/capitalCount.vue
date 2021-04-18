<template>
    <div>
        <el-row :gutter="10">
            <el-col :span="6" v-for="(item, i) in list" :key="i">
                <el-card class="box-card">
                    <div slot="header">
                        <div>{{item.label[0]}}</div>
                        <div class="time">{{item.label[1]}}</div>
                    </div>
                    <div v-loading="item.loading" class="text item">{{item.value}}</div>
                </el-card>
            </el-col>
        </el-row>
    </div>
</template>
<style>
.time {
    font-size: 13px;
    color: #999;
}

.text {
    font-size: 14px;
    height: 20px;
    padding-top: 10px;
}

.clearfix:before,
.clearfix:after {
    display: table;
    content: "";
}

.clearfix:after {
    clear: both
}
</style>
<script>
import { httpGet } from '~/plugins/axios'

export default {
    head: {
        title: '资金汇总信息'
    },
    data () {
        return {

            list: [
                {
                    label: ['客户存款', '账户余额'],
                    value: '',
                    loading: false,
                    filter: data => 'CAD ' + data.toFixed(2),
                    api: '/api/admin/user/totalBalance'
                },
                {
                    label: ['客户欠款', '账户赊欠'],
                    value: '',
                    loading: false,
                    filter: data => 'CAD ' + (Number(data) * -1).toFixed(2),
                    api: '/api/admin/user/totalDebts'
                },
                {
                    label: ['未付订单', '含预付关税'],
                    value: '',
                    loading: false,
                    filter: data => 'CAD ' + data.toFixed(2),
                    api: '/api/admin/orders/countFreightNotPaid'
                },
                {
                    label: ['未付关税', '仅后付关税'],
                    value: '',
                    loading: false,
                    filter: data => 'CNY ' + data.toFixed(2),
                    api: '/api/admin/orders/countTariffNotPaid'
                }
            ]
        }
    },
    async mounted () {
        this.list.forEach(async item => {
            try {
                item.loading = true
                const data = await httpGet(item.api)
                item.value = item.filter(data)
            } catch (e) {
                this.$message.error(e.message)
            } finally {
                item.loading = false
            }
        })
    }
}
</script>

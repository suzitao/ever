<template>
    <div class="home-wallet">
        <div class="home-wallet-banner" v-if="accountAmount < 0">
            <div>账户欠款</div>
            <div class="money">$ {{accountAmount * -1}}</div>
        </div>
        <div class="home-wallet-banner" v-if="accountAmount >= 0">
            <div>账户余额</div>
            <div class="money">$ {{accountAmount}}</div>
        </div>
        <el-table :data="list" border style="width: 100%"  v-loading="loading">
            <el-table-column prop="capitalDetailNumber" label="流水号" width="130">
            </el-table-column>
            <el-table-column prop="order" label="对应订单" width="92">
                <template slot-scope="scope">
                    <nuxt-link :to="'/home/order/' + scope.row.order._id" v-if="scope.row.order">{{scope.row.order.orderNumber}}</nuxt-link>
                </template>
            </el-table-column>
            <el-table-column prop="amount" label="金额" width="100" show-overflow-tooltip>
            </el-table-column>
            <el-table-column prop="balance" label="账户余额" width="100" show-overflow-tooltip>
            </el-table-column>
            <el-table-column prop="recordType" label="类型" width="80" :formatter="row => capitalDetailRecordTypeList[row.recordType]" show-overflow-tooltip>
            </el-table-column>
            <el-table-column prop="occurMethod" label="方式" width="100" :formatter="row => paymentMethodList[row.occurMethod]" show-overflow-tooltip>
            </el-table-column>
            <el-table-column prop="createTime" label="时间" width="160" :formatter="row => row.createTime && formatDate(new Date(row.createTime), 'yyyy/MM/dd HH:mm:ss')">
            </el-table-column>
            <el-table-column prop="illustration" label="说明" show-overflow-tooltip>
            </el-table-column>
        </el-table>
    
        <div class="toolbar">
            <el-pagination class="pager-block" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="pageNo" :page-sizes="pageSizes" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
            </el-pagination>
        </div>
    
    </div>
</template>
<style lang="less">
.home-wallet {

    .home-wallet-banner {
        font-size: 12px; // height: 100px;
        // line-height: 100px;
        border-bottom: solid 2px #b33131;
        margin-bottom: 20px;

        .money {
            color: #b33131;
            font-size: 30px;
        }
    }
}
</style>
<script>
import { httpGet } from '~/plugins/axios'
import pageMixins from '~/mixins/pageMixins'
import { formatDate } from '~/plugins/tool'
import capitalDetail from '~/mixins/capitalDetail'
import paymentMethod from '~/mixins/paymentMethod'

export default {
    mixins: [pageMixins(), capitalDetail, paymentMethod],

    async asyncData ({ error }) {
        try {
            const { accountAmount } = await httpGet(`/api/users/user/accountAmount`)
            return { accountAmount }
        } catch (err) {
            error({ statusCode: 404, message: err.message })
        }
    },
    data () {
        return {
            label: '我的钱包'
        }
    },
    methods: {
        formatDate,
        onQueryList (params) {
            return httpGet(`/api/users/capitalDetail`, params)
        },
        async getAccountAmount () {
            try {
                const { accountAmount } = await httpGet(`/api/users/user/accountAmount`)
                this.accountAmount = accountAmount
            } catch (e) {
                this.$message.error(e.message)
            } finally {
            }
        }
    },

    mounted () {
        this.queryList()
    }
}
</script>

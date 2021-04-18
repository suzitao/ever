<template>
    <div>
        <div class="toolbar">
            <div style="display: inline-block; width: 400px">
                <el-input placeholder="用户ID" v-model="recalCulationId" size="small">
                    <el-button @click="recalCulation" slot="append" :loading="recalCulationLoading">重算</el-button>
                </el-input>
            </div>
            <div style="display: inline-block; float: right; width: 400px">
                <el-input placeholder="输入用户名/真实姓名/E-mail搜索" v-model="searchFormInput.mixSearch" size="small" @keyup.enter.native="search">
                    <el-button @click="search" slot="append" icon="el-icon-search"></el-button>
                </el-input>
            </div>
        </div>

        <el-table :data="list" border @row-dblclick="row => openUrl(`/admin/customer/-10-90/${row._id}`)" v-loading="loading">
            <el-table-column min-width="250" label="ID" prop="_id">
            </el-table-column>
            <el-table-column min-width="150" label="用户名" prop="username">
                <template slot-scope="scope">
                    <nuxt-link target="_blank" :to="'/admin/customer/-10-90/' + scope.row._id">{{scope.row.username}}</nuxt-link>
                </template>
            </el-table-column>
            <el-table-column min-width="150" label="真实姓名" prop="realname">
            </el-table-column>
            <el-table-column min-width="120" label="手机号码" prop="cellphoneNumber">
            </el-table-column>
            <el-table-column min-width="233" label="E-mail" prop="email">
            </el-table-column>
            <el-table-column width="75" label="状态" prop="status">
                <template slot-scope="scope">
                    <status-tag :status="scope.row.status"/>
                </template>
            </el-table-column>
            <el-table-column min-width="100" label="账户余额" prop="accountAmount">
            </el-table-column>
            <el-table-column min-width="100" label="充值/提现" prop="rechangeAmount">
            </el-table-column>
            <el-table-column min-width="100" label="已支付运费" prop="orderAmount">
            </el-table-column>
            <el-table-column min-width="100" label="已支付关税" prop="orderTraffic">
            </el-table-column>
            <el-table-column min-width="100" label="差额" prop="amountDifference">
                <template slot-scope="scope">
                    <span style="color:red;font-weight:bold;" v-if="getamountDifferent(scope.row)">{{getamountDifferent(scope.row)}}</span>
                    <span v-else>{{getamountDifferent(scope.row)}}</span>
                </template>
            </el-table-column>
            <el-table-column width="200px" label="操作">
                <template slot-scope="scope">
                    <el-button type="text" @click="openUrl(`/admin/customer/10/${scope.row._id}`)">待收货运单</el-button>
                    <el-button type="text" @click="openUrl(`/admin/customer/-10-90/${scope.row._id}`)">已收货运单</el-button>
                </template>
            </el-table-column>
        </el-table>
    
        <div class="toolbar toolbar-pager" v-if="list.length > 0">
            <el-pagination class="pager-block" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="pageNo" :page-sizes="pageSizes" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
            </el-pagination>
        </div>
    </div>
</template>
<script>
import { httpGet } from '~/plugins/axios'
import { extend, openUrl } from '~/plugins/tool'
import pageMixins from '~/mixins/pageMixins'
import ConfirmButton from '~/components/ConfirmButton'
import StatusTag from '~/components/tag/StatusTag'

export default {
    mixins: [pageMixins()],
    components: { ConfirmButton, StatusTag },
    data () {
        return {
            recalCulationId: '',
            recalCulationLoading: false
        }
    },

    methods: {
        openUrl,
        getamountDifferent (row) {
            return Number((row.rechangeAmount - row.orderAmount - row.orderTraffic - row.accountAmount).toFixed(2))
        },
        async onQueryList (params) {
            extend(params, {isAdmin: false, isCustomerList: true})
            return httpGet(`/api/admin/user`, params)
        },
        async recalCulation () {
            if (!this.recalCulationId) return
            await this.$confirm(`确认重算${this.recalCulationId}的余额记录`, '提示', {
                type: 'warning'
            })
            this.recalCulationLoading = true
            try {
                await httpGet(`/api/admin/user/${this.recalCulationId}/recalCulation`)
                await this.$alert(`重算成功,用户ID:${this.recalCulationId}`)
            } catch (e) {
                this.$message.error(e.message)
            } finally {
                this.recalCulationLoading = false
            }
        }
    },
    mounted () {
        this.queryList()
    }
}
</script>

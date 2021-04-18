<template>
    <div>
        <div class="toolbar">
            <div style="display: inline-block; float: right; width: 400px">
                <el-input placeholder="运单号/收件人姓名/收件人手机号码/发件人姓名/发件人手机号码" v-model="searchFormInput.mixSearch" size="small" @keyup.enter.native="search">
                    <el-button @click="search" slot="append" icon="el-icon-search">
                    </el-button>
                </el-input>
            </div>
        </div>
        <el-table :data="list" border  v-loading="loading">
            <el-table-column prop="orderNumber" label="运单号" width="145px">
            </el-table-column>
            <el-table-column prop="transhipmentExpressNumber" label="国内运单号">
            </el-table-column>
            <el-table-column prop="state" label="状态" width="75">
                <template slot-scope="scope">
                    <order-state-tag :state="scope.row.state"/>
                </template>
            </el-table-column>
            <el-table-column prop="branch" label="店铺" width="160px" :formatter="row => row.branch && row.branch.name || ''">
            </el-table-column>
            <el-table-column prop="line" label="线路" width="110px" :formatter="row => row.line && row.line.name || ''">
            </el-table-column>
            <el-table-column prop="recipientName" label="收件人" width="180px">
            </el-table-column>
            <el-table-column prop="amount" label="费用总额" width="100px">
            </el-table-column>
            <el-table-column prop="createTime" label="下单时间" width="180px" :formatter="formateCreateTime">
            </el-table-column>
        </el-table>
        <div class="toolbar toolbar-pager" v-if="list.length > 0">
            <el-pagination class="pager-block" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="pageNo" :page-sizes="pageSizes" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
            </el-pagination>
        </div>
    </div>
</template>
<script>
import pageMixins from '~/mixins/pageMixins'
import { httpGet } from '~/plugins/axios'
import { extend, formatDate } from '~/plugins/tool'
import OrderStateTag from '~/components/tag/OrderStateTag'

export default {
    mixins: [pageMixins()],
    components: { OrderStateTag },
    methods: {
        async onQueryList (params) {
            extend(params, { state: 'ALL' })
            return httpGet(`/api/admin/ordersAll`, params)
        },
        formateCreateTime (row) {
            return row.createTime && formatDate(new Date(row.createTime), 'yyyy/MM/dd HH:mm')
        }
    },
    mounted () {
        this.queryList()
    }
}
</script>

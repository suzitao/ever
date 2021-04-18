<template>
    <div>
        <div class="toolbar">
            <div style="display: inline-block; float: right; width: 400px">
                <el-input placeholder="请输入客户用户名或实名搜索" v-model="searchFormInput.mixSearch" size="small" @keyup.enter.native="search">
                    <el-button @click="search" slot="append" icon="el-icon-search"></el-button>
                </el-input>
            </div>
        </div>

        <el-table :data="list" border v-loading="loading">
            <el-table-column label="客户" prop="account" min-width="200" :formatter="row => row.account.username + `(${row.account.realname})`">
            </el-table-column>
            <el-table-column label="网点" prop="branch.name" width="180">
            </el-table-column>
            <el-table-column label="金额" prop="balanceChangeAmount" width="120">
            </el-table-column>
            <el-table-column label="账户余额" prop="balance" width="120">
            </el-table-column>
            <el-table-column label="类型" prop="recordType" width="120" :formatter="row => capitalDetailRecordTypeList[row.recordType]">
            </el-table-column>
            <el-table-column label="方式" prop="occurMethod" width="120" :formatter="row => paymentMethodList[row.occurMethod]">
            </el-table-column>
            <el-table-column label="时间" prop="createTime" width="180" :formatter="row => row.createTime && formatDate(new Date(row.createTime), 'yyyy/MM/dd HH:mm:ss')">
            </el-table-column>
            <el-table-column label="说明" prop="illustration" min-width="300">
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
import pageMixins from '~/mixins/pageMixins'
import { formatDate } from '~/plugins/tool'
import capitalDetail from '~/mixins/capitalDetail'
import paymentMethod from '~/mixins/paymentMethod'
import ConfirmButton from '~/components/ConfirmButton'

export default {
    mixins: [pageMixins(), capitalDetail, paymentMethod],
    components: { ConfirmButton },
    data () {
        return {
        }
    },

    methods: {
        formatDate,
        async onQueryList (params) {
            return httpGet(`/api/admin/capitalDetail/rechange`, params)
        }
    },
    mounted () {
        this.queryList()
    }
}
</script>

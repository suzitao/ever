<template>
    <el-dialog size="small" title="选择物品" :visible.sync="dialogVisible" :before-close="close" width="800px">
        <el-table :data="list"  v-loading="loading" @selection-change="handleSelectionChange" ref="table">
            <el-table-column type="selection" width="55">
            </el-table-column>
            <el-table-column label="物品名称" prop="name">
            </el-table-column>
            <el-table-column label="品牌" prop="brand">
            </el-table-column>
            <el-table-column label="申报单价($)" prop="valueDeclared" width="150">
            </el-table-column>
            <el-table-column label="规格" prop="measurementUnit" width="150">
            </el-table-column>
        </el-table>
    
        <el-pagination class="pager" layout="prev, next" :total="total" :page-size="pageSize" @current-change="handleCurrentChange">
        </el-pagination>
    
        <span slot="footer" class="dialog-footer">
            <el-button size="small" @click="close">取 消</el-button>
            <el-button size="small" type="primary" @click="handleConfirm" :disabled="selection.length === 0">确 定</el-button>
        </span>
    </el-dialog>
</template>
<script>
import pageMixins from '~/mixins/pageMixins'

import { httpGet } from '~/plugins/axios'

export default {
    mixins: [pageMixins()],
    data () {
        return {
            dialogVisible: false,
            loadData: false,
            selection: []
        }
    },
    methods: {
        handleSelectionChange (val) {
            this.selection = val
        },
        handleConfirm () {
            this.$emit('confirm', this.selection)
            this.close()
        },
        onQueryList (params) {
            return httpGet('/api/users/commonGoods', params)
        },
        open () {
            this.dialogVisible = true
            if (!this.loadData) {
                this.loadData = true
                this.queryList()
            }
        },
        close () {
            this.dialogVisible = false
            this.selection = []
            this.$refs.table.clearSelection()
        }
    }
}
</script>
<style lang="less" scoped>
.pager {
    text-align: right;
    padding: 0;
    margin: 6px 0;
}
</style>

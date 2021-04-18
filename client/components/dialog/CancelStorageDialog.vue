<template>
    <el-dialog title="取消入库" :visible.sync="dialogVisible" :before-close="handleClose" width="650px">
        <div>确认将以下订单取消入库？</div>
        <div>{{orderList.map(item => item.orderNumber + '、').join('')}}</div>
        <div slot="footer" class="dialog-footer">
            <el-button size="small" type="primary" @click="handleSubmit" :loading="loading">提交</el-button>
            <el-button size="small" @click="handleClose" :disabled="loading">取消</el-button>
        </div>
    </el-dialog>
</template>
<script>
import { httpPost } from '~/plugins/axios'
export default {
    props: {
        orderList: {
            type: Array
        }
    },
    data () {
        return {
            orderIdList: [],
            dialogVisible: false,
            loading: false
        }
    },
    methods: {
        handleEdit () {
            this.orderIdList = this.orderList.map(item => item._id)
            this.dialogVisible = true
        },
        handleClose () {
            this.orderIdList = []
            this.dialogVisible = false
            this.loading = false
        },
        async handleSubmit () {
            try {
                this.loading = true
                await httpPost(`/api/admin/orders/cancelStorage`, { orderIdList: this.orderIdList })
                this.$alert('操作成功')
                this.handleClose()
                this.$emit('after-submit')
            } catch (e) {
                this.$alert(`操作失败(${e.message})`)
                this.loading = false
            } finally {
            }
        }
    }
}
</script>

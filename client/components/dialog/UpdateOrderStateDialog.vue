<template>
    <el-dialog :title="title" :visible.sync="dialogVisible" :before-close="handleClose" width="650px">
        <div>{{alert}}</div>
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
        },
        title: {
            type: String,
            default: '提示'
        },
        alert: {
            type: String,
            default: '是否确定更新以下运单的状态?'
        }
    },
    data () {
        return {
            orderIdList: [],
            state: null,
            dialogVisible: false,
            loading: false
        }
    },
    methods: {
        handleEdit (state) {
            this.state = state
            this.orderIdList = this.orderList.map(item => item._id)
            this.dialogVisible = true
        },
        handleClose () {
            this.orderIdList = []
            this.dialogVisible = false
            this.loading = false
        },
        async handleSubmit () {
            if (!this.state) throw new Error('状态为空')
            try {
                this.loading = true
                const result = await httpPost(`/api/admin/orders/updateState`, { orderIdList: this.orderIdList, state: this.state })
                this.$areaAlert({
                    data: result,
                    key: 'orderNumber',
                    value: 'message'
                })
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

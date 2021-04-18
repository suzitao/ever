<template>
    <div>
        <el-form size="small" :model="editForm" label-position="top" ref="editForm" status-icon>
            <el-form-item label="运单号" prop="orderNumber" :rules="[ { required: true, message: '请输入运单号'} ]">
                <el-input type="orderNumber" v-model="editForm.orderNumber" style="width: 410px"></el-input>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="handleUpdateTrace" :loading="editForm.loading" :disabled="loading" style="width: 200px">更新单个国内物流信息</el-button>
                <el-button type="warning" @click="handleUpdateAllTrace" :loading="loading" style="width: 200px" :disabled="editForm.loading">更新全部国内物流信息</el-button>
            </el-form-item>
        </el-form>
    </div>
</template>
<script>
import { httpGet } from '~/plugins/axios'

export default {
    data () {
        return {
            loading: false,
            editForm: {
                orderNumber: '',
                loading: false
            }
        }
    },
    methods: {
        async handleUpdateAllTrace () {
            await this.$confirm('是否确定更新全部物流信息（请勿经常使用该选项）', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            })
            this.loading = true
            try {
                await httpGet(`/api/admin/orders/updateAllTrace`)
                this.$alert('已启动后台更新进程', '提示', {
                    confirmButtonText: '关闭'
                })
            } catch (e) {
                this.$alert(`更新失败：${e.message}`, '提示', {
                    confirmButtonText: '关闭'
                })
            }
            this.loading = false
        },
        handleUpdateTrace () {
            this.$refs.editForm.validate(async (valid) => {
                if (valid) {
                    this.editForm.loading = true
                    try {
                        const result = await httpGet(`/api/admin/orders/updateTrace/${this.editForm.orderNumber}`)
                        this.$alert(result.success ? '更新成功' : `更新失败${result.info}`, '提示', {
                            confirmButtonText: '关闭'
                        })
                    } catch (e) {
                        this.$alert(`更新失败：${e.message}`, '提示', {
                            confirmButtonText: '关闭'
                        })
                    }
                    this.editForm.loading = false
                }
            })
        }
    }
}
</script>

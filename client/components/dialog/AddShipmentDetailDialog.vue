<template>
    <el-dialog title="添加运单跟踪项" :visible.sync="dialogVisible" :before-close="handleClose" width="650px">
        <div style="margin-bottom: 20px;">{{orderList.map(item => item.orderNumber + '、').join('')}}</div>
        <el-form :model="editForm" :rules="editFormRule" ref="editForm" status-icon label-width="80px">
            <el-row :gutter="10">
                <el-col :span="18">
                    <el-form-item size="small" label="跟踪信息" prop="information">
                        <el-input placeholder="请输入跟踪信息" v-model="editForm.information"></el-input>
                    </el-form-item>
                </el-col>
                <el-col :span="6">
                    <div class="float-right">
                        <el-button size="small" type="primary" @click="handleSubmit" :loading="loading">提交</el-button>
                        <el-button size="small" @click="handleClose" :disabled="loading">取消</el-button>
                    </div>
                </el-col>
            </el-row>
        </el-form>
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
            editForm: {
                orderIdList: [],
                information: ''
            },
            editFormRule: {
                information: [
                    { required: true, message: '请输入跟踪信息', trigger: 'submit' }
                ]
            },
            dialogVisible: false,
            loading: false
        }
    },
    methods: {
        handleEdit () {
            this.editForm.orderIdList = this.orderList.map(item => item._id)
            this.dialogVisible = true
        },
        handleClose () {
            this.editForm = {
                orderIdList: [],
                information: ''
            }
            this.dialogVisible = false
            this.loading = false
        },
        handleSubmit () {
            this.$refs.editForm.validate(async (valid) => {
                if (valid) {
                    try {
                        this.loading = true
                        await httpPost(`/api/admin/orders/addShipmentDetail`, this.editForm)
                        this.$alert('操作成功')
                        this.handleClose()
                        this.$emit('after-submit')
                    } catch (e) {
                        this.$alert(`操作失败(${e.message})`)
                        this.loading = false
                    } finally {
                    }
                }
            })
        }
    }
}
</script>

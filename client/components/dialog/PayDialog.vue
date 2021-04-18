<template>
    <el-dialog title="付款" :visible.sync="dialogVisible" :before-close="handleClose" width="650px">
        <div style="margin-bottom: 20px;">{{orderList.map(item => item.orderNumber + '、').join('')}}</div>
        <el-form size="small" :model="editForm" :rules="payRules" ref="editForm" status-icon label-width="80px">
            <el-form-item label="支付方式" prop="paymentMethod">
                <el-radio-group v-model="editForm.paymentMethod">
                    <el-radio-button label=30>账户余额付款(余额不足时赊账)</el-radio-button>
                </el-radio-group>
            </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <!-- <el-button size="small" type="primary" @click="handleSubmit(2)" :loading="loading && editForm.controlType === 2" v-if="payType === 0" :disabled="loading && editForm.controlType !== 2">付款</el-button> -->
            <el-button size="small" type="primary" @click="handleSubmit(1)" :loading="loading && editForm.controlType === 1" v-if="payType === 0" :disabled="loading && editForm.controlType !== 1">付款并入库</el-button>
            <el-button size="small" type="primary" @click="handleSubmit" :loading="loading" v-if="payType === 1">关税付款</el-button>
            <el-button size="small" @click="handleClose" :disabled="loading">取消</el-button>
            <el-progress :percentage="progressPercentage" :status="progressStatus" v-if="progressPercentage"></el-progress>
        </div>
    </el-dialog>
</template>
<script>
import { httpGet, httpPost } from '~/plugins/axios'
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
                paymentMethod: '',
                // 付款or支付关税
                controlType: ''
            },
            payRules: {
                paymentMethod: [
                    { required: true, message: '请选择支付方式', trigger: 'submit' }
                ]
            },
            payType: '',
            dialogVisible: false,
            loading: false,
            progressPercentage: 0,
            progressStatus: '',
            intervalId: ''
        }
    },
    methods: {
        handleEdit (type) {
            this.payType = type
            this.editForm.orderIdList = this.orderList.map(item => item._id)
            this.dialogVisible = true
        },
        handleClose () {
            this.editForm = {
                orderIdList: [],
                paymentMethod: '',
                controlType: ''
            }
            this.payType = ''
            this.dialogVisible = false
            this.loading = false
        },
        handleSubmit (controlType) {
            this.$refs.editForm.validate(async (valid) => {
                if (valid) {
                    let progressId
                    try {
                        this.loading = true
                        this.editForm.controlType = controlType
                        progressId = await httpPost(this.payType === 0 ? `/api/admin/orders/pay` : `/api/admin/orders/payTariff`, this.editForm)
                        // this.$areaAlert({
                        //     data: result,
                        //     key: 'orderNumber',
                        //     value: 'message'
                        // })
                        // this.handleClose()
                        // this.$emit('after-submit')
                    } catch (e) {
                        this.$alert(`付款失败(${e.message})`)
                        this.loading = false
                        return
                    } finally {
                    }
                    const fetchProgress = async () => {
                        try {
                            const { percentage, result } = await httpGet(`/api/common/progress/${progressId}`)
                            this.progressPercentage = percentage
                            if (percentage < 100) {
                                setTimeout(fetchProgress, 1000)
                            } else {
                                this.progressStatus = 'success'
                                this.$areaAlert({
                                    data: result,
                                    key: 'orderNumber',
                                    value: 'message'
                                })
                                this.handleClose()
                                this.progressPercentage = 0
                                this.progressStatus = ''
                                this.$emit('after-submit')
                            }
                        } catch (e) {
                            console.log(e.message)
                            setTimeout(fetchProgress, 1000)
                        }
                    }
                    fetchProgress()
                }
            })
        }
    }
}
</script>

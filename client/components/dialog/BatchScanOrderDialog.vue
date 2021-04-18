<template>
    <el-dialog title="批量装盘/移除" :visible.sync="dialogVisible" :before-close="handleClose" :close-on-click-modal="false" width="650px">
        <el-form size="small" label-position="top" :model="editForm" :rules="editFormRules" ref="editForm" status-icon label-width="120px" @submit.native.prevent>
            <el-row>
                <el-col :span="5">
                    <el-form-item prop="type">
                        <el-radio-group v-model="editForm.type">
                            <el-radio-button label='0'>装盘</el-radio-button>
                            <el-radio-button label='1'>移除</el-radio-button>
                        </el-radio-group>
                    </el-form-item>
                </el-col>
                <el-col :span="19">
                    <el-form-item>
                        <el-input style="width:100%" ref="orderInput" placeholder="扫描运单号添加" v-model="orderInput" @keyup.enter.native="scanOrder">
                            <el-button @click="scanOrder" slot="append" :loading="checking">添加运单</el-button>
                        </el-input>
                    </el-form-item>
                </el-col>
            </el-row>
            <el-form-item label="请扫描运单或在以下区域输入运单：" prop="orders">
                <el-input type="textarea" :rows="15" placeholder="运单号以回车分隔" v-model="editForm.orders">
                </el-input>
            </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <div class="float-left">共{{getOrderArray().length}}个运单</div>
            <el-button size="small" type="primary" @click="handleSubmit" :loading="loading">提交</el-button>
            <el-button size="small" @click="handleClose">取消</el-button>
        </div>
        <warning-tone ref="warningTone"></warning-tone>
    </el-dialog>
</template>
<script>
import { httpPost } from '~/plugins/axios'
import WarningTone from '~/components/WarningTone'
export default {
    components: { WarningTone },
    props: {
        palletId: {
            type: String
        }
    },
    data () {
        return {
            orderInput: '',
            editForm: {
                orders: '',
                type: '0'
            },
            editFormRules: {
                orders: [
                    { required: true, message: '请扫描或输入运单号', trigger: 'submit' }
                ],
                type: [
                    { required: true, message: '请选择装盘或移除', trigger: 'submit' }
                ]
            },
            checking: false,
            dialogVisible: false,
            loading: false
        }
    },
    methods: {
        async scanOrder () {
            const orderInputCopy = this.orderInput
            this.orderInput = ''
            this.$refs.orderInput.$el.getElementsByTagName('input')[0].focus()
            if (orderInputCopy) {
                this.checking = true
                try {
                    if (this.editForm.type === '0') {
                        await httpPost(`/api/admin/orders/checkPallet`, { orderNumber: orderInputCopy, palletId: this.palletId })
                    }
                    if (this.getOrderArray().indexOf(orderInputCopy) === -1) {
                        while (this.editForm.orders.slice(-1) === '\n') {
                            this.editForm.orders = this.editForm.orders.substring(0, this.editForm.orders.length - 1)
                        }
                        this.editForm.orders = this.editForm.orders + (this.editForm.orders ? '\n' : '') + orderInputCopy
                    }
                    this.$refs.warningTone.warningSuccess()
                } catch (e) {
                    this.$refs.warningTone.warningFail()
                    this.$notify({
                        title: '警告',
                        message: `运单${orderInputCopy}添加失败：${e.message}`,
                        type: 'warning',
                        duration: 0
                    })
                } finally {
                }
                this.checking = false
            }
        },
        handleEdit () {
            this.dialogVisible = true
        },
        handleClose () {
            this.orderInput = ''
            this.editForm = {
                orders: '',
                type: '0'
            }
            this.checking = false
            this.dialogVisible = false
            this.loading = false
        },
        getOrderArray () {
            const reg = /\n(\n)*( )*(\n)*\n/g
            const oldArr = this.editForm.orders.replace(reg, '\n').split('\n')
            const res = []
            const json = {}
            for (var i = 0; i < oldArr.length; i++) {
                if (oldArr[i] && !json[oldArr[i]]) {
                    res.push(oldArr[i])
                    json[oldArr[i]] = 1
                }
            }
            return res
        },
        handleSubmit () {
            this.$refs.editForm.validate(async (valid) => {
                if (valid) {
                    try {
                        this.loading = true
                        console.log(this.editForm.type)
                        const result = await httpPost(`/api/admin/orders/batchSetPallet`, { orderNumbers: this.getOrderArray(), palletId: this.palletId, type: this.editForm.type })
                        this.handleClose()
                        this.$areaAlert({
                            data: result,
                            key: 'orderNumber',
                            value: 'message'
                        })
                        await this.$emit('after-submit')
                    } catch (e) {
                        this.$alert(e.message)
                        this.loading = false
                    } finally {
                    }
                }
            })
        }
    }
}
</script>

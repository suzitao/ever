<template>
    <el-form size="small" :model="editForm" :rules="rules" ref="editForm" status-icon label-width="100px" class="demo-ruleForm">
        <el-form-item label="托盘重量" prop="weight" style="width: 559px">
            <el-input v-model.number="editForm.weight"><template slot="append">LB(磅)</template></el-input>
        </el-form-item>
        <el-form-item label="发货线路" prop="lineList">
            <el-transfer filterable
            :render-content="renderFunc"
            :titles="['全部线路', '已选线路']"
            :format="{
                noChecked: '${total}',
                hasChecked: '${checked}/${total}'
            }"
            v-model="editForm.lineList"
            :data="transferData"
            :props="{
                key: '_id',
                label: 'name'
            }">
            </el-transfer>
        </el-form-item>
        <el-form-item>
            <el-button type="primary" @click="submit">立即创建</el-button>
            <el-button @click="resetForm">重置</el-button>
        </el-form-item>
    </el-form>
</template>
<script>
import { httpGet, httpPost } from '~/plugins/axios'
export default {
    data () {
        // 穿梭框
        return {
            transferData: [],
            editForm: {
                weight: '',
                lineList: [],

                loading: false
            },
            rules: {
                weight: [
                    { required: true, message: '托盘重量不能为空' },
                    { type: 'number', message: '托盘重量必须为数字值', trigger: 'submit' }
                ],
                lineList: [
                    { type: 'array', required: true, message: '请至少选择一个发货线路', trigger: 'submit' }
                ]
            },
            renderFunc (h, option) {
                console.log(option)
                return <span>{ option.lineNumber } - { option.name }</span>
            }
        }
    },
    methods: {
        async queryLineList () {
            const { list } = await httpGet('/api/lines')
            this.transferData = list
        },
        async submit () {
            await this.$refs.editForm.validate()
            try {
                this.editForm.loading = true
                await httpPost('/api/admin/pallet', this.editForm)
                this.$router.replace('/admin/pallet/list')
            } catch (e) {
                this.$message.error(e.message)
                this.editForm.loading = false
            }
        },
        resetForm (formName) {
            this.$refs.editForm.resetFields()
        }
    },
    async mounted () {
        this.queryLineList()
    }
}
</script>
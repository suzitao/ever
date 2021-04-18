<template>
    <el-dialog :visible.sync="dialogVisible" :before-close="close" width="650px">
    
        <span slot="title">
            设置商品价格
            <i class="el-icon-loading" v-show="loading"></i>
        </span>
    
        <el-card class="card-line" v-for="item in list" :key="item._id">
            <div slot="header">
                <span>{{item.name}}</span>
                <el-button style="float: right;" type="primary" @click="handleAddType(item)" size="mini">添加商品类型</el-button>
            </div>
    
            <el-form size="small" status-icon label-width="150px" label-position="left">
                <el-form-item :label="priceType.name" v-for="priceType in item.priceTypes" :key="priceType._id">
                    <span slot="label" class="pricetype-title">
                        <i class="el-icon-delete" @click="deletePriceType(item, priceType)"></i>
                        {{priceType.name}}
                    </span>
                    <div>
                        <el-form-item label="单价">
                            <el-input type="number" v-model="priceType.unitPrice"></el-input>
                        </el-form-item>
                        <el-form-item label="首磅附加费">
                            <el-input type="number" v-model="priceType.poundSurcharge"></el-input>
                        </el-form-item>
                        <el-form-item label="最低计费重量">
                            <el-input type="number" v-model="priceType.startingWeight"></el-input>
                        </el-form-item>
                    </div>
                    
                </el-form-item>
            </el-form>
    
            <div class="card-empty" v-if="!loading && item.priceTypes.length == 0">暂无商品类型</div>
        </el-card>
        <div slot="footer" class="dialog-footer">
            <el-button size="small" type="primary" @click="save" :loading="submitting">保存</el-button>
            <el-button size="small" @click="close">取消</el-button>
        </div>
    </el-dialog>
</template>
<script>
import { httpGet, httpPost, httpDelete } from '~/plugins/axios'

export default {
    data () {
        return {
            _branchId: null,
            list: [],
            loading: false,
            submitting: false,
            dialogVisible: false
        }
    },
    methods: {
        // 添加商品类型
        async handleAddType (line) {
            const { value } = await this.$prompt('请输入分类名称', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消'
            })
            if (value) {
                try {
                    this.loading = true
                    const priceType = await httpPost(`/api/admin/line/${line._id}/priceType`, { name: value })
                    priceType.unitPrice = line.DefaultUnitPrice
                    line.priceTypes.push(priceType)
                } catch (e) {
                    this.$message.error(e.message)
                } finally {
                    this.loading = false
                }
            }
        },
        // 删除商品类型
        async deletePriceType (line, priceType) {
            await this.$confirm('此操作将删除该商品类别, 是否继续?')
            try {
                this.loading = true
                await httpDelete(`/api/admin/line/priceType/${priceType._id}`)
                line.priceTypes = line.priceTypes.filter(p => p._id !== priceType._id)
            } catch (e) {
                this.$message.error(e.message)
            } finally {
                this.loading = false
            }
        },
        async save () {
            // TODO 校验
            const params = {}
            this.list.forEach(line => {
                params[line._id] = line.priceTypes
            })
            this.submitting = true
            try {
                await httpPost(`/api/admin/branchs/${this._branchId}/priceType`, params)
                this.$emit('save')
                this.close()
            } catch (e) {
                this.$message.error(e.message)
            } finally {
                this.submitting = false
            }
        },
        async open (branch) {
            this.dialogVisible = true
            this.loading = true
            this._branchId = branch._id
            try {
                this.list = await httpGet(`/api/admin/branchs/${this._branchId}/priceType`)
            } catch (e) {
                this.$message.error(e.message)
            } finally {
                this.loading = false
            }
        },
        close () {
            this.dialogVisible = false
            this.list = []
        }
    }
}
</script>
<style lang="less" scoped>
.card-line {
    margin-bottom: 12px;

    .pricetype-title {
        font-size: 1rem;
    }

    .el-icon-delete {
        color: #8492a6;
        cursor: pointer;

        &:hover {
            color: #b33131;
        }
    }

    .card-empty {
        text-align: center;
    }
}
</style>

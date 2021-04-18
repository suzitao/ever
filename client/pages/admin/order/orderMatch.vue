<template>
    <div>
        <div class="upload-panel">
            <el-upload drag action="/api/admin/orders/match" :before-upload="onBeforeUpload" :on-error="handleError" :on-success="handleSuccess" :data="uploadData">
                <i class="el-icon-upload"></i>
                <div class="el-upload__text">将文件拖到此处，或
                    <em>点击上传</em>
                </div>
            </el-upload>
            <div class="upload-option">
                <label>
                    覆盖原有匹配：
                    <el-switch v-model="uploadData.cover">
                    </el-switch>
                </label>
                <div class="el-upload__tip" slot="tip">请按模板格式上传
                    <a href="/admin/example.xlsx">下载模板</a>
                </div>
            </div>
        </div>
    
        <div class="result-panel" v-loading="loading">
            <el-table :data="list" border v-if="list.length">
                <el-table-column width="145px" prop="orderNumber" label="运单号" :formatter="row => row.data[0]">
                </el-table-column>
                <el-table-column width="145px" prop="expressNumber" label="国内快递单号" :formatter="row => row.data[1]">
                </el-table-column>
                <el-table-column width="100px" prop="expressCompany" label="快递公司" :formatter="row => row.data[2]">
                </el-table-column>
                <el-table-column width="80px" prop="type" label="状态">
                    <template slot-scope="scope">
                        <el-tag size="small" :type="typetag(scope.row.type)" close-transition>{{scope.row.type |　typeName}}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="message" label="说明">
                </el-table-column>
            </el-table>
        </div>

    
    </div>
</template>
<script>
export default {
    data () {
        return {
            uploadData: {
                cover: false
            },
            list: [],
            loading: false
        }
    },
    filters: {
        typeName (type) {
            return {
                success: '成功',
                ignore: '忽略',
                error: '错误'
            }[type]
        }
    },
    methods: {
        typetag (type) {
            return {
                success: 'success',
                ignore: 'gray',
                error: 'danger'
            }[type]
        },
        onBeforeUpload (file) {
            if (file.size / 1024 / 1024 > 1) {
                this.$message.error('上传文件大小不能超过 1MB!')
                return false
            }
            const fileMatch = !!file.name.match(/\.(xls|xlsx)$/)
            if (!fileMatch) {
                this.$message.error('只能上传xls或者xlsx文件!')
            }
            this.list = []
            return fileMatch
        },
        handleSuccess (res) {
            console.log(JSON.stringify(res))
            this.loading = false
            if (res.success) {
                this.list = res.data
            } else {
                this.$alert(`操作出错，请稍后检查运单是否已经匹配，避免重复操作：${res.message}`, '提示', {
                    confirmButtonText: '关闭'
                })
            }
        },
        handleError (err) {
            console.log(err)
            this.$alert(`操作出错，请稍后检查运单是否已经匹配，避免重复操作：handleError`, '提示', {
                confirmButtonText: '关闭'
            })
        }
    }
}
</script>
<style lang="less" scoped>
.upload-panel {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 12px;

    .upload-option {
        margin-top: 10px;
        color: #8391a5;
    }

    .result-panel {
        min-height: 100px;
    }
}
</style>

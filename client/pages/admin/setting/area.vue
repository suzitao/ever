<template>
    <div>
        <el-button type="primary" @click="handleAsyncAreas" :loading="loading">更新行政区划</el-button>
    </div>
</template>
<script>
import { httpGet } from '~/plugins/axios'

export default {
    data () {
        return {
            loading: false
        }
    },
    methods: {
        async handleAsyncAreas () {
            await this.$confirm('是否确定更新行政区划', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            })
            this.loading = true
            try {
                await httpGet(`/api/areas/async`)
                this.$alert('更新成功', '提示', {
                    confirmButtonText: '关闭'
                })
            } catch (e) {
                this.$alert(`更新失败：${e.message}`, '提示', {
                    confirmButtonText: '关闭'
                })
            } finally {
                this.loading = false
            }
        }
    }
}
</script>

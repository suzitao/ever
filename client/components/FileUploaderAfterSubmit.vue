<template>
    <el-upload ref="upload" class="upload-demo" action="/api/files" :multiple="true" :on-error="handleError" :on-preview="handlePreview" :on-remove="handleRemove" :on-change="handleChange" :on-success="handleSuccess" :file-list="fileList" :auto-upload="false">
        <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
        <el-button style="margin-left: 10px;" size="small" type="success" @click="submitUpload">上传到服务器</el-button>
    </el-upload>
</template>
<script>
import { defer } from '~/plugins/tool'
export default {
    props: {
        value: {
            type: Array
        }
    },
    computed: {
        fileList () {
            return this.value.map(file => {
                return { name: file.originalname, url: `/api/files/${file._id}`, _id: file._id }
            })
        },
        uploadCount () {
            return (this.tempList.length - this.fileList.length)
        }
    },
    data () {
        return {
            deleteList: [],
            tempList: []
        }
    },
    methods: {
        handleRemove (file, fileList) {
            if (file.status === 'success') {
                this.deleteList.push(file._id)
            }
            this.$emit('input', fileList.map(file => {
                if (file.status === 'success') {
                    return { originalname: file.name, _id: file._id }
                }
            }))
        },
        handlePreview (file) {
            window.location.href = file.url
        },
        handleError (err) {
            console.log('handleError')
            this._defer.reject(err)
        },
        handleSuccess (response) {
            console.log('handleSuccess')
            if (response.success === true) {
                this.value.push({ originalname: response.data.originalname, _id: response.data._id })
            }
            this._defer.resolve(response)
        },
        handleChange (file, fileList) {
            this.tempList = fileList
        },
        async submitUpload () {
            const uploadCount = this.uploadCount
            console.log(uploadCount)
            this.$refs.upload.submit()
            const result = []
            for (let i = 0; i < uploadCount; i++) {
                this._defer = defer()
                result.push(await this._defer.promise)
                console.log(this._defer.promise)
            }
            console.log('submitUpload-end')
            console.log(result)
            return result
        }
    }
}
</script>
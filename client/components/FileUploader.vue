<template>
    <el-upload class="upload-demo" action="/api/files" :on-preview="handlePreview" :on-remove="handleRemove" :on-success="handleSuccess" :file-list="fileList">
        <el-button size="small" type="primary">点击上传</el-button>
    </el-upload>
</template>
<script>
import { httpDelete } from '~/plugins/axios'
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
        }
    },
    data () {
        return {
            deleteList: []
        }
    },
    methods: {
        handleRemove (file, fileList) {
            this.$emit('input', fileList.map(file => {
                return { originalname: file.name, _id: file._id }
            }))
            if (file.status === 'success') {
                this.deleteList.push(file._id)
            }
        },
        handlePreview (file) {
            window.location.href = file.url
        },
        handleSuccess (response, file, fileList) {
            if (response.success === true) {
                this.value.push({ originalname: response.data.originalname, _id: response.data._id })
            }
        },
        handleDelete () {
            this.deleteList.forEach(id => {
                httpDelete(`/files/delete/${id}`)
            })
        }
    }
}
</script>
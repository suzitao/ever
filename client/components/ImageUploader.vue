<template>
    <el-upload class="avatar-uploader" action="/api/files" :show-file-list="false" :on-error="handleError" :on-success="handleSuccess" :before-upload="beforeUpload">
        <img v-if="imgSrc" :src="imgSrc" class="avatar">
        <i v-else class="el-icon-plus avatar-uploader-icon"></i>
    </el-upload>
</template>
<script>
export default {
    props: {
        // fileId
        value: {
            type: String
        }
    },
    data () {
        return {
            objectURL: null,
            uploading: false
        }
    },
    computed: {
        imgSrc () {
            const { objectURL, value } = this
            if (objectURL) return objectURL
            if (value) return `/api/files/${value}`
        }
    },
    methods: {
        beforeUpload (file) {
            const isJPG = file.type === 'image/jpeg'
            const isLt2M = file.size / 1024 / 1024 < 2

            if (!isJPG) {
                this.$message.error('上传图片只能是 JPG 格式!')
            }
            if (!isLt2M) {
                this.$message.error('上传图片大小不能超过 2MB!')
            }
            if (isJPG && isLt2M) {
                this.uploading = true
                this.objectURL = URL.createObjectURL(file)
                this.$emit('uploading')
            }
            return isJPG && isLt2M
        },
        handleSuccess (res, file) {
            this.$emit('input', res.data._id)
            this.uploading = false
            this.$emit('upload-end')
        },
        handleError (err) {
            this.uploading = false
            this.objectURL = null
            this.$emit('error', err)
            this.$message.error(err.message)
        }
    }
}
</script>
<style lang="less">
.avatar-uploader {

    .el-upload {
        border: 1px dashed #d9d9d9;
        border-radius: 6px;
        cursor: pointer;
        position: relative;
        overflow: hidden;

        &:hover {
            border-color: #20a0ff;
        }


        .avatar-uploader-icon {
            font-size: 28px;
            color: #8c939d;
            width: 2000px / 4.5;
            height: 300px / 4.5;
            line-height: 300px / 4.5;
            text-align: center;
        }

        .avatar {
            width: 2000px / 4.5;
            height: 300px / 4.5;
            display: block;
        }
    }
}
</style>

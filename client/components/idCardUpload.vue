<template>
    <div class="upload-wrapper">
        <vue-core-image-upload class="btn btn-primary" inputOfFile="file" cropRatio="214:135" :maxWidth="856" :maxHeight="540" crop="local" :rotate="true" @imageuploaded="imageuploaded" :max-file-size="5242880" url="/api/files" @has-image-change="onModalChange">
            <div class="avatar-uploader">
                <div class="el-upload el-upload--text">
                    <img v-if="imgSrc" :src="imgSrc" class="avatar">
                    <i v-else class="el-icon-plus avatar-uploader-icon"><span class="avatar-uploader-text"><slot></slot></span></i>
                </div>
            </div>
        </vue-core-image-upload>
        <el-button size="mini" @click="clear">删除</el-button>
    </div>
</template>
<script>
import VueCoreImageUpload from '~/components/vue-core-image-upload'

function parent (elm, selector) {
    let parent = elm
    while ((parent = parent.parentNode) && parent && parent.nodeType === 1) {
        if (parent.classList.contains(selector)) {
            return parent
        }
    }
}

export default {
    components: {
        VueCoreImageUpload
    },
    props: {
        // fileId
        value: {
            type: String
        },
        defaultSrc: {
            type: String,
            default: ''
        }
    },
    data () {
        return {
        }
    },
    computed: {
        imgSrc () {
            const value = this.value
            if (value) {
                return `/api/files/${value}`
            } else {
                return this.defaultSrc
            }
        }
    },
    methods: {
        imageuploaded (res) {
            if (res.success) {
                this.$emit('input', res.data._id)
            } else {
                this.$message.error(res)
            }
        },
        clear () {
            this.$emit('input', null)
        },
        onModalChange (hasImage) {
            const dialog = this._dialog || (this._dialog = parent(this.$el, 'el-dialog'))
            if (dialog) {
                dialog.classList[hasImage ? 'add' : 'remove']('no-transform')
            }
        }
    }
}
</script>
<style lang="less" scoped>

.upload-wrapper {
    display: flex;
    flex-direction: column;
    align-items: left;

    .g-core-image-upload-form {
        width: 100% !important;
        height: 100% !important;
    }
}


.avatar-uploader {
    line-height: 0;
}
.avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
}

.avatar-uploader .el-upload:hover {
    border-color: #20a0ff;
}

.avatar-uploader-icon {
    font-size: 24px;
    color: #8c939d;
    width: 170.8px;
    height: 108px;
    line-height: 108px;
    text-align: center;
    margin-left: 10px;
    
    .avatar-uploader-text {
        margin-left: 10px;
        font-size: 15px;
    }
}

.avatar {
    width: 170.8px;
    height: 108px;
    display: block;
}
</style>
<style lang="less">
.no-transform {
    transform: none;
}
</style>

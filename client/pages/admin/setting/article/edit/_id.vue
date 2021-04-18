<template>
    <div v-loading="loading">
        <el-form size="small" :model="editForm" :rules="rules" ref="editForm" status-icon label-width="80px" style="width: 1100px">
            <el-row>
            <el-col :span="12"><el-form-item label="编码">
                <el-input v-model="editForm.articleNumber" :disabled="true"></el-input>
            </el-form-item></el-col>
            <el-col :span="12">
                <el-form-item label="标题" prop="title">
                    <el-input v-model="editForm.title"></el-input>
                </el-form-item>
            </el-col>
            </el-row>
            <el-row>
                <el-form-item  label="标题图片" prop="headImg">
                    <image-uploader v-model="editForm.headImg" ref="headImg"></image-uploader>
                </el-form-item>
            </el-row>
            <el-row>
                <vue-ueditor @ready="editorReady" style="width: 1100px"></vue-ueditor>
            </el-row>
            <el-row>
                <div style="margin-top: 10px; padding: 0 20px">
                    <el-radio-group v-model="editForm.type">
                        <el-radio :label='0'>优惠信息</el-radio>
                        <el-radio :label='1'>外部公告</el-radio>
                        <el-radio :label='2'>内部公告</el-radio>
                        <el-radio :label='3'>产品介绍</el-radio>
                    </el-radio-group>
                    <div class="float-right">
                        <el-button size="small" type="primary" @click="submit" :loading="editForm.loading">提交</el-button>
                        <el-button size="small" @click="cancel">取消</el-button>
                    </div>
                </div>
            </el-row>
        </el-form>
    </div>
</template>

<script>
import { httpPost, httpGet } from '~/plugins/axios'
import { smartExtend } from '~/plugins/tool'
import VueUeditor from '~/components/VueUeditor'
import ImageUploader from '~/components/ImageUploader'
export default {
    name: 'ueditor1',
    components: {
        VueUeditor,
        ImageUploader
    },
    data () {
        return {
            editForm: {
                id: '', // 有id编辑，无id新增
                articleNumber: '',
                title: '',
                type: 0,
                html: '',
                headImg: null,

                loading: false,
                dialogVisible: false
            },

            rules: {
                title: [
                    { required: true, message: '请输入标题', trigger: 'submit' }
                ],
                headImg: [
                    {
                        validator: (rule, value, callback) => {
                            const { headImg } = this.$refs
                            if (headImg.uploading) {
                                callback(new Error('请等待图片上传完成'))
                            } else {
                                callback()
                            }
                        },
                        trigger: 'submit'
                    }
                ]
            },
            editorInstance: null,
            loading: false
        }
    },
    methods: {
        editorReady (editorInstance) {
            this.editorInstance = editorInstance
            if (this.editForm.html) {
                editorInstance.setContent(this.editForm.html)
            }
        },
        cancel () {
            this.$router.push('/admin/setting/article')
        },
        async queryArticle () {
            this.loading = true
            const Article = await httpGet(`/api/admin/article/${this.$route.params.id}`)
            console.log(Article)
            this.editForm.id = Article._id
            smartExtend(this.editForm, Article)
            if (this.editorInstance) {
                this.editorInstance.setContent(this.editForm.html)
            }
            this.loading = false
        },
        submit () {
            this.$refs.editForm.validate(async (valid) => {
                if (valid) {
                    try {
                        this.editForm.loading = true
                        this.editForm.html = this.editorInstance.getContent()
                        await httpPost(
                            this.editForm.id
                                ? `/api/admin/article/${this.editForm.id}`
                                : '/api/admin/article', this.editForm)
                        this.$router.push('/admin/setting/article')
                    } catch (e) {
                        this.$message.error(e.message)
                        this.editForm.loading = false
                    } finally {
                    }
                }
            })
        }
    },
    async mounted () {
        if (this.$route.params.id) {
            await this.queryArticle()
        }
    }
}
</script>

<style lang="less">
.avatar-uploader {

    .el-upload {

        .avatar-uploader-icon {
            width: 1116px / 2 !important;
            height: 80px / 2 !important;
            line-height: 80px / 2 !important;
        }

        .avatar {
            width: 1116px / 2 !important;
            height: 80px / 2 !important;
        }
    }
}
</style>

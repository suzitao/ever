<template>
    <div class="idCard-container">
        <div class="idCard-container">
            <el-breadcrumb separator="/" class="breadcrumb">
                <el-breadcrumb-item to="/">首页</el-breadcrumb-item>
                <el-breadcrumb-item to="/idCard">证件上传</el-breadcrumb-item>
            </el-breadcrumb>
            <div class="idCard-container-inner">
                <el-radio-group size="small" v-model="activeTab" @change="handleTabChange">
                    <el-radio-button :label="tab.value" v-for="tab in tabs" :key="tab.value">{{tab.name}}</el-radio-button>
                </el-radio-group>
                <div class="idCard-container-banner">
                    <el-form size="small" :inline="true" :model="searchEditForm" status-icon label-width="110px" @submit.native.prevent>
                        <el-form-item label="运单号" v-if="activeTab === 0">
                            <el-input v-model="searchEditForm.orderNumber" placeholder="请输入运单号"></el-input>
                        </el-form-item>
                        <el-form-item label="收件人" v-if="activeTab === 1">
                            <el-input v-model="searchEditForm.recipientName" placeholder="请输入收件人"></el-input>
                        </el-form-item>
                        <el-form-item label="收件手机号码">
                            <el-input v-model="searchEditForm.recipientCellphoneNumber" placeholder="请输入收件手机号码"></el-input>
                        </el-form-item>
                        <el-form-item>
                            <el-button type="primary" @click="queryOrder" :loading="searchEditForm.loading">查询</el-button>
                        </el-form-item>
                    </el-form>
                </div>
                <div class="idCard-container-banner" style="padding-bottom: 20px" v-if="searchEditForm.searchOn">
                    <el-table :data="list" border @selection-change="handleSelectionChange" empty-text="暂无需要上传证件信息的运单">
                        <el-table-column type="selection" width="45">
                        </el-table-column>
                        <el-table-column prop="orderNumber" label="运单号" width="180px">
                        </el-table-column>
                        <el-table-column prop="line" label="线路" width="150px" :formatter="row => row.line && row.line.name || ''">
                        </el-table-column>
                        <el-table-column prop="recipientName" label="收件人" width="150px">
                        </el-table-column>
                        <el-table-column prop="recipientIdNumber" label="收件人身份证号">
                        </el-table-column>
                        <el-table-column prop="recipientCellphoneNumber" label="收件人手机号码" width="230px">
                        </el-table-column>
                    </el-table>
                </div>
                <el-form size="small" :model="uploadEditForm" :rules="uploadRules" ref="uploadEditForm" status-icon label-width="100px" :inline="true" label-position="top" v-if="searchEditForm.searchOn" @submit.native.prevent>
                    <el-form-item label="身份证号" prop="recipientIdNumber" style="width: 300px">
                        <el-input v-model="uploadEditForm.recipientIdNumber"></el-input>
                    </el-form-item>
                    <el-form-item label="身份证正面" prop="recipientIdCardImg">
                        <id-card-upload v-model="uploadEditForm.recipientIdCardPositiveImg">点击上传正面</id-card-upload>
                    </el-form-item>
                    <el-form-item label="身份证背面">
                        <id-card-upload v-model="uploadEditForm.recipientIdCardBackImg">点击上传背面</id-card-upload>
                    </el-form-item>
                    <el-form-item label="" style="margin-top: 115px">
                        <el-button type="primary" @click="submit" :loading="uploadEditForm.loading" :disabled="uploadEditForm.orderList.length < 1">上传</el-button>
                    </el-form-item>
                </el-form>
            </div>
        </div>
    </div>
</template>

<style lang="less" rel="stylesheet/less">
.idCard-container {
    .idCard-container {
        padding: 0px 10px;
        width: 1170px - 20px;
        margin: 0 auto;

        .breadcrumb {
            padding: 15px 0;
        }

        .idCard-container-inner {
            padding: 15px 15px;
            position: relative;
            min-height: 500px;
            border: solid 1px #eeeeee;

            .el-radio-group {
                width: 100%;
                margin-bottom: 10px;

                .el-radio-button {
                    width: 50%;

                    .el-radio-button__inner {
                        width: 100%;
                    }
                }
            }

            .idCard-container-banner {
                // height: 80px;
                // line-height: 80px;
                border-bottom: solid 2px #b33131;
                margin-bottom: 20px; // color: #848484;
                // font-size: 30px;
                // .el-input{
                //     width: 500px
                // }
            }
        }
    }
}
</style>

<script>
import { httpGet, httpPost } from '~/plugins/axios'
import idCardUpload from '~/components/idCardUpload'
import { identityCodeValid } from '~/plugins/tool'
// import VueCoreImageUpload from 'vue-core-image-upload'
// https://vanthink-ued.github.io/vue-core-image-upload/index.html#/cn/get-started

export default {
    layout: 'index',
    name: 'idCard',
    head: {
        title: '证件上传'
    },

    components: { idCardUpload },

    data () {
        return {
            activeTab: 0,

            tabs: [
                { value: 0, name: '按运单号查找' },
                { value: 1, name: '按收件人查找' }
            ],

            searchEditForm: {
                orderNumber: '',
                recipientName: '',
                recipientCellphoneNumber: '',
                loading: false,
                searchOn: false
            },
            list: [],

            uploadEditForm: {
                recipientIdNumber: '',
                recipientIdCardPositiveImg: null,
                recipientIdCardBackImg: null,
                orderList: [],

                loading: false
            },

            uploadRules: {
                recipientIdNumber: [
                    {
                        validator: (rule, value, callback) => {
                            if (!value) {
                                callback()
                            } else if (!identityCodeValid(value)) {
                                callback(new Error('身份证号码校验不通过'))
                            } else {
                                callback()
                            }
                        },
                        trigger: 'blur'
                    },
                    { required: true, message: '请填写身份证号码', trigger: 'submit' }
                ],
                recipientIdCardImg: [
                    {
                        validator: (rule, value, callback) => {
                            if (this.uploadEditForm.recipientIdCardPositiveImg && (!this.uploadEditForm.recipientIdCardBackImg)) {
                                callback(new Error('请同时上传证件正反面'))
                            } else if ((!this.uploadEditForm.recipientIdCardPositiveImg) && this.uploadEditForm.recipientIdCardBackImg) {
                                callback(new Error('请同时上传证件正反面'))
                            } else {
                                callback()
                            }
                        },
                        trigger: 'submit'
                    }
                ]
            }

        }
    },

    methods: {
        handleTabChange () {
            this.searchEditForm = {
                orderNumber: '',
                recipientName: '',
                recipientCellphoneNumber: '',
                loading: false,
                searchOn: this.searchEditForm.searchOn
            }
        },

        async queryOrder () {
            this.list = []
            try {
                this.searchEditForm.loading = true
                const { list } = await httpGet(`/api/orders/idCardList`, this.searchEditForm)
                this.list = list
                this.searchEditForm.searchOn = true
            } catch (e) {
                this.$message.error(e.message)
            } finally {
                this.searchEditForm.loading = false
            }
        },

        handleSelectionChange (val) {
            this.uploadEditForm.orderList = val.map(item => item._id)
        },

        submit () {
            // const { recipientIdCardPositiveImg, recipientIdCardBackImg } = this.$refs
            // if (recipientIdCardPositiveImg.uploading || recipientIdCardBackImg.uploading) {
            //     this.$message.error('请等待图片上传完成')
            //     return false
            // }

            this.$refs.uploadEditForm.validate(async (valid) => {
                if (valid) {
                    try {
                        this.uploadEditForm.loading = true
                        await httpPost(`/api/orders/uploadIdCardImg`, this.uploadEditForm)
                        this.uploadEditForm = {
                            recipientIdCardPositiveImg: null,
                            recipientIdCardBackImg: null,
                            orderList: [],

                            loading: false
                        }
                        this.queryOrder()
                        await this.$alert('上传成功')
                    } catch (e) {
                        await this.$alert(`上传失败(${e.message})`)
                    } finally {
                        this.uploadEditForm.loading = false
                    }
                }
            })
        }
    },

    mounted () {
    }
}
</script>

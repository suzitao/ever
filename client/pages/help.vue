<template>
    <div class="help-container">
        <div class="help-container">
            <el-breadcrumb separator="/" class="breadcrumb">
                <el-breadcrumb-item to="/">首页</el-breadcrumb-item>
                <el-breadcrumb-item to="/help/branch">帮助中心</el-breadcrumb-item>
                <el-breadcrumb-item v-if="childLabel" :to="$route.path">{{childLabel}}</el-breadcrumb-item>
            </el-breadcrumb>

            <div class="help-container-inner">
                <div class="help-menu">
                    <ul>
                        <nuxt-link tag="li" to="/help/branch">网点查询</nuxt-link>
                        <nuxt-link tag="li" to="/help/faq">常见问题</nuxt-link>
                    </ul>
                </div>
                <nuxt-child class="help-content" ref="child"></nuxt-child>
            </div>
        </div>
    </div>
</template>
<script>
    export default {
        layout: 'index',
        name: 'Help',
        head: {
            title: '帮助中心'
        },
        data () {
            return {
                childLabel: ''
            }
        },
        watch: {
            $route () {
                setTimeout(_ => {
                    this.getChildLabel()
                }, 200)
            }
        },
        methods: {
            getChildLabel () {
                this.childLabel = this.$refs.child && this.$refs.child.label
            }
        },
        mounted () {
            this.getChildLabel()
        }
    }
</script>
<style lang="less" rel="stylesheet/less">
    .help-container {
        .help-container {
            padding: 0px 10px;
            width: 1170px - 20px;
            margin: 0 auto;

            .breadcrumb {
                padding: 15px 0;
            }

            .help-container-inner {
                position: relative;
                min-height: 500px;
                border: solid 1px #eeeeee;

                .help-menu {
                    width: 150px;
                    border-right: solid 1px #eeeeee;
                    position: absolute;
                    top: 0;
                    bottom: 0;

                    li {
                        line-height: 45px;
                        padding-left: 20px;
                        border-left: 3px solid #fff;
                        cursor: pointer;

                        &.active,
                        &.nuxt-link-exact-active {
                            color: #b33131;
                            background-color: #f1f3f7;
                            border-left: 4px solid #48576a;
                        }
                    }
                }

                .help-content {
                    margin-left: 150px;
                    padding: 15px 15px;
                }
            }
        }
    }
</style>

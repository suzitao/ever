<template>
    <div class="footer">
        <div class="container">
            <div class="footer-body">
                <div class="footer-body-left">
                    <router-link to="/"><img src="/logo/LOGO5.png" style="height: 45px;"/></router-link>
                    <div>© 2017 Everfast Express Inc. All rights reserved.</div>
                </div>
                <div class="footer-body-right">
                    <div>
                        <span>E-mail: everfastexp@gmail.com</span>
                        <span>Phone: (647)978-2999</span>
                    </div>
                    <div>
                        <span>友情链接</span><a target="_blank" href="https://www.kuaidi100.com">快递查询</a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<style lang="less" scoped>
    .footer {
        margin-top: 10px;
        height: 79px;
        min-width: 1170px;
        background-color: #fafafa;
        border-top: 1px solid #eeeeee;

        .container {
            background-color: #fafafa;
            font-size: 12px;

            .footer-body {
                // margin-top: 19px;
                width: 100%;
                height: 50px;
                
                .footer-body-left {
                    float: left;
                    margin: 0 10px;
                    padding-top: 15px;
                }

                .footer-body-right {
                    float: right;
                    line-height: 20px;
                    padding-top: 35px;

                    span{
                        margin-right: 10px;
                    }
                }
            }
        }
    }
</style>

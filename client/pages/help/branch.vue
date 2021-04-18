<template>
    <div class="help-branch">
        <el-card :body-style="{ padding: '0px' }">
            <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2876.5684818381533!2d-79.29473928426155!3d43.86477194674132!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89d4d5d65b8f4245%3A0xb866a19f1af2b6a6!2zNDk4MSBId3kgNyAjMTAsIFVuaW9udmlsbGUsIE9OIEwzUiAxTjHliqDmi7_lpKc!5e0!3m2!1szh-CN!2sus!4v1500116437623" width="968" height="300" frameborder="0" style="border:0" allowfullscreen></iframe>
            <div style="padding: 14px;">
                <span>Markham 门店</span>
                <div style="font-size: 13px;color: #999">Tel: (905)604-2025
                    <br>Phone: (647)978-2999
                    <br>Address: Suite 10, 4981 Highway 7 East, Markham, ON, L3R 1N1
                </div>
            </div>
        </el-card>
        <el-card :body-style="{ padding: '0px' }">
            <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2877.0252663594497!2d-79.38825168412849!3d43.85530497911483!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x882b2b317e57367d%3A0xd0171cb86bf583ab!2zOTEyMCBMZXNsaWUgU3QsIFJpY2htb25kIEhpbGwsIE9OIEw0QiAzSjnliqDmi7_lpKc!5e0!3m2!1szh-CN!2scn!4v1543563014812" width="968" height="300" frameborder="0" style="border:0" allowfullscreen></iframe>
            <div style="padding: 14px;">
                <span>Richmond Hill 仓库</span>
                <div style="font-size: 13px;color: #999">Phone: (647)394-7999
                    <br>Address: Unit 6, 9120 Leslie Street, Richmond Hill, ON, L4B 3J9
                </div>
            </div>
        </el-card>
    </div>
</template>

<<style>


.el-card{
    margin-bottom: 15px;
}

</style>


<script>
export default {
    data () {
        return {
            label: '网点查询'
        }
    }
}
</script>

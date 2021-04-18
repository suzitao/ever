<template>
<qrcode-vue :value="value" :size="size" level="H"></qrcode-vue>
</template>
<script>
import QrcodeVue from 'qrcode.vue'
export default {
    props: {
        value: [String, Number],
        size: Number
    },
    components: { QrcodeVue }
}
</script>

<template>
    <svg class="vue-barcode-element" style="width:0"></svg>
</template>
<script>
import JsBarcode from 'jsbarcode'
export default {
    props: {
        value: [String, Number],
        height: [String, Number],
        width: [String, Number],
        fontSize: [String, Number],
        textMargin: [String, Number],
        displayValue: [Boolean]
    },
    methods: {
        render () {
            JsBarcode(this.$el, this.value, {
                height: this.height,
                width: this.width,
                fontSize: this.fontSize,
                margin: 0,
                textMargin: this.textMargin,
                displayValue: this.displayValue
            })
        }
    },
    mounted () {
        this.render()
        this.$watch('$props', this.render, { deep: true, immediate: true })
    }
}
</script>

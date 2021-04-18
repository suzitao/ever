<template>
    <div class="number-list">
        <div class="number-cell" v-for="s in '123456789.0'" :key="s" @click="append(s)">{{s}}</div>
        <div class="number-cell" @click="back">←</div>
    </div>
</template>
<script>
export default {
    props: {
        value: {
            default: ''
        }
    },
    data () {
        return {
        }
    },
    computed: {
        inputValue: {
            set (newValue) {
                this.$emit('input', newValue)
            },
            get () {
                return this.value
            }
        }
    },
    methods: {
        append (s) {
            this.inputValue += s
        },
        back () {
            if (this.inputValue) {
                this.inputValue = this.inputValue.substr(0, this.inputValue.length - 1)
            }
        },
        close () {
            this.popoverVisible = false
        }
    }
}
</script>
<style lang="less" scoped>
.number-list {

    .number-cell {
        display: inline-block;
        width: 33.33%;
        height: 56.75px;
        line-height: 56.75px;
        text-align: center;
        font-size: 32px;
        color: rgb(255, 255, 255);
        background-color: rgba(46, 55, 66, 0.9);
        border: solid 1px #2E3742;
        box-sizing: border-box;
        cursor: pointer;
        user-select: none;

        &:active {
            background-color: rgba(46, 55, 66, 1);
        }
    }
}
</style>

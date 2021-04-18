<template>
    <el-popover placement="bottom" trigger="manual" v-model="popoverVisible">
        <div class="box">
            <div class="menu">
                <i class="icon-close el-icon-close" @click="close"></i>
            </div>
            <div class="number-list">
                <div class="number-cell" v-for="s in '123456789.0'" :key="s" @click="append(s)">{{s}}</div>
                <div class="number-cell" @click="back">←</div>
            </div>
        </div>
        <el-input type="text" slot="reference" v-model="inputValue" @focus="popoverVisible = true" :placeholder="placeholder" size="large">
        </el-input>
    </el-popover>
</template>
<script>
export default {
    props: {
        value: {
            type: String,
            default: ''
        },
        placeholder: String
    },
    data () {
        return {
            popoverVisible: false
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
.box {
    width: 362px;

    .menu {
        height: 40px;
        background: #585858;

        .icon-close {
            float: right;
            font-size: 30px;
            color: white;
            padding: 5px;
            cursor: pointer;

            &:active {
                color: #656765;
            }
        }
    }

    .number-list {

        .number-cell {
            display: inline-block;
            width: 33.33%;
            height: 60px;
            line-height: 60px;
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
}
</style>

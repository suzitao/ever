<template>
    <div>
        <el-popover ref="areaSelectPopover" placement="bottom-start" v-model="popoverVisible" @show="initPopover()">
            <div class="area-select-popover">
                <div class="options">
                    <el-button v-for="item in optionsToDisplay" :key="item.name" size="mini" :type="getButtonType(item)" @click="selectItem(item)" class="button">{{item.name}}</el-button>
                </div>
                <div class="toolbar">
                    <el-button v-if="parents.length>0" size="mini" type="primary" @click="previousPage()">返回</el-button>
                    <el-button size="mini" type="text" class="cancel-button" @click="popoverVisible=false">取消</el-button>
                    <el-button :disabled="!leafSelected" size="mini" type="primary" @click="handleConfirm()">确定</el-button>
                </div>
            </div>
        </el-popover>
        <el-cascader :options="areaList" :props="props" v-model="areaValue" :placeholder="placeholder" popper-class="area-select-hide" v-popover:areaSelectPopover/>
    </div>
</template>
<script>
import { httpGet } from '~/plugins/axios'

const getPopoverState = context => {
    const {value, areaList} = context
    let optionsToDisplay = areaList
    let selected = null
    let parents = []
    let leafSelected = false
    for (let nodeName of value) {
        let validNode = optionsToDisplay.find(node => node.name === nodeName)
        if (!validNode) {
            selected = null
            break
        }
        selected = validNode
        if (validNode.childs) {
            parents.push(validNode)
            optionsToDisplay = validNode.childs
        } else {
            leafSelected = true
            break
        }
    }
    return { selected, parents, optionsToDisplay, leafSelected }
}

let timeout = null

export default {
    props: {
        value: {
            type: Array
        },
        placeholder: String,
        areaType: String
    },
    computed: {
        areaValue: {
            set (newValue) {
                this.$emit('input', newValue)
            },
            get () {
                return this.value
            }
        }
    },
    watch: {
        areaList () {
            const popoverState = getPopoverState(this)
            Object.assign(this, popoverState)
        }
    },
    methods: {
        handleConfirm () {
            let {selected, parents} = this
            let items = [...parents, selected]
            let newAreaValue = items.map(item => item.name)
            this.popoverVisible = false
            this.areaValue = newAreaValue
        },
        previousPage () {
            let parents = [...this.parents]
            let selected = parents.pop() || null
            let newParentLength = parents.length
            let newDirectParent = newParentLength > 0 ? parents[newParentLength - 1] : null
            let optionsToDisplay = newDirectParent ? newDirectParent.childs : this.areaList
            Object.assign(this, { selected, parents, optionsToDisplay, leafSelected: false })
        },
        selectItem (item) {
            const {childs} = item
            const isLeaf = !childs
            this.leafSelected = isLeaf
            // 被选中的按钮会变成蓝色
            this.selected = item
            // 如果跳转下一级前更换选择，取消之前的跳转
            clearTimeout(timeout)
            if (!isLeaf) {
                // 如果有下一级的话，0.3秒后跳转
                timeout = setTimeout(() => {
                    this.optionsToDisplay = childs
                    this.parents.push(item)
                    // 下一级选中的清零
                    this.selected = null
                }, 300)
            }
        },
        getButtonType (item) {
            const {selected} = this
            if (!selected) {
                return 'text'
            }
            const buttonType = selected.name === item.name ? 'primary' : 'text'
            return buttonType
        },
        initPopover () {
            const popoverState = getPopoverState(this)
            Object.assign(this, popoverState)
        }
    },
    data () {
        return {
            popoverVisible: false,
            optionsToDisplay: [],
            selected: null,
            parents: [],
            leafSelected: false,
            areaList: [],
            props: {
                value: 'name',
                label: 'name',
                children: 'childs'
            }
        }
    },
    async mounted () {
        const areaList = await httpGet('/api/areas?type=' + this.areaType)
        this.areaList = areaList
    }
}
</script>
<style lang="less">
.area-select-popover {
    min-width: 200px;
    max-width: 500px;
    min-height: 100px;
    display: flex;
    flex-direction: column;
    .options {
        display: flex;
        flex-wrap: wrap;
        margin: 0 0 20px 0;
        .button {
            margin: 4px;
            padding: 8px;
            animation: button-enter 0.2s ease-in-out;
        }
    }
    .toolbar {
        margin-top: auto;
        display: flex;
        justify-content: space-between;
        .cancel-button {
            margin: 0 16px 0 auto;
        }
    }
}
.area-select-hide {
    display: none;
}

@keyframes button-enter {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}
</style>

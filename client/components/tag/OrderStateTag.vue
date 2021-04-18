<template>
    <ev-tag :color="stateColor[state]" width="58px">{{stateList[state]}}</ev-tag>
</template>

<script>
import orderState from '~/mixins/orderState'
import EvTag from '~/components/tag/EvTag'
export default {
    mixins: [orderState],
    components: { EvTag },
    props: {
        state: {
            type: Number
        }
    }
}
</script>

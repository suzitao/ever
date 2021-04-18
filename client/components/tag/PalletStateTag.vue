<template>
    <ev-tag :color="palletStateColor[state]" width="58px">{{palletStateList[state]}}</ev-tag>
</template>

<script>
import palletState from '~/mixins/palletState'
import EvTag from '~/components/tag/EvTag'
export default {
    mixins: [palletState],
    components: { EvTag },
    props: {
        state: {
            type: Number
        }
    }
}
</script>

<template>
    <ev-tag :color="statusColorList[status]" width="58px">{{statusList[status]}}</ev-tag>
</template>

<script>
import statusList from '~/mixins/statusList'
import EvTag from '~/components/tag/EvTag'
export default {
    mixins: [statusList],
    components: { EvTag },
    props: {
        status: {
            type: Number
        }
    }
}
</script>

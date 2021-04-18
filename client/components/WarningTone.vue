<template>
    <div>
        <audio id="sound" autoplay="autoplay" />
    </div>
</template>
<script>
export default {
    methods: {
        play (url) {
            const obj = document.getElementById('sound')
            obj.src = url
        },
        warningSuccess () {
            this.play('/sound/success.wav')
        },
        warningFail () {
            this.play('/sound/fail.wav')
        }
    }
}
</script>

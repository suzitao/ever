<template>
    <section class="container">
        <h1 class="title">
            {{ error.statusCode }}
        </h1>
        <h2 class="info">
            {{ error.message }}
        </h2>
        <nuxt-link class="button" to="/" v-if="error.statusCode === 404">
            Homepage
        </nuxt-link>
    </section>
</template>
<script>
    export default {
        props: ['error']
    }
</script>

<style scoped>

    .container {
        text-align: center;
        margin-top: 70px;
    }
    .title {
        margin-top: 15px;
        font-size: 5em;
    }

    .info {
        font-weight: 300;
        color: #9aabb1;
        display: block;
        margin: 20px 0;
    }

    .button {
        display: block;
        margin-top: 50px;
    }
</style>

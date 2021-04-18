<<template>
<div class="article-container">
    <div class="article-container">
        <el-breadcrumb separator="/" class="breadcrumb">
            <el-breadcrumb-item to="/">首页</el-breadcrumb-item>
            <el-breadcrumb-item to="/news">极速快闻</el-breadcrumb-item>
            <el-breadcrumb-item :to="'/news/' + article.id">{{article.title}}</el-breadcrumb-item>
        </el-breadcrumb>
        <div class="article-container-inner" v-html="article.html">
        </div>
    </div>
</div>
</template>

<style lang="less" rel="stylesheet/less">
.article-container {
    .article-container {
        padding: 0px 10px;
        width: 1170px - 20px;
        margin: 0 auto;

        .breadcrumb {
            padding: 15px 0;
        }

        .article-container-inner {
            padding: 15px 15px;
            position: relative;
            min-height: 707px;
            border: solid 1px #eeeeee;
        }
    }
}
</style>

<script>
import { httpGet } from '~/plugins/axios'

export default {
    layout: 'index',
    name: 'Article',
    head: {
        title: '极速快闻'
    },
    async asyncData ({ params, error }) {
        try {
            const article = await httpGet(`/api/article/${params.id}`)
            return { article }
        } catch (err) {
            error({ statusCode: 404, message: err.message })
        }
    }
}
</script>

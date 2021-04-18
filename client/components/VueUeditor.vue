<template> 
    <script :id="randomId" name="content" type="text/plain"></script> 
</template> 
 
<script>
export default {
    name: 'VueUeditor',
    props: {
        ueditorPath: {
            // UEditor 代码的路径
            type: String,
            default: '/ueditor/'
        },
        ueditorConfig: {
            // UEditor 配置项
            type: Object,
            default: function () {
                return {}
            }
        }
    },
    data () {
        return {
            // 为了避免麻烦，每个编辑器实例都用不同的 id
            randomId: '',
            instance: null,
            // scriptTagStatus -> 0:代码未加载，1:两个代码依赖加载了一个，2:两个代码依赖都已经加载完成
            scriptTagStatus: 0
        }
    },
    mounted () {
        this.randomId = 'editor_' + (Math.random() * 100000000000000000)
        if (window.UE !== undefined) {
            // 如果全局对象存在，说明编辑器代码已经初始化完成，直接加载编辑器
            this.scriptTagStatus = 2
            this.initEditor()
        } else {
            // 如果全局对象不存在，说明编辑器代码还没有加载完成，需要加载编辑器代码
            this.insertScriptTag()
        }
    },
    beforeDestroy () {
    // 组件销毁的时候，要销毁 UEditor 实例
        if (this.instance !== null && this.instance.destroy) {
            this.instance.destroy()
        }
    },
    methods: {
        insertScriptTag () {
            let editorScriptTag = document.getElementById('editorScriptTag')
            let configScriptTag = document.getElementById('configScriptTag')
            // 如果这个tag不存在，则生成相关代码tag以加载代码
            if (editorScriptTag === null) {
                configScriptTag = document.createElement('script')
                configScriptTag.type = 'text/javascript'; configScriptTag.src = this.ueditorPath + 'ueditor.config.js'; configScriptTag.id = 'configScriptTag'
                editorScriptTag = document.createElement('script')
                editorScriptTag.type = 'text/javascript'; editorScriptTag.src = this.ueditorPath + 'ueditor.all.js'; editorScriptTag.id = 'editorScriptTag'
                let s = document.getElementsByTagName('head')[0]
                s.appendChild(configScriptTag)
                s.appendChild(editorScriptTag)
            }
            // 等待代码加载完成后初始化编辑器
            if (configScriptTag.loaded) {
                this.scriptTagStatus++
            } else {
                configScriptTag.addEventListener('load', () => {
                    this.scriptTagStatus++
                    configScriptTag.loaded = true
                    this.initEditor()
                })
            }
            if (editorScriptTag.loaded) {
                this.scriptTagStatus++
            } else {
                editorScriptTag.addEventListener('load', () => {
                    this.scriptTagStatus++
                    editorScriptTag.loaded = true
                    this.initEditor()
                })
            }
            this.initEditor()
        },
        initEditor () {
            // scriptTagStatus 为 2 的时候，说明两个必需引入的 js 文件都已经被引入，且加载完成
            if (this.scriptTagStatus === 2 && this.instance === null) {
                // Vue 异步执行 DOM 更新，这样一来代码执行到这里的时候可能 template 里面的 script 标签还没真正创建
                // 所以，我们只能在 nextTick 里面初始化 UEditor
                this.$nextTick(() => {
                    this.ueditorConfig.toolbars = [[
                        'preview', // 预览
                        'print', // 打印
                        'source', // 源代码
                        // 'anchor', // 锚点
                        'undo', // 撤销
                        'redo', // 重做
                        'indent', // 首行缩进
                        // 'snapscreen', // 截图
                        'bold', // 加粗
                        'italic', // 斜体
                        'underline', // 下划线
                        'strikethrough', // 删除线
                        'subscript', // 下标
                        'fontborder', // 字符边框
                        'superscript', // 上标
                        'formatmatch', // 格式刷
                        // 'blockquote', // 引用
                        'pasteplain', // 纯文本粘贴模式
                        'selectall', // 全选
                        'horizontal', // 分隔线
                        'removeformat', // 清除格式
                        'time', // 时间
                        'date', // 日期
                        'unlink', // 取消链接
                        'insertrow', // 前插入行
                        'insertcol', // 前插入列
                        'mergeright', // 右合并单元格
                        'mergedown', // 下合并单元格
                        'deleterow', // 删除行
                        'deletecol', // 删除列
                        'splittorows', // 拆分成行
                        'splittocols', // 拆分成列
                        'splittocells', // 完全拆分单元格
                        'deletecaption', // 删除表格标题
                        'inserttitle', // 插入标题
                        'mergecells', // 合并多个单元格
                        'deletetable', // 删除表格
                        'cleardoc', // 清空文档
                        'insertparagraphbeforetable', // "表格前插入行"
                        // 'insertcode', // 代码语言
                        'fontfamily', // 字体
                        'fontsize', // 字号
                        'paragraph', // 段落格式
                        'simpleupload', // 单图上传
                        'insertimage', // 多图上传
                        'edittable', // 表格属性
                        'edittd', // 单元格属性
                        'link', // 超链接
                        'emotion', // 表情
                        'spechars', // 特殊字符
                        'searchreplace', // 查询替换
                        'map', // Baidu地图
                        'gmap', // Google地图
                        'insertvideo', // 视频
                        'help', // 帮助
                        'justifyleft', // 居左对齐
                        'justifyright', // 居右对齐
                        'justifycenter', // 居中对齐
                        'justifyjustify', // 两端对齐
                        'forecolor', // 字体颜色
                        'backcolor', // 背景色
                        'insertorderedlist', // 有序列表
                        'insertunorderedlist', // 无序列表
                        'fullscreen', // 全屏
                        'directionalityltr', // 从左向右输入
                        'directionalityrtl', // 从右向左输入
                        'rowspacingtop', // 段前距
                        'rowspacingbottom', // 段后距
                        'pagebreak', // 分页
                        // 'insertframe', // 插入Iframe
                        'imagenone', // 默认
                        'imageleft', // 左浮动
                        'imageright', // 右浮动
                        'attachment', // 附件
                        'imagecenter', // 居中
                        'wordimage', // 图片转存
                        'lineheight', // 行间距
                        'edittip ', // 编辑提示
                        'customstyle', // 自定义标题
                        'autotypeset', // 自动排版
                        // 'webapp', // 百度应用
                        'touppercase', // 字母大写
                        'tolowercase', // 字母小写
                        'background', // 背景
                        'template', // 模板
                        'scrawl', // 涂鸦
                        // 'music', // 音乐
                        'inserttable', // 插入表格
                        // 'drafts', // 从草稿箱加载
                        'charts' // 图表
                    ]]
                    this.instance = window.UE.getEditor(this.randomId, this.ueditorConfig)
                    // 绑定事件，当 UEditor 初始化完成后，将编辑器实例通过自定义的 ready 事件交出去
                    this.instance.addListener('ready', () => {
                        this.$emit('ready', this.instance)
                    })
                })
            }
        }
    }
}
</script> 

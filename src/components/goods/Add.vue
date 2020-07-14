<template>
    <div class="box">
         <!-- 面包屑导航栏 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item>添加商品</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片区域 -->
        <el-card>
            <!-- 提示区域 -->
             <el-alert
                title="添加商品信息"
                type="info"
                show-icon :closable="false">
            </el-alert>
            <!-- 步骤条区域 -->
            <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
                <el-step title="基本信息"></el-step>
                <el-step title="商品参数"></el-step>
                <el-step title="商品属性"></el-step>
                <el-step title="商品图片"></el-step>
                <el-step title="商品内容"></el-step>
                <el-step title="内容"></el-step>
            </el-steps>
            <!-- 左边tabs标签页区域 -->
            <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" label-position="top">
                <el-tabs v-model="activeIndex" :tab-position="'left'" :before-leave="beforeTabsLeace" @tab-click="tabClick">
                    <el-tab-pane label="基本信息" name="0">
                        <el-form-item label="商品名称" prop="goods_name">
                            <el-input v-model="addForm.goods_name"></el-input>
                        </el-form-item>
                        <el-form-item label="商品价格" prop="goods_price">
                            <el-input v-model="addForm.goods_price" type="number"></el-input>
                        </el-form-item>
                        <el-form-item label="商品重量" prop="goods_weight">
                            <el-input v-model="addForm.goods_weight" type="number"></el-input>
                        </el-form-item>
                        <el-form-item label="商品数量" prop="goods_number">
                            <el-input v-model="addForm.goods_number" type="number"></el-input>
                        </el-form-item>
                        <el-form-item label="商品分类" prop="goods_cat">
                            <el-cascader
                                v-model="addForm.goods_cat"
                                :options="catelist"
                                :props="catelistProps"
                                @change="cateHandleChange"
                                expandTrigger='hover' >
                            </el-cascader>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品参数" name="1">
                        <!-- 渲染表单的item项 -->
                        <el-form-item :label="item.attr_name" v-for="(item) in attrList" :key="item.attr_id">
                            <!-- 复选框 -->
                            <el-checkbox-group v-model="item.attr_vals">
                                <el-checkbox :label="item2" v-for="(item2, i) in item.attr_vals" :key="i" border></el-checkbox>
                            </el-checkbox-group>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品属性" name="2">
                         <!-- 渲染表单的item项 -->
                        <el-form-item :label="item.attr_name" v-for="(item) in onlyAttrList" :key="item.attr_id">
                           <el-input v-model="item.attr_vals"></el-input>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品图片" name="3">
                        <el-upload
                            :action="uploadURL"
                            :on-preview="handlePreview"
                            :on-remove="handleRemove"
                            list-type="picture" :headers="headerObj" :on-success="handleSuccess">
                            <el-button size="small" type="primary">点击上传</el-button>
                        </el-upload>
                    </el-tab-pane>
                    <el-tab-pane label="商品内容" name="4">
                        <!-- 副文本编辑器 -->
                        <quill-editor v-model="addForm.goods_introduce"></quill-editor>
                        <!-- 添加商品按钮 -->
                        <el-button type="primary" @click="addCate" class="addbtn">添加商品</el-button>
                    </el-tab-pane>
                </el-tabs>
            </el-form>
        </el-card>

        <!-- 图片预览对话框 -->
        <el-dialog
            title="图片预览"
            :visible.sync="previewVisible"
            width="50%">
            <img :src="previewPath" alt="" class="previewImg"/>
        </el-dialog>
    </div>
</template>
<script>
export default {
    data() {
        return {
            // 商品步骤条索引的默认值
            activeIndex: '0',
            // 添加商品的数据表单
            addForm: {
                goods_name: '',
                goods_price: 0,
                goods_weight: 0,
                goods_number: 0,
                // 级联选择器的默认选中项
                goods_cat: [],
                // 上传图片的临时路径
                pics: [],
                // 副文本编辑器的双向绑定数据内容
                goods_introduce: '',
                // 静态属性和动态参数的数组
                attrs: []
            },
            // 添加商品的验证规则
            addFormRules: {
                goods_name: [
                     { required: true, message: '请输入商品名称', trigger: 'blur' }
                ],
                goods_price: [
                     { required: true, message: '请输入商品价格', trigger: 'blur' }
                ],
                goods_weight: [
                     { required: true, message: '请输入商品重量', trigger: 'blur' }
                ],
                goods_number: [
                     { required: true, message: '请输入商品数量', trigger: 'blur' }
                ],
                goods_cat: [
                     { required: true, message: '请选择商品分类', trigger: 'blur' }
                ]
            },
            // 商品分类列表数据
            catelist: [],
            // 级联选择器的选项卡数据
            catelistProps: {
                value: 'cat_id',
                label: 'cat_name',
                children: 'children'
            },
            // 商品分类动态参数列表数据
            attrList: [],
            // 商品分类静态属性列表数据
            onlyAttrList: [],
            // 图片上传地址
            uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
            // 上传图片的headers请求头对象
            headerObj: {
                Authorization: window.sessionStorage.getItem('token')
            },
            // 图片预览事件的url数据
            previewPath: '',
            // 图片预览对话框的显示与隐藏
            previewVisible: false
        }
    },
    created() {
        // 加载页面时获取商品分类列表数据
        this.getCateList()
    },
    methods: {
        // 获取商品分类列表数据
        async getCateList() {
            const { data: res } = await this.$http.get('categories')
            if (res.meta.status !== 200) {
                return this.$message.error('获取商品列表数据失败！')
            }
            this.catelist = res.data
            console.log(this.catelist)
        },
        // 级联选择器的选项事件函数
        cateHandleChange() {
            console.log(this.addForm.goods_cat)
            if (this.addForm.goods_cat.length !== 3) {
                this.addForm.goods_cat = []
                console.log(this.addForm.goods_cat)
            }
        },
        // Tabs选项卡的切换事件  activeName参数代表即将进入下一个标签页的名字  oldActiveName参数代表即将离开的标签页名字
        beforeTabsLeace(activeName, oldActiveName) {
            // console.log(activeName)
            // console.log(oldActiveName)
            // 判断是否满足条件切换选项卡
            if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
                this.$message.error('请选择商品分类！')
                this.addForm.goods_cat = []
                return false// return false 用来阻止切换
            }
        },
        // tabs选项卡的点击事件
        async tabClick() {
            console.log(this.activeIndex)
            // 判断点击的当前的索引值，为商品参数则获取动态参数数据列表
            if (this.activeIndex === '1') {
                const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: 'many' } })
                if (res.meta.status !== 200) {
                    return this.$message.error('获取商品分类参数失败！')
                }
                console.log(res.data)
                // 用foreach循环遍历出来，然后用split做分割，把字符串变成数组
                res.data.forEach(item => {
                    item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
                })
                this.attrList = res.data
                console.log(this.attrList)
            } else if (this.activeIndex === '2') {
                const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: 'only' } })
                if (res.meta.status !== 200) {
                    return this.$message.error('获取商品分类属性失败！')
                }
                this.onlyAttrList = res.data
                console.log(this.onlyAttrList)
            }
        },
        // 图片预览事件
        handlePreview(file) {
            this.previewPath = file.response.data.url
            this.previewVisible = true
        },
        // 图片关闭事件
        handleRemove(file) {
            // 获取图片将要删除的临时路径、
            console.log(file)
            const filepath = file.response.data.tmp_path
            // 获取要删除图片的临时路径的索引值 用findIndex判断数组的索引值
            const i = this.addForm.pics.findIndex(x =>
                x.pic === filepath
            )
            // 把获取到的索引值到数组里删除，splice
            this.addForm.pics.splice(i, 1)
            console.log(this.addForm)
        },
        // 监听上传图片成功后返回的数据
        handleSuccess(response) {
            console.log(response)
            // 获取到图片的临时路径
            const respath = { pic: response.data.tmp_path }
            // 把每个路径添加到pics数组中
            this.addForm.pics.push(respath)
            console.log(this.addForm)
        },
        // 添加商品按钮事件
        addCate() {
        // 表单的预校验
            this.$refs.addFormRef.validate(async valid => {
                if (!valid) {
                    return this.$message.error('请填写表单选项！')
                }
                // 把addForm的goods_cat属性转化为字符串   也可以安装lodash依赖包 用cloneDeep(obj)方法实现拷贝一份，然后操作拷贝那份代码
                this.addForm.goods_cat = this.addForm.goods_cat.join(',')
                console.log(this.addForm)
                console.log(this.onlyAttrList)
                console.log(this.attrList)
                this.attrList.forEach(item => {
                    const newInfo = { attr_id: item.attr_id, attr_value: item.attr_vals.join(' ') }
                    this.addForm.attrs.push(newInfo)
                })
                this.onlyAttrList.forEach(item => {
                    const newInfo = { attr_id: item.attr_id, attr_value: item.attr_vals }
                    this.addForm.attrs.push(newInfo)
                    console.log(this.addForm.attrs)
                })
                const { data: res } = await this.$http.post('goods', this.addForm)
                console.log(res)
                if (res.meta.status !== 201) {
                    return this.$message.error('添加商品失败！')
                }
                this.$message.success('添加商品成功！')
                // 成功后跳转goods页面
                this.$router.push('/goods')
            })
        }
    },
    // 计算属性
    computed: {
        cateId() {
            if (this.addForm.goods_cat.length === 3) {
                return this.addForm.goods_cat[2]
            }
            return null
        }
    }
}
</script>
<style lang="less" scoped>
.el-checkbox {
    margin: 0 10px 0 0 !important;
}
.previewImg {
    width: 100%;
}
.addbtn {
    margin-top: 15px;
}
</style>

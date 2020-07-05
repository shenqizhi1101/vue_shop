<template>
    <div class="box">
        <!-- 面包屑导航栏 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>权限管理</el-breadcrumb-item>
        <el-breadcrumb-item>角色列表</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片区域 -->
        <el-card>
            <el-row>
                <el-col>
                    <el-button type="primary" @click="addCatelist">添加分类</el-button>
                </el-col>
            </el-row>

            <!-- 表格区域 -->
            <tree-table :data="catelist" :columns="columns" :selection-type="false" :expand-type="false" :border="true" :show-row-hover="false" show-index index-text="#" class="treetable">
                <!-- 是否有效 -->
                <template slot="isok" slot-scope="scope">
                    <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color:lightgreen"></i>
                    <i class="el-icon-error" v-else style="color:red"></i>
                </template>
                <!-- 排序 -->
                <template slot="paixu" slot-scope="scope">
                    <el-tag v-if="scope.row.cat_level === 0">一级</el-tag>
                    <el-tag v-else-if="scope.row.cat_level === 1" type="success">二级</el-tag>
                    <el-tag v-else type="warning">三级</el-tag>
                </template>
                <!-- 操作 -->
                <template slot="caozuo" slot-scope="scope">
                    <!-- 编辑按钮 -->
                    <el-button type="primary" icon="el-icon-edit" size="mini" @click="editCateBtn(scope.row.cat_id)">编辑</el-button>
                    <!-- 删除按钮 -->
                    <el-button type="danger" icon="el-icon-delete" size="mini" @click="delCate(scope.row.cat_id)">删除</el-button>
                </template>
            </tree-table>

            <!-- 分页区域 -->
            <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="querInfo.pagenum"
                :page-sizes="[3, 5, 10, 15]"
                :page-size="querInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total">
            </el-pagination>
        </el-card>

        <!-- 添加分类的对话框 -->
        <el-dialog
            title="添加分类"
            :visible.sync="addCateDialogVisible"
            width="50%" @close="addCateDialogClose">
            <!-- 文本区域 -->
            <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
                <el-form-item label="分类名称：" prop="cat_name">
                    <el-input v-model="addCateForm.cat_name"></el-input>
                </el-form-item>
                <el-form-item label="分类名称：">
                    <!-- 级联选择器 -->
                    <!-- v-model是选择产品时的id值 -->
                    <!-- :options是数据源 -->
                    <!-- :props配置选项 -->
                    <el-cascader
                        v-model="parentCateModel"
                        :options="parentCatelist"
                        :props="parentCateProps"
                        @change="parentCateChange"
                        expandTrigger='hover'
                        size="mini"
                        :collapse-tags="true"
                        clearable
                        change-on-select>
                    </el-cascader>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addCateDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addCate">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 编辑分类的对话框 -->
        <el-dialog
            title="编辑分类"
            :visible.sync="editDialogVisible"
            width="50%" @close="editDialogClose">
            <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
                <el-form-item label="分类名称:" prop="cat_name">
                    <el-input v-model="editForm.cat_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editCateDialog">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>
<script>
    export default {
        data() {
            return {
                // 获取分类数据的参数
                querInfo: {
                    type: 3,
                    pagenum: 1,
                    pagesize: 5
                },
                // 获取到的商品分类数据
                catelist: [],
                // 获取的总数据值
                total: 0,
                // 为table指定列的定义
                columns: [
                    {
                        label: '分类名称',
                        prop: 'cat_name',
                        width: '200px'
                    },
                     {
                        label: '是否有效',
                        type: 'template',
                        template: 'isok'
                    },
                     {
                        label: '排序',
                        type: 'template',
                        template: 'paixu'
                    },
                     {
                        label: '操作',
                        type: 'template',
                        template: 'caozuo'
                    }
                ],
                // 添加分类对话框的显示与隐藏
                addCateDialogVisible: false,
                // 添加分类的表单数据对象
                addCateForm: {
                    // 将要添加的分类的名称
                    cat_name: '',
                    // 父级分类的ID
                    cat_pid: 0,
                    // 分类的等级，默认添加的一级分类
                    cat_level: 0
                },
                // 添加分类的表单验证规则
                addCateFormRules: {
                    cat_name: [
                        { required: true, message: '请输入分类名称', trigger: 'blur' },
                        { min: 1, max: 10, message: '长度在 1 到 10 个字符', trigger: 'blur' }
                    ]
                },
                // 获取父级分类的数据
                parentCatelist: [],
                // 选择器的选中商品的id值
                parentCateModel: [],
                // 父级分类选择器的配置选项
                parentCateProps: {
                    value: 'cat_id',
                    label: 'cat_name',
                    children: 'children'
                },
                // 编辑对话框的显示与隐藏
                editDialogVisible: false,
                // 编辑分类的表单数据
                editForm: {},
                // 编辑分类的验证规则
                editFormRules: {
                    cat_name: [
                        { required: true, message: '请输入分类名称', trigger: 'blur' },
                        { min: 1, max: 10, message: '长度在 1 到 10 个字符', trigger: 'blur' }
                    ]
                }
            }
        },
        created() {
            this.getCatelist()
        },
        methods: {
            // 获取商品分类列表数据
            async getCatelist() {
                // 用get请求时参数名用params
                const { data: res } = await this.$http.get('categories', { params: this.querInfo })
                if (res.meta.status !== 200) {
                    return this.$message.error('获取商品分类列表失败！')
                }
                // 成功后保存在数组里
                this.catelist = res.data.result
                console.log(this.catelist)
                // 获取数据的总数据条数
                this.total = res.data.total
            },
            // 获取pagesize的值
            handleSizeChange(newsize) {
                this.querInfo.pagesize = newsize
                this.getCatelist()
            },
            // 获取pagenum的值
            handleCurrentChange(newpage) {
                this.querInfo.pagenum = newpage
                this.getCatelist()
            },
            // 添加分类按钮
            addCatelist() {
                // 获取父级分类的数据列表
                this.getparentCateList()
                // 再显示对话框
                this.addCateDialogVisible = true
            },
            // 获取父级分类的数据列表
            async getparentCateList() {
                const { data: res } = await this.$http.get('categories', { params: { type: 2 } })
                console.log(res.data)
                if (res.meta.status !== 200) {
                    return this.$message.error('获取父级分类数据失败！')
                }
                this.parentCatelist = res.data
            },
            // 选择项发生变化时触发的函数
            parentCateChange() {
                console.log(this.parentCateModel)
                // 判断parentCateModel中的数组是否大于0,是则选了父级分类。
                // 反之没选择父级分类
                if (this.parentCateModel.length > 0) {
                    // 获取父级分类的ID，拿出数组的最后一个数的id值
                    this.addCateForm.cat_pid = this.parentCateModel[this.parentCateModel.length - 1]
                    // 获取父级分类的等级
                    this.addCateForm.cat_level = this.parentCateModel.length
                    return false
                } else {
                    this.addCateForm.cat_pid = 0
                    this.addCateForm.cat_level = 0
                }
            },
            // 添加分类的确定按钮
            addCate() {
                // 表单的预校验检查，如果为true，请求添加数据
                this.$refs.addCateFormRef.validate(async valid => {
                    console.log(this.addCateForm)
                    if (!valid) return
                    const { data: res } = await this.$http.post('categories', this.addCateForm)
                    console.log(res)
                    if (res.meta.status !== 201) {
                        return this.$message.error('添加分类失败！')
                    }
                    this.$message.success('添加分类成功！')
                    this.getCatelist()
                    this.addCateDialogVisible = false
                })
            },
            // 监听添加分类对话框关闭时重置表单数据
            addCateDialogClose() {
                // 重置表单的数据
                this.$refs.addCateFormRef.resetFields()
                this.parentCateModel = []
                this.addCateForm.cat_pid = 0
                this.addCateForm.cat_level = 0
            },
            // 编辑按钮获取表单数据
            async editCateBtn(id) {
                const { data: res } = await this.$http.get(`categories/${id}`)
                console.log(res)
                this.editForm = res.data
                console.log(this.editForm.cat_name)
                this.editDialogVisible = true
            },
            // 编辑对话框的确定按钮
            editCateDialog() {
                this.$refs.editFormRef.validate(async valid => {
                    if (!valid) return
                    console.log(this.editForm.cat_name)
                    const { data: res } = await this.$http.put('categories/' + this.editForm.cat_id, { cat_name: this.editForm.cat_name })
                    console.log(res)
                    if (res.meta.status !== 200) {
                        return this.$message.error('编辑分类失败！')
                    }
                    this.$message.success('编辑分类成功！')
                    this.getCatelist()
                    this.editDialogVisible = false
                })
            },
            // 监听编辑对话框关闭时重置表单数据
            editDialogClose() {
                this.$refs.editFormRef.resetFields()
            },
            // 删除按钮事件
            async delCate(id) {
                const confirmResult = await this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
                }).catch(eer => eer)
                // 如果用户确认删除，则返回字符串confirm
                // 如果用户取消删除，则返回值为字符串cancel
                if (confirmResult !== 'confirm') {
                    return this.$message.info('已取消删除')
                }
                const { data: res } = await this.$http.delete('categories/' + id)
                console.log(res)
                if (res.meta.status !== 200) {
                    return this.$message.error('删除分类失败！')
                }
                this.$message.success('删除分类成功！')
                this.getCatelist()
            }
        }
    }
</script>
<style lang="less" scoped>
.treetable {
    margin-top: 15px;
}
.el-pagination{
    margin-top: 18px;
}
.el-cascader {
    width: 100%;
}
</style>

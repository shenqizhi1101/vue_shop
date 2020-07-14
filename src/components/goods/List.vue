<template>
    <div class="box">
        <!-- 面包屑导航栏 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item>商品列表</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片区域 -->
        <el-card>
            <el-row :gutter="20">
                <el-col :span="8">
                    <el-input placeholder="请输入内容" v-model="querInfo.query" clearable @clear="getGoodsList">
                        <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
                    </el-input>
                </el-col>
                <el-col :span="4">
                    <el-button type="primary" @click="goGoodsPage">添加商品</el-button>
                </el-col>
            </el-row>

            <!-- 表格区域 -->
            <el-table :data="goodsList" border stripe>
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column label="商品名称" prop="goods_name"></el-table-column>
                <el-table-column label="商品价格(元)" prop="goods_price" width="90px;"></el-table-column>
                <el-table-column label="商品重量" prop="goods_weight" width="75px;"></el-table-column>
                <el-table-column label="创建时间" prop="add_time" width="120px;">
                    <template slot-scope="scope">{{scope.row.add_time | dateFormat}}</template>
                </el-table-column>
                <el-table-column label="操作" width="130px;">
                    <template slot-scope="scope">
                        <el-button type="primary" icon="el-icon-edit" size="mini" @click="editList(scope.row.goods_id)"></el-button>
                        <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteList(scope.row.goods_id)"></el-button>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 表格分页区域 -->
            <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="querInfo.pagenum"
                :page-sizes="[5, 10, 15, 20]"
                :page-size="querInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total" background>
            </el-pagination>
        </el-card>

        <!-- 编辑按钮的对话框 -->
        <el-dialog
            title="编辑商品"
            :visible.sync="editDialogVisible"
            width="50%" @close="editDialogClose">
            <el-form :model="editLists" :rules="editListsRules" ref="editListsRef" label-width="100px">
                <el-form-item label="商品名称" prop="goods_name">
                    <el-input v-model="editLists.goods_name"></el-input>
                </el-form-item>
                <el-form-item label="商品价格" prop="goods_price">
                    <el-input v-model="editLists.goods_price"></el-input>
                </el-form-item>
                <el-form-item label="商品重量" prop="goods_weight">
                    <el-input v-model="editLists.goods_weight"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editDialog">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>
<script>
export default {
    data() {
        return {
            // 请求参数的数据
            querInfo: {
                query: '',
                pagenum: 1,
                pagesize: 10
            },
            // 获取到的商品列表数据
            goodsList: [],
            // 获取数据的总条数
            total: 0,
            // 编辑商品获取到的信息数据
            editLists: [],
            // 编辑对话框的显示与隐藏
            editDialogVisible: false,
            // 编辑的验证表单规则
            editListsRules: {
                goods_name: [
                    { required: true, message: '请输入商品名称', trigger: 'blur' }
                ],
                goods_price: [
                    { required: true, message: '请输入商品价格', trigger: 'blur' }
                ],
                goods_weight: [
                    { required: true, message: '请输入商品重量', trigger: 'blur' }
                ]
            }
        }
    },
    created() {
        // 加载页面请求商品列表数据
        this.getGoodsList()
    },
    methods: {
        // 请求商品列表数据函数
        async getGoodsList() {
            const { data: res } = await this.$http.get('goods', { params: this.querInfo })
            console.log(res)
            if (res.meta.status !== 200) {
                return this.$message.error('获取商品列表失败！')
            }
            this.$message.success('获取商品列表成功！')
            this.goodsList = res.data.goods
            this.total = res.data.total
            console.log(this.goodsList)
        },
        // 改变分页pagesize值的事件
        handleSizeChange(newSize) {
            this.querInfo.pagesize = newSize
            this.getGoodsList()
        },
        // 改变分页pagenum值的事件
        handleCurrentChange(newPage) {
            this.querInfo.pagenum = newPage
            this.getGoodsList()
        },
        // 删除商品的事件
        async deleteList(id) {
            const confirmResult = await this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
            }).catch(eer => eer)
            console.log(confirmResult)
            if (confirmResult !== 'confirm') {
                return this.$message.info('已取消删除!')
            }
            const { data: res } = await this.$http.delete(`goods/${id}`)
            console.log(res)
            if (res.meta.status !== 200) {
                return this.$message.error('删除商品失败！')
            }
            this.$message.success('删除商品成功！')
            this.getGoodsList()
        },
        // 点击添加商品按钮跳转到新的页面
        goGoodsPage() {
            this.$router.push('/goods/add')
        },
        // 编辑商品按钮
        async editList(id) {
            console.log(id)
            const { data: res } = await this.$http.get('goods/' + id)
            if (res.meta.status !== 200) {
                return this.$message.error('获取商品信息失败！')
            }
            this.editLists = res.data
            console.log(this.editLists)
            this.editDialogVisible = true
        },
        // 编辑商品对话框的关闭事件
        editDialogClose() {
            // 恢复表单的默认状态
            this.$refs.editListsRef.resetFields()
        },
        // 编辑商品对话框的确定按钮
        async editDialog() {
            const { data: res } = await this.$http.put(`goods/${this.editLists.goods_id}`, this.editLists)
            console.log(res)
            this.getGoodsList()
            this.editDialogVisible = false
        }
    }
}
</script>
<style lang="less" scoped>
.box {min-width: 1166px;}
</style>

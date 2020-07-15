<template>
    <div class="box">
        <!-- 面包屑导航栏 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>订单管理</el-breadcrumb-item>
        <el-breadcrumb-item>订单列表</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片区域 -->
        <el-card>
            <el-row>
                <el-col :span="8">
                     <el-input placeholder="请输入内容" v-model="orderInfo.query" clearable @clear="getOrderList">
                        <el-button slot="append" icon="el-icon-search" @click="getOrderList"></el-button>
                    </el-input>
                </el-col>
            </el-row>

            <!-- 表格区域 -->
            <el-table :data="orderList" border stripe>
                <el-table-column type="index"></el-table-column>
                <el-table-column label="订单编号" prop="order_number"></el-table-column>
                <el-table-column label="订单价格" prop="order_price"></el-table-column>
                <el-table-column label="是否付款" prop="order_pay">
                    <template slot-scope="scope">
                        <el-tag type="success" v-if="scope.row.order_pay === '1'">已付款</el-tag>
                        <el-tag type="danger" v-else>未付款</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="是否发货" prop="is_send"></el-table-column>
                <el-table-column label="下单时间" prop="create_time">
                    <template slot-scope="scope">
                    {{scope.row.create_time | dateFormat}}
                    </template>
                </el-table-column>
                <el-table-column label="操作">
                    <template slot-scope="">
                        <el-button type="primary" icon="el-icon-edit" size="mini" @click="showAddress"></el-button>
                        <el-button type="success" icon="el-icon-location" size="mini" @click="showProgress"></el-button>
                    </template>
                </el-table-column>
            </el-table>
            <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="orderInfo.pagenum"
                :page-sizes="[5, 10, 15, 20]"
                :page-size="orderInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total">
            </el-pagination>
        </el-card>

        <!-- 修改地址的对话框 -->
        <el-dialog
            title="修改地址"
            :visible.sync="addAdressVisible"
            width="50%" @close="addressDialogClose">
            <el-form :model="addressForm" :rules="addressFormRules" ref="addressFormRef" label-width="100px">
                <el-form-item label="省市区/县" prop="address1">
                    <el-cascader
                        v-model="addressForm.address1"
                        :options="cityData"
                        @change="AddressHandleChange">
                    </el-cascader>
                </el-form-item>
                <el-form-item label="详细地址" prop="address2">
                    <el-input v-model="addressForm.address2"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addAdressVisible = false">取 消</el-button>
                <el-button type="primary" @click="addAdressVisible = false">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 查看物流进度的对话框 -->
        <el-dialog
            title="物流进度"
            :visible.sync="addProgressVisible"
            width="50%">
            <el-timeline>
                <el-timeline-item
                v-for="(activity, index) in progressInfo"
                :key="index"
                :timestamp="activity.time">
                {{activity.context}}
                </el-timeline-item>
            </el-timeline>
        </el-dialog>
    </div>
</template>
<script>
// 引入js文件
import cityData from './citydata.js'
    export default {
        data() {
            return {
                // 获取订单数据列表的参数
                orderInfo: {
                    query: '',
                    pagenum: 1,
                    pagesize: 10
                },
                // 订单列表数据
                orderList: [],
                // 获取到的订单列表的总条数
                total: 0,
                // 修改地址对话框的显示与隐藏
                addAdressVisible: false,
                // 修改地址的表单数据
                addressForm: {
                    address1: [],
                    address2: ''
                },
                // 修改地址的表单验证规则
                addressFormRules: {
                    address1: [
                        { required: true, message: '请选择省市区/县', trigger: 'blur' }
                    ],
                    address2: [
                        { required: true, message: '请填写详细地址', trigger: 'blur' }
                    ]
                },
                // 初始化js文件
                cityData,
                // 物流进度对话框的显示与隐藏
                addProgressVisible: false,
                // 获取到物流进度的数据数组
                progressInfo: []
            }
        },
        created() {
            // 页面加载时获取的订单数据列表
            this.getOrderList()
        },
        methods: {
            // 加载页面获取的订单列表数据
            async getOrderList() {
                const { data: res } = await this.$http.get('orders', { params: this.orderInfo })
                if (res.meta.status !== 200) {
                    return this.$message.error('获取订单列表失败！')
                }
                this.$message.success('获取订单列表成功！')
                console.log(res)
                this.orderList = res.data.goods
                console.log(this.orderList)
                this.total = res.data.total
            },
            // 改变分页的pagesize值
            handleSizeChange(newSize) {
                this.orderInfo.pagesize = newSize
                this.getOrderList()
            },
            // 改变分页的pagenum值
            handleCurrentChange(newPage) {
                this.orderInfo.pagenum = newPage
                this.getOrderList()
            },
            // 点击修改地址按钮
            showAddress() {
                this.addAdressVisible = true
            },
            // 修改地址的对话框关闭
            addressDialogClose() {
                // 初始化表单的默认状态
                this.$refs.addressFormRef.resetFields()
            },
            // 修改地址的级联选择器的选项事件
            AddressHandleChange() {},
            // 点击查看物流信息按钮
            async showProgress() {
                const { data: res } = await this.$http.get('/kuaidi/1106975712662')
                if (res.meta.status !== 200) {
                    return this.$message.error('获取物流进度失败！')
                }
                this.progressInfo = res.data
                console.log(this.progressInfo)
                this.addProgressVisible = true
            }
        }
    }
</script>
<style lang="less" scoped>
.el-cascader {
    width: 100%;
}
</style>

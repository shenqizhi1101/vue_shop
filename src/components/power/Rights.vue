<template>
    <div class="box">
        <!-- 面包屑导航栏 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>权限管理</el-breadcrumb-item>
            <el-breadcrumb-item>权限列表</el-breadcrumb-item>
        </el-breadcrumb>
         <!-- 卡片区域 -->
         <el-card>
             <!-- 表格区域 -->
             <el-table :data="rightsList" border stripe>
                 <el-table-column type="index" label="#"></el-table-column>
                 <el-table-column label="权限名称" prop="authName"></el-table-column>
                 <el-table-column label="路径" prop="path"></el-table-column>
                 <el-table-column label="权限等级" prop="level">
                    <template slot-scope="scope">
                        <el-tag v-if="scope.row.level === '0'">一级</el-tag>
                        <el-tag type="success" v-else-if="scope.row.level === '1'">二级</el-tag>
                        <el-tag type="warning" v-else>三级</el-tag>
                    </template>
                 </el-table-column>
             </el-table>
         </el-card>
    </div>
</template>
<script>
export default {
    data() {
        return {
            // 权限列表数据
            rightsList: []
        }
    },
    created() {
        // 获取所有权限列表事件
        this.getRightsList()
    },
    methods: {
        // 获取权限事件
        async getRightsList() {
            const { data: res } = await this.$http.get('rights/list')
            console.log(res)
            if (res.meta.status !== 200) {
                return this.$message.error('获取权限列表失败！');
            }
            this.$message.success('获取权限列表成功！')
            // 把获取的权限列表数据保存到数组
            this.rightsList = res.data
        }
    }
}
</script>
<style lang="less" scoped>
.box {
    width: 100%;
    height: auto;
}
.el-breadcrumb {
  margin-bottom: 15px;
  margin-left: 10px;
  margin-top: 15px;
  font-size: 15px;
  display: flex;
  align-items: center;
}
</style>

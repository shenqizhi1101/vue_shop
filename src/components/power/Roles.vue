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
      <!-- 添加角色按钮区域 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="dialogVisible = true">添加角色</el-button>
        </el-col>
      </el-row>

      <!-- 角色列表区域 -->
      <el-table :data="rolesList" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <!-- 作用域插槽 -->
          <template slot-scope="scope">
          <!-- i1判断是否是在第一个，是就加样式borderTop -->
            <el-row :class="['borderBottom', i1 == 0 ? 'borderTop' : '', 'vcenter']" v-for="( item1, i1 ) in scope.row.children" :key="item1.id">
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="delRightById(scope.row, item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="19">
              <!-- 用for循环渲染二级权限 -->
                <el-row :class="[i2 == 0 ? '':'borderTop', 'vcenter']" v-for="( item2, i2 ) in item1.children" :key="item2.id">
                  <el-col :span="6">
                    <el-tag type="success" closable @close="delRightById(scope.row, item2.id)">{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 用for循环渲染三级权限 -->
                  <el-col  :span="18">
                      <el-tag closable type="warning" v-for="(item3) in item2.children" :key="item3.id" @close="delRightById(scope.row, item3.id)">{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
            <!-- 渲染全部数据 -->
            <!-- <pre>{{scope.row}}</pre> -->
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
          <!-- 编辑按钮 -->
            <el-button size="mini" type="primary" icon="el-icon-edit" @click="editRole(scope.row.id)">编辑</el-button
            >
            <!-- 删除按钮 -->
            <el-button size="mini" type="danger" icon="el-icon-delete" @click="deleRole(scope.row.id)">删除</el-button
            >
            <!-- 分配按钮 -->
            <el-button size="mini" type="warning" icon="el-icon-setting" @click="showSetRightDialog(scope.row)">分配权限</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加角色的对话框 -->
    <el-dialog title="添加角色" :visible.sync="dialogVisible" @close="adddialogVisible" width="50%">
    <!-- 文本区域 -->
      <span>
          <el-form :model="addRoles"
          :rules="addRolesRules"
          ref="addRolesRef"
          label-width="100px">
              <el-form-item label="角色名称" prop="roleName">
                  <el-input v-model="addRoles.roleName"></el-input>
              </el-form-item>
              <el-form-item label="角色描述" prop="roleDesc">
                  <el-input v-model="addRoles.roleDesc"></el-input>
              </el-form-item>
          </el-form>
      </span>
      <span slot="footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑角色信息的对话框 -->
    <el-dialog title="编辑角色" :visible.sync="editdialogVisible" @close="editDialogVisible" width="50%">
    <!-- 文本区域 -->
      <span>
          <el-form :model="editRoles"
          :rules="editRolesRules"
          ref="editRolesRef"
          label-width="100px">
              <el-form-item label="角色名称" prop="roleName">
                  <el-input v-model="editRoles.roleName"></el-input>
              </el-form-item>
              <el-form-item label="角色描述" prop="roleDesc">
                  <el-input v-model="editRoles.roleDesc"></el-input>
              </el-form-item>
          </el-form>
      </span>
      <span slot="footer">
        <el-button @click="editdialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRoleslist">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配权限的对话框 -->
    <el-dialog title="分配权限" :visible.sync="setRightDialogVisible" width="50%" @close="setRightDialogClose()">
      <!-- 树形控件 -->
      <el-tree :data="setrightlist" :props="treeProps" show-checkbox node-key='id' default-expand-all :default-checked-keys="defaultkeys" ref="treeRef"></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights()">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      // 所有角色列表数据
      rolesList: {},
      // 修改当前角色信息的数据
      editRoles: {},
      // 添加角色对话框的显示与隐藏
      dialogVisible: false,
      // 编辑角色对话框的显示与隐藏
      editdialogVisible: false,
      // 分配权限对话框的显示与隐藏
      setRightDialogVisible: false,
      // 分配权限的数据
      setrightlist: [],
      // 分配权限点击获取当前的id
      closeId: '',
      // 分配权限的树形控件的属性绑定对象
      treeProps: {
        children: 'children',
        label: 'authName'
      },
      // 默认勾选的节点的 key 的数组
      defaultkeys: [],
    //   添加用户数据
      addRoles: {
          roleName: '',
          roleDesc: ''
      },
      // 添加角色的规则
      addRolesRules: {
        roleName: [
            { required: true, message: '请输入角色名称', trigger: 'blur' },
            { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
          ],
        roleDesc: [
          { required: false, message: '请输入角色描述', trigger: 'blur' },
          { min: 0, max: 20, message: '长度在 0 到 20 个字符', trigger: 'blur' }
        ]
      },
      // 编辑角色的规则
      editRolesRules: {
        roleName: [
            { required: true, message: '请输入角色名称', trigger: 'blur' },
            { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
          ],
        roleDesc: [
          { required: false, message: '请输入角色描述', trigger: 'blur' },
          { min: 0, max: 20, message: '长度在 0 到 20 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    // 获取角色列表数据的事件加载
    this.getRolesList()
  },
  methods: {
    // 获取角色列表数据的事件操作
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')
      console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('请求角色列表失败！')
      }
      this.rolesList = res.data
    },
    // 取消角色对话框时，恢复对话框初始值
      adddialogVisible() {
        this.$refs.addRolesRef.resetFields();
      },
    // 添加角色按钮
    addRole() {
      // 预校验检查，如果为true,请求数据添加角色
      this.$refs.addRolesRef.validate(async valid => {
        if (!valid) return
          // 可以发起添加角色数据请求
          const { data: res } = await this.$http.post('roles', this.addRoles)
          console.log(res)
          if (res.meta.status !== 201) {
            return this.$message.error('创建新角色失败！')
          }
          // 成功后返回提示消息
          this.$message.success('创建新角色成功！')
          this.getRolesList()
          this.dialogVisible = false;
      })
    },
    // 取消编辑角色对话框时，恢复默认属性
    editDialogVisible() {
      this.$refs.editRolesRef.resetFields();
    },
    // 编辑角色信息的获取信息和对话框显示与隐藏
    async editRole(id) {
      const { data: res } = await this.$http.get('roles/' + id)
      console.log(res)
      this.editdialogVisible = true
      // 保存在数组里
      this.editRoles = res.data
    },
    // 编辑对话框的确定按钮请求数据
    editRoleslist() {
      //  预校验检查，如果为true,请求数据添加角色
      this.$refs.editRolesRef.validate(async valid => {
        if (!valid) return
        // 请求路径带参数方式
        console.log(this.editRoles)
        const { data: res } = await this.$http.put('roles/' + this.editRoles.roleId, { roleName: this.editRoles.roleName, roleDesc: this.editRoles.roleDesc })
        this.editdialogVisible = false
        // 保存在数组里
        this.$message.success('修改角色信息成功！')
        this.editRoles = res.data
        this.getRolesList()
      })
    },
    // 删除角色按钮 使用MessageBox弹框和$confirm组件
    async deleRole(id) {
      const confirmResult = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(eer => eer)
      // 如果用户确认删除，则返回字符串confirm
      // 如果用户取消删除，则返回值为字符串cancel
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除！')
      }
      const { data: res } = await this.$http.delete('roles/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除角色失败！')
      }
      this.$message.success('删除角色成功！')
      this.getRolesList()
    },
    // 点击三级权限的x按钮删除事件
    async delRightById(role, rightId) {
      const confirmResult = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(eer => eer)
        if (confirmResult !== 'confirm') return this.$message.info('已取消删除')
        // 删除权限数据的请求
        const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
        if (res.meta.status !== 200) {
          return this.$message.error('删除权限失败！')
        }
        // 删除成功后重新渲染页面的最新数据
        role.children = res.data
    },
    // 分配权限按钮
    async showSetRightDialog(row) {
      this.closeId = row.id
      // 获取对话框的权限数据
      const { data: res } = await this.$http.get('rights/tree')
      console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限失败！')
      }
      // 成功获取数据后保存到数组中
      this.setrightlist = res.data
      console.log(this.setrightlist)
      // 递归获取三级节点的id
      this.getLeftKeys(row, this.defaultkeys)
      console.log(this.defaultkeys)
      // 显示对话框
      this.setRightDialogVisible = true
    },
    // 通过递归的形式，获取角色下所有的三级权限id，并保存在defaultkeys数组中
    getLeftKeys(node, arr) {
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => {
        this.getLeftKeys(item, arr)
      });
    },
    // 关闭分配权限的对话框时的事件、
    setRightDialogClose() {
      // 关闭对话框时，初始化数组
      this.defaultkeys = []
    },
    // 点击角色分配权限
    async allotRights() {
      const keys = [
        // 返回目前选中和半选中的节点的 key 所组成的数组
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      // 用,拼接的字符串,用于请求数据
      const idstr = keys.join(',')
      console.log(keys)
      console.log(idstr)
      const { data: res } = await this.$http.post(`roles/${this.closeId}/rights`, { rids: idstr })
      if (res.meta.status !== 200) {
        return this.$message.error('分配权限失败！')
      }
      this.getRolesList()
      this.setRightDialogVisible = false
    }
  }
}
</script>
<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.borderTop {
  border-top:1px solid #eee;
}
.borderBottom {
  border-bottom:1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>

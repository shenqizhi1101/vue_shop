<template>
  <div class="box">
     <!-- 面包屑导航栏 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区域 -->
    <el-card>
         <!-- 警告框 -->
        <el-row>
            <el-col>
                <el-alert title="注意：只允许为第三级分类设置相关参数！" type="warning" show-icon :closable='false'> </el-alert>
            </el-col>
        </el-row>
        <!-- 选择商品的级联选择框 -->
        <el-row class="cat_margin">
            <el-col>
                <span>选择商品分类：</span>
                <!-- 级联选择框 -->
                <el-cascader expandTrigger='hover' v-model="cateListMoel" :options="catelist" :props="cateListProps" @change="cateListChange">
                </el-cascader>
            </el-col>
        </el-row>

        <!-- tabs页签区域 -->
        <el-tabs v-model="activeName" @tab-click="tabHandleClick">
          <el-tab-pane label="动态参数" name="many">
            <el-button type="primary" :disabled="isBtnDisabled" @click="addDialogVisible = true">添加参数</el-button>
            <!-- 动态参数表格 -->
            <el-table :data="manyCateData" border stripe>
            <!-- 展开列 -->
             <el-table-column type="expand">
             <!-- 渲染出参数项的可选项 -->
              <template slot-scope="scope">
                  <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="hanldClose(i,scope.row)">{{item}}</el-tag>
                  <!-- 添加参数项的按钮 -->
                  <el-input
                    class="input-new-tag"
                    v-if="scope.row.inputVisible"
                    v-model="scope.row.inputValue"
                    ref="saveTagInput"
                    size="small"
                    @keyup.enter.native="handleInputConfirm(scope.row)"
                    @blur="handleInputConfirm(scope.row)"
                  >
                  </el-input>
                  <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
             </el-table-column>
              <!-- 索引列 -->
              <el-table-column type="index"></el-table-column>
              <el-table-column label="参数名称" prop="attr_name"></el-table-column>
              <el-table-column label="操作">
                <template slot-scope="scope">
                  <el-button size="mini" type="primary" icon="el-icon-edit" @click="editDialog(scope.row.attr_id)">编辑</el-button>
                  <el-button size="mini" type="danger" icon="el-icon-delete" @click="deleteParams(scope.row.attr_id)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
          <el-tab-pane label="静态属性" name="only">
            <el-button type="primary" :disabled="isBtnDisabled" @click="addDialogVisible = true">添加属性</el-button>
            <!-- 静态属性表格 -->
            <el-table :data="onlyCateData" border stripe>
            <!-- 展开列 -->
             <el-table-column type="expand">
             <!-- 渲染出参数项的可选项 -->
              <template slot-scope="scope">
                <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="hanldClose(i,scope.row)">{{item}}</el-tag>
                <!-- 添加参数项的按钮 -->
                  <el-input
                    class="input-new-tag"
                    v-if="scope.row.inputVisible"
                    v-model="scope.row.inputValue"
                    ref="saveTagInput"
                    size="small"
                    @keyup.enter.native="handleInputConfirm(scope.row)"
                    @blur="handleInputConfirm(scope.row)"
                  >
                  </el-input>
                  <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
             </el-table-column>
              <!-- 索引列 -->
              <el-table-column type="index"></el-table-column>
              <el-table-column label="属性名称" prop="attr_name"></el-table-column>
              <el-table-column label="操作">
                <template slot-scope="scope">
                  <el-button size="mini" type="primary" icon="el-icon-edit" @click="editDialog(scope.row.attr_id)">编辑</el-button>
                  <el-button size="mini" type="danger" icon="el-icon-delete" @click="deleteParams(scope.row.attr_id)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>
    </el-card>

    <!-- 添加参数和属性的对话框 -->
    <el-dialog :title="'添加' + addtext" :visible.sync="addDialogVisible" width="50%" @close="addDialogClose">
      <!-- form表单 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item :label="addtext" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>

     <!-- 编辑参数和属性的对话框 -->
    <el-dialog :title="'编辑' + addtext" :visible.sync="editDialogVisible" width="50%" @close="editDialogClose">
      <!-- form表单 -->
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item :label="addtext" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
      return {
        //   保存商品列表数据
        catelist: [],
        // 级联选择框双向绑定的数组
        cateListMoel: '',
        // 级联选择框的选项属性
        cateListProps: {
            value: 'cat_id',
            label: 'cat_name',
            children: 'children'
        },
        // 被激活的页签，绑定name的值
        activeName: 'many',
        // 级联选择器获取的第三级分类的ID
        cateid: '',
        // 动态参数的数组
        manyCateData: [],
        // 静态属性的数组
        onlyCateData: [],
        // 添加参数和属性对话框的显示与隐藏
        addDialogVisible: false,
        // 添加参数或属性的对象
        addForm: {
          attr_name: ''
        },
        // 添加参数和属性的验证规则对象
        addFormRules: {
          attr_name: [
            { required: true, message: '请输入参数名称', trigger: 'blur' }
          ]
        },
        // 编辑参数和属性对话框的显示与隐藏
        editDialogVisible: false,
        // 编辑对话框的参数和属性对象
        editForm: {
          attr_name: ''
        },
        // 编辑参数和属性的验证规则对象
        editFormRules: {
          attr_name: [
            { required: true, message: '请输入参数名称', trigger: 'blur' }
          ]
        },
        // 文本框中的值
        inputValue: '',
        // 控制文本框的显示与隐藏
        inputVisible: false
      }
  },
  created() {
    //   加载商品列表函数
      this.getCatelist()
  },
  methods: {
    //   获取商品列表数据
      async getCatelist() {
          const { data: res } = await this.$http.get('categories')
          if (res.meta.status !== 200) {
              return this.$message.error('获取商品列表失败！')
          }
          this.catelist = res.data
          console.log(this.catelist)
      },
      // 监听选择栏改变的事件
      cateListChange() {
        this.getParamsList()
      },
      // tabs标签的点击事件处理函数
      tabHandleClick() {
        this.getParamsList()
      },
      // 获取参数的数据列表
      async getParamsList() {
        if (this.cateListMoel.length !== 3) {
          this.cateListMoel = []
          this.manyCateData = []
          this.onlyCateData = []
          return false
        }
        console.log(this.cateListMoel)
        // 判断选择栏是否选中第三级分类。是则拿出第三级分类的id，然后进行数据请求
        if (this.cateListMoel.length === 3) {
          this.cateid = this.cateListMoel[2]
          const { data: res } = await this.$http.get(`categories/${this.cateid}/attributes`, { params: { sel: this.activeName } })
          if (res.meta.status !== 200) {
            return this.$message.error('获取分类参数列表失败！')
          }
          // 用foreach循环遍历出来，然后用split做分割，把字符串变成数组
          res.data.forEach(item => {
            item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
            // 给每个数组数据添加一个文本框的空值
            item.inputValue = ''
            // 给每个数组数据控制文本框的显示与隐藏
            item.inputVisible = false
          });
          console.log(res.data)
          if (this.activeName === 'many') {
            this.manyCateData = res.data
            console.log(this.manyCateData)
            return false
          } else {
            this.onlyCateData = res.data
            return false
          }
        } else {
          return null
        }
      },
      // 添加参数和属性的对话框的关闭事件
      addDialogClose() {
        this.$refs.addFormRef.resetFields()
      },
      // 添加参数和属性对话框的确定按钮
      addParams() {
        this.$refs.addFormRef.validate(async valid => {
          if (!valid) return
          const { data: res } = await this.$http.post(`categories/${this.cateid}/attributes`, { attr_name: this.addForm.attr_name, attr_sel: this.activeName })
          console.log(res)
          if (res.meta.status !== 201) {
            return this.$message.error('添加' + this.addtext + '失败！')
          }
          this.$message.success('添加' + this.addtext + '成功！')
          this.addDialogVisible = false
          this.getParamsList()
        })
      },
      // 编辑按钮
      async editDialog(id) {
        const { data: res } = await this.$http.get(`categories/${this.cateid}/attributes/${id}`, { params: { attr_sel: this.activeName } })
        console.log(res)
        if (res.meta.status !== 200) {
          return this.$message.error('获取' + this.addtext + '名称失败！')
        }
        // 获取成功后保存在数组里
        this.editForm = res.data
        this.editDialogVisible = true
      },
      // 编辑对话框的确定事件
      editParams() {
        console.log(this.editForm)
        // 表单的预检验
        this.$refs.editFormRef.validate(async valid => {
          if (!valid) return
          const { data: res } = await this.$http.put(`categories/${this.editForm.cat_id}/attributes/${this.editForm.attr_id}`, { attr_name: this.editForm.attr_name, attr_sel: this.editForm.attr_sel })
          console.log(res)
          if (res.meta.status !== 200) {
            return this.$message.error('更新' + this.addtext + '失败！')
          }
          this.$message.success('更新' + this.addtext + '成功！')
          this.editDialogVisible = false
          this.getParamsList()
        })
      },
      // 编辑对话框的关闭事件
      editDialogClose() {
        this.$refs.editFormRef.resetFields()
      },
      // 删除参数或者属性的事件
      async deleteParams(id) {
        const confirmResult = await this.$confirm('此操作将永久删除该' + this.addtext + ',是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(eer => eer)
        if (confirmResult !== 'confirm') {
          return this.$message.info('已取消删除!')
        }
        const { data: res } = await this.$http.delete(`categories/${this.cateid}/attributes/${id}`)
        console.log(res)
        if (res.meta.status !== 200) {
          return this.$message.error('删除' + this.addtext + '失败！')
        }
        this.$message.success('删除' + this.addtext + '成功！')
        this.getParamsList()
      },
      // 文本框失去焦点，或者点击enter键触发
      async handleInputConfirm(row) {
        // 判断文本框是否有空格或者有文字，有非法数字则清空文本框   trim()方法为去除两边的空格
        if (row.inputValue.trim().length === 0) {
          row.inputValue = ''
          row.inputVisible = false
          return
        }
        // 否则文本框不为空，则数据请求做后续处理
        // 把新增加的选项添加到数组里
        row.attr_vals.push(row.inputValue.trim())
        row.inputValue = ''
        row.inputVisible = false
        // 请求数据，把选项添加到数据库中  row.attr_vals.join(' ')是把数组转换成字符串
        const { data: res } = await this.$http.put(`categories/${this.cateid}/attributes/${row.attr_id}`, { attr_name: row.attr_name, attr_sel: row.attr_sel, attr_vals: row.attr_vals.join(' ') })
        console.log(res)
        if (res.meta.status !== 200) {
          return this.$message.error('添加参数项失败！')
        }
        this.$message.success('添加参数项成功！')
      },
      // 点击按钮，显示文本框,传参数为了控制点击的那个数据改变
      showInput(row) {
        row.inputVisible = true
        // 让文本框自动获取焦点
        // $nextTick方法的作用是当页面上元素被重新渲染后，才会指定回调函数中的代码
         this.$nextTick(_ => {
          this.$refs.saveTagInput.$refs.input.focus();
        });
      },
      // tag标签删除事件
      async hanldClose(i, row) {
        console.log(i)
        row.attr_vals.splice(i, 1)
        const { data: res } = await this.$http.put(`categories/${this.cateid}/attributes/${row.attr_id}`, { attr_name: row.attr_name, attr_sel: row.attr_sel, attr_vals: row.attr_vals.join(' ') })
        console.log(res)
        if (res.meta.status !== 200) {
          return this.$message.error('删除参数项失败！')
        }
        this.$message.success('删除参数项成功！')
      }
  },
  // 计算属性
  computed: {
    // 如果按钮需要被禁用，则返回False,否则返回true
    isBtnDisabled() {
      // 判断cateListMoel选择框有没有值，是不是三级分类
      if (this.cateListMoel.length !== 3) {
        return true
      }
      return false
    },
    // 判断添加参数和属性的名称事件
    addtext() {
      if (this.activeName === 'many') {
        return '动态参数'
      } else {
        return '静态属性'
      }
    }
  }
}
</script>
<style lang="less" scoped>
.box {
    width: 100%;
    height: auto;
}
.cat_margin {
    margin: 15px;
}
.el-tag {margin: 8px;}
.input-new-tag {
  width: 100px;
}
</style>

<template>
    <div>
        <!-- 面包屑导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item><a href="/">商品管理</a></el-breadcrumb-item>
          <el-breadcrumb-item><a href="/">参数列表</a></el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片 -->
        <el-card>
            <!-- 警告区域 -->
            <el-alert title="注意：只允许为第三级分类设置相关参数" type="warning" show-icon :closable="false">
            </el-alert>

            <!-- 选择商品分类区域 -->
            <el-row class="cate">
                <el-col>
                    <span>选择商品分类：</span>
                    <!-- 级联选择框 -->
                    <el-cascader v-model="selectedKeys" :options="cateList" :props="cascaderConfig" @change="cateHandleChange"></el-cascader>
                </el-col>
            </el-row>

            <!-- tabs区域 -->
            <el-tabs v-model="activeName" @tab-click="handleClick">
                <!-- 添加动态参数区域 -->
                <el-tab-pane label="动态参数" name="many">
                    <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible = true">添加参数</el-button>
                    <!-- 动态参数表格 -->
                    <el-table :data="manyData" border stripe>
                        <!-- 展开行 -->
                        <el-table-column type="expand">
                            <template v-slot="value">
                                <el-tag v-for="(val, index) in value.row.attr_vals" :key="index" closable @close="tagClosed(value.row , index)">
                                   {{val}}
                                </el-tag>
                               <!-- tag的输入与添加 -->
                                <el-input class="input-new-tag" v-if="value.row.inputVisible" v-model="value.row.inputValue"
                               ref="saveTagInputRef" size="small" @keyup.enter.native="handleInputConfirm(value.row)"
                               @blur="handleInputConfirm(value.row)">
                                </el-input>
                                <el-button v-else class="button-new-tag" size="small" @click="showInput(value.row)">+ New Tag
                                </el-button>
                            </template>
                        </el-table-column>
                        <!-- 索引列 -->
                        <el-table-column type="index"></el-table-column>
                        <el-table-column label="参数名称" prop="attr_name"></el-table-column>
                        <el-table-column label="操作">
                            <template v-slot="params">
                                <el-button type="primary" size="mini" icon="el-icon-edit" @click="showEditDialog(params.row.attr_id)">编辑</el-button>
                                <el-button type="danger" size="mini" icon="el-icon-delete"  @click="deleteParams(params.row.attr_id)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
                <!-- 添加静态属性区域 -->
                <el-tab-pane label="静态属性" name="only">
                    <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible = true">添加属性</el-button>
                    <!-- 静态属性表格 -->
                    <el-table :data="onlyData" border stripe>
                        <!-- 展开行 -->
                        <el-table-column type="expand">
                            <template v-slot="value">
                                <el-tag v-for="(val, index) in value.row.attr_vals" :key="index" closable @close="tagClosed(value.row , index)">
                                   {{val}}
                                </el-tag>
                               <!-- tag的输入与添加 -->
                                <el-input class="input-new-tag" v-if="value.row.inputVisible" v-model="value.row.inputValue"
                               ref="saveTagInputRef" size="small" @keyup.enter.native="handleInputConfirm(value.row)"
                               @blur="handleInputConfirm(value.row)">
                                </el-input>
                                <el-button v-else class="button-new-tag" size="small" @click="showInput(value.row)">+ New Tag
                                </el-button>
                            </template>
                        </el-table-column>
                        <!-- 索引列 -->
                        <el-table-column type="index"></el-table-column>
                        <el-table-column label="属性名称" prop="attr_name"></el-table-column>
                        <el-table-column label="操作">
                            <template v-slot="params">
                                <el-button type="primary" size="mini" icon="el-icon-edit" @click="showEditDialog(params.row.attr_id)">编辑</el-button>
                                <el-button type="danger" size="mini" icon="el-icon-delete" @click="deleteParams(params.row.attr_id)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
            </el-tabs>
        </el-card>

        <!-- 添加对话框 -->
        <el-dialog :title="'添加' + titleText" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
            <el-form :model="addForm" :rules="addRules" ref="addFormRef" label-width="100px">
                <el-form-item :label="titleText" prop="attr_name">
                    <el-input v-model="addForm.attr_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addEvent">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 编辑对话框 -->
        <el-dialog :title="'编辑' + titleText" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
            <el-form :model="editForm" :rules="addRules" ref="editFormRef" label-width="100px">
                <el-form-item :label="titleText" prop="attr_name">
                    <el-input v-model="editForm.attr_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editEvent">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
    data: function () {
        return {
            // 商品分类信息
            cateList: [],
            // 级联选择器配置对象
            cascaderConfig: {
                // 子菜单展开方式
                expandTrigger: 'hover',
                value: 'cat_id',
                label: 'cat_name',
                children: 'children'
            },
            // 级联选择器选择id
            selectedKeys: [],
            // tabs激活的名称
            activeName: 'many',
            // 动态参数数据
            manyData: [],
            // 静态参数数据
            onlyData: [],
            // 添加对话框校验规则对象
            addRules: {
                attr_name: [
                    { required: true, message: '请输入参数名称', trigger: 'blur' }
                ]
            },
            addDialogVisible: false,
            addForm: {
                attr_name: ''
            },
            // 控制编辑对话框
            editDialogVisible: false,
            // 编辑对话框表单数据
            editForm: {
                attr_name: ''
            }
        }
    },
    methods: {
        // 获取分类信息
        getCateList: async function () {
            const ret = await this.axios.get('categories')
            if (ret.meta.status !== 200) {
                return this.$message.error('获取商品分类信息失败！')
            }
            this.cateList = ret.data
        },
        // 监听级联选择器的选择变化
        cateHandleChange: async function () {
            this.getParams()
        },
        // 监听tabs点击事件
        handleClick: function () {
            this.getParams()
        },
        // 获取参数信息
        getParams: async function () {
            // 只能选择三级分类
            if (this.selectedKeys.length !== 3) {
                this.selectedKeys = []
                // 选择不是三级时清空之前的表格数据
                this.manyData = []
                this.onlyData = []
                return
            }
            const ret = await this.axios.get(`categories/${this.cateId}/attributes`, {
                params: {
                    sel: this.activeName
                }
            })
            if (ret.meta.status !== 200) {
                return this.$message.error('获取信息失败！')
            }
            // 将具体参数分割分数组
            ret.data.forEach(item => {
                // 每个参数绑定tag的input值
                // tag input和button的切换
                item.inputVisible = false
                // tag input的值
                item.inputValue = ''
                if (item.attr_vals) {
                    item.attr_vals = item.attr_vals.split(' ')
                } else {
                    item.attr_vals = []
                }
            })
            if (this.activeName === 'many') {
                this.manyData = ret.data
            } else {
                this.onlyData = ret.data
            }
        },
        // 监听添加对话框关闭事件
        addDialogClosed: function () {
            this.$refs.addFormRef.resetFields()
        },
        // 提交添加事件
        addEvent: function () {
            this.$refs.addFormRef.validate(async value => {
                if (!value) return
                const ret = await this.axios.post(`categories/${this.cateId}/attributes`, {
                    attr_name: this.addForm.attr_name,
                    attr_sel: this.activeName
                })
                if (ret.meta.status !== 201) {
                    return this.$message.error('添加失败！')
                }
                this.$message.success('添加成功！')
                this.addDialogVisible = false
                this.getParams()
            })
        },
        // 显示编辑对话框
        showEditDialog: async function (id) {
            const ret = await this.axios.get(`categories/${this.cateId}/attributes/${id}`, {
                params: {
                    attr_sel: this.activeName
                }
            })
            if (ret.meta.status !== 200) {
                return this.$message.error('获取信息失败！')
            }
            this.editForm = ret.data
            this.editDialogVisible = true
        },
        // 提交编辑事件
        editEvent: function () {
            this.$refs.editFormRef.validate(async value => {
                if (!value) return
                const ret = await this.axios.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`, {
                    attr_name: this.editForm.attr_name,
                    attr_sel: this.activeName
                })
                if (ret.meta.status !== 200) {
                    return this.$message.error('编辑失败！')
                }
                this.$message.success('编辑成功！')
                this.editDialogVisible = false
                this.getParams()
            })
        },
        // 编辑对话框关闭事件
        editDialogClosed: function () {
            this.$refs.editFormRef.resetFields()
        },
        // 删除参数
        deleteParams: async function (id) {
            const tip = await this.$confirm('此操作将删除该参数, 是否继续?', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }).catch(err => err)
            // 确定删除返回confirm，取消返回cancel
            if (tip === 'confirm') {
                const ret = await this.axios.delete(`categories/${this.cateId}/attributes/${id}`)
                if (ret.meta.status !== 200) {
                    return
                }
                this.$message.success('参数删除成功！')
                this.getParams()
            }
        },
        // attr_vals的改变
        changeAttr: async function (row) {
            const ret = await this.axios.put(`categories/${this.cateId}/attributes/${row.attr_id}`, { attr_name: row.attr_name,
                attr_sel: row.attr_sel,
                attr_vals: row.attr_vals.join(' ')
            })
            if (ret.meta.status !== 200) {
                return this.$message.error('修改失败！')
            }
            this.$message.success('新增参数项成功！')
        },
        // tag失去焦点或者按下enter
        handleInputConfirm: async function (row) {
            if (row.inputValue.trim().length === 0) {
                row.inputValue = ''
                row.inputVisible = false
                return
            }
            row.attr_vals.push(row.inputValue.trim())
            row.inputValue = ''
            row.inputVisible = false
            // 提交新增参数
            this.changeAttr(row)
        },
        // 显示tag input框
        showInput: function (row) {
            row.inputVisible = true
            // $nextTick 当页面上的元素被重新渲染后调用回调函数中的代码
            this.$nextTick(_ => {
                this.$refs.saveTagInputRef.$refs.input.focus()
            })
        },
        // 删除tag
        tagClosed: function (row, index) {
            // 从attr_vals数组中删去选择参数
            row.attr_vals.splice(index, 1)
            this.changeAttr(row)
        }
    },
    mounted: function () {
        this.getCateList()
    },
    computed: {
        // true按钮被禁用，false按钮可以使用
        isBtnDisabled: function () {
            if (this.selectedKeys.length !== 3) {
                return true
            } else {
                return false
            }
        },
        // 计算级联选择器选择的id
        cateId: function () {
            if (this.selectedKeys.length === 3) {
                return this.selectedKeys[2]
            } else {
                return null
            }
        },
        // 计算当前对话框的text
        titleText: function () {
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
.cate{
    margin: 15px 0;
}

.el-tag{
    margin: 10px;
}

.input-new-tag{
    width: 120px;
}
</style>

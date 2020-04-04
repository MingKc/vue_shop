<template>
    <div>
        <!-- 面包屑导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item><a href="/">商品管理</a></el-breadcrumb-item>
          <el-breadcrumb-item><a href="/">商品分类</a></el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片 -->
        <el-card>
            <!-- 添加分类按钮 -->
            <el-row>
                <el-col>
                    <el-button type="primary" @click="showCateDialog">添加分类</el-button>
                </el-col>
            </el-row>

            <!-- 表格 -->
            <tree-table class="treetable" :data='cateList' :columns="columnsConfig" :selection-type="false" :expand-type="false" show-index index-text="#" border :show-row-hover="false">
                <!-- 是否有效 -->
                <template v-slot:check="cateInfo">
                    <i class="el-icon-success" style="color: lightgreen" v-if="cateInfo.row.cat_deleted === false"></i>
                    <i class="el-icon-error" style="color: red" v-else></i>
                </template>
                <!-- 排序 -->
                <template v-slot:order="cateInfo">
                    <el-tag size="mini" v-if="cateInfo.row.cat_level === 0">一级</el-tag>
                    <el-tag size="mini" type="success" v-else-if="cateInfo.row.cat_level === 1">二级</el-tag>
                    <el-tag size="mini" type="warning" v-else>三级</el-tag>
                </template>
                <!-- 操作 -->
                <template v-slot:operate="cateInfo">
                    <el-button type="primary" size="mini" icon="el-icon-edit" @click="showEditCateDialog(cateInfo.row)">编辑</el-button>
                    <el-button type="danger" size="mini" icon="el-icon-delete" @click="deleteCate(cateInfo.row)">删除</el-button>
                </template>
            </tree-table>

            <!-- 分页 -->
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[3, 5, 10, 20]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
            </el-pagination>

            <!-- 添加分类对话框 -->
            <el-dialog title="添加分类" :visible.sync="addCateDialogVisible" width="50%" @close="cateClosed">
                <el-form :model="cateForm" :rules="caterules" ref="cateFormRef" label-width="100px">
                    <el-form-item label="分类名称" prop="cat_name">
                        <el-input v-model="cateForm.cat_name"></el-input>
                    </el-form-item>
                    <el-form-item label="父级分类">
                        <!-- options：数据源    props:级联配置  v-model要绑定数组 -->
                        <el-cascader v-model="selectedKeys" :options="parentCateList" :props="cascaderConfig" @change="cateHandleChange" clearable></el-cascader>
                        </el-form-item>
                </el-form>
                <span slot="footer" class="dialog-footer">
                    <el-button @click="addCateDialogVisible = false">取 消</el-button>
                    <el-button type="primary" @click="addCateEvent">确 定</el-button>
                </span>
            </el-dialog>

            <!-- 编辑分类对话框 -->
        <el-dialog title="编辑分类" :visible.sync="editCateDialogVisible" width="50%" @close="editClosed">
            <!-- 添加用户表单 -->
            <el-form :model="editCate" status-icon :rules="caterules" ref="editCateRef" label-width="100px">
                <el-form-item label="分类名称" prop="cat_name">
                    <el-input v-model="editCate.cat_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editCateDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editCateEvent">确 定</el-button>
            </span>
        </el-dialog>
        </el-card>
    </div>
</template>

<script>
export default {
    data: function () {
        return {
            // 查询信息
            queryInfo: {
                type: 3,
                pagenum: 1,
                pagesize: 5
            },
            // 商品分类列表
            cateList: [],
            // 商品分类总数
            total: 0,
            // 表格column设置
            columnsConfig: [{
                // 列标题名称
                label: '分类名称',
                // 对应列内容的属性名
                prop: 'cat_name'
            }, {
                label: '是否有效',
                // 自定义模板列
                type: 'template',
                // 插槽名称
                template: 'check'
            }, {
                label: '排序',
                type: 'template',
                template: 'order'
            }, {
                label: '操作',
                type: 'template',
                template: 'operate'
            }],
            // 控制添加分类对话框
            addCateDialogVisible: false,
            // 添加分类表单数据对象
            cateForm: {
                cat_name: '',
                cat_level: 0,
                cat_pid: 0
            },
            // 分类表单校验对象
            caterules: {
                cat_name: [
                    { required: true, message: '请输入分类名称', trigger: 'blur' }
                ]
            },
            // 父级分类列表
            parentCateList: [],
            // 级联选择器配置对象
            cascaderConfig: {
                // 子菜单展开方式
                expandTrigger: 'hover',
                // 父子节点不关联
                checkStrictly: true,
                value: 'cat_id',
                label: 'cat_name',
                children: 'children'
            },
            // 选择的父级
            selectedKeys: [],
            // 控制编辑分类对话框
            editCateDialogVisible: false,
            // 编辑分类表单对象
            editCate: {
                cat_name: ''
            },
            // 当前编辑的分类id
            editCateId: ''
        }
    },
    methods: {
        getCateList: async function () {
            const ret = await this.axios.get('categories', {
                params: this.queryInfo
            })
            if (ret.meta.status !== 200) {
                return this.$message.error('获取商品分类失败！')
            }
            this.cateList = ret.data.result
            this.total = ret.data.total
        },
        // 监听pagesize改变
        handleSizeChange: function (newSize) {
            this.queryInfo.pagesize = newSize
            this.getCateList()
        },
        // 监听pagenum改变
        handleCurrentChange: function (newPage) {
            this.queryInfo.pagenum = newPage
            this.getCateList()
        },
        // 显示添加分类对话框
        showCateDialog: function () {
            this.getParentCateList()
            this.addCateDialogVisible = true
        },
        // 获取父级分类列表
        getParentCateList: async function () {
            const ret = await this.axios.get('categories', {
                params: {
                    type: 2
                }
            })
            if (ret.meta.status !== 200) {
                return this.$message.error('获取父级分类列表失败！')
            }
            this.parentCateList = ret.data
        },
        // 级联选择变化
        cateHandleChange: function () {
            if (this.selectedKeys.length > 0) {
                // 父级id
                this.cateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
                // 当前分类等级
                this.cateForm.cat_level = this.selectedKeys.length
            } else {
                // 父级id
                this.cateForm.cat_pid = 0
                // 当前分类等级
                this.cateForm.cat_level = 0
            }
        },
        // 提交添加分类
        addCateEvent: function () {
            // 表单预验证
            this.$refs.cateFormRef.validate(async value => {
                if (!value) return
                const ret = await this.axios.post('categories', this.cateForm)
                if (ret.meta.status !== 201) {
                    return this.$message.error('添加分类失败！')
                }
                this.$message.success('添加分类成功！')
                this.getCateList()
                this.addCateDialogVisible = false
            })
        },
        // 添加分类表单关闭
        cateClosed: function () {
            this.$refs.cateFormRef.resetFields()
            this.selectedKeys = []
            // 父级id
            this.cateForm.cat_pid = 0
            // 当前分类等级
            this.cateForm.cat_level = 0
        },
        // 监听编辑分类对话框关闭事件
        editClosed: function () {
            this.$refs.editCateRef.resetFields()
        },
        // 打开对话框并显示当前编辑分类名称
        showEditCateDialog: async function (cateInfo) {
            this.editCateId = cateInfo.cat_id
            const ret = await this.axios.get('categories/' + this.editCateId)
            if (ret.meta.status !== 200) {
                return this.$message.error('获取当前分类信息失败！')
            }
            this.editCate.cat_name = ret.data.cat_name
            this.editCateDialogVisible = true
        },
        // 提交编辑分类表单
        editCateEvent: function () {
            this.$refs.editCateRef.validate(async value => {
                if (!value) return
                const ret = await this.axios.put('categories/' + this.editCateId, {
                    cat_name: this.editCate.cat_name
                })
                console.log(ret)
                if (ret.meta.status !== 200) {
                    return this.$message.error('编辑分类失败！')
                }
                this.$message.success('编辑分类成功！')
                this.getCateList()
                this.editCateDialogVisible = false
            })
        },
        // 删除分类
        deleteCate: async function (cateInfo) {
            const tip = await this.$confirm('此操作将删除该分类, 是否继续?', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }).catch(err => err)
            // 确定删除返回confirm，取消返回cancel
            if (tip === 'confirm') {
                const ret = await this.axios.delete(`categories/${cateInfo.cat_id}`)
                if (ret.meta.status !== 200) {
                    return
                }
                this.$message.success('分类删除成功！')
                this.getCateList()
            }
        }
    },
    mounted: function () {
        this.getCateList()
    }
}
</script>

<style lang="less" scoped>
    .treetable{
        margin-top: 15px;
    }

    .el-cascader{
        width: 100%;
    }
</style>

<template>
    <div>
        <!-- 面包屑导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item><a href="/">用户管理</a></el-breadcrumb-item>
          <el-breadcrumb-item><a href="/">用户列表</a></el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片 -->
        <el-card>
            <!-- 搜索和添加用户 -->
            <el-row :gutter="20">
                <!-- 搜索框 -->
                <el-col :span="10">
                    <el-input v-model="queryInfo.query" placeholder="请输入搜索用户名" clearable @clear="queryData">
                        <el-button slot="append" icon="el-icon-search" @click="queryData"></el-button>
                    </el-input>
                </el-col>
                <!-- 添加用户按钮 -->
                <el-col :span="4">
                    <el-button type="primary" @click="dialogVisible = true">添加用户</el-button>
                </el-col>
            </el-row>

            <!-- 用户列表 -->
            <el-table :data="userList" stripe border>
                <el-table-column type="index"></el-table-column>
                <el-table-column label="姓名" prop="username" ></el-table-column>
                <el-table-column label="电话" prop="mobile" ></el-table-column>
                <el-table-column label="邮箱" prop="email" ></el-table-column>
                <el-table-column label="角色" prop="role_name" ></el-table-column>
                <el-table-column label="状态">
                <!-- 状态栏按钮 -->
                <template v-slot="slotProps">
                    <el-switch v-model="slotProps.row.mg_state" @change="changeUserState(slotProps.row)">
                    </el-switch>
                </template>
                </el-table-column>
                <!-- 操作 -->
                <el-table-column label="操作" width="175px">
                    <template v-slot="useritem">
                        <!-- 修改 -->
                        <el-tooltip effect="dark" content="修改" placement="bottom" :enterable="false">
                          <el-button type="primary" icon="el-icon-edit" size="mini" @click="showUserDialog(useritem.row.id)"></el-button>
                        </el-tooltip>
                        <!-- 删除 -->
                        <el-tooltip effect="dark" content="删除" placement="bottom" :enterable="false">
                          <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteUser(useritem.row.id)"></el-button>
                        </el-tooltip>
                        <!-- 分配角色 -->
                        <el-tooltip effect="dark" content="分配角色" placement="bottom" :enterable="false">
                          <el-button type="warning" icon="el-icon-setting" size="mini"></el-button>
                        </el-tooltip>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 分页 -->
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[1, 2, 5, 10]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="totalPage">
            </el-pagination>

            <!-- 添加用户对话框 -->
            <el-dialog title="添加用户" :visible.sync="dialogVisible" width="50%" @close="dialogClosed">
                <!-- 添加用户表单 -->
                <el-form :model="addUser" status-icon :rules="addUserRules" ref="addUserRef" label-width="80px">
                    <el-form-item label="用户名" prop="username">
                        <el-input v-model="addUser.username"></el-input>
                    </el-form-item>
                    <el-form-item label="密码" prop="password">
                        <el-input v-model="addUser.password"></el-input>
                    </el-form-item>
                    <el-form-item label="邮箱" prop="email">
                        <el-input v-model="addUser.email"></el-input>
                    </el-form-item>
                    <el-form-item label="联系电话" prop="mobile">
                        <el-input v-model="addUser.mobile"></el-input>
                    </el-form-item>
                </el-form>
                <span slot="footer" class="dialog-footer">
                    <el-button @click="dialogVisible = false">取 消</el-button>
                    <el-button type="primary" @click="addUserEvent">确 定</el-button>
                </span>
            </el-dialog>

            <!-- 修改用户信息对话框 -->
            <el-dialog title="修改用户信息" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
                <!-- 添加用户表单 -->
                <el-form :model="modifyUser" status-icon :rules="addUserRules" ref="modifyUserRef" label-width="80px">
                    <el-form-item label="用户名">
                        <el-input v-model="modifyUser.username" disabled></el-input>
                    </el-form-item>
                    <el-form-item label="邮箱" prop="email">
                        <el-input v-model="modifyUser.email"></el-input>
                    </el-form-item>
                    <el-form-item label="联系电话" prop="mobile">
                        <el-input v-model="modifyUser.mobile"></el-input>
                    </el-form-item>
                </el-form>
                <span slot="footer" class="dialog-footer">
                    <el-button @click="editDialogVisible = false">取 消</el-button>
                    <el-button type="primary" @click="modifyUserEvent">确 定</el-button>
                </span>
            </el-dialog>
        </el-card>
    </div>
</template>

<script>
export default {
    data: function () {
        // 邮箱验证规则
        var emailRule = (rule, value, callback) => {
            // 验证邮箱正则
            const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
            if (regEmail.test(value)) {
                // 验证通过
                return callback()
            }
            callback(new Error('输入邮箱不合法'))
        }

        // 手机验证规则
        var phoneRule = (rule, value, callback) => {
            // 验证邮箱正则
            const regEmail = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
            if (regEmail.test(value)) {
                // 验证通过
                return callback()
            }
            callback(new Error('输入手机号不合法'))
        }

        return {
            queryInfo: {
               // 查询用户名
               query: '',
               // 当前页码
               pagenum: 1,
               // 每页显示条数
               pagesize: 2
            },
            // 用户数据列表
            userList: [],
            // 总共数据条数
            totalPage: 0,
            // 控制对话框显示
            dialogVisible: false,
            // 添加用户表单数据
            addUser: {
                username: '',
                password: '',
                email: '',
                mobile: ''
            },
            // 添加用户表单验证数据对象
            addUserRules: {
                // 用户名验证
                username: [
                    { required: true, message: '请输入用户名', trigger: 'blur' },
                    { min: 3, max: 12, message: '用户名长度在 3 到 12 个字符', trigger: 'blur' }
                ],
                // 密码验证
                password: [
                    { required: true, message: '请输入密码', trigger: 'blur' },
                    { min: 6, max: 18, message: '密码长度在 6 到 18 个字符', trigger: 'blur' }
                ],
                // 邮箱验证
                email: [
                    { required: true, message: '请输入邮箱', trigger: 'blur' },
                    { validator: emailRule, trigger: 'blur' }
                ],
                // 联系电话验证
                mobile: [
                    { required: true, message: '请输入联系电话', trigger: 'blur' },
                    { validator: phoneRule, trigger: 'blur' }
                ]
            },
            // 控制修改用户信息表单
            editDialogVisible: false,
            // 修改用户表单数据
            modifyUser: {}
        }
    },
    methods: {
        // 查询用户数据
        queryData: async function () {
            const result = await this.axios.get('users', {
                params: this.queryInfo
            })
            // 判断是否查询成功
            if (result.meta.status === 200) {
                this.userList = result.data.users
                this.totalPage = result.data.total
            } else {
                this.$message.error('获取用户列表失败！')
            }
        },
        // 监听pagesize的改变
        handleSizeChange: function (newSize) {
            this.queryInfo.pagesize = newSize
            // 重新渲染页面数据
            this.queryData()
        },
        // 监听页码改变
        handleCurrentChange: function (newPage) {
            this.queryInfo.pagenum = newPage
            // 重新渲染页面数据
            this.queryData()
        },
        // 监听用户状态改变
        changeUserState: async function (userinfo) {
            const result = await this.axios.put(`users/${userinfo.id}/state/${userinfo.mg_state}`)
            // 判断是否更新成功
            if (result.meta.status !== 200) {
                userinfo.mg_state = !userinfo.mg_state
                return this.$message.error('用户状态更新失败！')
            }
            this.$message.success('用户状态更新成功！')
        },
        // 监听关闭添加用户表单
        dialogClosed: function () {
            // 重置表单
            this.$refs.addUserRef.resetFields()
        },
        // 添加用户
        addUserEvent: function () {
            // 表单预校验
            this.$refs.addUserRef.validate(async (validate) => {
                if (validate) {
                    const ret = await this.axios.post('users', this.addUser)
                    if (ret.meta.status !== 201) {
                        return this.$message.error('添加用户失败！')
                    }
                    this.$message.success('添加用户成功！')
                    // 关闭表单并刷新列表数据
                     this.dialogVisible = false
                     this.queryData()
                }
            })
        },
        // 修改用户信息
        showUserDialog: async function (id) {
            const ret = await this.axios.get(`users/${id}`)
            if (ret.meta.status === 200) {
                this.modifyUser = ret.data
                // 打开对话框
                this.editDialogVisible = true
            }
        },
        // 重置修改用户表单
        editDialogClosed: function () {
            this.$refs.modifyUserRef.resetFields()
        },
        // 提交修改的用户信息
        modifyUserEvent: async function () {
             this.$refs.modifyUserRef.validate(async (validate) => {
                if (validate) {
                    const ret = await this.axios.put('users/' + this.modifyUser.id, {
                        email: this.modifyUser.email,
                        mobile: this.modifyUser.mobile
                    })
                    if (ret.meta.status !== 200) {
                        return this.$message.error('修改用户信息失败！')
                    }
                    // 关闭对话框并刷新数据
                    this.editDialogVisible = false
                    this.queryData()
                    this.$message.success('修改用户信息成功！')
                }
             })
        },
        // 删除用户
        deleteUser: async function (id) {
            const tip = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }).catch(err => err)
            // 确定删除返回confirm，取消返回cancel
            if (tip === 'confirm') {
                const ret = await this.axios.delete('users/' + id)
                if (ret.meta.status !== 200) {
                    return this.$message.error('删除用户失败！')
                }
                this.$message.success('删除用户成功！')
                this.queryData()
            }
        }
    },
    mounted: function () {
        this.queryData()
    }
}
</script>

<style lang="less" scoped>
</style>

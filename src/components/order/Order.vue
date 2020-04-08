<template>
    <div>
        <!-- 面包屑导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item><a href="/">订单管理</a></el-breadcrumb-item>
          <el-breadcrumb-item><a href="/">订单列表</a></el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片 -->
        <el-card>
            <!-- 搜索订单 -->
            <el-row :gutter='20'>
                <!-- 搜索框 -->
                <el-col :span="10">
                    <el-input v-model="queryInfo.query" placeholder="请输入搜索内容" clearable @clear="getOrdersList">
                        <el-button slot="append" icon="el-icon-search" @click="getOrdersList"></el-button>
                    </el-input>
                </el-col>
            </el-row>

            <el-table :data="ordersList" stripe border>
                <el-table-column type="index"></el-table-column>
                <el-table-column label="订单编号" prop="order_number"></el-table-column>
                <el-table-column label="订单价格" prop="order_price" width="80px"></el-table-column>
                <el-table-column label="是否付款" width="80px">
                    <template v-slot="orders">
                        <el-tag type="danger" v-if="orders.row.pay_status === '1'">未付款</el-tag>
                        <el-tag type="success" v-else>已付款</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="是否发货" prop="is_send" width="80px"></el-table-column>
                <el-table-column label="下单时间" width="250px">
                    <template v-slot="orders">
                        {{orders.row.create_time | dateFormat}}
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="150px">
                    <template v-slot="orders">
                        <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditLocationDialog(orders.row)"></el-button>
                        <el-button type="success" icon="el-icon-location" size="mini" @click="showProgressDialog(orders.row)"></el-button>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 分页区域 -->
            <!-- 分页 -->
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[5, 10, 20, 30]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
            </el-pagination>
        </el-card>

        <!-- 修改订单地址对话框 -->
        <el-dialog title="修改地址" :visible.sync="editLocationDialogVisible" width="50%" @close="editLocationDialogClosed">
            <!-- 修改地址表单 -->
            <el-form :model="editLocation" status-icon :rules="editLocationRules" ref="editLocationRef" label-width="100px">
                <el-form-item label="省市区/县" prop="address1">
                    <el-cascader :options="cityData" :props="cascaderConfig" v-model="editLocation.address1"></el-cascader>
                </el-form-item>
                <el-form-item label="详细地址" prop="address2">
                    <el-input v-model="editLocation.address2"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editLocationDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editLocationEvent">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 物流进度对话框 -->
        <el-dialog title="物流进度" :visible.sync="progressDialogVisible" width="50%">
            <!-- 时间线 -->
            <el-timeline>
                <el-timeline-item v-for="(activity, index) in progressList" :key="index" :timestamp="activity.time">
                    {{activity.context}}
                </el-timeline-item>
          </el-timeline>
        </el-dialog>
    </div>
</template>

<script>
    import cityData from './city_data2016.js'
    export default {
        data: function () {
            return {
                // 查询内容对象
                queryInfo: {
                    query: '',
                    pagenum: 1,
                    pagesize: 10
                },
                // 存储订单数组
                ordersList: [],
                // 订单总数
                total: 0,
                // 中国城市数据
                cityData,
                // 控制修改订单地址对话框
                editLocationDialogVisible: false,
                // 物流进度对话框
                progressDialogVisible: false,
                // 级联选择器配置对象
                cascaderConfig: {
                    // 子菜单展开方式
                    expandTrigger: 'hover',
                    value: 'n',
                    label: 'n',
                    children: 's'
                },
                // 修改地址表单对象
                editLocation: {
                    // 级联选择器选择的id
                    address1: [],
                    address2: ''
                },
                editLocationRules: {
                    address1: [
                        { required: true, message: '请选择省市区/县', trigger: 'blur' }
                    ],
                    address2: [
                        { required: true, message: '请输入详细地址', trigger: 'blur' }
                    ]
                },
                // 物流信息
                progressList: []
            }
        },
        methods: {
            // 查询订单列表
            getOrdersList: async function () {
                const ret = await this.axios('/orders', {
                    params: this.queryInfo
                })
                if (ret.meta.status !== 200) {
                    return this.$message.error('获取订单列表失败！')
                }
                this.ordersList = ret.data.goods
                this.total = ret.data.total
            },
            // 监听pagesize改变
            handleSizeChange: function (newSize) {
                this.queryInfo.pagesize = newSize
                this.getOrdersList()
            },
            // 监听pagenum改变
            handleCurrentChange: function (newPage) {
                this.queryInfo.pagenum = newPage
                this.getOrdersList()
            },
            // 监听修改订单地址对话框关闭事件
            editLocationDialogClosed: function () {
                this.$refs.editLocationRef.resetFields()
            },
            // 显示修改订单对话框
            showEditLocationDialog: function () {
                this.editLocationDialogVisible = true
            },
            // 修改订单地址表单提交事件
            editLocationEvent: function (orderInfo) {},
            // 显示物流信息对话框
            showProgressDialog: async function (orderInfo) {
                // 仅供测试的订单号
                const id = '1106975712662'
                // 查询物流信息
                const ret = await this.axios.get('/kuaidi/' + id)
                if (ret.meta.status !== 200) {
                    return this.$message.error('获取物流信息失败！')
                }
                this.progressList = ret.data
                this.progressDialogVisible = true
            }
        },
        mounted: function () {
            this.getOrdersList()
        }
    }
</script>

<style lang="less" scoped>
.el-cascader{
    width: 100%;
}
</style>

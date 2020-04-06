<template>
    <div>
        <!-- 面包屑导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item><a href="/">商品管理</a></el-breadcrumb-item>
          <el-breadcrumb-item><a href="/">商品列表</a></el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片 -->
        <el-card>
            <!-- 搜索和添加商品 -->
            <el-row :gutter="20">
                <!-- 搜索框 -->
                <el-col :span="8">
                    <el-input v-model="queryInfo.query" placeholder="请输入搜索商品名称" clearable @clear="getGoodsList">
                        <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
                    </el-input>
                </el-col>
                <!-- 添加商品按钮 -->
                <el-col :span="4">
                    <el-button type="primary" @click="addGoods">添加商品</el-button>
                </el-col>
            </el-row>

            <!-- 表格区 -->
            <el-table :data="goodsList" stripe border>
                <el-table-column type="index"></el-table-column>
                <el-table-column label="商品名称" prop="goods_name" ></el-table-column>
                <el-table-column label="商品价格(元)" prop="goods_price" width="110px"></el-table-column>
                <el-table-column label="商品重量" prop="goods_weight" width="90px"></el-table-column>
                <el-table-column label="创建时间" width="160px">
                    <template v-slot="goods">
                        {{goods.row.add_time | dateFormat}}
                    </template>
                </el-table-column>
                <el-table-column label="操作"  width="130px">
                    <template v-slot="goods">
                        <el-button size="mini" type="primary" icon="el-icon-edit"></el-button>
                        <el-button size="mini" type="danger" icon="el-icon-delete" @click="deleteGood(goods.row.attr_id)"></el-button>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 分页 -->
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[5, 10, 20, 30]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total" background>
            </el-pagination>
        </el-card>
    </div>
</template>

<script>
    export default {
        data: function () {
            return {
                // 商品列表查询对象
                queryInfo: {
                    query: '',
                    pagenum: 1,
                    pagesize: 10
                },
                // 商品数据总数
                total: 0,
                // 商品数据
                goodsList: []
            }
        },
        methods: {
            // 查询商品列表
            getGoodsList: async function () {
                const ret = await this.axios.get('goods', {
                    params: this.queryInfo
                })
                if (ret.meta.status !== 200) {
                    return this.$message.error('商品列表获取失败！')
                }
                this.goodsList = ret.data.goods
                this.total = ret.data.total
            },
            // 监听pagesize改变
            handleSizeChange: function (newSize) {
                this.queryInfo.pagesize = newSize
                this.getGoodsList()
            },
            // 监听pagenum改变
            handleCurrentChange: function (newPage) {
                this.queryInfo.pagenum = newPage
                this.getGoodsList()
            },
            // 删除商品
            deleteGood: async function (id) {
                const tip = await this.$confirm('此操作将删除该商品, 是否继续?', '提示', {
                  confirmButtonText: '确定',
                  cancelButtonText: '取消',
                  type: 'warning'
                }).catch(err => err)
                // 确定删除返回confirm，取消返回cancel
                if (tip === 'confirm') {
                    const ret = await this.axios.delete('goods/' + id)
                    if (ret.meta.status !== 200) {
                        return this.$message.error('删除用户失败！')
                    }
                    this.$message.success('删除用户成功！')
                    this.getGoodsList()
                }
            },
            // 跳转到商品添加页面
            addGoods: function () {
                this.$router.push('/goods/add')
            }
        },
        mounted: function () {
            this.getGoodsList()
        }
    }
</script>

<style lang="less" scoped>
</style>

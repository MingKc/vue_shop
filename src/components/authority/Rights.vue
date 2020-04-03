<template>
    <div>
        <!-- 面包屑导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item><a href="/">权限管理</a></el-breadcrumb-item>
          <el-breadcrumb-item><a href="/">权限列表</a></el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片 -->
        <el-card>
            <el-table :data="rightsList" stripe border>
                <el-table-column type="index"></el-table-column>
                <el-table-column label="权限名称" prop="authName" ></el-table-column>
                <el-table-column label="路径" prop="path" ></el-table-column>
                <el-table-column label="权限等级">
                    <template v-slot="rights">
                        <el-tag v-if="rights.row.level === '0'">一级</el-tag>
                        <el-tag type="success" v-else-if="rights.row.level === '1'">二级</el-tag>
                        <el-tag type="warning" v-else>三级</el-tag>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>
    </div>
</template>

<script>
export default {
    data: function () {
        return {
            // 权限列表
            rightsList: []
        }
    },
    methods: {
        // 获取权限列表
        queryRightsList: async function () {
            const ret = await this.axios.get('rights/list')
            if (ret.meta.status !== 200) {
                return this.$message.error('获取权限列表失败！')
            }
            this.rightsList = ret.data
        }
    },
    mounted: function () {
        this.queryRightsList()
    }
}
</script>

<style lang="less" scoped>
</style>

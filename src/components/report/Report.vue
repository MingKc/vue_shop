<template>
    <div>
        <!-- 面包屑导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item><a href="/">角色管理</a></el-breadcrumb-item>
          <el-breadcrumb-item><a href="/">角色列表</a></el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片区域 -->
        <el-card>
            <!-- 数据视图 -->
            <div id="main" style="width: 750px; height: 400px;"></div>
        </el-card>
    </div>
</template>

<script>
import echarts from 'echarts'
import _ from 'lodash'
    export default {
        data: function () {
            return {
                // 图表需要合并数据
                options: {
                  title: {
                    text: '用户来源'
                  },
                  tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                      type: 'cross',
                      label: {
                        backgroundColor: '#E9EEF3'
                      }
                    }
                  },
                  grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                  },
                  xAxis: [
                    {
                      boundaryGap: false
                    }
                  ],
                  yAxis: [
                    {
                      type: 'value'
                    }
                  ]
                }
            }
        },
        methods: {},
        // 此时页面上的元素已经渲染完毕
        mounted: async function () {
            // 基于准备好的dom，初始化echarts实例
            var myChart = echarts.init(document.getElementById('main'))
            const ret = await this.axios.get('reports/type/1')
            if (ret.meta.status !== 200) {
                return this.$message.error('获取数据图标错误！')
            }

            // 指定图表的配置项和数据
            const result = _.merge(ret.data, this.options)
            // 使用刚指定的配置项和数据显示图表。
            myChart.setOption(result)
        }
    }
</script>

<style lang="less" scoped></style>

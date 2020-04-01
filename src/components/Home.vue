<template>
    <!-- 后台首页 -->
    <el-container class="container">
      <!-- 头部 -->
      <el-header>
        <div>
          <!-- 图标 -->
          <img src="../assets/logo.png">
          <span>电商管理系统</span>
        </div>
        <el-button type="info" @click="logout">退出登录</el-button>
      </el-header>
      <!-- 主体内容 -->
      <el-container>
        <!-- 左侧菜单栏 -->
        <el-aside :width="isCollapse ? '64px' : '200px'">
          <el-menu background-color="#545c64" text-color="#fff" active-text-color="#409EFF" unique-opened :collapse="isCollapse" :collapse-transition="false" router :default-active="nowActive">
            <!-- 一级菜单 -->
            <el-submenu :index="items.id + ''" :key="items.id" v-for="items in menus">
              <!-- 一级菜单模板区 -->
              <template slot="title" >
                <!-- 图标 -->
                <i :class="icon[items.id]"></i>
                <!-- 名称 -->
                <span>{{items.authName}}</span>
              </template>

              <!-- 二级菜单 -->
              <el-menu-item :index="'/'+childItem.path" :key="childItem.id" v-for="childItem in items.children" @click="saveActive('/'+childItem.path)">
                <!-- 二级菜单模板区 -->
                <template slot="title" >
                  <!-- 图标 -->
                  <i class="el-icon-menu"></i>
                  <!-- 名称 -->
                  <span>{{childItem.authName}}</span>
                </template>
              </el-menu-item>
            </el-submenu>
          </el-menu>
          <!-- 菜单栏折叠 -->
          <div class="collapse">
            <div @click="toggleCollapse">
              <i :class="collapseIcon"></i>
            </div>
          </div>
        </el-aside>
        <!-- 右侧主要信息 -->
        <el-main>
          <!-- 路由占位符 -->
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
</template>

<script>
export default {
  data: function () {
    return {
      // 左侧菜单数据
      menus: [],
      // 菜单栏图标
      icon: {
        125: 'el-icon-user-solid',
        103: 'el-icon-setting',
        101: 'el-icon-goods',
        102: 'el-icon-s-order',
        145: 'el-icon-s-data'
      },
      // 菜单栏折叠
      isCollapse: false,
      // 折叠图标
      collapseIcon: 'el-icon-arrow-left',
      // 当前选择连接
      nowActive: ''
    }
  },
  methods: {
    logout: function () {
      // 清空token，并跳转到登录界面
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    showMenu: async function () {
      // 查询菜单栏
      const result = await this.axios.get('menus')
      if (result.meta.status === 200) {
        this.menus = result.data
      } else {
        this.$message.error('菜单栏加载失败！')
      }
    },
    toggleCollapse: function () {
      // 折叠菜单栏
      this.isCollapse = !this.isCollapse
      // 折叠图标变化
      if (this.isCollapse) {
        this.collapseIcon = 'el-icon-arrow-right'
      } else {
        this.collapseIcon = 'el-icon-arrow-left'
      }
    },
    saveActive: function (path) {
      // 保存当前选择菜单
      window.sessionStorage.setItem('active', path)
      // 切换当前选择的菜单
      this.nowActive = path
    }
  },
  mounted () {
    // 加载左侧菜单栏
    this.showMenu()
    // 后退到上一步选择的菜单栏
    this.nowActive = window.sessionStorage.getItem('active')
  }
}
</script>

<style lang="less" scoped>
.container{
  height: 100%;
}

.el-header{
  background-color: #b3c0d1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #fff;
  font-size: 25px;
  >div{
    display: flex;
    align-items: center;
    img{
      width: 60px;
      height: 60px;
    }
    span{
      padding-left: 20px;
    }
  }
}

.el-aside{
  background-color: #b3c0d1;
  > .el-menu{
    border-right: none;
  }
}

.el-main{
  background-color: #E9EEF3;
}

.collapse{
  background-color: rgb(84, 92, 100);
  text-align: center;
  color: #fff;
  font-size: 20px;
  line-height: 24px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  >div{
    border-radius: 50%;
    width: 30px;
    height: 30px;
    background-color: #32363a;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }
}
</style>

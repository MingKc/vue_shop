<template>
    <div class="login-container">
        <div class="login-box">
            <!-- 头像 -->
            <div class="logo-box">
                <img src="../assets/logo.png">
            </div>
            <!-- 登录表单 -->
            <el-form ref="loginFormRef" label-width="0px" :model="loginForm" :rules="loginCheck" class="login-form">
                <!-- 用户名 -->
                <el-form-item  prop="username">
                    <el-input v-model="loginForm.username" prefix-icon="el-icon-user"></el-input>
                </el-form-item>
                <!-- 密码 -->
                <el-form-item prop="password">
                    <el-input v-model="loginForm.password" prefix-icon="el-icon-orange" type="password"></el-input>
                </el-form-item>
                <!-- 按钮 -->
                <el-form-item class="btns">
                    <el-button type="primary" @click="login">登录</el-button>
                    <el-button type="info" @click="reset">重置</el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>

<script>
export default {
  data: function () {
    return {
      // 表单数据绑定
      loginForm: {
        username: '',
        password: ''
      },
      // 登录验证
      loginCheck: {
        // 用户名
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' }
        ],
        // 密码
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 3, max: 8, message: '长度在 3 到 8 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 重置表单
    reset: function () {
      this.$refs.loginFormRef.resetFields()
    },
    // 登录
    login: function () {
      // 预验证
      this.$refs.loginFormRef.validate(async (validate) => {
        // 验证通过，提交表单
        if (validate) {
          // post请求
          const { data: result } = await this.$axios.post('login', this.loginForm)
          if (result.meta.status === 200) {
            this.$message.success('登录成功！')
            // 保存token到Session Storage
            window.sessionStorage.setItem('token', result.data.token)
            // 跳转到首页
            this.$router.push('/home')
          } else {
            this.$message.error('登录失败！')
          }
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
.login-container{
    height: 100%;
    background-color:#242662;
}

.login-box{
    width: 500px;
    height: 300px;
    border-radius: 15px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    background-color: #fff;
}

.logo-box{
    width: 130px;
    height: 130px;
    background-color: #fff;
    border-radius: 50%;
    padding: 10px;
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
    box-shadow: 0 0 10px #eee;
    img{
        width: 100%;
        height: 100%;
        background-color: #eee;
        border-radius: 50%;
    }
}

.login-form{
    position: absolute;
    bottom: 0;
    width: 100%;
    box-sizing: border-box;
    padding: 0 20px;
}

.btns{
    display: flex;
    justify-content: flex-end;
}
</style>

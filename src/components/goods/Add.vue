<template>
    <div>
        <!-- 面包屑导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item><a href="/">商品管理</a></el-breadcrumb-item>
          <el-breadcrumb-item><a href="/">添加商品</a></el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片 -->
        <el-card>
            <!-- 警告信息 -->
            <el-alert title="添加商品信息" type="info" center show-icon :closable="false"></el-alert>
            <!-- 步骤条 -->
            <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
                <el-step title="基本信息"></el-step>
                <el-step title="商品参数"></el-step>
                <el-step title="商品属性"></el-step>
                <el-step title="商品图片"></el-step>
                <el-step title="商品内容"></el-step>
                <el-step title="完成"></el-step>
            </el-steps>

            <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-position="top">
                <!-- tabs区域 -->
                <el-tabs :tab-position="'left'" v-model="activeIndex" :before-leave="beforeLeave" @tab-click="tabClick">

                    <!-- 基本信息 -->
                    <el-tab-pane label="基本信息" name="0">
                        <el-form-item label="商品名称" prop="goods_name">
                            <el-input v-model="addForm.goods_name"></el-input>
                        </el-form-item>
                        <el-form-item label="商品价格" prop="goods_price">
                            <el-input v-model="addForm.goods_price" type="number"></el-input>
                        </el-form-item>
                        <el-form-item label="商品重量" prop="goods_weight">
                            <el-input v-model="addForm.goods_weight" type="number"></el-input>
                        </el-form-item>
                        <el-form-item label="商品数量" prop="goods_number">
                            <el-input v-model="addForm.goods_number" type="number"></el-input>
                        </el-form-item>
                        <el-form-item label="商品分类" prop="goods_cat">
                            <el-cascader v-model="addForm.goods_cat" :options="cateList" :props="cascaderConfig" @change="handleChange"></el-cascader>
                        </el-form-item>
                    </el-tab-pane>

                    <!-- 商品动态参数 -->
                    <el-tab-pane label="商品参数" name="1">
                        <!-- 商品参数的item -->
                        <el-form-item :label="item.attr_name" v-for="item in manyData" :key="item.attr_id">
                            <el-checkbox-group v-model="item.attr_vals">
                                    <el-checkbox :label="vals" v-for="(vals, index) in item.attr_vals" :key="index" border></el-checkbox>
                            </el-checkbox-group>
                        </el-form-item>
                    </el-tab-pane>

                    <!-- 商品静态属性 -->
                    <el-tab-pane label="商品属性" name="2">
                        <el-form-item :label="item.attr_name" v-for="item in onlyData" :key="item.attr_id">
                            <el-input v-model="item.attr_vals"></el-input>
                        </el-form-item>
                    </el-tab-pane>

                    <!-- 上传商品图片 -->
                    <el-tab-pane label="商品图片" name="3">
                        <!-- action 图片上传的后台API地址 -->
                        <el-upload :action="uploadURL" :on-preview="handlePreview" :on-remove="handleRemove" list-type="picture" :headers="requestHeader" :on-success="uploadSuccess">
                          <el-button size="small" type="primary">点击上传</el-button>
                        </el-upload>
                    </el-tab-pane>

                    <!-- 商品内容 -->
                    <el-tab-pane label="商品内容" name="4">
                        <!-- 富文本编辑器 -->
                        <quill-editor v-model="addForm.goods_introduce" />
                        <!-- 添加商品按钮 -->
                        <el-button type="primary" class="addbtn" @click="addGood">添加商品</el-button>
                    </el-tab-pane>
                </el-tabs>
            </el-form>
        </el-card>

        <!-- 图片预览对话框 -->
        <el-dialog title="图片预览" :visible.sync="previewVisible" width="50%">
            <img :src="previewURL" alt="" class="previewImg">
        </el-dialog>
  </div>
</template>

<script>
export default {
    data: function () {
        return {
            // 步骤条当前激活下标
            activeIndex: '0',
            // 商品分类信息
            cateList: [],
            // 级联选择器配置对象
            cascaderConfig: {
                expandTrigger: 'hover',
                label: 'cat_name',
                value: 'cat_id',
                children: 'children'
            },
            // 级联选择的id
            addForm: {
                goods_name: '',
                goods_price: 0,
                goods_weight: 0,
                goods_number: 0,
                goods_cat: [],
                // 图片上传临时对象
                pics: [],
                // 商品介绍
                goods_introduce: '',
                // 商品内容
                attrs: []
            },
            addFormRules: {
                goods_name: [
                    { required: true, message: '请输入商品名称', trigger: 'blur' }
                ],
                goods_price: [
                    { required: true, message: '请输入商品价格', trigger: 'blur' }
                ],
                goods_weight: [
                    { required: true, message: '请输入商品重量', trigger: 'blur' }
                ],
                goods_number: [
                    { required: true, message: '请输入商品数量', trigger: 'blur' }
                ],
                goods_cat: [
                    { required: true, message: '请输入商品分类', trigger: 'blur' }
                ]
            },
            // 动态参数
            manyData: [],
            // 静态属性
            onlyData: [],
            uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
            // 图片上传请求头对象
            requestHeader: {
                Authorization: window.sessionStorage.getItem('token')
            },
            // 图片预览路径
            previewURL: '',
            // 图片预览对话框控制
            previewVisible: false
        }
    },
    methods: {
        // 获取所有商品分类
        getCateList: async function () {
            const ret = await this.axios.get('categories')
            if (ret.meta.status !== 200) {
                return
            }
            this.cateList = ret.data
        },
        // 级联选择器选择变化
        handleChange: function () {
            if (this.addForm.goods_cat.length !== 3) {
                this.addForm.goods_cat.length = []
            }
        },
        // tab切换
        beforeLeave: function (activeName, oldActiveName) {
            if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
                this.$message.error('请选择商品分类！')
                return false
            }
        },
        // tab点击事件
        tabClick: async function () {
            // 获取动态参数
            if (this.activeIndex === '1') {
                const ret = await this.axios.get(`categories/${this.cateId}/attributes`, {
                    params: {
                        sel: 'many'
                    }
                })
                if (ret.meta.status !== 200) {
                    return
                }
                // 将返回的data中的每个item的attr_vals切割成数组
                ret.data.forEach(item => {
                    if (item.attr_vals) {
                        item.attr_vals = item.attr_vals.split(' ')
                    } else {
                        item.attr_vals = []
                    }
                })
                this.manyData = ret.data
            // 静态属性
            } else if (this.activeIndex === '2') {
                const ret = await this.axios.get(`categories/${this.cateId}/attributes`, {
                    params: {
                        sel: 'only'
                    }
                })
                if (ret.meta.status !== 200) {
                    return
                }
                this.onlyData = ret.data
            }
        },
        // 图片预览效果事件
        handlePreview: function (file) {
            // 获取图片的url
            this.previewURL = file.response.data.url
            this.previewVisible = true
        },
        // 图片移出事件
        handleRemove: function (file) {
            // 获取要删除图片的临时路径
            const path = file.response.data.tmp_path
            // 找到临时路径在数组中的下标
            const index = this.addForm.pics.findIndex(item => {
                return item.pic === path
            })
            // 从数组中移出临时路径
            this.addForm.pics.splice(index, 1)
        },
        // 图片上传成功
        uploadSuccess: function (response) {
            // 拼接每个上传的图片成对象
            const picture = {
                pic: response.data.tmp_path
            }
            // 将图片信息加到对象数组中
            this.addForm.pics.push(picture)
        },
        // 添加商品
        addGood: function () {
            this.$refs.addFormRef.validate(async value => {
                if (!value) {
                    return this.$message.error('请填写所有必须的表单内容！')
                }
                this.addForm.goods_cat = this.addForm.goods_cat.join(',')
                // 处理动态数据
                this.manyData.forEach(item => {
                    const info = {
                        attr_id: item.attr_id,
                        attr_vals: item.attr_vals.join(' ')
                    }
                    this.addForm.attrs.push(info)
                })
                // 处理静态参数
                this.onlyData.forEach(item => {
                    const info = {
                        attr_id: item.attr_id,
                        attr_vals: item.attr_vals
                    }
                    this.addForm.attrs.push(info)
                })
                const ret = await this.axios.post('goods', this.addForm)
                this.addForm.goods_cat = this.addForm.goods_cat.split(',')
                if (ret.meta.status !== 201) {
                    return this.$message.error(ret.meta.msg)
                }
                this.$message.success('添加商品成功！')
                // 跳转回到商品列表
                this.$router.push('/goods')
            })
        }
    },
    mounted: function () {
        this.getCateList()
    },
    computed: {
        // 计算当前级联选择的id
        cateId: function () {
            if (this.addForm.goods_cat.length === 3) {
                return this.addForm.goods_cat[2]
            } else {
                return null
            }
        }
    }
}
</script>

<style lang="less" scoped>
    .el-checkbox{
        margin: 0 5px 0 0 !important;
    }
    .previewImg{
        width: 100%;
    }
    .addbtn{
        margin-top:15px;
    }
</style>

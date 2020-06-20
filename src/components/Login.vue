<template>
    <div class="login_container">
        <div class="login_box">
            <!--头像框-->
            <div class="avatar_box">
                <img src="../assets/logo.png" alt="">
            </div>
            <!--表单文本框-->
            <el-form ref="loginFormRef" :model="loginForm" :rules="loginFormRules" label-width="0px" class="login_form">
                <!--用户名-->
                <el-form-item label="" prop="username">
                    <el-input v-model="loginForm.username" prefix-icon="iconfont icon-user" ></el-input>
                </el-form-item>
                <!--密码-->
                <el-form-item label="" prop="password">
                    <el-input type="password" v-model="loginForm.password" prefix-icon="iconfont icon-3702mima"></el-input>
                </el-form-item>
                <!--按钮-->
                <el-form-item class="btns">
                    <el-button type="primary" @click="login">登录</el-button>
                    <el-button type="info" @click="resetLoginForm">重置</el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>
<script>
export default {
    data() {
        return {
            // 这是登录表单的数据绑定对象
            loginForm: {
                username: "admin",
                password: "123456"
            },
            // 这是登录表单验证
            loginFormRules: {
                username: [
                    { required: true, message: '请输入登录名称', trigger: 'blur' },
                    { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
                ],
                password: [
                    { required: true, message: '请输入登录密码', trigger: 'blur' },
                    { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
                ]
            }
        }
    },
    methods: {
        // 点击重置按钮，重置登录表单
        resetLoginForm() {
            this.$refs.loginFormRef.resetFields();
        },
        login() {
            this.$refs.loginFormRef.validate(async valid => {
                if (!valid) return false;
                const { data: res } = await this.$http.post('login', this.loginForm);
                console.log(res);
                if (res.meta.status !== 200) return this.$message.error("登陆失败！");
                this.$message.success("登陆成功！")
                window.sessionStorage.setItem("token", res.data.token);
                this.$router.push("/home");
            })
        }
    }
}
</script>
<style lang="less" scoped>
.login_container {
    background-color: #2b4b6b; height:100%;display:flex;align-items:center;justify-content:center;
    }
.login_box {
    width:450px; height:300px; background:white;border-radius:3px;margin:auto;position:relative;
     }
.avatar_box {
    width: 130px;height: 130px;border: 1px solid #eee;border-radius: 50%;padding: 10px;position: absolute;left: 50%;transform: translate(-50%,-50%);background-color: #fff;
}
.avatar_box img {
    width: 100%;height: 100%;border-radius: 50%;background-color: #eee;
}
.btns {
    display:flex;justify-content:flex-end;
}
.login_form {
    position:absolute;
    bottom:0;
    width:100%;
    box-sizing:border-box;
    padding:0 20px;
}
</style>

<template>
    <div>
      <el-button type="info" @click="loginout">登出</el-button>
    </div>
</template>

<script>

export default {
  methods: {
    loginout() {
      window.sessionStorage.clear("token");
      this.$router.push('/login')
    }
  }
}
</script>

<style>

</style>

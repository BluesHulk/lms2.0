<template>
  <el-config-provider :locale="locale">
    <router-view />
  </el-config-provider>
</template>

<script>
import { ElConfigProvider } from 'element-plus';

import zhCn from 'element-plus/lib/locale/lang/zh-cn';

export default {
  components: {
    ElConfigProvider,
  },
  setup () {
    return {
      locale: zhCn,
    }
  },
}
</script>

<style lang="scss">
#app {
  font-family: PingFangSC-Semibold, PingFang SC;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  height: 100%;
  width: 100%;
  font-size: 0.14rem;
}
</style>

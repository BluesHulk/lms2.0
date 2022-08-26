<template>
  <Breadcrumb v-if="currentRouterPath != '/home'" />
  <div :class="`page ${currentRouterPath == '/home' && 'page-bespread'}`">
    <router-view />
  </div>
</template>

<script>
import { computed } from 'vue';
import Breadcrumb from "./Breadcrumb.vue";
import { useStore } from 'vuex';

export default {
  name: "ContentBox",
  components: {
    Breadcrumb,
  },
  setup() {
    const store = useStore();
    return {
      currentRouterPath: computed(() => store.state.common.currentRouterData.path),
      currentRouterName: computed(() => store.state.common.currentRouterData.title),
    }
  }
};
</script>

<style lang="scss" scoped>
.page {
  margin: 24px;
  width: calc(100% - 0.48rem);
  height: calc(100% - 114px);
  background: #fff;
  box-sizing: border-box;
  overflow: hidden;
  overflow-y: auto;
}
.page-bespread {
  margin: 0;
  width: 100%;
  height: 100%;
}
</style>
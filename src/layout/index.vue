<template>
  <el-container class="layout">
    <el-header>
      <Header />
    </el-header>
    <el-container>
      <el-aside width="200px" :class="isCollapse && 'aside-collapse'">
        <SideBar :isCollapse="isCollapse" @changeCollapse="changeCollapse" />
      </el-aside>
      <el-main>
        <BreadCrumb />
        <div class="page">
          <router-view />
        </div>
      </el-main>
      <el-aside
        width="314px"
        id="filter-aside"
        :class="`${!isFilterShow && 'filter-aside-collapse'}`"
      >
      </el-aside>
    </el-container>
  </el-container>
</template>
<script setup>
import { ref, computed, watch } from "vue";
import { useStore } from "vuex";
import Header from "./Header/index.vue";
import SideBar from "./SideBar/index.vue";
import BreadCrumb from "./BreadCrumb/index.vue";

const store = useStore();

const isCollapse = ref(false);
const changeCollapse = (val) => {
  isCollapse.value = val;
};

const isFilterShow = ref(computed(() => store.state.common.isFilterShow));

watch(() => isFilterShow.value, (val) => {
  if(val) {
    isCollapse.value = true;
  }
})
</script>
<style lang="scss" scoped>
.layout {
  box-sizing: border-box;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: #fff;

  .el-header {
    padding: 0;
    height: 54px;
  }

  .el-aside {
    position: relative;
    border-right: 1px solid $color-border;
    overflow: initial;
  }

  .aside-collapse {
    width: 60px;
    animation: minusWidth 0.5s;
  }

  @keyframes minusWidth {
    from {
      width: 200px;
    }
    to {
      width: 60px;
    }
  }

  .el-main {
    padding: 0;
    height: 100%;
    background: $color-bg;
    overflow: auto;

    .page {
      position: relative;
      height: calc(100vh - 60px - 54px);
    }
  }

  #filter-aside {
    overflow: hidden;
  }
  .filter-aside-collapse {
    width: 0;
    transition: width 0.3s;
  }
}
</style>

<template>
  <div class="breadcrumb-box">
    <el-breadcrumb>
      <span class="current-router-name">{{ currentRouterName }}</span>
      <template v-for="item in breadcrumbData" :key="item.name">
        <el-breadcrumb-item v-if="item.name">
          <!-- <i :class="`iconfont ${item.icon}`" v-if="item.icon"></i> -->
          <span>{{ item.name }}</span>
        </el-breadcrumb-item>
      </template>
    </el-breadcrumb>
  </div>
</template>

<script>
import { computed  } from 'vue';
import { useStore } from 'vuex';

export default {
  name: "Breadcrumb",
  setup() {
    const store = useStore();
    const breadcrumbData = computed(() => store.state.common.breadCrumb);
    return {
      breadcrumbData,
      currentRouterName: computed(() => store.state.common.currentRouterData.title)
    };
  },
};
</script>

<style lang="scss" scoped>
.breadcrumb-box {
  display: flex;
  padding: 0 24px;
  height: 60px;
  background: #fff;
  align-items: center;

  .current-router-name {
    position: relative;
    padding-right: 12px;
    margin-right: 12px;
    font-size: 18px;
    font-family: PingFangSC-Semibold, PingFang SC;
    font-weight: 600;
    color: $color-text;

    &::before {
      content: '';
      position: absolute;
      right: 0;
      top: 50%;
      display: inline-block;
      width: 1px;
      height: 14px;
      background: #ddd;
      transform: translateY(-50%);
    }
  }

  ::v-deep .el-breadcrumb {
    display: flex;
    align-items: center;
    .el-breadcrumb__item {
      display: flex;
      align-items: center;
      .el-breadcrumb__inner {
        display: flex;
        align-items: center;
      }
      .iconfont {
        padding-right: 5px;
        font-size: 20px;
        color: $color-blue;
      }
      &:last-child {
        .el-breadcrumb__inner {
          &:hover {
            color: $color-blue;
          }
        }
      }
    }
  }
}
</style>
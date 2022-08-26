<template>
  <el-drawer
    v-model="isShow"
    :title="drawerTitle"
    :size="drawerSize"
    :direction="direction"
    :append-to-body="true"
    :show-close="showClose"
    :before-close="handleClose"
    :custom-class="`my-drawer ${className}`"
  >
    <template #header>
      <slot name="header"></slot>
    </template>
    <slot></slot>
    <template #footer>
      <slot name="footer"></slot>
    </template>
  </el-drawer>
</template>

<script>
import { computed, watch } from 'vue';
export default {
  props: {
    class: String,
    drawerShow: {
      type: Boolean,
      default: true,
    },
    title: String,
    size: {
      type: [String, Number],
      default: 422
    },
    direction: {
      type: String,
      default: 'rtl',
    },
    showClose: {
      type: Boolean,
      default: true,
    }
  },
  setup(props, { emit }) {
    const handleClose = () => {
      emit("onUpdateDrawerStatus", false);
    }

    watch(props.drawerShow, (newVal) => {
      emit("onUpdateDrawerStatus", newVal);
    });

    return {
      className: props.class,
      isShow: computed(() => props.drawerShow),
      drawerTitle: computed(() => props.title),
      drawerSize: props.size,
      handleClose,
    }
  }
}
</script>

<style lang="scss">
.el-overlay {
  .my-drawer {
    .el-drawer__header {
      padding: 21px 0 21px 24px;
      margin: 0;
      border-bottom: 1px solid $color-border;
      .el-drawer__title {
        color: $color-text;
        font-size: 16px;
        font-family: PingFangSC-Semibold, PingFang SC;
        font-weight: 600;
      }
    }

    .el-drawer__body {
      padding: 24px;
    }

    .el-drawer__footer {
      padding: 16px 0;
      border-top: 1px solid $color-border;
    }
  }
}
</style>
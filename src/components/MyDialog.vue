<template>
  <el-dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    :width="width"
    append-to-body
    :custom-class="`my-dialog ${className}`"
    :before-close="handleClose"
    :close-on-click-modal="closeOnCloseModal"
  >
    <slot></slot>
    <template #footer>
      <slot name="footer"></slot>
    </template>
  </el-dialog>
</template>

<script>
import { computed, watch } from "vue";
export default {
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    title: String,
    width: [Number, String],
    className: String,
    closeOnCloseModal: {
      type: Boolean,
      default: true
    }
  },
  setup(props, { emit }) {
    const handleClose = () => {
      emit("onUpdateDialogStatus", false);
    }

    watch(props.visible, (newVal) => {
      emit("onUpdateDialogStatus", newVal);
    });

    return {
      dialogVisible: computed(() => props.visible),
      dialogTitle: computed(() => props.title),
      handleClose,
      closeOnCloseModal: computed(()=>props.closeOnCloseModal)
    };
  },
};
</script>

<style lang="scss">
.el-overlay {
  .my-dialog {
    border-radius: 4px;
    .el-dialog__header {
      padding: 15px 24px;
      font-size: 16px;
      font-family: PingFangSC-Medium, PingFang SC;
      font-weight: 500;
      color: #3A3A3A;
    }
    .el-dialog__body {
      padding: 24px 0;
      border-top: 1px solid #eee;
      border-bottom: 1px solid #eee;
    }
  }
}
</style>
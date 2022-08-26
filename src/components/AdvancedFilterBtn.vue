<template>
  <div :class="`btn-box ${isOpen && 'btn-box-open'} ${customClass}`" :style="style">
    <el-button @click="onBtnClick">
      高级筛选
      <i class="iconfont icon-xiala"></i>
    </el-button>
  </div>
</template>

<script>
import { ref } from "vue";
export default {
  props: {
    customClass: {
      type: String
    },
    style: {
      type: String,
    }
  },
  setup(props, { emit }) {
    const isOpen = ref(false);

    const onBtnClick = () => {
      isOpen.value = !isOpen.value;

      emit('getBtnStatus', isOpen.value);
    };

    return {
      isOpen,
      onBtnClick,
    };
  },
};
</script>

<style lang="scss" scoped>
.btn-box {
  display: inline-block;

  .iconfont {
    margin-left: 8px;
    display: inline-block;
    transition: transform 0.4s;
    font-size: 10px;
    color: #ccc;
    transform: rotate(0deg);
  }
  .el-button {
    width: 106px;
    &:hover,
    &:focus {
      color: #606266;
      background: none;
      border-color: #dcdfe6;
      .iconfont {
        color: none;
      }
    }
  }
}
.btn-box-open {
  .iconfont {
    transform: rotate(180deg);
  }
  .el-button {
    color: $color-blue;
    background: #ecf5ff;
    border-color: #c6e2ff;
    .iconfont {
      color: $color-blue;
    }
    &:hover,
    &:focus {
      color: $color-blue;
      background: #ecf5ff;
      border-color: #c6e2ff;
      .iconfont {
        color: $color-blue;
      }
    }
  }
}
</style>
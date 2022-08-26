<template>
  <div class="my-multiple-filter-container">
    <MyForm
      ref="formRef"
      :labelSuffix="labelSuffix"
      :labelPosition="labelPosition"
      :formItems="formItems"
      :formData="formData"
      :gutter="18"
      @onFormItemChange="onFormItemChange"
      @submitForm="submitForm"
    >
      <template
        v-for="(slotName, index) in slotList"
        v-slot:[slotName]
        :key="index"
      >
        <slot :name="slotName"></slot>
      </template>
    </MyForm>
    <div class="button-box">
      <el-button type="primary" @click="onSearch">搜索</el-button>
      <el-button @click="clearData">重置</el-button>
    </div>
  </div>
</template>

<script>
import MyForm from "./MyForm.vue";

export default {
  components: { MyForm },
  props: {
    labelPosition: {
      type: String,
      default: "left",
    },
    labelSuffix: {
      type: String,
      default: "：",
    },
    formItems: {
      type: Array,
    },
    slotList: {
      type: Array,
    },
    // 重置设置默认值
    initData: {
      type: Object,
      default: () => ({}),
    },
    formData: {
      type: Object,
      default: () => ({}),
    },
  },
  setup(props, { emit }) {
    const onSearch = () => {
      emit("onSearch", props.formData);
    };

    const clearData = () => {
      emit("onSearch", { ...props.initData });
    };

    return {
      onSearch,
      clearData,
    };
  },
};
</script>

<style lang="scss" scoped>
.my-multiple-filter-container {
  padding: 24px;
  background: #fff;

  .button-box {
    text-align: center;

    .el-button + .el-button {
      margin-left: 24px;
    }
  }
  ::v-deep {
    .my-form {
      .el-form-item {
        margin-bottom: 24px;
        .el-form-item__content {
          .el-select {
            width: 100%;
          }
        }
      }
    }
  }
}
</style>
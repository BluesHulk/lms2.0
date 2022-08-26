<template>
  <div class="my-filter-container">
    <el-form
      ref="commonFormRef"
      class="my-form"
      :model="form"
      :label-width="labelWidth"
      :label-position="labelPosition"
      :label-suffix="labelSuffix"
      :size="formSize"
      :style="formStyle"
    >
      <div v-for="(item, index) in items" :key="index" :style="colStyle">
        <el-form-item
          class="form-item"
          :label="item.label"
          :prop="item.paramName"
        >
          <el-input
            v-if="item.type == 'input'"
            v-model="form[item.paramName]"
            :placeholder="
              item.disabled === true ? '' : `请输入${item.placeholder || ''}`
            "
            :maxlength="item.maxlength"
            :oninput="emit('oninput', item)"
            :disabled="item.disabled"
            @change="emit('onFormItemChange', form, item.paramName)"
          />
          <el-input
            v-else-if="item.type == 'textArea'"
            v-model="form[item.paramName]"
            :rows="item.rows || 4"
            type="textarea"
            :placeholder="
              item.disabled === true ? '' : `请输入${item.placeholder || ''}`
            "
            @change="emit('onFormItemChange', form, item.paramName)"
          />
          <el-select
            v-else-if="item.type === 'select'"
            v-model="form[item.paramName]"
            clearable
            :filterable="item.filterable ? item.filterable : false"
            :multiple="item.multiple ? item.multiple : false"
            :disabled="item.disabled"
            :placeholder="`请选择${item.placeholder || ''}`"
            @change="emit('onFormItemChange', form, item.paramName)"
          >
            <el-option
              v-for="(option, i) in item.options"
              :key="i"
              :value="option.value"
              :label="option.label"
            />
          </el-select>
          <el-date-picker
            v-else-if="item.type === 'rangePicker'"
            v-model="form[item.paramName]"
            type="daterange"
            range-separator="-"
            start-placeholder="起始时间"
            end-placeholder="结束时间"
            :disabled="item.disabled"
            :size="size"
            @change="emit('onFormItemChange', form, item.paramName)"
          />
          <el-checkbox-group
            v-else-if="item.type === 'checkbox'"
            v-model="form[item.paramName]"
            @change="emit('onFormItemChange', form, item.paramName)"
          >
            <el-checkbox
              v-for="option in item.options"
              :key="option.value"
              :label="option.label"
            />
          </el-checkbox-group>
          <div v-else-if="item.type == 'labelBlank'">
            <div :class="`${item.class}`">
              <slot :name="`${item.slotName}`"></slot>
            </div>
          </div>
        </el-form-item>
        <div v-if="item.type == 'blank'">
          <div :class="`${item.class}`">
            <slot :name="`${item.slotName}`"></slot>
          </div>
        </div>
      </div>
      <div class="button-list">
        <el-button type="primary" @click="emit('searchForm', form)"
          >查询</el-button
        >
        <el-button @click="clearData">重置</el-button>
      </div>
    </el-form>
  </div>
</template>

<script>
import { computed, ref } from "vue";

export default {
  name: "MyFilter",
  props: {
    formSize: {
      type: String,
    },
    labelWidth: {
      type: String,
      default: "0",
    },
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
      default: () => [],
    },
    formData: {
      type: Object,
      default: () => {},
    },
    formStyle: {
      type: String,
      default: "justify-content: end",
    },
    colStyle: {
      type: String,
    },
  },
  setup(props, { emit }) {
    const form = ref(computed(() => props.formData || {}));

    const clearData = () => {
      // 清空搜索栏
      form.value = {};
      emit("clearSearchForm");
    };
    return {
      emit,
      items: computed(() => props.formItems),
      form,
      clearData,
    };
  },
};
</script>

<style lang="scss" scoped>
.my-filter-container {
  width: 100%;

  .my-form {
    display: flex;
    justify-content: end;
    .el-form-item {
      margin: 0;
    }
  }
  .button-list {
    margin-left: 24px;
  }
}
</style>

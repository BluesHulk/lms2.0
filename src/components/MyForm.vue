<template>
  <div class="my-form-container">
    <el-form
      ref="commonFormRef"
      class="my-form"
      :model="form"
      :rules="rules"
      :label-width="labelWidth"
      :label-position="labelPosition"
      :label-suffix="labelSuffix"
      :size="formSize"
      :disabled="disabled"
    >
      <el-row :gutter="gutter">
        <el-col
          v-for="(item, index) in items"
          :key="item.key || item.paramName || index"
          :span="item.span"
        >
          <el-form-item
            :class="`form-item ${item.formItemClass}`"
            :label="item.label"
            :prop="item.paramName"
            :label-width="item.labelWidth"
            v-if="item.type !== 'blank'"
          >
            <!-- labelSlot：自定义label -->
            <template v-if="item.labelSlot" v-slot:label>
              <slot :name="`${item.labelSlot}`"></slot>
            </template>
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
            >
              <template v-if="item.suffix" #suffix>{{ item.suffix }}</template>
            </el-input>
            <el-input
              v-if="item.type == 'number'"
              v-model="form[item.paramName]"
              type="number"
              :placeholder="
                item.disabled === true ? '' : `请输入${item.placeholder || ''}`
              "
              :maxlength="item.maxlength"
              :min="item.min"
              :max="item.max"
              :oninput="emit('oninput', item)"
              :disabled="item.disabled"
              @change="emit('onFormItemChange', form, item.paramName)"
            >
              <template v-if="item.suffix" #suffix>{{ item.suffix }}</template>
            </el-input>
            <el-input-number
              v-if="item.type == 'inputNumber'"
              v-model="form[item.paramName]"
              :placeholder="
                item.disabled === true ? '' : `请输入${item.placeholder || ''}`
              "
              :controls-position="item.controlsPosition || 'right'"
              :maxlength="item.maxlength"
              :min="item.min"
              :max="item.max"
              :precision="item.precision || 0"
              :step="item.step || 1"
              :controls="item.controls"
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
              v-else-if="item.type === 'datetimePicker'"
              v-model="form[item.paramName]"
              type="datetimerange"
              :disabled="item.disabled"
              :size="size"
              range-separator="—"
              start-placeholder="起始时间"
              end-placeholder="结束时间"
              @change="emit('onFormItemChange', form, item.paramName)"
            />
            <el-date-picker
              v-else-if="item.type === 'datetimePicker2'"
              v-model="form[item.paramName]"
              type="datetime"
              style="width: 100%"
              :placeholder="`${item.placeholder || '请选择日期'}`"
              :disabled="item.disabled"
              :size="size"
              :value-format="item.valueFormat"
              @change="emit('onFormItemChange', form, item.paramName)"
            />
            <el-date-picker
              v-else-if="item.type === 'datePicker'"
              v-model="form[item.paramName]"
              type="date"
              style="width: 100%"
              :placeholder="`${item.placeholder || '请选择日期'}`"
              :disabled="item.disabled"
              :size="size"
              @change="emit('onFormItemChange', form, item.paramName)"
            />
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
            <el-date-picker
              v-else-if="item.type === 'weekPicker'"
              v-model="form[item.paramName]"
              type="week"
              format="[Week] ww"
              :placeholder="`${item.placeholder || '请选择日期'}`"
              :disabled="item.disabled"
              :size="size"
              @change="emit('onFormItemChange', form, item.paramName)"
            />
            <el-date-picker
              v-else-if="item.type === 'monthPicker'"
              v-model="form[item.paramName]"
              type="month"
              :placeholder="`${item.placeholder || '请选择日期'}`"
              :disabled="item.disabled"
              :size="size"
              @change="emit('onFormItemChange', form, item.paramName)"
            />
            <el-date-picker
              v-else-if="item.type === 'yearPicker'"
              v-model="form[item.paramName]"
              type="year"
              :placeholder="`${item.placeholder || '请选择日期'}`"
              :disabled="item.disabled"
              :size="size"
              @change="emit('onFormItemChange', form, item.paramName)"
            />
            <el-checkbox-group
              v-else-if="item.type === 'checkbox'"
              v-model="form[item.paramName]"
              :disabled="item.disabled"
              @change="emit('onFormItemChange', form, item.paramName)"
            >
              <el-checkbox
                v-for="option in item.options"
                :key="option.value"
                :label="option.value"
                >{{ option.label }}</el-checkbox
              >
            </el-checkbox-group>
            <el-radio-group
              v-else-if="item.type === 'radio'"
              v-model="form[item.paramName]"
              :disabled="item.disabled"
              @change="emit('onFormItemChange', form, item.paramName)"
            >
              <el-radio
                v-model="form[item.paramName]"
                v-for="option in item.options"
                :key="option.value"
                :label="option.value"
                size="large"
                >{{ option.label }}</el-radio
              >
            </el-radio-group>
            <el-switch
              v-else-if="item.type === 'switch'"
              v-model="form[item.paramName]"
              :size="size"
              :disabled="item.disabled"
              :active-text="item.activeText"
              :inactive-text="item.inactiveText"
              :active-value="item.activeValue"
              :inactive-value="item.inactiveValue"
              :inline-prompt="item.inlinePrompt"
              @change="emit('onFormItemChange', form, item.paramName)"
            />
            <div
              v-else-if="item.type == 'labelBlank'"
              :class="`slot-box ${item.class}`"
            >
              <slot :name="`${item.slotName}`"></slot>
            </div>
            <!-- extraSlot：添加额外内容 -->
            <template v-if="item.extraSlot">
              <div :class="`extra-box ${item.extraSlotClass}`">
                <slot :name="`${item.extraSlot}`"></slot>
              </div>
            </template>
          </el-form-item>
          <div v-else :class="`slot-box ${item.class}`">
            <slot :name="`${item.slotName}`"></slot>
          </div>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<script>
import { ref, computed, watch } from "vue";
export default {
  props: {
    formSize: {
      type: String,
    },
    rules: {
      type: Object,
      default: () => {},
    },
    labelWidth: {
      type: String,
      default: "130px",
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
    disabled: {
      type: Boolean,
      default: false,
    },
    suffix: {
      type: String,
    },
    gutter: {
      type: Number,
      default: 48,
    },
  },

  setup(props, { emit }) {
    const commonFormRef = ref(null);

    const form = ref(computed(() => props.formData));
    const items = ref(computed(() => props.formItems));

    props.formItems.map((item) => {
      if (item.defaultDataType == Array && !form.value[item.paramName]) {
        form.value[item.paramName] = [];
      }
    });

    const submitForm = (failMessage) => {
      if (props.rules) {
        return commonFormRef.value.validate((valid) => {
          if (!valid) {
            failMessage && failMessage();
            return false;
          }
          emit("submitForm", form.value);
        });
      }
    };

    const clearForm = () => {
      commonFormRef.value && commonFormRef.value.resetFields();
    };

    watch(
      () => form.value,
      (newVal) => {
        props.formItems.map((item) => {
          if (item.defaultDataType == Array && !newVal[item.paramName]) {
            form.value[item.paramName] = [];
          }
        });
      }
    );

    return {
      items,
      commonFormRef,
      form,
      emit,
      submitForm,
      clearForm,
    };
  },
};
</script>

<style lang="scss" scoped>
.my-form-container {
  .my-form {
    .form-item {
      // padding: 0 12px;
      .el-form-item__content {
        .el-select {
          width: 100%;
        }

        .el-input-number.is-without-controls {
          width: 100%;

          :deep(.el-input__wrapper) {
            padding-left: 11px;
            padding-right: 11px;

            .el-input__inner {
              text-align: left;
            }
          }
        }
      }
    }
    .extra-box {
      position: absolute;
      top: 0;
      right: 0;
      width: 0;
    }
    .el-form {
      .el-form-item__content {
        .el-select {
          width: 100%;
        }
      }
    }

    .slot-box {
      width: 100%;
    }
  }
}
</style>
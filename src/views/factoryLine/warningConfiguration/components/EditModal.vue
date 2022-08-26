<template>
  <MyDialog
    :className="'receipt-modal'"
    v-if="modalShow"
    :visible="modalShow"
    :title="modalTitle"
    :width="1140"
    @onUpdateDialogStatus="onUpdateDialogStatus"
  >
    <div class="content">
      <MyForm
        ref="formRef"
        :formItems="formItems"
        :rules="formRules"
        :formData="formData"
        @onFormItemChange="onFormItemChange"
        @submitForm="submitForm"
      >
      </MyForm>
      <el-button @click="onModalShow">添加物料</el-button>
      <el-form ref="tableFormRef" :model="tableDataForm" :rules="tableRules">
        <MyTable
          ref="tableRef"
          :tableData="tableDataForm.tableData"
          :columns="tableColumns"
          @handleSelectChange="handleSelectChange"
        >
          <template v-slot:warningNumHeader>
            预警车数<span class="required-symbol">*</span>
          </template>
          <template v-slot:warningNum="row">
            <el-form-item
              label-width="0"
              :prop="`tableData.${row.index}.numbers`"
              :rules="tableRules.numbers"
              :show-message="false"
            >
              <el-input
                v-model="row.data.numbers"
                type="number"
                :min="0"
                placeholder="请输入预警车数"
              />
            </el-form-item>
          </template>
          <template v-slot:operation>
            <el-button type="text" @click="onDetailDelete(slotProps.data)"
              >删除</el-button
            >
          </template>
        </MyTable>
      </el-form>
    </div>
    <template v-slot:footer>
      <el-button @click="onModalClose">取消</el-button>
      <el-button type="primary" @click="onConfirm" :loading="btnLoading">
        确定
      </el-button>
    </template>
  </MyDialog>
</template>

<script>
import { ref, reactive, toRefs } from "vue";
import { ElMessage } from "element-plus";
import MyDialog from "@/components/MyDialog.vue";
import MyForm from "@/components/MyForm.vue";
import MyTable from "@/components/MyTable.vue";
import { billsPayableApi } from "@/request/services/fundsManagement";
import config from "@/utils/config";

export default {
  name: "EditModal",
  components: {
    MyDialog,
    MyForm,
    MyTable,
  },
  props: {
    modalShow: {
      type: Boolean,
      default: false,
    },
    modalTitle: {
      type: String,
      default: "预警规则",
    },
    modalData: {
      type: Object,
      default: () => ({}),
    },
  },
  setup(props, { emit }) {
    const formRecord = reactive({
      formRef: null,
      formItems: [
        {
          type: "select",
          label: "仓库&区域",
          paramName: "cangku",
          options: [],
          span: 12,
        },
        {
          type: "select",
          label: "所属公司",
          paramName: "gongsi",
          options: [],
          span: 12,
        },
        {
          type: "number",
          label: "超时时间",
          paramName: "time",
          suffix: "min",
          span: 12,
        },
        {
          type: "number",
          label: "超时延后",
          paramName: "num",
          suffix: "位",
          span: 12,
        },
        {
          type: "number",
          label: "预警总车数",
          paramName: "num1",
          suffix: "辆",
          span: 12,
        },
        {
          type: "switch",
          label: "使用配置",
          paramName: "peizhi",
          span: 12,
        },
      ],
      formRules: {
        cangku: [config.rules({ type: "required" })],
        gongsi: [config.rules({ type: "required" })],
        time: [config.rules({ type: "required" })],
        num: [config.rules({ type: "required" })],
        num1: [config.rules({ type: "required" })],
      },
      formData: {},
    });

    const tableRecord = reactive({
      tableFormRef: null,
      tableRef: null,
      tableDataForm: {
        tableData: [
          {
            index: 0,
            num: 1,
            name: "物料名称",
            code: "BH123456",
            numbers: 333,
            isEnable: "是",
          },
          {
            index: 1,
            num: 2,
            name: "物料名称",
            code: "BH123456",
            numbers: 333,
            isEnable: "是",
          },
        ],
      },
      tableRules: {
        numbers: [config.rules({ type: "required" })],
      },
    });

    const tableColumns = [
      { label: "序号", prop: "num", width: 56 },
      { label: "物料名称", prop: "name" },
      { label: "物料编号", prop: "code" },
      {
        label: "预警车辆",
        prop: "numbers",
        headerSlotName: "warningNumHeader",
        slotName: "warningNum",
      },
      { label: "是否启用", prop: "isEnable", slotName: "isEnable" },
      { label: "操作", slotName: "operation", width: 100 },
    ];

    const onUpdateDialogStatus = (status) => {
      if (!status) {
        emit("onClose", status);
      }
    };

    const onModalShow = () => {
      console.log(111111111);
      emit("onModalShow", "addMaterial");
    };

    const onModalClose = () => {
      emit("onClose", false);
    };

    const submitForm = (val) => {
      console.log(val, 111111);
    };

    const onConfirm = () => {
      formRecord.formRef.submitForm();
    };

    return {
      tableColumns,
      ...toRefs(formRecord),
      ...toRefs(tableRecord),
      onUpdateDialogStatus,
      onModalShow,
      onModalClose,
      submitForm,
      onConfirm,
    };
  },
};
</script>

<style lang="scss" scoped>
.content {
  padding: 0 24px;

  .required-symbol {
    color: $color-red;
  }

  ::v-deep {
    .el-table__row {
      .el-form-item {
        margin: 0;
      }
      .el-form-item.is-error {
        input::-webkit-input-placeholder {
          color: #ff9d97;
        }
      }
    }
  }
}
</style>
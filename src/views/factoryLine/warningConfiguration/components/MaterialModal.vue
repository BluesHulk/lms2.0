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
      <div class="left">

      </div>
      <div class="right">
        <MyTable
          ref="tableRef"
          :tableData="tableData"
          :columns="tableColumns"
          @handleSelectChange="handleSelectChange"
        />
      </div>
    </div>
    <template v-slot:footer>
      <el-button @click="onModalClose">取消</el-button>
      <el-button
        type="primary"
        @click="onConfirm"
        :loading="btnLoading"
      >
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
  name: "MaterialModal",
  components: {
    MyDialog,
    MyTable,
  },
  props: {
    modalShow: {
      type: Boolean,
      default: false,
    },
    modalTitle: {
      type: String,
      default: "添加物料",
    },
    modalData: {
      type: Object,
      default: () => ({}),
    },
  },
  setup(props, { emit }) {

    const tableRecord = reactive({
      tableRef: null,
      tableData: [],
    });

    const tableColumns = [
      { label: "物料编号", prop: "tenantName" },
      { label: "物料名称", prop: "id" },
      { label: "物料规格", prop: "createTime" },
      { label: "型号材质", prop: "createTime" },
      { label: "所属分类", prop: "operation" },
      { label: "计量单位", prop: "operation" },
      { label: "创建人", prop: "operation" },
      { label: "是否有效", prop: "operation" },
    ];

    const onUpdateDialogStatus = (status) => {
      if (!status) {
        emit("onClose", 'addMaterial');
      }
    };

    const onModalShow = () => {
      emit("onModalShow", 'addMaterial')
    }

    const onModalClose = () => {
      emit("onClose", 'addMaterial');
    };

    const submitForm = (val) => {
      console.log(val, 111111);
    }

    const onConfirm = () => {
      formRecord.formRef.submitForm();
    };

    return {
      tableColumns,
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
  display: flex;
  padding: 0 24px;

  .left {
    margin-right: 24px;
    width: 261px;
    border-right: 1px solid $color-border;
  }
  .right {
    width: calc(100% - 261px - 24px);
  }
}
</style>
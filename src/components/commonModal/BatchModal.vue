<template>
  <MyDialog
    :className="'material-modal'"
    v-if="visible"
    :visible="visible"
    :title="modalTitle"
    :width="1280"
    @onUpdateDialogStatus="onUpdateDialogStatus"
  >
    <div class="content">
        <MyFilter
          :formItems="filterItems"
          :formData="searchData"
          :labelWidth="'124px'"
          :formStyle="'justify-content: flex-start'"
          :colStyle="'width: 388px'"
          @searchForm="searchForm"
          @clearSearchForm="clearSearchForm"
        />
        <MyTable
          ref="tableRef"
          :tableData="tableData"
          :columns="tableColumns"
          :selection="modalType == 'multiple'"
          :radioSelection="modalType == 'single'"
          @handleSelectionChange="handleSelectChange"
          @handleRadioChange="handleRadioChange"
        />
        <MyPagination
          :total="tableTotal"
          :queryData="pageParams"
          @paginationChange="paginationChange"
        />
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
import { reactive, toRefs } from "vue";
import { ElMessage } from "element-plus";
import MyDialog from "@/components/MyDialog.vue";
import MyFilter from "@/components/MyFilter.vue";
import MyTable from "@/components/MyTable.vue";
import MyPagination from "@/components/MyPagination.vue";
import commonApi from "@/request/services/common";
import { transformArrayData } from "@/utils/index";

export default {
  name: "MaterialModal",
  components: {
    MyDialog,
    MyTable,
    MyPagination,
    MyFilter,
  },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    modalTitle: {
      type: String,
      default: "选择物料",
    },
    modalData: {
      type: Object,
      default: () => ({}),
    },
    modalType: {
      type: String,
      default: "multiple",
    },
    isRequired: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { emit }) {

    const filterRecord = reactive({
      filterItems: [
        {
          type: "input",
          label: "物料编号",
          paramName: "productCode",
          placeholder: "请输入物料编号",
        },
        {
          type: "input",
          label: "物料名称",
          paramName: "productName",
          placeholder: "请输入物料名称",
        },
      ],
      searchData: {},
    });
    const searchForm = (val) => {
      filterRecord.searchData = val;
      getTableData();
    };

    const clearSearchForm = () => {
      filterRecord.searchData = {};
      getTableData();
    };

    const tableRecord = reactive({
      tableRef: null,
      tableData: [],
      tableTotal: 0,
      pageParams: {
        currentPage: 1,
        pageSize: 5,
      },
      selectedRows: [],
      selectedRaioRows: {},
    });

    const tableColumns = [
      { label: "序号", prop: "num", width: 56 },
      { label: "批次编码", prop: "batchNum" },
      { label: "物料编码", prop: "productCode" },
      { label: "物料名称", prop: "productName" },
      { label: "包装类型", prop: "packType" ,
      formatter: (row) => {
          return { "S": "散装", "D": "袋装" }[row.packType];
        },},
      { label: "发货工厂", prop: "billFactoryName" },
    ];

    const getTableData = () => {
      const params = {
        status: 0,
        ...filterRecord.searchData,
        ...tableRecord.pageParams,
      };
      commonApi.getBatchTableData(params).then((res) => {
        if (res && res.code == 0) {
          tableRecord.tableTotal = res.data.total;
          tableRecord.tableData = res.data.records;
          transformArrayData(
            tableRecord.tableData,
            true,
            true,
            tableRecord.pageParams.currentPage,
            tableRecord.pageParams.pageSize
          );
        }
      });
    };
getTableData();

    const handleSelectChange = (val) => {
      tableRecord.selectedRows = val;
    };

    const handleRadioChange = (val) => {
      tableRecord.selectedRaioRows = val;
    };

    const onUpdateDialogStatus = (status) => {
      if (!status) {
        onModalClose();
      }
    };

    const onModalShow = () => {
      emit("onModalShow", "materialModal");
    };

    const onModalClose = () => {
      emit("onClose", "materialModal");
    };

    const onConfirm = () => {
      if (
        props.isRequired &&
        tableRecord.selectedRows.length == 0 &&
        (!tableRecord.selectedRaioRows ||
          Object.keys(tableRecord.selectedRaioRows).length == 0)
      ) {
        ElMessage.warning("请选择物料！");
        return;
      }
      if (props.modalType == "single") {
        emit("getSelected", tableRecord.selectedRaioRows);
      } else {
        emit("getSelected", tableRecord.selectedRows);
      }
      onModalClose();
    };

    return {
      tableColumns,
      ...toRefs(filterRecord),
      ...toRefs(tableRecord),
      onUpdateDialogStatus,
      onModalShow,
      onModalClose,
      onConfirm,
      searchForm,
      clearSearchForm,
      handleSelectChange,
      handleRadioChange,
    };
  },
};
</script>

<style lang="scss" scoped>
.content {
  padding: 0 24px;
    .my-filter-container {
      margin: 24px 0;
      ::v-deep {
        .el-form-item {
          margin-right: 24px;
        }
      }
    }
}
</style>

<style lang="scss">
.el-overlay-dialog {
  .material-modal {
    .el-dialog__body {
      padding: 0;
      max-height: 440px;
    }
  }
}
</style>
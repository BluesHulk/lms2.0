<template>
  <MyDialog
    :className="'receipt-modal'"
    v-if="modalShow"
    :visible="modalShow"
    :title="modalTitle"
    :width="1233"
    @onUpdateDialogStatus="onUpdateDialogStatus"
  >
    <div class="content">
      <div class="search-box">
        <MyFilter
          :formItems="filterItems"
          :formData="searchData"
          :labelWidth="'100px'"
          :colStyle="'max-width: 342px'"
          @searchForm="searchForm"
          @clearSearchForm="clearSearchForm"
        />
        <el-button style="margin-left: 12px" type="primary"> 导出 </el-button>
      </div>
      <MyTable
        ref="tableRef"
        :tableData="tableData"
        :columns="tableColumns"
        :selection="true"
        @handleSelectionChange="handleSelectionChange"
      />
      <MyPagination
        :total="tableTotal"
        :queryData="pageParams"
        @paginationChange="paginationChange"
      />
    </div>
  </MyDialog>
</template>

<script>
import { reactive, toRefs } from "vue";
import { ElMessageBox, ElMessage } from "element-plus";
import MyDialog from "@/components/MyDialog.vue";
import MyTable from "@/components/MyTable.vue";
import MyPagination from "@/components/MyPagination.vue";
import MyFilter from "@/components/MyFilter.vue";
import { batchReceiptApi } from "@/request/services/examinationRoom.js";
import { transformArrayData } from "@/utils/index";
import moment from "moment";

export default {
  components: {
    MyDialog,
    MyTable,
    MyPagination,
    MyFilter,
  },
  props: {
    modalShow: {
      type: Boolean,
      default: false,
    },
    modalTitle: {
      type: String,
      default: "客户批次回单统计",
    },
    modalData: {
      type: Object,
      default: () => ({}),
    },
  },
  setup(props, { emit }) {
    const filterRecord = reactive({
      filterItems: [
        {
          type: "input",
          label: "客户名称",
          paramName: "tenantNameBusiness",
          placeholder: "请输入客户名",
        },
      ],
      searchData: {},
    });

    const searchForm = (val) => {
      let params = {
        ...val,
      };
      filterRecord.searchData = params;
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
        pageSize: 10,
      },
      selectedRows: [],
    });

    const getTableData = () => {
      const params = {
        batchNum:props.modalData.batchNum,
        current: tableRecord.pageParams.currentPage,
        size: tableRecord.pageParams.pageSize,
        ...filterRecord.searchData,
      };
      batchReceiptApi.getTotalTableData(params).then((res) => {
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
    const paginationChange = (data) => {
      const { currentPage, pageSize } = tableRecord.pageParams;
      if (data.currentPage == currentPage && data.pageSize == pageSize) {
        return;
      }
      tableRecord.pageParams = { ...data };
      getTableData();
    };
     const handleSelectionChange = (val) => {
      tableRecord.selectedRows = val;
    };
    const tableColumns = [
      { label: "序号", prop: "num", width: 60, fixed: "left" },
      { label: "物料编号", prop: "productCode", fixed: "left", width: 160 },
      { label: "物料名称", prop: "productName", fixed: "left", width: 160 },
      { label: "批次编号", prop: "batchNum", width: 150 },
      {
        label: "包装类型",
        prop: "packType",
        width: 160,
        formatter: (row) => {
          return { S: "散装", D: "袋装" }[row.packType];
        },
      },
      { label: "客户编号", prop: "tenantCodeBusiness", width: 180 },
      { label: "客户名称", prop: "tenantNameBusiness", width: 180 },
      { label: "车数", prop: "trainNumber", width: 100 },
      { label: "实发量（吨）", prop: "settlementAmount", width: 120 },
      { label: "发货工厂", prop: "billCustomer", width: 180 },
      { label: "公司编号", prop: "tenantId", width: 120 },
      { label: "所属公司", prop: "tenantName", width: 180 },
    ];

    const onUpdateDialogStatus = (status) => {
      if (!status) {
        emit("onClose", status);
      }
    };

    const onModalClose = () => {
      emit("onClose", false);
    };
    return {
      ...toRefs(filterRecord),
      ...toRefs(tableRecord),
      tableColumns,
      onUpdateDialogStatus,
      onModalClose,
      searchForm,
      clearSearchForm,
      paginationChange,
      handleSelectionChange,
    };
  },
};
</script>

<style lang="scss" scoped>
.content {
  padding: 0 24px;

  .search-box {
    display: flex;
    margin-top: 20px;
  }
}
</style>
<template>
  <MyDialog
    :className="'receipt-modal'"
    v-if="modalShow"
    :visible="modalShow"
    :title="modalTitle"
    :width="976"
    @onUpdateDialogStatus="onUpdateDialogStatus"
  >
    <div class="content">
      <div class="search-box">
        <MyFilter
          :formItems="filterItems"
          :formData="searchData"
          :labelWidth="'0px'"
          :formStyle="'justify-content: flex-start'"
          :colStyle="'width: 246px'"
          @searchForm="searchForm"
          @clearSearchForm="clearSearchForm"
        />
      </div>
      <MyTable
        ref="tableRef"
        :tableData="tableData"
        :columns="tableColumns"
        :selection="true"
        @handleSelectChange="handleSelectChange"
      />
      <MyPagination
        :total="tableTotal"
        :queryData="pageParams"
        @paginationChange="paginationChange"
      />
    </div>
    <template v-slot:footer>
      <el-button @click="onModalClose">取消</el-button>
      <el-button
        type="primary"
        @click="onConfirm"
        :disabled="!(selectedRows && selectedRows.length)"
        :loading="btnLoading"
      >
        确定
      </el-button>
    </template>
  </MyDialog>
</template>

<script>
import { reactive, toRefs } from "vue";
import { ElMessageBox, ElMessage } from "element-plus";
import moment from "moment";
import MyDialog from "@/components/MyDialog.vue";
import MyTable from "@/components/MyTable.vue";
import MyPagination from "@/components/MyPagination.vue";
import MyFilter from "@/components/MyFilter.vue";
import { billsPayableApi } from "@/request/services/fundsManagement";
import { transformArrayData } from "@/utils/index";

export default {
  name: "TakeNumModal",
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
      default: "（厂内运输单）取号",
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
          label: "",
          paramName: "time",
          placeholder: "请输入车牌号查询",
        },
      ],
      searchData: {},
    });

    const searchForm = (val) => {
      let params = {};
      if (val.time) {
        params = {
          startTime: moment(val.time[0]).format("YYYY-MM-DD 00:00:00"),
          endTime: moment(val.time[1]).format("YYYY-MM-DD 23:59:59"),
          ...val,
        };
      }
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
        current: tableRecord.pageParams.currentPage,
        size: tableRecord.pageParams.pageSize,
        ...filterRecord.searchData,
      };
      delete params.time;
      billsPayableApi.getTableData(params).then((res) => {
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

    const tableColumns = [
      { label: "车牌号", prop: "id" },
      { label: "物料", prop: "tenantName" },
      { label: "取卡时间", prop: "createTime" },
    ];

    const handleSelectChange = (val) => {
      tableRecord.selectedRows = val;
    };

    const onUpdateDialogStatus = (status) => {
      if (!status) {
        emit("onClose", status);
      }
    };

    const onModalClose = () => {
      emit("onClose", false);
    };

    const onConfirm = () => {
      billsPayableApi
        .onVerify({
          id: props.modalData.id,
          receiptRecordId: tableRecord.selectedRow.id,
        })
        .then((res) => {
          if (res && res.code == 0) {
            emit("onClose", false);
            ElMessage.success("操作成功！");
          } else {
            ElMessage.error(res.message);
          }
        });
    };

    return {
      ...toRefs(filterRecord),
      ...toRefs(tableRecord),
      tableColumns,
      onUpdateDialogStatus,
      handleSelectChange,
      onModalClose,
      onConfirm,
      searchForm,
      clearSearchForm,
    };
  },
};
</script>

<style lang="scss" scoped>
.content {
  padding: 0 24px;
  .search-box {
    display: flex;
    .info {
      display: flex;
      width: 50%;
      font-size: 16px;
      font-family: PingFangSC-Regular, PingFang SC;
      color: $color-text;
      align-items: baseline;

      span {
        color: #5a78a0;
      }
      .num {
        color: $color-blue;
      }
      .price {
        font-size: 28px;
        font-family: HelveticaNeue-Bold, HelveticaNeue;
        font-weight: bold;
        color: $color-blue;
      }
    }
  }
}
</style>
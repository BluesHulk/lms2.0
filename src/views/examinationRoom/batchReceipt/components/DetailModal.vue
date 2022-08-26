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
        <el-button style="margin-left: 12px" type="primary" @click="exportOut">
          导出
        </el-button>
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
      default: "批次回单明细",
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
          type: "rangePicker",
          label: "出厂日期",
          paramName: "time",
          placeholder: "请输入",
        },
        {
          type: "input",
          label: "客户名称",
          paramName: "tenantNameBusiness",
          placeholder: "请输入客户名",
        },
        {
          type: "input",
          label: "车号",
          paramName: "licensePlate",
          placeholder: "请输入车号",
        },
      ],
      searchData: {},
    });

    const searchForm = (val) => {
      let params = {
        ...val,
      };
      if (val.time) {
        params = {
          outTimeStart: moment(val.time[0]).format("YYYY-MM-DD 00:00:00"),
          outTimeEnd: moment(val.time[1]).format("YYYY-MM-DD 23:59:59"),
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
        batchNum:props.modalData.batchNum,
        current: tableRecord.pageParams.currentPage,
        size: tableRecord.pageParams.pageSize,
        ...filterRecord.searchData,
      };
      delete params.time;
      batchReceiptApi.getDetailTableData(params).then((res) => {
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
    const tableColumns = [
      { label: "序号", prop: "num", width: 60, fixed: "left" },
      { label: "物料编号", prop: "productCode", fixed: "left", width: 160 },
      { label: "物料名称", prop: "productName", width: 160 },
      { label: "批次编号", prop: "batchNum", width: 150 },
      {
        label: "包装类型",
        prop: "packType",
        width: 160,
        formatter: (row) => {
          return { S: "散装", D: "袋装" }[row.packType];
        },
      },
      { label: "提货单号", prop: "dpOrderNum", width: 180 },
      { label: "客户编号", prop: "tenantCodeBusiness", width: 180 },
      { label: "客户名称", prop: "tenantNameBusiness", width: 180 },
      { label: "车号", prop: "licensePlate", width: 120 },
      { label: "实发量（吨）", prop: "settlementAmount", width: 120 },
      { label: "出场日期", prop: "outTime", width: 150 },
    ];

    const onUpdateDialogStatus = (status) => {
      if (!status) {
        emit("onClose", status);
      }
    };

    const onModalClose = () => {
      emit("onClose", false);
    };
    //多选
    const handleSelectionChange = (val) => {
      tableRecord.selectedRows = val;
    };
    const exportOut = () => {
      if (!tableRecord.selectedRows.length) {
        ElMessage.warning("请选择要导出的数据");
        return;
      }
      ElMessageBox.confirm(
        `<strong>导出数据</strong><br/>
        是否导出选中的数据?`,
        {
          dangerouslyUseHTMLString: true,
          confirmButtonText: "导出",
          cancelButtonText: "取消",
          type: "warning",
          [`close-on-click-modal`]: false,
        }
      )
        .then(async () => {
          const ids = tableRecord.selectedRows.map((item) => item.id);
          const res = await batchRecordApi.download(ids);
          let fileName = "批次回单明细";
          const _res = res;
          let blob = new Blob([_res], {
            type: "application/vnd.ms-excel;charset=utf-8",
          });
          let downloadElement = document.createElement("a");
          let href = window.URL.createObjectURL(blob); //创建下载的链接
          downloadElement.href = href;
          downloadElement.download = `${fileName}.xls`; //下载后文件名
          document.body.appendChild(downloadElement);
          downloadElement.click(); //点击下载
          document.body.removeChild(downloadElement); //下载完成移除元素
          window.URL.revokeObjectURL(href); //释放掉blob对象
        })
        .catch(() => {});
    };
    return {
      ...toRefs(filterRecord),
      ...toRefs(tableRecord),
      tableColumns,
      handleSelectionChange,
      exportOut,
      onUpdateDialogStatus,
      onModalClose,
      searchForm,
      clearSearchForm,
      paginationChange,
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
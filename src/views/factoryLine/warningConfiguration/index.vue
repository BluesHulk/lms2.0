<template>
  <MyContainer>
    <template v-slot:header>
      <el-button type="primary" @click="onModalShow('add')">新增</el-button>
    </template>
    <div class="content">
      <MyMultipleFilter :formItems="filterItems" @onSearch="onSearch" />
      <MyTable
        className="receipt-voucher-table"
        ref="tableRef"
        :tableData="tableData"
        :columns="tableColumns"
        @handleSelectionChange="handleSelectionChange"
      >
        <template v-slot:operation="slotProps">
          <el-button type="text" @click="onModalShow('edit', slotProps.data)"
            >配置</el-button
          >
          <el-button type="text" @click="onDelete(slotProps.data)"
            >删除</el-button
          >
        </template>
      </MyTable>
      <MyPagination
        :total="tableTotal"
        :queryData="pageParams"
        @paginationChange="paginationChange"
      />
    </div>
  </MyContainer>
  <EditModal
    :modalShow="modalShow"
    :modalTitle="modalTitle"
    :modalData="modalData"
    @onModalShow="onModalShow"
    @onClose="onModalClose"
  />
  <MaterialModal :modalShow="materialModalShow" @onClose="onModalClose" />
</template>

<script>
import { ref, reactive, toRefs } from "vue";
import moment from "moment";
import MyContainer from "@/components/MyContainer.vue";
import MyTable from "@/components/MyTable.vue";
import MyPagination from "@/components/MyPagination.vue";
import MyMultipleFilter from "@/components/MyMultipleFilter.vue";
import MySearch from "@/components/MySearch.vue";
import EditModal from "./components/EditModal.vue";
import MaterialModal from "./components/MaterialModal.vue";
import commonApi from "@/request/services/common";
import { billsPayableApi } from "@/request/services/fundsManagement";
import { ElMessage, ElMessageBox } from "element-plus";
import { transformArrayData } from "@/utils/index";

export default {
  name: "WarningConfiguration",
  components: {
    MyContainer,
    MyTable,
    MyPagination,
    MyMultipleFilter,
    MySearch,
    EditModal,
    MaterialModal,
  },
  setup() {
    const tenantList = ref([]);

    const getTenantList = () => {
      commonApi.getCompany().then((res) => {
        if (res && res.code == 0) {
          res.data.map((item) => {
            item.label = item.name;
            item.value = item.id;
          });
          tenantList.value = res.data;
        }
      });
    };
    getTenantList();

    const filterRecord = reactive({
      searchParams: {},
    });

    const getAdvancedBtnStatus = (status) => {
      filterRecord.advancedFilterShow = status;
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
        ...filterRecord.searchParams,
      };
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

    const onSearch = (val) => {
      tableRecord.pageParams.currentPage = 1;
      if (val.time && val.time.length) {
        val.startTime = moment(val.time[0]).format("YYYY-MM-DD 00:00:00");
        val.endTime = moment(val.time[1]).format("YYYY-MM-DD 23:59:59");

        delete val.time;
      }
      filterRecord.searchParams = val;
      getTableData();
    };

    const paginationChange = (data) => {
      const { currentPage, pageSize } = tableRecord.pageParams;
      if (data.currentPage == currentPage && data.pageSize == pageSize) {
        return;
      }
      tableRecord.pageParams = { ...data };
      getTableData();
    };

    const onDelete = (record) => {
      ElMessageBox.confirm(
        `<strong>提示</strong><br/>
        确定删除该预警配置？`,
        {
          dangerouslyUseHTMLString: true,
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).then(() => {
        billsPayableApi.onDelete(record.id).then((res) => {
          if (res && res.code == 0) {
            ElMessage.success("操作成功！");
            getTableData();
          } else {
            ElMessage.error(res.message);
          }
        });
      });
    };

    const modalRecord = reactive({
      modalShow: false,
      modalTitle: "",
      modalData: {},
    });

    const materialModalRecord = reactive({
      materialModalShow: false,
    });

    const onModalShow = (type, record) => {
      console.log(type, 2222222222)
      if (type == "addMaterial") {
        materialModalRecord.materialModalShow = true;
        return;
      }

      modalRecord.modalShow = true;
      modalRecord.modalTitle = type == "add" ? "新增预警规则" : "编辑预警规则";
      modalRecord.modalData = record;
    };

    const onModalClose = (type) => {
      if (type == "addMaterial") {
        materialModalRecord.materialModalShow = false;
      } else {
        modalRecord.modalShow = false;
      }
    };

    const filterItems = ref([
      {
        type: "select",
        label: "所属公司",
        paramName: "tenantId",
        options: tenantList,
        span: 12,
      },
      {
        type: "input",
        label: "区域名称",
        paramName: "customerName",
        span: 12,
      },
    ]);

    const tableColumns = [
      { label: "序号", prop: "num", width: 60, fixed: "left" },
      { label: "仓库&区域名称", prop: "customerName", minwidth: 150 },
      { label: "所属公司", prop: "money", minWidth: 200 },
      { label: "预警总车辆", prop: "money", minwidth: 120 },
      { label: "超时时间(min)", prop: "money", minwidth: 140 },
      { label: "超时延后(位)", prop: "checkTime", minwidth: 140 },
      { label: "状态", prop: "checkTime", minwidth: 120 },
      { label: "操作", slotName: "operation", width: 160, fixed: "right" },
    ];

    return {
      ...toRefs(filterRecord),
      ...toRefs(tableRecord),
      ...toRefs(modalRecord),
      ...toRefs(materialModalRecord),
      filterItems,
      tableColumns,
      onSearch,
      getAdvancedBtnStatus,
      paginationChange,
      onModalShow,
      onModalClose,
      onDelete,
    };
  },
};
</script>

<style lang="scss" scoped>
::v-deep {
  .my-multiple-filter-container {
    display: flex;
    justify-content: space-between;
    .my-form-container {
      min-width: calc(100% / 3 * 2);

      .el-form-item {
        margin: 0;
      }
    }
    .button-box {
      min-width: 145px;
    }
  }
}
</style>
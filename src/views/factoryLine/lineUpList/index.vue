<template>
  <MyContainer>
    <template v-slot:header>
      <el-button type="primary" @click="onModalShow('takeLineUp')"
        >取号排队</el-button
      >
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
          <el-button type="text" @click="onModalShow('jumpQueue', slotProps.data)"
            >插队</el-button
          >
          <el-button type="text" @click="onCancelQueue(slotProps.data)"
            >取消排队</el-button
          >
          <el-button type="text" @click="onCallNumberChange(slotProps.data)">{{
            slotProps.data.checkStatus == 0 ? "叫号" : "取消叫号"
          }}</el-button>
        </template>
      </MyTable>
      <MyPagination
        :total="tableTotal"
        :queryData="pageParams"
        @paginationChange="paginationChange"
      />
    </div>
  </MyContainer>
  <TakeNumModal :modalShow="takeNumModalShow" @onClose="onModalClose('takeLineUp')" />
  <JumpQueueModal :modalShow="jumpQueueModalShow" @onClose="onModalClose('jumpQueue')" />
</template>

<script>
import { ref, reactive, toRefs } from "vue";
import moment from "moment";
import MyContainer from "@/components/MyContainer.vue";
import MyTable from "@/components/MyTable.vue";
import MyPagination from "@/components/MyPagination.vue";
import MyMultipleFilter from "@/components/MyMultipleFilter.vue";
import MySearch from "@/components/MySearch.vue";
import TakeNumModal from "./components/TakeNumModal.vue";
import JumpQueueModal from "./components/JumpQueueModal.vue";
import commonApi from "@/request/services/common";
import { billsPayableApi } from "@/request/services/fundsManagement";
import { ElMessage, ElMessageBox } from "element-plus";
import { transformArrayData } from "@/utils/index";

export default {
  name: "LineUpList",
  components: {
    MyContainer,
    MyTable,
    MyPagination,
    MyMultipleFilter,
    MySearch,
    TakeNumModal,
    JumpQueueModal,
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

    const onJumpQueue = () => {};

    const onCancelQueue = (record) => {
      ElMessageBox.confirm(
        `<strong>提示</strong><br/>
        确定取消"${record.id}"的排队？`,
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

    const onCallNumberChange = (record) => {
      console.log("叫号");
      ElMessage.success("叫号成功！");
    };

    const takeNumModalRecord = reactive({
      takeNumModalShow: false,
      
    })

    const jumpQueueModalRecord = reactive({
      jumpQueueModalShow: false,
      
    })

    const onModalShow = (type, record) => {
      if(type == 'takeLineUp') {
        takeNumModalRecord.takeNumModalShow = true;

      }
      if(type == 'jumpQueue') {
        jumpQueueModalRecord.jumpQueueModalShow = true;
      }
    }

    const onModalClose = (type) => {
      if(type == 'takeLineUp') {
        takeNumModalRecord.takeNumModalShow = false;

      }
      if(type == 'jumpQueue') {
        jumpQueueModalRecord.jumpQueueModalShow = false;
      }
    }

    const filterItems = ref([
      {
        type: "select",
        label: "所属公司",
        paramName: "tenantId",
        options: tenantList,
        span: 8,
      },
      {
        type: "input",
        label: "区域名称",
        paramName: "customerName",
        span: 8,
      },
      {
        type: "input",
        label: "物料名称",
        paramName: "customerName",
        span: 8,
      },
    ]);

    const tableColumns = [
      { label: "序号", prop: "num", width: 60, fixed: "left" },
      { label: "车牌号", prop: "id", width: 160 },
      { label: "排队时间", prop: "createTime", width: 180 },
      { label: "物料名称", prop: "tenantName", width: 160 },
      { label: "仓库&区域名称", prop: "customerName", width: 150 },
      { label: "所属公司", prop: "money", minWidth: 200 },
      { label: "排队序号", prop: "money", width: 120 },
      { label: "叫号次数", prop: "money", width: 120 },
      { label: "叫号时间", prop: "checkTime", width: 180 },
      { label: "操作", slotName: "operation", width: 200, fixed: "right" },
    ];

    return {
      ...toRefs(filterRecord),
      ...toRefs(tableRecord),
      ...toRefs(takeNumModalRecord),
      ...toRefs(jumpQueueModalRecord),
      filterItems,
      tableColumns,
      onSearch,
      getAdvancedBtnStatus,
      paginationChange,
      onCallNumberChange,
      onCancelQueue,
      onModalShow,
      onModalClose,
    };
  },
};
</script>
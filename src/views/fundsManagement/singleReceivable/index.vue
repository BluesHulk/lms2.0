<template>
  <MyContainer>
    <div class="content">
      <MyMultipleFilter
        :formItems="filterItems"
        :formData="searchParams"
        :slotList="['customerId']"
        @onSearch="onSearch"
      >
        <template #customerId>
          <CustomerSelect
            :placeholder="'请选择'"
            :lockType="1"
            :customerId="searchParams.customerId"
            @selectedCustomer="selectedCustomer"
          />
        </template>
      </MyMultipleFilter>
      <MyTable
        className="receipt-voucher-table"
        ref="tableRef"
        :tableData="tableData"
        :columns="tableColumns"
        :selection="true"
        @handleSelectionChange="handleSelectionChange"
      >
        <template v-slot:operation="slotProps">
          <el-button type="text" @click="onJump('view', slotProps.data)"
            >详情</el-button
          >
          <el-button type="text" @click="onAuditStatusChange(slotProps.data)">{{
            slotProps.data.checkStatus == 0 ? "审核" : "弃审"
          }}</el-button>
          <el-button
            type="text"
            v-if="slotProps.data.checkStatus == 0"
            @click="onDelete(slotProps.data)"
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
</template>

<script>
import { ref, reactive, toRefs, computed } from "vue";
import moment from "moment";
import MyContainer from "@/components/MyContainer.vue";
import MyTable from "@/components/MyTable.vue";
import MyPagination from "@/components/MyPagination.vue";
import MyMultipleFilter from "@/components/MyMultipleFilter.vue";
import MySearch from "@/components/MySearch.vue";
import AdvancedFilterBtn from "@/components/AdvancedFilterBtn.vue";
import CustomerSelect from "@/components/CustomerSelect.vue";
import { singleReceivableApi } from "@/request/services/fundsManagement";
import { ElMessage, ElMessageBox } from "element-plus";
import { transformArrayData } from "@/utils/index";
import { useRouter } from "vue-router";
import { useStore } from "vuex";

export default {
  name: "ReceiptVoucher",
  components: {
    MyContainer,
    MyTable,
    MyPagination,
    MyMultipleFilter,
    MySearch,
    AdvancedFilterBtn,
    CustomerSelect,
  },
  setup() {
    const store = useStore();
    const router = useRouter();

    const tenantList = ref(
      computed(() => {
        if (store.state.common.tenantList.length) {
          return store.state.common.tenantList;
        } else {
          store.dispatch("common/getTenantList");
        }
      })
    );

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
      delete params.time;
      
      singleReceivableApi.getTableData(params).then((res) => {
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

    const onAuditStatusChange = (record) => {
      if (record.checkStatus == 0) {
        ElMessageBox.confirm(
          `<strong>审核通过</strong><br/>
          该收款单信息无误，确定审核通过？`,
          {
            dangerouslyUseHTMLString: true,
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          }
        ).then(() => {
          singleReceivableApi.onAudit(record.id).then((res) => {
            if (res && res.code == 0) {
              ElMessage.success("操作成功！");
              getTableData();
            } else {
              ElMessage.error(res.message);
            }
          });
        });
      } else {
        ElMessageBox.confirm(
          `<strong>提示</strong><br/>
          确定弃审该收款单？`,
          {
            dangerouslyUseHTMLString: true,
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          }
        ).then(() => {
          singleReceivableApi.onCancelAudit(record.id).then((res) => {
            if (res && res.code == 0) {
              ElMessage.success("操作成功！");
              getTableData();
            } else {
              ElMessage.error(res.message);
            }
          });
        });
      }
    };

    const onDelete = (record) => {
      ElMessageBox.confirm(
        `<strong>提示</strong><br/>
        确定删除"${record.id}"收款单？`,
        {
          dangerouslyUseHTMLString: true,
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).then(() => {
        singleReceivableApi.onDelete(record.id).then((res) => {
          if (res && res.code == 0) {
            ElMessage.success("操作成功！");
            getTableData();
          } else {
            ElMessage.error(res.message);
          }
        });
      });
    };

    const onJump = (type, record = {}) => {
      router.push({
        path: "/singleReceivableDetail",
        query: {
          type,
          id: record.id,
        },
      });
    };

    const filterItems = ref([
      {
        type: "input",
        label: "单据号",
        paramName: "id",
        span: 8,
      },
      {
        type: "rangePicker",
        label: "单据日期",
        paramName: "time",
        span: 8,
      },
      {
        type: "labelBlank",
        label: "收款对象",
        paramName: "customerName",
        slotName: "customerId",
        span: 8,
      },
      {
        type: "select",
        label: "收款主体",
        paramName: "tenantId",
        options: tenantList,
        span: 8,
      },
      {
        type: "select",
        label: "审核状态",
        paramName: "checkStatus",
        options: [
          { value: 0, label: "未审核" },
          { value: 1, label: "已审核" },
        ],
        span: 8,
      },
    ]);

    const tableColumns = [
      { label: "序号", prop: "num", width: 60, fixed: "left" },
      { label: "单据号", prop: "id", fixed: "left", width: 160 },
      { label: "单据日期", prop: "createTime", width: 180 },
      { label: "收款主体", prop: "tenantName", minWidth: 180 },
      { label: "收款对象", prop: "customerName", width: 150 },
      { label: "总金额(元)", prop: "money", width: 120 },
      {
        label: "审核状态",
        prop: "checkStatus",
        width: 120,
        formatter: (row) =>
          `<span class="status-label" style="background: ${
            row.checkStatus == 1 ? "#32D231" : "#FF3B30"
          };"></span>${{ 0: "未审核", 1: "已审核" }[row.checkStatus]}`,
      },
      { label: "审核人", prop: "checkUserName", width: 120 },
      { label: "审核时间", prop: "checkTime", width: 180 },
      { label: "操作", slotName: "operation", width: 170, fixed: "right" },
    ];

    const selectedCustomer = (val) => {
      filterRecord.searchParams.customerId = val.id;
    };

    return {
      ...toRefs(filterRecord),
      ...toRefs(tableRecord),
      filterItems,
      tableColumns,
      onSearch,
      getAdvancedBtnStatus,
      paginationChange,
      onAuditStatusChange,
      onDelete,
      onJump,
      selectedCustomer,
    };
  },
};
</script>
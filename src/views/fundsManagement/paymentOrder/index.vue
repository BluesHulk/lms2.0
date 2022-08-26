<template>
  <MyContainer>
    <template v-slot:header>
      <el-button type="primary" @click="onJump('add')">新增</el-button>
    </template>
    <template v-slot:header-right>
      <MySearch
        :initConditionValue="conditionValue"
        :searchCondition="searchCondition"
        @onSearch="onFuzzySearch"
      />
      <AdvancedFilterBtn
        style="margin-left: 24px"
        @getBtnStatus="getAdvancedBtnStatus"
      />
    </template>
    <div class="content">
      <MyMultipleFilter
        v-if="advancedFilterShow"
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
        className="payment-order-table"
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
          <el-dropdown v-if="!slotProps.data.checkStatus">
            <span class="el-dropdown-more">
              更多
              <el-icon class="el-icon--right">
                <arrow-down />
              </el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="onJump('edit', slotProps.data)"
                  >编辑</el-dropdown-item
                >
                <el-dropdown-item @click="onDelete(slotProps.data)"
                  >删除</el-dropdown-item
                >
              </el-dropdown-menu>
            </template>
          </el-dropdown>
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
import { ref, reactive, toRefs } from "vue";
import { useRouter } from "vue-router";
import moment from "moment";
import MyContainer from "@/components/MyContainer.vue";
import MyTable from "@/components/MyTable.vue";
import MyPagination from "@/components/MyPagination.vue";
import MyMultipleFilter from "@/components/MyMultipleFilter.vue";
import MySearch from "@/components/MySearch.vue";
import AdvancedFilterBtn from "@/components/AdvancedFilterBtn.vue";
import CustomerSelect from "@/components/CustomerSelect.vue";
import commonApi from "@/request/services/common";
import { paymentOrderApi } from "@/request/services/fundsManagement";
import { transformArrayData } from "@/utils/index";
import { ElMessage, ElMessageBox } from "element-plus";

export default {
  name: "PaymentOrder",
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
    const router = useRouter();

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
      conditionValue: "id",
      searchCondition: [
        {
          label: "单据号",
          value: "id",
        },
        // {
        //   label: "付款对象",
        //   value: "customerName",
        // },
      ],
      advancedFilterShow: false,
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

      paymentOrderApi.getTableData(params).then((res) => {
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

    const onFuzzySearch = (val) => {
      tableRecord.pageParams.currentPage = 1;
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
          该付款单信息无误，确定审核通过？`,
          {
            dangerouslyUseHTMLString: true,
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          }
        ).then(() => {
          paymentOrderApi.onAudit(record.id).then((res) => {
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
          确定弃审该付款单？`,
          {
            dangerouslyUseHTMLString: true,
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          }
        ).then(() => {
          paymentOrderApi.onCancelAudit(record.id).then((res) => {
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
        确定删除"${record.id}"付款单？`,
        {
          dangerouslyUseHTMLString: true,
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).then(() => {
        paymentOrderApi.onDelete(record.id).then((res) => {
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
      const params = {};
      let path = "/paymentOrderEdit";
      if (type == "edit") {
        params.id = record.id;
      }
      if (type == "view") {
        path = "/paymentOrderDetail";
        params.id = record.id;
      }
      router.push({
        path,
        query: {
          type,
          ...params,
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
        label: "付款对象",
        paramName: "customerName",
        slotName: "customerId",
        span: 8,
      },
      {
        type: "select",
        label: "付款主体",
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
      { label: "付款主体", prop: "tenantName", minWidth: 180 },
      { label: "付款对象", prop: "customerName", width: 150 },
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
      onFuzzySearch,
      paginationChange,
      onJump,
      onAuditStatusChange,
      onDelete,
      selectedCustomer,
    };
  },
};
</script>

<style lang="scss" scoped>
.payment-order-table {
  .el-dropdown-more {
    margin-left: 12px;
    height: 30px;
    color: #5a78a0;
    line-height: 30px;
  }
}
</style>
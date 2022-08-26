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
        @onSearch="onSearch"
      />
      <MyTable
        className="receipt-voucher-table"
        ref="tableRef"
        :tableData="tableData"
        :columns="tableColumns"
        :selection="true"
        @handleSelectionChange="handleSelectionChange"
      >
        <template v-slot:operation="slotProps">
          <el-button type="text" @click="onJump('detail', slotProps.data)"
            >详情</el-button
          >
          <el-button
            v-if="slotProps.data.checkStatus && slotProps.data.confirmStatus"
            type="text" 
            @click="onChangeStatus('check', slotProps.data)"
          >审核</el-button>
          <el-button
            v-if="slotProps.data.checkStatus && !slotProps.data.confirmStatus"
            type="text" 
            @click="onChangeStatus('confirm', slotProps.data)"
          >确认</el-button>
          <el-button
            v-if="slotProps.data.checkStatus && !slotProps.data.confirmStatus"
            type="text" 
            @click="onChangeStatus('cancelCheck', slotProps.data)"
          >弃审</el-button>

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
import { ref, reactive, toRefs, onMounted } from "vue";
import { useRouter } from "vue-router";
import moment from "moment";
import MyContainer from "@/components/MyContainer.vue";
import MyTable from "@/components/MyTable.vue";
import MyPagination from "@/components/MyPagination.vue";
import MyMultipleFilter from "@/components/MyMultipleFilter.vue";
import MySearch from "@/components/MySearch.vue";
import AdvancedFilterBtn from "@/components/AdvancedFilterBtn.vue";
import commonApi from "@/request/services/common";
import { accountStatementApi } from "@/request/services/settlementMangement";
import { transformArrayData } from "@/utils/index";
import { ElMessage, ElMessageBox } from "element-plus";

export default {
  name: "ReceiptVoucher",
  components: {
    MyContainer,
    MyTable,
    MyPagination,
    MyMultipleFilter,
    MySearch,
    AdvancedFilterBtn,
  },
  setup() {
    const router = useRouter();
    const tenantList = ref([]);

    const filterRecord = reactive({
      conditionValue: "id",
      searchCondition: [
        {
          label: "单据号",
          value: "id",
        },
      ],
      advancedFilterShow: false,
      searchParams: {},
    });

    const filterItems = ref([
      {
        type: "input",
        label: "单据号",
        paramName: "id ",
        span: 8,
      },
      {
        type: "rangePicker",
        label: "单据日期",
        paramName: "time",
        span: 8,
      },
      {
        type: "input",
        label: "对账单位",
        paramName: "customerName",
        span: 8,
      },
      {
        type: "select",
        label: "对账单类型",
        paramName: "statementType",
        options: [
          { value: 1, label: "贷款销售对账" },
          { value: 2, label: "贷款采购对账" },
        ],
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
      {
        type: "select",
        label: "单据状态",
        paramName: "confirmStatus",
        options: [
          { value: 0, label: "未确认" },
          { value: 1, label: "已确认" },
        ],
        span: 8,
      },
    ]);


    const getAdvancedBtnStatus = (status) => {
      filterRecord.advancedFilterShow = status;
    };

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

    const statementTypeMap = new Map([
      [1,'贷款销售对账'],
      [2,'贷款采购对账'],  
    ])

    const tableColumns = [
      { label: "序号", prop: "num", width: 60, fixed: "left" },
      { label: "单据号", prop: "id", fixed: "left", width: 160 },
      { label: "单据日期", prop: "createTime", width: 180 },
      { label: "业务主体", prop: "tenantName" },
      { label: "对账单位", prop: "customerName", width: 150 },
      { label: "账单类型", prop: "statementType", width: 150,
        formatter: (row) => {
          return statementTypeMap.get(row.statementType)
        }
      },
      { label: "总金额(元)", prop: "money", width: 120 },
      { label: "实发总数量(吨）", prop: "realSendNum", width: 150 },
      { label: "实扣总数量(吨）", prop: "realSubtractNum", width: 150 },
      { label: "签收总数量(吨）", prop: "realReceiveNum", width: 150 },
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
      {
        label: "单据状态",
        prop: "confirmStatus",
        width: 120,
        formatter: (row) =>
          `<span class="status-label" style="background: ${
            row.confirmStatus == 1 ? "#32D231" : "#FF3B30"
          };"></span>${{ 0: "未确认", 1: "已确认" }[row.confirmStatus]}`,
      },
      { label: "操作", slotName: "operation", width: 170, fixed: "right" },
    ];

    const paginationChange = (data) => {
      const { currentPage, pageSize } = tableRecord.pageParams;
      if (data.currentPage == currentPage && data.pageSize == pageSize) {
        return;
      }
      tableRecord.pageParams = { ...data };
      getTableData();
    };


    const getTableData = async () => {
      const params = {
        current: tableRecord.pageParams.currentPage,
        size: tableRecord.pageParams.pageSize,
        ...filterRecord.searchParams,
      };
      delete params.time;

      const res = await accountStatementApi.getTableData(params)
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
    };


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
    

    onMounted(async() => {
      getTableData();
      getTenantList();
    })

    const onJump = (type, record = {}) => {
      if(type == 'detail') {
        router.push({
          name: "accountStatementDetail",
          query: {
            id: record.id
          }
        })
      }
      if(type == 'edit') {
        router.push({
          name: "accountStatementEdit",
          query: {
            id: record.id
          }
        })
      }
      if(type == "add") {
        router.push({
          name: "accountStatementEdit",
        })
      }
    };

    const onChangeStatus = async(type, row) => {
      const result = await ElMessageBox.confirm(
        `<strong>提示</strong><br/>
        该收款单信息无误，确定审核通过？`,
        {
          dangerouslyUseHTMLString: true,
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
      if(result !=='confirm') return
      let res = null
      if(type=='confirm') {
        res = await accountStatementApi.confirm({id:row.id})
      }
      if(type=='check') {
        res = await accountStatementApi.check({id:row.id})
      }
      if(type=='cancelCheck') {
        res = await accountStatementApi.cancelCheck({id:row.id})
      }
      if (res && res.code == 0) {
        ElMessage.success("操作成功！");
        getTableData();
      } else {
        ElMessage.error(res.message);
      }
    }

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
      onChangeStatus,
    };
  },
};
</script>

<style lang="scss" scoped>
.receipt-voucher-table {
  .el-dropdown-more {
    margin-left: 12px;
    height: 30px;
    color: #5a78a0;
    line-height: 30px;
  }
}
</style>
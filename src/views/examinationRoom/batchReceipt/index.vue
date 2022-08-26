<template>
  <MyContainer>
    <div class="content">
      <MyMultipleFilter
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
          <el-button type="text" @click="viewDetail(slotProps.data)"
            >查看明细</el-button
          >
          <el-button type="text" @click="viewTotal(slotProps.data)"
            >查看统计</el-button
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
  <DetailModal
    v-if="detailModalShow"
    :modalTitle="'批次回单明细'"
    :modalShow="detailModalShow"
    :modalData="modalData"
    @onClose="onDetailClose"
  />
  <TotalModal
    v-if="totalModalShow"
    :modalTitle="'客户批次回单统计'"
    :modalShow="totalModalShow"
    :modalData="modalData"
    @onClose="onTotalClose"
  />
</template>

<script>
import { ref, reactive, toRefs,computed } from "vue";
import moment from "moment";
import MyContainer from "@/components/MyContainer.vue";
import MyTable from "@/components/MyTable.vue";
import MyPagination from "@/components/MyPagination.vue";
import MyMultipleFilter from "@/components/MyMultipleFilter.vue";
import MySearch from "@/components/MySearch.vue";
import AdvancedFilterBtn from "@/components/AdvancedFilterBtn.vue";
import CustomerSelect from "@/components/CustomerSelect.vue";
import commonApi from "@/request/services/common";
import { batchReceiptApi } from "@/request/services/examinationRoom.js";
import { ElMessage, ElMessageBox } from "element-plus";
import { transformArrayData } from "@/utils/index";
import { useRouter } from "vue-router";
import DetailModal from "./components/DetailModal.vue";
import TotalModal from "./components/TotalModal.vue";
import { useStore } from "vuex";

export default {
  name: "BatchReceipt",
  components: {
    MyContainer,
    MyTable,
    MyPagination,
    MyMultipleFilter,
    MySearch,
    AdvancedFilterBtn,
    CustomerSelect,
    DetailModal,
    TotalModal,
  },
  setup() {
    const router = useRouter();
    const store = useStore();

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

    const modalRecord = reactive({
      detailModalShow: false,
      totalModalShow: false,
      modalData: {},
    });
    const getTableData = () => {
      const params = {
        current: tableRecord.pageParams.currentPage,
        size: tableRecord.pageParams.pageSize,
        ...filterRecord.searchParams,
      };
      batchReceiptApi.getTableData(params).then((res) => {
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
        val.createStartTime = moment(val.time[0]).format("YYYY-MM-DD 00:00:00");
        val.createEndTime = moment(val.time[1]).format("YYYY-MM-DD 23:59:59");

        delete val.time;
      }
      if (val.time1 && val.time1.length) {
        val.sealStartTime = moment(val.time1[0]).format("YYYY-MM-DD 00:00:00");
        val.sealEndTime = moment(val.time1[1]).format("YYYY-MM-DD 23:59:59");

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

    const viewTotal = (record) => {
      modalRecord.totalModalShow = true;
      modalRecord.modalData = record;
    };

    const viewDetail = (record) => {
      modalRecord.detailModalShow = true;
      modalRecord.modalData = record;
    };

    const onDetailClose = () => {
      modalRecord.detailModalShow = false;
      modalRecord.modalData = {};
    };
    const onTotalClose = () => {
      modalRecord.totalModalShow = false;
      modalRecord.modalData = {};
    };

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
        label: "批次号",
        paramName: "batchNum",
        span: 8,
      },
      {
        type: "select",
        label: "状态",
        paramName: "status",
        options: [
          { value: 0, label: "启用" },
          { value: 1, label: "禁用" },
          { value: 2, label: "作废" },
        ],
        span: 8,
      },
      {
        type: "rangePicker",
        label: "启用日期",
        paramName: "time",
        span: 8,
      },
      {
        type: "rangePicker",
        label: "封存日期",
        paramName: "time1",
        span: 8,
      },
    ]);

    const tableColumns = [
      { label: "序号", prop: "num", width: 60, fixed: "left" },
      { label: "物料编号", prop: "productCode", fixed: "left", width: 180 },
      { label: "物料名称", prop: "productName", width: 180 },
      { label: "批次编号", prop: "batchNum", width: 180 },
      {
        label: "包装类型",
        prop: "packType",
        width: 160,
        formatter: (row) => {
          return { S: "散装", D: "袋装" }[row.packType];
        },
      },
      { label: "检测量（吨）", prop: "amount", width: 160 },
      { label: "实发量（吨）", prop: "useAmount", width: 160 }, //w
      // { label: "剩余量（吨）", prop: "amount", width: 160 },//w
      { label: "启用日期", prop: "useTime", width: 180 }, //w
      { label: "封存日期", prop: "sealTime", width: 180 },
      {
        label: "状态",
        prop: "status",
        width: 160,
        formatter: (row) => {
          return { 0: "启用", 1: "禁用", 2: "作废" }[row.status];
        },
      },
      { label: "发货工厂", prop: "billFactoryName", width: 180 },
      { label: "公司编号", prop: "tenantId", width: 180 },
      { label: "所属公司", prop: "tenantName", width: 180 },

      { label: "操作", slotName: "operation", width: 220, fixed: "right" },
    ];

    const selectedCustomer = (val) => {
      filterRecord.searchParams.customerId = val.id;
    };

    return {
      ...toRefs(filterRecord),
      ...toRefs(tableRecord),
      ...toRefs(modalRecord),
      filterItems,
      tableColumns,
      onSearch,
      getAdvancedBtnStatus,
      paginationChange,
      viewTotal,
      viewDetail,
      selectedCustomer,
      onDetailClose,
      onTotalClose,
    };
  },
};
</script>
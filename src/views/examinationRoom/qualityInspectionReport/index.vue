<template>
  <MyContainer>
    <template v-slot:header>
      <el-button type="primary" @click="onModalShow('add')">新增</el-button>
    </template>
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
        @handleSelectionChange="handleSelectionChange"
      >
        <template v-slot:operation="slotProps">
          <el-button type="text" @click="onDelete(slotProps.data)"
            >删除</el-button
          >
          <el-button type="text" @click="onModalShow('edit', slotProps.data)"
            >修改</el-button
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
    v-if="modalShow"
    :visible="modalShow"
    :modalType="modalType"
    :modalTitle="modalTitle"
    :modalData="modalData"
    @onClose="onModalClose"
    @onRefresh="getTableData"
  />
</template>

<script>
import { ref, reactive, toRefs ,computed} from "vue";
import moment from "moment";
import MyContainer from "@/components/MyContainer.vue";
import MyTable from "@/components/MyTable.vue";
import MyPagination from "@/components/MyPagination.vue";
import MyMultipleFilter from "@/components/MyMultipleFilter.vue";
import MySearch from "@/components/MySearch.vue";
import EditModal from "./components/EditModal.vue";
import commonApi from "@/request/services/common";
import { qualityInspectionApi } from "@/request/services/examinationRoom";
import { ElMessage, ElMessageBox } from "element-plus";
import { transformArrayData } from "@/utils/index";
import { useStore } from "vuex";
import CustomerSelect from "@/components/commonModal/CustomerModal.vue";

export default {
  name: "MaterialBatchManagement",
  components: {
    MyContainer,
    MyTable,
    MyPagination,
    MyMultipleFilter,
    MySearch,
    EditModal,
    CustomerSelect,
  },
  setup() {
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

    const getTableData = () => {
      const params = {
        current: tableRecord.pageParams.currentPage,
        size: tableRecord.pageParams.pageSize,
        ...filterRecord.searchParams,
      };
      qualityInspectionApi.getTableData(params).then((res) => {
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
        val.updateStartTime = moment(val.time[0]).format("YYYY-MM-DD 00:00:00");
        val.updateEndTime = moment(val.time[1]).format("YYYY-MM-DD 23:59:59");

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
        您确定要删除此条数据？`,
        {
          dangerouslyUseHTMLString: true,
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).then(() => {
        qualityInspectionApi.onDelete(record.id).then((res) => {
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
      modalType: "",
      modalData: {},
    });

    const onModalShow = (type, record = {}) => {
      modalRecord.modalShow = true;
      modalRecord.modalType = type;
      modalRecord.modalTitle = type == "add" ? "新增" : "编辑";
      modalRecord.modalData = { ...record };
    };

    const onModalClose = () => {
      modalRecord.modalShow = false;
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
        paramName: "batchId",
        span: 8,
      },
      {
        type: "input",
        label: "车牌号",
        paramName: "licensePlate",
        span: 8,
      },
      {
        type: "labelBlank",
        label: "客户名称",
        paramName: "customerName",
        slotName: "customerId",
        span: 8,
      },
      {
        type: "rangePicker",
        label: "选择日期",
        paramName: "time",
        span: 8,
      },
    ]);

    const tableColumns = [
      { label: "序号", prop: "num", width: 60, fixed: "left" },
      { label: "物料编号", prop: "productCode", width: 140, fixed: "left" },
      { label: "物料名称", prop: "productName", width: 160, fixed: "left" },
      {
        label: "包装类型",
        prop: "packType",
        width: 160,
        formatter: (row) => {
          return { S: "散装", D: "袋装" }[row.packType];
        },
      },
      { label: "车牌号", prop: "licensePlate", width: 120 },
      { label: "客户名称", prop: "customerName", minWidth: 160 },
      { label: "开单客户", prop: "billCustomerName", width: 160 },
      { label: "提货量", prop: "amount", width: 120 }, //wu
      { label: "创建人", prop: "createUserName", width: 120 },
      {
        label: "创建时间",
        prop: "createTime",
        width: 170,
        formatter: (row) =>
          row.createTime &&
          moment(row.createTime).format("YYYY-MM-DD HH:mm:ss"),
      },
      { label: "修改人", prop: "updateUserName", width: 120 },
      {
        label: "修改时间",
        prop: "updateTime",
        width: 170,
        formatter: (row) =>
          row.updateTime &&
          moment(row.updateTime).format("YYYY-MM-DD HH:mm:ss"),
      },
      { label: "发货工厂", prop: "billFactoryName", width: 140 },
      { label: "公司编号", prop: "tenantId", width: 120 },
      { label: "所属公司", prop: "tenantName", width: 180 },
      { label: "操作", slotName: "operation", width: 200, fixed: "right" },
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
      onDelete,
      onModalShow,
      onModalClose,
      getTableData,
      selectedCustomer,
    };
  },
};
</script>
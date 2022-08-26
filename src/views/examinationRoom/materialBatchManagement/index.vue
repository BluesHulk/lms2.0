<template>
  <MyContainer>
    <template v-slot:header>
      <el-button type="primary" @click="onModalShow('add')">新增</el-button>
    </template>
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
        @handleSelectionChange="handleSelectionChange"
      >
        <template v-slot:operation="slotProps">
          <el-button type="text" @click="onDelete(slotProps.data)"
            >删除</el-button
          >
          <el-button type="text" @click="onModalShow('edit', slotProps.data)"
            >修改</el-button
          >
          <el-button type="text" @click="onStatusChange(slotProps.data)">{{
            slotProps.data.status == 0 ? "禁用" : "启用"
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
import { ref, reactive, toRefs } from "vue";
import moment from "moment";
import MyContainer from "@/components/MyContainer.vue";
import MyTable from "@/components/MyTable.vue";
import MyPagination from "@/components/MyPagination.vue";
import MyMultipleFilter from "@/components/MyMultipleFilter.vue";
import MySearch from "@/components/MySearch.vue";
import EditModal from "./components/EditModal.vue";
import commonApi from "@/request/services/common";
import { batchManagementApi } from "@/request/services/examinationRoom";
import { ElMessage, ElMessageBox } from "element-plus";
import { transformArrayData } from "@/utils/index";

export default {
  name: "MaterialBatchManagement",
  components: {
    MyContainer,
    MyTable,
    MyPagination,
    MyMultipleFilter,
    MySearch,
    EditModal,
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
      batchManagementApi.getTableData(params).then((res) => {
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

    const onStatusChange = (record) => {
      const status = record.status == 0 ? 1 : 0;
      ElMessageBox.confirm(
        `<strong>提示</strong><br/>
        您确定要对物料【${record.batchNum}】${
          { 0: "启用", 1: "禁用" }[status]
        }批次吗？`,
        {
          dangerouslyUseHTMLString: true,
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).then(() => {
        batchManagementApi
          .onStatusChange({ id: record.id, status })
          .then((res) => {
            if (res && res.code == 0) {
              ElMessage.success("操作成功！");
              getTableData();
            } else {
              ElMessage.error(res.message);
            }
          });
      });
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
        batchManagementApi.onDelete(record.id).then((res) => {
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
      record.batchType &&
        (modalRecord.modalData.batchType = record.batchType * 1);
      modalRecord.modalData.isAddYyyy = record.isAddYyyy == 1 ? [1] : [];
      modalRecord.modalData.isAutoReset = record.isAutoReset == 1 ? [1] : [];
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
        label: "物料批号/名称",
        paramName: "productNameOrBatchNum",
        span: 8,
      },
      {
        type: "select",
        label: "状态",
        paramName: "status",
        options: [
          { label: "启用", value: 0 },
          { label: "禁用", value: 1 },
          // { label: "作废", value: 2 },
        ],
        span: 8,
      },
    ]);

    const tableColumns = [
      { label: "序号", prop: "num", width: 60, fixed: "left" },
      { label: "物料编号", prop: "productCode", width: 140, fixed: "left" },
      { label: "物料名称", prop: "productName", width: 160, fixed: "left" },
      { label: "当前批号", prop: "batchNum", width: 160 },
      { label: "批号前缀", prop: "noProfix", width: 120 },
      { label: "分隔符", prop: "divide", minWidth: 120 },
      { label: "编号基数", prop: "noBase", width: 120 },
      { label: "编号增量", prop: "noStep", width: 120 },
      { label: "编号长度", prop: "noLength", width: 120 },
      { label: "检测量(吨)", prop: "amount", width: 150 },
      { label: "预警量(%)", prop: "warningAmount", width: 120 },
      { label: "禁超量(%)", prop: "banSurpassAmount", width: 120 },
      { label: "编号周期(天)", prop: "period", width: 120 },
      {
        label: "状态",
        prop: "status",
        width: 120,
        formatter: (row) => (
          { 0: "启用", 1: "禁用" }[row.status]
        )
      },
      { label: "创建人", prop: "createUserName", width: 120 },
      {
        label: "创建时间",
        prop: "createTime",
        width: 170,
        formatter: (row) => (
          row.createTime && moment(row.createTime).format('YYYY-MM-DD HH:mm:ss')
        )
      },
      { label: "修改人", prop: "updateUserName", width: 120 },
      {
        label: "修改时间",
        prop: "updateTime",
        width: 170,
        formatter: (row) => (
          row.updateTime && moment(row.updateTime).format('YYYY-MM-DD HH:mm:ss')
        )
      },
      { label: "发货工厂", prop: "billFactoryName", width: 140 },
      { label: "公司编号", prop: "tenantId", width: 120 },
      { label: "所属公司", prop: "tenantName", width: 180 },
      { label: "操作", slotName: "operation", width: 200, fixed: "right" },
    ];

    return {
      ...toRefs(filterRecord),
      ...toRefs(tableRecord),
      ...toRefs(modalRecord),
      filterItems,
      tableColumns,
      onSearch,
      getAdvancedBtnStatus,
      paginationChange,
      onStatusChange,
      onDelete,
      onModalShow,
      onModalClose,
      getTableData,
    };
  },
};
</script>
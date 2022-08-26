<template>
  <MyContainer>
    <template v-slot:header>
      <el-button type="primary" @click="onModalShow('add')">新增</el-button>
    </template>
    <div class="content">
      <MyMultipleFilter
        :formItems="filterItems"
        :initData="initParams"
        :formData="searchParams"
        @onSearch="onSearch"
      />
      <MyTable
        className="mill-management-table"
        ref="tableRef"
        :tableData="tableData"
        :columns="tableColumns"
        :extraHeight="285"
        @handleSelectionChange="handleSelectionChange"
      >
        <template v-slot:operation="slotProps">
          <el-button type="text" @click="onModalShow('edit', slotProps.data)"
            >修改</el-button
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
import { ref, reactive, toRefs, computed } from "vue";
import moment from "moment";
import MyContainer from "@/components/MyContainer.vue";
import MyTable from "@/components/MyTable.vue";
import MyPagination from "@/components/MyPagination.vue";
import MyMultipleFilter from "@/components/MyMultipleFilter.vue";
import MySearch from "@/components/MySearch.vue";
import EditModal from "./components/EditModal.vue";
import { customerLaneSettingApi } from "@/request/services/factoryDispatch";
import { ElMessage, ElMessageBox } from "element-plus";
import { transformArrayData } from "@/utils/index";
import { useStore } from "vuex";

export default {
  name: "CustomerLaneSetting",
  components: {
    MyContainer,
    MyTable,
    MyPagination,
    MyMultipleFilter,
    MySearch,
    EditModal,
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
      initParams: {
        tenantId: sessionStorage.getItem("tenantId") * 1 || "",
      },
      searchParams: {
        tenantId: sessionStorage.getItem("tenantId") * 1 || "",
      },
    });

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
      customerLaneSettingApi.getTableData(params).then((res) => {
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

    const onDelete = (record) => {
      ElMessageBox.confirm(
        `<strong>温馨提示</strong><br/>
        您确定要删除此条数据？`,
        {
          dangerouslyUseHTMLString: true,
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).then(() => {
        customerLaneSettingApi.onDelete(record.id).then((res) => {
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
        type: "select",
        label: "车道类型",
        paramName: "laneType",
        options: [
          { label: "普通", value: "ordinary" },
          { label: "VIP", value: "vip" },
        ],
        span: 8,
      },
      {
        type: "input",
        label: "客户名称",
        paramName: "customerName",
        span: 8,
      },
    ]);

    const tableColumns = [
      { label: "序号", prop: "num", width: 60, fixed: "left" },
      { label: "客户编号", prop: "customerCode", width: 140, fixed: "left" },
      { label: "客户名称", prop: "customerName", width: 160, fixed: "left" },
      { label: "磨机编号", prop: "millCode", width: 140 },
      { label: "磨机名称", prop: "millName", width: 160 },
      { label: "车道类型", prop: "laneTypeName", width: 120 },
      { label: "创建人", prop: "createUserName", width: 120 },
      {
        label: "创建时间",
        prop: "createTime",
        width: 170,
        formatter: (row) =>
          row.createTime &&
          moment(row.createTime).format("YYYY-MM-DD HH:mm:ss"),
      },
      { label: "公司编号", prop: "tenantId", width: 120 },
      { label: "所属公司", prop: "tenantName", minWidth: 180 },
      { label: "操作", slotName: "operation", width: 140, fixed: "right" },
    ];

    return {
      ...toRefs(filterRecord),
      ...toRefs(tableRecord),
      ...toRefs(modalRecord),
      filterItems,
      tableColumns,
      onSearch,
      paginationChange,
      onDelete,
      onModalShow,
      onModalClose,
      getTableData,
    };
  },
};
</script>
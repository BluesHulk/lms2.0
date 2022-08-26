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
        className="lane-management-table"
        ref="tableRef"
        :tableData="tableData"
        :columns="tableColumns"
        :extraHeight="300"
        @handleSelectionChange="handleSelectionChange"
      >
        <template v-slot:operation="slotProps">
          <el-button type="text" @click="onModalShow('edit', slotProps.data)"
            >修改</el-button
          >
          <el-button type="text" @click="onDelete(slotProps.data)"
            >删除</el-button
          >
          <el-button
            type="text"
            @click="onStatusChange(slotProps.data)"
            :style="slotProps.data.isEnable == true ? 'color: #FF3B30' : ''"
            >{{ slotProps.data.isEnable == true ? "停用" : "启用" }}</el-button
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
import {
  laneManagementApi,
  millManagementApi,
} from "@/request/services/factoryDispatch";
import { ElMessage, ElMessageBox } from "element-plus";
import { transformArrayData } from "@/utils/index";
import { useStore } from "vuex";

export default {
  name: "MaterialBatchRecord",
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

    const tenantList = ref(computed(() => {
      if(store.state.common.tenantList.length) {
        return store.state.common.tenantList;
      } else {
        store.dispatch('common/getTenantList');
      }
    }));

    const millList = ref([]);

    const getMillList = () => {
      millManagementApi.getMillList().then((res) => {
        if (res && res.code == 0) {
          res.data.map((item) => {
            item.label = item.name;
            item.value = item.id;
          });
          millList.value = res.data;
        }
      });
    };
    getMillList();

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
      laneManagementApi.getTableData(params).then((res) => {
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
      const status = record.isEnable == true ? false : true;
      ElMessageBox.confirm(
        `<strong>温馨提示</strong><br/>
        您确定要调整该车道状态为：${
          { true: "启用", false: "停用" }[status]
        }状态吗？`,
        {
          dangerouslyUseHTMLString: true,
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).then(() => {
        laneManagementApi
          .onStatusChange({ loadLaneId: record.id, isEnable: status })
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
        `<strong>温馨提示</strong><br/>
        您确定要删除此条数据？`,
        {
          dangerouslyUseHTMLString: true,
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).then(() => {
        laneManagementApi.onDelete(record.id).then((res) => {
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
        label: "车道状态",
        paramName: "isEnable",
        options: [
          { label: "启用", value: true },
          { label: "停用", value: false },
        ],
        span: 8,
      },
      {
        type: "select",
        label: "隶属磨机",
        paramName: "millId",
        options: millList,
        span: 8,
      },
      {
        type: "input",
        label: "车道名称",
        paramName: "name",
        span: 8,
      },
    ]);

    const tableColumns = [
      { label: "序号", prop: "num", width: 60, fixed: "left" },
      { label: "车道编号", prop: "code", width: 120, fixed: "left" },
      { label: "车道名称", prop: "name", width: 140, fixed: "left" },
      { label: "物料名称", prop: "productName", width: 140 },
      { label: "物料编号", prop: "productCode", width: 100 },
      {
        label: "包装类型",
        prop: "packType",
        minWidth: 100,
        render: (row) => (
          { D: "袋装", S: "散装" }[row.packType]
        )
      },
      { label: "统计分组", prop: "productGroupTypeName", minWidth: 100 },
      { label: "隶属磨机", prop: "millName", minWidth: 140 },
      { label: "车道容量", prop: "volume", minWidth: 100 },
      { label: "车道类型", prop: "laneTypeName", minWidth: 100 },
      {
        label: "车道状态",
        prop: "isEnable",
        width: 120,
        formatter: (row) =>
          `<span class="status-label" style="background: ${
            row.isEnable == true ? "#32D231" : "#FF3B30"
          };"></span>${{ true: "启用", false: "停用" }[row.isEnable]}`,
      },
      { label: "单袋重量(kg)", prop: "bagWeight", minWidth: 120 },
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
      { label: "修改人", prop: "updateUserName", width: 120 },
      {
        label: "修改时间",
        prop: "updateTime",
        width: 170,
        formatter: (row) =>
          row.updateTime &&
          moment(row.updateTime).format("YYYY-MM-DD HH:mm:ss"),
      },
      { label: "操作", slotName: "operation", width: 180, fixed: "right" },
    ];

    return {
      ...toRefs(filterRecord),
      ...toRefs(tableRecord),
      ...toRefs(modalRecord),
      filterItems,
      tableColumns,
      onSearch,
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

<style lang="scss" scoped>
:deep(.status-label) {
  display: inline-block;
  margin-right: 4px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
</style>
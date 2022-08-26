<template>
  <MyContainer>
    <template v-slot:header>
      <el-button type="primary" @click="onModalShow('add')">新增</el-button>
    </template>
    <div class="content">
      <MyMultipleFilter :formItems="filterItems" :formData="searchParams" @onSearch="onSearch" />
      <MyTable
        className="receipt-voucher-table"
        ref="tableRef"
        :tableData="tableData"
        :columns="tableColumns"
        :extraHeight="230"
        @handleSelectionChange="handleSelectionChange"
      >
        <template v-slot:operation="slotProps">
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
import { ref, reactive, toRefs } from "vue";
import moment from "moment";
import MyContainer from "@/components/MyContainer.vue";
import MyTable from "@/components/MyTable.vue";
import MyPagination from "@/components/MyPagination.vue";
import MyMultipleFilter from "@/components/MyMultipleFilter.vue";
import MySearch from "@/components/MySearch.vue";
import EditModal from "./components/EditModal.vue";
import commonApi from "@/request/services/common";
import { groupMaterialSettingApi } from "@/request/services/factoryDispatch";
import { ElMessage, ElMessageBox } from "element-plus";
import { transformArrayData } from "@/utils/index";

export default {
  name: "GroupMaterialSetting",
  components: {
    MyContainer,
    MyTable,
    MyPagination,
    MyMultipleFilter,
    MySearch,
    EditModal,
  },
  setup() {
    const groupList = ref([]);
    const getDictionaryList = (code, setData) => {
      commonApi.getDictionaryList(code).then((res) => {
        if (res && res.code == 0) {
          res.data.map((item) => {
            item.label = item.name;
            item.value = item.code;
          });
          setData.value = res.data;
        }
      });
    };
    getDictionaryList("PRODUCT_GROUP_TYPE", groupList);

    const filterRecord = reactive({
      searchParams: {},
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
      groupMaterialSettingApi.getTableData(params).then((res) => {
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
        groupMaterialSettingApi.onDelete(record.id).then((res) => {
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
        label: "分组类型",
        paramName: "type",
        options: groupList,
        span: 12,
      },
      {
        type: "input",
        label: "物料名称",
        paramName: "productName",
        span: 12,
      },
    ]);

    const tableColumns = [
      { label: "序号", prop: "num", width: 60, fixed: "left" },
      { label: "物料编号", prop: "productCode", width: 100 },
      { label: "物料名称", prop: "productName", width: 140 },
      { label: "统计分组编号", prop: "type", minWidth: 140 },
      { label: "统计分组名称", prop: "typeName", minWidth: 140 },
      { label: "创建人", prop: "createUserName", width: 120 },
      {
        label: "创建时间",
        prop: "createTime",
        width: 170,
        formatter: (row) => (
          row.createTime && moment(row.createTime).format('YYYY-MM-DD HH:mm:ss')
        )
      },
      { label: "公司编号", prop: "tenantId", width: 120 },
      { label: "所属公司", prop: "tenantName", minWidth: 180 },
      { label: "操作", slotName: "operation", width: 100, fixed: "right" },
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
<template>
  <MyMultipleFilter
    :formItems="filterItems"
    :formData="searchParams"
    @onSearch="onSearch"
  />
  <MyTable
    className="examination-roomSetting-table"
    ref="tableRef"
    :tableData="tableData"
    :columns="tableColumns"
    :selection="true"
    @handleSelectionChange="handleSelectionChange"
  >
    <template v-slot:operation="slotProps">
      <el-button type="text" @click="onDelete(slotProps.data.id)"
        >删除</el-button
      >
    </template>
  </MyTable>
  <MyPagination
    :total="tableTotal"
    :queryData="pageParams"
    @paginationChange="paginationChange"
  />
</template>

<script>
import { ref, reactive, toRefs, watch } from "vue";
import MyTable from "@/components/MyTable.vue";
import MyPagination from "@/components/MyPagination.vue";
import MyMultipleFilter from "@/components/MyMultipleFilter.vue";
import commonApi from "@/request/services/common";
import { examinationRoomSettingApi } from "@/request/services/examinationRoom";
import { transformArrayData } from "@/utils/index";
import { ElMessage, ElMessageBox } from "element-plus";

export default {
  name: "examinationRoomSetting",
  components: {
    MyTable,
    MyPagination,
    MyMultipleFilter,
  },
  props: {
    tabKey: {
      type: Number,
    },
  },
  setup(props) {
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

    const tableRecord = reactive({
      tableRef: null,
      tableData: [{}, {}],
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

      examinationRoomSettingApi.getTableData1(params).then((res) => {
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
        `<strong>提示</strong><br/>
        您确定要删除此条数据？`,
        {
          dangerouslyUseHTMLString: true,
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).then(() => {
        examinationRoomSettingApi.onDelete(record.id).then((res) => {
          if (res && res.code == 0) {
            ElMessage.success("操作成功！");
            getTableData();
          } else {
            ElMessage.error(res.message);
          }
        });
      });
    };

    const filterItems = ref([
      {
        type: "select",
        label: "所属公司",
        paramName: "tenantId",
        options: tenantList,
        span: 12,
      },
      {
        type: "select",
        label: "发货工厂",
        paramName: "checkStatus",
        options: [
          { value: 0, label: "未审核" },
          { value: 1, label: "已审核" },
        ],
        span: 12,
      },
    ]);

    const tableColumns = ref([]);

    const handleTableColumns = (tabKey) => {
      if (tabKey == 4) {
        tableColumns.value = [
          { label: "序号", prop: "num", width: 60 },
          { label: "分组编号", prop: "id" },
          { label: "分组名称", prop: "createTime" },
          { label: "分组类型", prop: "createTime" },
          { label: "创建人", prop: "money" },
          { label: "创建时间", prop: "money", minwidth: 160 },
          { label: "公司编号", prop: "money" },
          { label: "所属公司", prop: "money", minWidth: 160 },
          { label: "操作", slotName: "operation" },
        ];
      } else {
        tableColumns.value = [
          { label: "序号", prop: "num", width: 60 },
          { label: "客户编号", prop: "id" },
          { label: "客户名称", prop: "createTime" },
          { label: "分组编号", prop: "id" },
          { label: "分组名称", prop: "createTime" },
          { label: "分组类型", prop: "createTime" },
          { label: "创建人", prop: "money" },
          { label: "创建时间", prop: "money", minWidth: 140 },
          { label: "公司编号", prop: "money" },
          { label: "所属公司", prop: "money", minWidth: 160 },
          { label: "操作", slotName: "operation" },
        ];
      }
    };

    watch(
      () => props.tabKey,
      (newVal) => {
        handleTableColumns(newVal);
      },
      {
        immediate: true
      }
    );
    return {
      ...toRefs(filterRecord),
      ...toRefs(tableRecord),
      filterItems,
      tableColumns,
      onSearch,
      paginationChange,
      onDelete,
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
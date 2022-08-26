<template>
  <MyDialog
    :className="'material-modal'"
    v-if="visible"
    :visible="visible"
    :title="modalTitle"
    :width="1280"
    @onUpdateDialogStatus="onUpdateDialogStatus"
  >
    <div class="content">
      <div class="left">
        <div class="title">全部物料分类</div>
        <el-tree
          class="material-tree"
          :data="treeData"
          @node-click="handleNodeClick"
        >
          <template #default="scope">
            <div class="tree-data">
              <i
                class="iconfont"
                :class="{
                  'icon-tianjia1': !scope.node.expanded && !scope.node.isLeaf,
                  'icon-jian': scope.node.expanded && !scope.node.isLeaf,
                  'no-icon': scope.node.isLeaf,
                }"
              />
              {{ scope.data.categoryName }}
            </div>
          </template>
        </el-tree>
      </div>
      <div class="right">
        <MyFilter
          :formItems="filterItems"
          :formData="searchData"
          :labelWidth="'124px'"
          :formStyle="'justify-content: flex-start'"
          :colStyle="'width: 388px'"
          @searchForm="searchForm"
          @clearSearchForm="clearSearchForm"
        />
        <MyTable
          ref="tableRef"
          :tableData="tableData"
          :columns="tableColumns"
          :tableHeight="290"
          :selection="modalType == 'multiple'"
          :radioSelection="modalType == 'single'"
          @handleSelectionChange="handleSelectChange"
          @handleRadioChange="handleRadioChange"
        />
        <MyPagination
          :total="tableTotal"
          :pageSizes="[5, 10, 20, 30]"
          :queryData="pageParams"
          @paginationChange="paginationChange"
        />
      </div>
    </div>
    <template v-slot:footer>
      <el-button @click="onModalClose">取消</el-button>
      <el-button type="primary" @click="onConfirm" :loading="btnLoading">
        确定
      </el-button>
    </template>
  </MyDialog>
</template>

<script>
import { reactive, toRefs } from "vue";
import { ElMessage } from "element-plus";
import MyDialog from "@/components/MyDialog.vue";
import MyFilter from "@/components/MyFilter.vue";
import MyTable from "@/components/MyTable.vue";
import MyPagination from "@/components/MyPagination.vue";
import commonApi from "@/request/services/common";
import { transformArrayData } from "@/utils/index";

export default {
  name: "MaterialModal",
  components: {
    MyDialog,
    MyTable,
    MyPagination,
    MyFilter,
  },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    modalTitle: {
      type: String,
      default: "选择物料",
    },
    modalData: {
      type: Object,
      default: () => ({}),
    },
    modalType: {
      type: String,
      default: "multiple",
    },
    isRequired: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { emit }) {
    const treeRecord = reactive({
      treeData: {},
      selectedData: {},
    });

    const getTreeData = () => {
      commonApi.getMaterialTree().then((res) => {
        if (res && res.code == 0) {
          treeRecord.treeData = res.data;
        }
      });
    };
    getTreeData();

    const handleNodeClick = (data) => {
      treeRecord.selectedData = data;
      getTableData();
    };

    const filterRecord = reactive({
      filterItems: [
        {
          type: "input",
          label: "物料编号",
          paramName: "productCode",
          placeholder: "请输入物料编号",
        },
        {
          type: "input",
          label: "物料名称",
          paramName: "productName",
          placeholder: "请输入物料名称",
        },
      ],
      searchData: {},
    });

    const searchForm = (val) => {
      filterRecord.searchData = val;
      getTableData();
    };

    const clearSearchForm = () => {
      filterRecord.searchData = {};
      getTableData();
    };

    const tableRecord = reactive({
      tableRef: null,
      tableData: [],
      tableTotal: 0,
      pageParams: {
        currentPage: 1,
        pageSize: 5,
      },
      selectedRows: [],
      selectedRaioRows: {},
    });

    const tableColumns = [
      { label: "序号", prop: "num", width: 56 },
      { label: "物料编码", prop: "productCode" },
      { label: "物料名称", prop: "productName" },
      { label: "物料分类", prop: "category" },
      { label: "规格", prop: "specification" },
      { label: "型号", prop: "modelMaterial" },
      { label: "计量单位", prop: "unit" },
    ];

    const getTableData = () => {
      const params = {
        auditStatus: 1,
        categoryId: treeRecord.selectedData.id,
        ...filterRecord.searchData,
        current: tableRecord.pageParams.currentPage,
        size: tableRecord.pageParams.pageSize,
      };
      commonApi.getMaterialTableData(params).then((res) => {
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

    const paginationChange = (data) => {
      const { currentPage, pageSize } = tableRecord.pageParams;
      if (data.currentPage == currentPage && data.pageSize == pageSize) {
        return;
      }
      tableRecord.pageParams = { ...data };
      getTableData();
    };

    const handleSelectChange = (val) => {
      tableRecord.selectedRows = val;
    };

    const handleRadioChange = (val) => {
      tableRecord.selectedRaioRows = val;
    };

    const onUpdateDialogStatus = (status) => {
      if (!status) {
        onModalClose();
      }
    };

    const onModalShow = () => {
      emit("onModalShow", "materialModal");
    };

    const onModalClose = () => {
      emit("onClose", "materialModal");
    };

    const onConfirm = () => {
      if (
        props.isRequired &&
        tableRecord.selectedRows.length == 0 &&
        (!tableRecord.selectedRaioRows ||
          Object.keys(tableRecord.selectedRaioRows).length == 0)
      ) {
        ElMessage.warning("请选择物料！");
        return;
      }
      if (props.modalType == "single") {
        emit("getSelected", tableRecord.selectedRaioRows);
      } else {
        emit("getSelected", tableRecord.selectedRows);
      }
      onModalClose();
    };

    return {
      tableColumns,
      ...toRefs(treeRecord),
      ...toRefs(filterRecord),
      ...toRefs(tableRecord),
      onUpdateDialogStatus,
      onModalShow,
      onModalClose,
      onConfirm,
      handleNodeClick,
      searchForm,
      clearSearchForm,
      handleSelectChange,
      handleRadioChange,
      paginationChange,
    };
  },
};
</script>

<style lang="scss" scoped>
.content {
  display: flex;
  padding: 0 24px;

  .left {
    margin-right: 24px;
    padding: 24px 0;
    width: 275px;
    max-height: 440px;
    border-right: 1px solid $color-border;
    overflow: auto;
    box-sizing: border-box;

    .title {
      margin-bottom: 16px;
      font-size: 14px;
      font-family: PingFangSC-Semibold, PingFang SC;
      font-weight: 600;
      color: $color-text;
      line-height: 20px;
    }

    .material-tree {
      .tree-data {
        display: flex;
        align-items: center;

        .iconfont {
          margin-right: 6px;
          min-width: 16px;
          color: #e0e6ed;
        }
      }
      ::v-deep {
        .el-icon {
          display: none;
        }
        .el-tree-node__children {
          .iconfont {
            min-width: 8px;
          }
        }
      }
    }
  }
  .right {
    width: calc(100% - 275px - 24px);

    .my-filter-container {
      margin: 24px 0;
      ::v-deep {
        .el-form-item {
          margin-right: 24px;
        }
      }
    }
    .my-pagination-container {
      margin: 24px 0;
    }
  }
}
</style>

<style lang="scss">
.el-overlay-dialog {
  .material-modal {
    .el-dialog__body {
      padding: 0;
      max-height: 440px;
    }
  }
}
</style>
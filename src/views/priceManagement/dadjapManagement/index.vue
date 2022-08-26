<template>
  <MyContainer>
    <template v-slot:top>
      <el-tabs
        class="custom-tabs"
        type="card"
        v-model="activeName"
        @tab-change="handleClick"
      >
        <el-tab-pane
          v-for="(item, index) in tabsList"
          :key="index"
          :label="`${item.label}`"
          :name="item.value"
        ></el-tab-pane>
      </el-tabs>
    </template>
    <template v-slot:header>
      <el-button type="primary" @click="onJump('add')">调价</el-button>
      <el-button v-if="activeName == 1" @click="onSelectChange('undo')"
        >批量撤回</el-button
      >
      <el-button
        v-if=" activeName == 2|| activeName == 0"
        @click="onSelectChange('del')"
        >批量删除</el-button
      >
    </template>
    <template v-slot:header-right>
      <!-- <MySearch
        v-if="!advancedFilterShow"
        :initConditionValue="conditionValue"
        :searchCondition="searchCondition"
        :initSearchEleType="searchEleType"
        @onSearch="onFuzzySearch"
      /> -->
      <el-button-group style="margin-left: 24px">
        <el-button @click="exportOut">导出</el-button>
        <el-button style="margin-left: 12px" @click="onAdvancedStatus"
          ><i class="iconfont icon-share1" />{{
            Object.keys(searchParams).length
          }}项</el-button
        >
        <el-button @click="() => {}"
          ><i class="iconfont icon-install"
        /></el-button>
      </el-button-group>
    </template>
    <div class="content">
      <MyTable
        className="receipt-voucher-table"
        ref="tableRef"
        :tableData="tableData"
        :columns="tableColumns"
        :selection="true"
        @onRowClick="onRowClick"
        @handleSelectionChange="handleSelectionChange"
      >
        <template v-slot:operation="slotProps">
          <div v-if="activeName == 0 || activeName == 2">
            <el-button type="text" @click="onBtnClick(slotProps.data, 'edit')"
              >编辑</el-button
            >
            <el-button type="text" @click="onBtnClick(slotProps.data, 'submit')"
              >提交</el-button
            >
            <el-dropdown>
              <span class="el-dropdown-more">
                更多
                <el-icon class="el-icon--right">
                  <arrow-down />
                </el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="onBtnClick(slotProps.data, 'del')"
                    >删除</el-dropdown-item
                  >
                  <el-dropdown-item @click="onBtnClick(slotProps.data, 'info')"
                    >详情</el-dropdown-item
                  >
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
          <div v-if="activeName == 1">
            <el-button type="text" @click="onBtnClick(slotProps.data, 'undo')"
              >撤回</el-button
            >
            <el-button type="text" @click="onBtnClick(slotProps.data, 'info')"
              >详情</el-button
            >
          </div>
          <div v-if="activeName == 3">
            <el-button type="text" @click="onBtnClick(slotProps.data, 'info')"
              >详情</el-button
            >
          </div>
        </template>
      </MyTable>
      <MyPagination
        :total="tableTotal"
        :queryData="pageParams"
        @paginationChange="paginationChange"
      />
      <template v-if="currentRow.id">
        <div class="table-header">
          <span></span>
          <div class="title">
            <i class="iconfont icon-biaoge" />物料明细（{{ currentRow.id }}）
          </div>
          <el-input
            class="search-input"
            v-model="filterText"
            placeholder="物料名称"
          >
            <template #suffix>
              <i class="iconfont icon-sousuo"></i>
            </template>
          </el-input>
          <div class="close-btn" @click="onDeliteClose">
            <i class="iconfont icon-biaogeguanbi" />
          </div>
        </div>
        <MyTable
          className="price-order-detail-table"
          ref="detailTableRef"
          :tableData="filterTableData"
          :columns="detailTableColumns"
        />
      </template>
    </div>
  </MyContainer>
  <teleport to="#filter-aside" v-if="advancedFilterShow">
    <FilterDrawer
      :visible="advancedFilterShow"
      @onSearch="onSearch"
      @onClose="onAdvancedStatus"
    />
  </teleport>
</template>

<script>
import { reactive, ref, toRefs, watch } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex"; //高级用
import moment from "moment";
import MyContainer from "@/components/MyContainer.vue";
import MyTable from "@/components/MyTable.vue";
import MyPagination from "@/components/MyPagination.vue";
import MySearch from "@/components/MySearch.vue";
import FilterDrawer from "./components/FilterDrawer.vue";
import { dadjapManagementApi } from "@/request/services/priceManagement";
import { transformArrayData } from "@/utils/index";
import { ElMessage, ElMessageBox } from "element-plus";

export default {
  components: {
    MyContainer,
    MyTable,
    MyPagination,
    MySearch,
    FilterDrawer,
  },
  setup() {
    const router = useRouter();
    const activeName = ref(1);
    const store = useStore();
    const state = reactive({
      tabsList: [
        {
          label: "审核中",
          value: 1,
          total: 99,
        },
        {
          label: "审核通过",
          value: 3,
          total: 99,
        },
        {
          label: "驳回",
          value: 2,
          total: 99,
        },
        {
          label: "草稿",
          value: "0",
          total: 99,
        },
      ],
    });

    const onBtnClick = (record, type) => {
      if (type == "info") {
        //审核
        router.push({
          path: "/dadjapManagement/dadjapInfo",
          query: {
            id: record.id,
            type,
          },
        });
      } else if (type == "edit") {
        //复制
        router.push({
          path: "/dadjapManagement/dadjapAdd",
          query: {
            id: record.id,
            type,
          },
        });
      } else if (type == "undo") {
        ElMessageBox.confirm(
          `<strong>撤回价目单</strong><br/>
        是否撤回该价目单?撤回后价目单将恢复草稿状态`,
          {
            dangerouslyUseHTMLString: true,
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          }
        ).then(() => {
          //撤回操作
          let ids = [record.id];
          onUndoPirce(ids);
        });
      } else if (type == "del") {
        ElMessageBox.confirm(
          `<strong>删除调价单</strong><br/>
        是否删除该价目单?删除后调价单将从列表移除`,
          {
            dangerouslyUseHTMLString: true,
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          }
        ).then(() => {
          //删除操作
          let ids = [record.id];
          onDelPirce(ids);
        });
      } else if (type == "submit") {
        ElMessageBox.confirm(
          `<strong>重新提交</strong><br/>
        是否重新提交该调价单?重新提交后调价单状态将变更为审核中状态`,
          {
            dangerouslyUseHTMLString: true,
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          }
        ).then(() => {
          // 重新提交操作
          dadjapManagementApi
            .onUnStatus({ id: record.id, checkStatus: 1 })
            .then((res) => {
              if (res.code == 0) {
                ElMessage.success("提交成功");
                getTableData();
              } else {
                ElMessage.error(res.message);
              }
            });
        });
      }
    };

    const handleClick = () => {
      getTableData();
      onDeliteClose();
    };
    const onJump = (type) => {
      if (type == "add") {
        router.push({
          path: "/dadjapManagement/dadjapAdd",
          query: {
            type: "add",
          },
        });
      }
    };
    //筛选配置项
    const filterRecord = reactive({
      conditionValue: "priceListName",
      searchCondition: [
        {
          label: "价目表名称",
          value: "priceListName",
        },
      ],
      advancedFilterShow: false,
      searchEleType: "input",
      searchParams: {},
    });

    const onAdvancedStatus = () => {
      filterRecord.advancedFilterShow = !filterRecord.advancedFilterShow;
      store.commit(
        "common/setAsideFilterShow",
        filterRecord.advancedFilterShow
      );
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
      currentRow: {},
    });

    const getTableData = () => {
      const params = {
        current: tableRecord.pageParams.currentPage,
        size: tableRecord.pageParams.pageSize,
        checkStatus: activeName.value * 1,
        ...filterRecord.searchParams,
      };
      dadjapManagementApi.getTableData(params).then((res) => {
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
          if (tableRecord.tableData.length > 0) {
            tableRecord.currentRow = tableRecord.tableData[0];
            getDetailTableData(tableRecord.currentRow.id);
          }
        }
      });
    };
    getTableData();
    //高级筛选
    const onSearch = (val) => {
      tableRecord.pageParams.currentPage = 1;
      if (val.time && val.time.length) {
        val.startTime = moment(val.time[0]).format("YYYY-MM-DD 00:00:00");
        val.endTime = moment(val.time[1]).format("YYYY-MM-DD 23:59:59");

        delete val.time;
      }
      filterRecord.searchParams = val;
      getTableData();
    };
    //模糊筛选
    const onFuzzySearch = (val) => {
      tableRecord.pageParams.currentPage = 1;
      filterRecord.searchParams = val;
      getTableData();
    };
    //多选
    const handleSelectionChange = (val) => {
      tableRecord.selectedRows = [...val];
      // const lastItem = val.pop() || {};
      // tableRecord.currentRow = lastItem;
      // getDetailTableData(lastItem.id);
    };

    //批量操作
    const onSelectChange = (type) => {
      console.log(tableRecord.selectedRows);
      if (tableRecord.selectedRows.length) {
        let ids = [];
        tableRecord.selectedRows.map((item) => {
          ids.push(item.id);
        });
        if (type == "undo") {
          //批量撤回
          onBatchUndo(ids);
        } else if (type == "del") {
          //批量删除
          onBatchDel(ids);
        }
      } else {
        ElMessage.warning("请至少选择1项");
      }
    };

    //批量撤回
    const onBatchUndo = (ids) => {
      ElMessageBox.confirm(
        `<strong>批量撤回</strong><br/>已选中${tableRecord.selectedRows.length}项调价单，是否要批量撤回<br/>撤回后调价单将恢复草稿状态`,
        {
          dangerouslyUseHTMLString: true,
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).then(() => {
        onUndoPirce(ids);
      });
    };

    //批量删除
    const onBatchDel = (ids) => {
      ElMessageBox.confirm(
        `<strong>批量删除</strong><br/>已选中${tableRecord.selectedRows.length}项调价单，是否要批量删除<br/>删除后调价单将从列表移除`,
        {
          dangerouslyUseHTMLString: true,
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).then(() => {
        onDelPirce(ids);
      });
    };

    //撤回的方法
    const onUndoPirce = (ids) => {
      dadjapManagementApi.onUndo(ids).then((res) => {
        if (res.code == 0) {
          ElMessage.success("撤回成功");
          getTableData();
        } else {
          ElMessage.error(res.message);
        }
      });
    };

    //删除的方法
    const onDelPirce = (ids) => {
      dadjapManagementApi.onDelete(ids).then((res) => {
        if (res.code == 0) {
          ElMessage.success("删除成功");
          getTableData();
        } else {
          ElMessage.error(res.message);
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

    const tableColumns = [
      { label: "序号", prop: "num", width: 60, fixed: "left" },
      { label: "调价单号", prop: "id", width: 200, fixed: "left" },
      { label: "销售公司", prop: "tenantName", width: 180 },
      {
        label: "调价方式",
        prop: "adjustType",
        formatter: (row) => {
          return { 1: "整体调价", 2: "客户调价" }[row.adjustType];
        },
        width: 180,
      },
      { label: "调价说明", prop: "adjustContent", width: 180 },
      { label: "调价开始时间", prop: "startExpireTime", width: 180 },
      { label: "调价结束时间", prop: "endExpireTime", width: 180 },
      { label: "审核人", prop: "checkUserName", width: 180 },
      { label: "审核时间", prop: "checkTime", width: 180 },
      { label: "创建人", prop: "createUserName", width: 180 },
      { label: "创建时间", prop: "createTime", width: 180 },
      {
        label: "状态",
        prop: "checkStatus",
        width: 150,
        formatter: (row) => {
          return { 1: "审核中", 3: "审核通过", 2: "驳回", 0: "草稿" }[
            row.checkStatus
          ];
        },
      },
      { label: "操作", slotName: "operation", width: 180, fixed: "right" },
    ];
    //子表
    const detailTableRecord = reactive({
      detailTableRef: null,
      detailTableData: [],
      filterTableData: [],
      filterText: "",
    });
    const onRowClick = (val, column) => {
      if (column.property != "checkStatus" && column.property != "operation") {
        tableRecord.currentRow = val;
        getDetailTableData(val.id);
      }
    };
    const onDeliteClose = () => {
      tableRecord.currentRow = {};
      operatetionTableRecord.operatingRecordShow = false;
    };
    const getDetailTableData = (id) => {
      if (!id) return;
      dadjapManagementApi
        .getPriceTableData({ priceListAdjustId: id })
        .then((res) => {
          if (res && res.code == 0) {
            detailTableRecord.detailTableData = transformArrayData(
              res.data,
              true,
              true
            );
            detailTableRecord.filterTableData = transformArrayData(
              res.data,
              true,
              true
            );
          }
        });
    };
    watch(
      () => detailTableRecord.filterText,
      (val) => {
        detailTableRecord.filterTableData =
          detailTableRecord.detailTableData.filter((item) => {
            return item.productName.includes(val);
          });
      }
    );
    const detailTableColumns = [
      { label: "序号", prop: "num", width: 60 },
      {
        label: "物料名称",
        prop: "productName",
      },
      {
        label: "价格来源",
        prop: "priceListName",
      },
      {
        label: "客户名称",
        prop: "customerName",
      },
      {
        label: "原货物单价",
        prop: "productOldPrice",
      },

      {
        label: "货物调价幅度",
        prop: "productPriceRange",
        formatter: (row) => {
          if (row.productPriceRange > 0) {
            return `<span style="color:#13CE66">+${row.productPriceRange}</span>`;
          } else if (row.productPriceRange < 0) {
            return `<span style="color:#FF3B30">${row.productPriceRange}</span>`;
          } else if (row.productPriceRange == 0) {
            return `<span style="color:#F7BA2A">${row.productPriceRange}</span>`;
          }
        },
      },
      {
        label: "调后货物单价",
        prop: "productPrice",
      },
      {
        label: "原运输单价",
        prop: "transportOldPrice",
      },

      {
        label: "运输调价幅度",
        prop: "transportPriceRange",
        formatter: (row) => {
          if (row.transportPriceRange > 0) {
            return `<span style="color:#13CE66">+${row.transportPriceRange}</span>`;
          } else if (row.transportPriceRange < 0) {
            return `<span style="color:#FF3B30">${row.transportPriceRange}</span>`;
          } else if (row.transportPriceRange == 0) {
            return `<span style="color:#F7BA2A">${row.transportPriceRange}</span>`;
          }
        },
      },
      {
        label: "调后运输单价",
        prop: "transportPrice",
      },
    ];
    const exportOut = () => {
      if (!tableRecord.selectedRows.length) {
        ElMessage.warning("请选择要导出的数据");
        return;
      }
      ElMessageBox.confirm(
        `<strong>导出调价单数据</strong><br/>
        是否导出选中的调价单数据?`,
        {
          dangerouslyUseHTMLString: true,
          confirmButtonText: "导出",
          cancelButtonText: "取消",
          type: "warning",
          [`close-on-click-modal`]: false,
        }
      )
        .then(async () => {
          const ids = tableRecord.selectedRows.map((item) => item.id);
          const res = await dadjapManagementApi.download(ids);
          let fileName = "调价单";
          const _res = res;
          let blob = new Blob([_res], {
            type: "application/vnd.ms-excel;charset=utf-8",
          });
          let downloadElement = document.createElement("a");
          let href = window.URL.createObjectURL(blob); //创建下载的链接
          downloadElement.href = href;
          downloadElement.download = `${fileName}.xls`; //下载后文件名
          document.body.appendChild(downloadElement);
          downloadElement.click(); //点击下载
          document.body.removeChild(downloadElement); //下载完成移除元素
          window.URL.revokeObjectURL(href); //释放掉blob对象
        })
        .catch(() => {});
    };
    return {
      activeName,
      onBtnClick,
      onJump,
      handleClick,
      ...toRefs(state),
      ...toRefs(filterRecord),
      ...toRefs(tableRecord),
      ...toRefs(detailTableRecord),
      detailTableColumns,
      tableColumns,
      onSearch,
      handleSelectionChange,
      onAdvancedStatus,
      onFuzzySearch,
      paginationChange,
      onSelectChange,
      onBatchDel,
      onBatchUndo,
      onUndoPirce,
      onDelPirce,
      onDeliteClose,
      onRowClick,
      exportOut,
    };
  },
};
</script>

<style lang="scss" scoped>
.table-header {
  position: relative;
  display: flex;
  margin-top: 24px;
  padding: 0 50px 0 16px;
  height: 58px;
  background: #e5e9f2;
  border: 1px solid #c0c5cf;
  justify-content: space-between;
  align-items: center;

  .operating-record-btn {
    width: 88px;
    height: 36px;
    background: #ffffff;
    border-radius: 18px;
  }
  .title {
    font-size: 18px;
    font-family: PingFangSC-Semibold, PingFang SC;
    font-weight: 600;
    color: $color-text;
    .iconfont {
      margin-right: 5px;
    }
  }
  .search-input {
    width: 246px;
  }

  .close-btn {
    position: absolute;
    top: 11px;
    right: 11px;
    width: 16px;
    height: 16px;
    color: #5a78a0;
    cursor: pointer;
  }
}
.price-order-detail-table,
.operating-record-table {
  margin-top: 0;
}
.el-dropdown-more {
  margin-left: 12px;
  height: 30px;
  color: #5a78a0;
  line-height: 30px;
}
.container {
  height: calc(100% - 30px);
  color: $color-text;
}
::v-deep {
  .el-tabs__nav-scroll {
    color: $color-text;
    background: #fff;
  }
}
</style>
<template>
  <MyContainer>
    <template #top>
      <div class="tab-box">
        <BaseTabs :data="tabList" :tabKey="tabKey" @onTabsClick="onTabsClick" />
      </div>
    </template>
    <template v-slot:header>
      <el-button type="primary" @click="onJump('add')">新增订单</el-button>
      <el-button v-if="tabKey == 1" @click="onWithdraw('batch')"
        >批量撤回</el-button
      >
      <el-button v-if="tabKey == 2" @click="onPause('batch')"
        >批量暂停</el-button
      >
      <el-button v-if="tabKey == 4 || tabKey == 5" @click="onEnable('batch')"
        >批量启用</el-button
      >
      <el-button v-if="tabKey == 6" @click="onSubmit('batch')"
        >批量提交</el-button
      >
      <el-button v-if="tabKey == 6" @click="onDelete('bacth')"
        >批量删除</el-button
      >
    </template>
    <template v-slot:header-right>
      <MySearch
        v-if="!advancedFilterShow"
        :initConditionValue="conditionValue"
        :searchCondition="searchCondition"
        @onSearch="onFuzzySearch"
      />
      <el-button-group style="margin-left: 24px">
        <el-button @click="onAdvancedStatus"
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
        className="purchase-order-table"
        ref="tableRef"
        :tableData="tableData"
        :columns="tableColumns"
        :showSummary="true"
        :selection="true"
        @onRowClick="onRowClick"
        @handleSelectionChange="handleSelectionChange"
        @sortChange="sortChange"
        @getSummaries="getSummaries"
        @arraySpanMethod="arraySpanMethod"
      >
        <template #status="slotProps">
          <div class="status-box">
            <i class="iconfont icon-bianji3" />
            {{
              {
                0: "草稿",
                1: "审批中",
                2: "审批通过",
                3: "审批不通过",
                4: "暂停",
                5: "关闭"
              }[slotProps.data.status]
            }}>
          </div>
        </template>
        <template v-slot:operation="slotProps">
          <template v-if="tabKey == 1">
            <el-button type="text" @click="onAudit(slotProps.data.id)"
              >审批</el-button
            >
            <el-button
              type="text"
              @click="onWithdraw('single', slotProps.data.id)"
              >撤回</el-button
            >
            <el-button type="text" @click="onJump('view', slotProps.data)"
              >详情</el-button
            >
          </template>
          <template v-if="tabKey == 2">
            <el-button type="text" @click="onJump('revise', slotProps.data)"
              >修订</el-button
            >
            <el-button type="text" @click="onJump('view', slotProps.data)"
              >详情</el-button
            >
            <el-dropdown>
              <span class="el-dropdown-more">
                更多
                <i class="iconfont icon-icon_zuocexialazhankai" />
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item
                    @click="onPause('single', slotProps.data.id)"
                    >暂停</el-dropdown-item
                  >
                  <el-dropdown-item @click="onClose(slotProps.data.id)"
                    >关闭</el-dropdown-item
                  >
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
          <template v-if="tabKey == 3">
            <el-button type="text" @click="onJump('view', slotProps.data)"
              >详情</el-button
            >
            <el-button type="text" @click="onClose(slotProps.data.id)"
              >关闭</el-button
            >
          </template>
          <template v-if="tabKey == 4 || tabKey == 5">
            <el-button
              type="text"
              @click="onEnable('single', slotProps.data.id)"
              >启用</el-button
            >
            <el-button type="text" @click="onJump('view', slotProps.data)"
              >详情</el-button
            >
          </template>
          <template v-if="tabKey == 6">
            <el-button
              type="text"
              @click="onSubmit('single', slotProps.data.id)"
              >提交</el-button
            >
            <el-button type="text" @click="onJump('view', slotProps.data)"
              >详情</el-button
            >
            <el-button
              type="text"
              @click="onDelete('single', slotProps.data.id)"
              >删除</el-button
            >
          </template>
        </template>
      </MyTable>
      <MyPagination
        :total="tableTotal"
        :queryData="pageParams"
        @paginationChange="paginationChange"
      />

      <Subtable
        v-if="currentRow.id"
        :currentRow="currentRow"
        :type="tabKey"
        @onDeliteClose="onDeliteClose"
      />
    </div>
  </MyContainer>
  <teleport to="#filter-aside" v-if="advancedFilterShow">
    <FilterDrawer
      :visible="advancedFilterShow"
      :data="{ ...searchParams }"
      @onSearch="onSearch"
      @onClose="onAdvancedStatus"
    />
  </teleport>
</template>

<script>
import { ref, reactive, toRefs, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import moment from "moment";
import BaseTabs from "@/components/BaseTabs.vue";
import MyContainer from "@/components/MyContainer.vue";
import MyTable from "@/components/MyTable.vue";
import MyPagination from "@/components/MyPagination.vue";
import MySearch from "@/components/MySearch.vue";
import AdvancedFilterBtn from "@/components/AdvancedFilterBtn.vue";
import Subtable from "./components/Subtable.vue";
import FilterDrawer from "./components/FilterDrawer.vue";
import { purchaseOrderApi } from "@/request/services/purchasingManagement";
import { transformArrayData } from "@/utils/index";
import { ElMessage, ElMessageBox } from "element-plus";

export default {
  name: "PaymentOrder",
  components: {
    BaseTabs,
    MyContainer,
    MyTable,
    MyPagination,
    MySearch,
    AdvancedFilterBtn,
    Subtable,
    FilterDrawer,
  },
  setup() {
    const router = useRouter();
    const store = useStore();

    const purchaseOrderKey = sessionStorage.getItem("purchaseOrderKey")
      ? sessionStorage.getItem("purchaseOrderKey") * 1
      : "";
    const tabKey = ref(purchaseOrderKey || 1);
    const tabList = ref([
      { label: "审批中", value: 1 },
      { label: "审批通过", value: 2 },
      { label: "审批驳回", value: 3 },
      { label: "暂停", value: 4 },
      { label: "关闭", value: 5 },
      { label: "草稿", value: 6 },
    ]);

    const onTabsClick = (val) => {
      tabKey.value = val;

      getTableData();
    };

    const filterRecord = reactive({
      conditionValue: "orderNum",
      searchCondition: [{ label: "单据号", value: "orderNum" }],
      advancedFilterShow: false,
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
      sortParams: {},
      selectedRows: [],
      currentRow: {},
    });

    const handleFilterData = (params) => {
      if (params.settlementTypeList && params.settlementTypeList.length) {
        params.settlementTypeList = params.settlementTypeList.join(",");
      }
      if (params.time && params.time.length) {
        params.billDateStart = moment(params.time[0]).format("YYYY-MM-DD 00:00:00");
        params.billDateEnd = moment(params.time[1]).format("YYYY-MM-DD 23:59:59");
      }
      if (params.time1 && params.time1.length) {
        params.createTimeStart = moment(params.time1[0]).format(
          "YYYY-MM-DD 00:00:00"
        );
        params.createTimeEnd = moment(params.time1[1]).format(
          "YYYY-MM-DD 23:59:59"
        );
      }
      if (params.time2 && params.time2.length) {
        params.updateTimeStart = moment(params.time2[0]).format(
          "YYYY-MM-DD 00:00:00"
        );
        params.updateTimeEnd = moment(params.time2[1]).format(
          "YYYY-MM-DD 23:59:59"
        );
      }
      delete params.time;
      delete params.time1;
      delete params.time2;

      return params;
    };

    const getTableData = () => {
      tableRecord.currentRow = {};

      const params = {
        current: tableRecord.pageParams.currentPage,
        size: tableRecord.pageParams.pageSize,
        statusList: tabKey.value == 6 ? 0 : tabKey.value,
        ...handleFilterData({ ...filterRecord.searchParams }),
        ...tableRecord.sortParams,
      };

      tableRecord.tableRef && tableRecord.tableRef.clearSelectedRows();

      purchaseOrderApi.getTableData(params).then((res) => {
        if (res && res.code == 0) {
          tableRecord.tableTotal = res.data.total;
          tableRecord.tableData = transformArrayData(
            res.data.records,
            true,
            true,
            tableRecord.pageParams.currentPage,
            tableRecord.pageParams.pageSize
          );
        }
      });
    };
    getTableData();

    const arraySpanMethod = () => {
      if (tableRecord.tableRef.$el) {
        const current = tableRecord.tableRef.$el
          .querySelector(".el-table__footer-wrapper")
          .querySelector(".el-table__footer");
        const cell = current.rows[0].cells;
        if (cell.length) {
          cell[0].colSpan = "3";
          cell[1].style.display = "none";
          cell[2].style.display = "none";
        }
      }
    };

    const getSummaries = (params, callback) => {
      const { columns, data } = params;
      const sums = [];
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = "合计";
          return;
        }
        if (
          column.property == "totalAmount" ||
          column.property == "totalTaxPrice"
        ) {
          const values = data.map((item) => Number(item[column.property]));
          sums[index] = values.reduce((prev, curr) => {
            return prev + curr;
          }, 0);
          sums[index] = sums[index].toFixed(2);
        }
      });
      callback && callback(sums);
    };

    const onSearch = (val) => {
      tableRecord.pageParams.currentPage = 1;

      filterRecord.searchParams = val;
      getTableData();
    };

    const onFuzzySearch = (val) => {
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

    const handleSelectionChange = (val) => {
      tableRecord.selectedRows = val;

      const list = [...val];
      const lastItem = list.pop() || {};
      tableRecord.currentRow = lastItem;
    };

    const sortChange = (val) => {
      if (val.prop) {
        tableRecord.sortParams = {
          orderByField: val.prop.replace(/([A-Z])/g, "_$1").toLowerCase(),
          orderByRule: { ascending: "asc", descending: "desc" }[val.order],
        };
      } else {
        tableRecord.sortParams = {};
      }
      getTableData();
    };

    const onRowClick = (val, column) => {
      if (column.property != "status" && column.property != "operation") {
        tableRecord.currentRow = val;
      }
    };

    const onDeliteClose = () => {
      tableRecord.currentRow = {};
    };

    const onDelete = (type, id) => {
      const fn = (ids) => {
        purchaseOrderApi.onDelete(ids).then((res) => {
          if (res && res.code == 0) {
            if (type == "single") {
              ElMessage.success("删除成功！");
            } else {
              ElMessage.success(
                `成功删除${tableRecord.selectedRows.length}个订单！`
              );
            }
            getTableData();
          } else {
            ElMessage.error(res.message);
          }
        });
      };
      if (type == "single") {
        ElMessageBox.confirm(
          `<strong>提示</strong><br/>
          是否删除此订单？<br/>
          删除后订单将在列表中移除`,
          {
            dangerouslyUseHTMLString: true,
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          }
        ).then(() => {
          fn([id]);
        });
      } else {
        if (tableRecord.selectedRows.length) {
          ElMessageBox.confirm(
            `<strong>批量删除</strong><br/>
            已选中${tableRecord.selectedRows.length}项订单，是否删除选中订单？<br/>
            删除后订单将在列表中移除`,
            {
              dangerouslyUseHTMLString: true,
              confirmButtonText: "确定",
              cancelButtonText: "取消",
              type: "warning",
            }
          ).then(() => {
            const ids = [];
            tableRecord.selectedRows.map((item) => {
              ids.push(item.id);
            });
            fn(ids);
          });
        } else {
          ElMessage.warning("请至少选择一项");
        }
      }
    };

    const onAudit = (record) => {
      ElMessageBox.confirm(
        `<strong>审核通过</strong><br/>
        确定审批通过？`,
        {
          dangerouslyUseHTMLString: true,
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).then(() => {
        purchaseOrderApi.onAudit(record.id).then((res) => {
          if (res && res.code == 0) {
            ElMessage.success("操作成功！");
            getTableData();
          } else {
            ElMessage.error(res.message);
          }
        });
      });
    };

    const onSubmit = (type, id) => {
      const fn = (ids) => {
        purchaseOrderApi.orderSubmit(ids).then((res) => {
          if (res && res.code == 0) {
            if (type == "single") {
              ElMessage.success("提交成功！");
            } else {
              ElMessage.success(
                `已提交${tableRecord.selectedRows.length}个订单，状态变更为审批中`
              );
            }
            getTableData();
          } else {
            ElMessage.error(res.message);
          }
        });
      };
      if (type == "single") {
        ElMessageBox.confirm(
          `<strong>提示</strong><br/>
          是否提交此订单？<br/>
          提交后订单将变更为审批中状态`,
          {
            dangerouslyUseHTMLString: true,
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          }
        ).then(() => {
          fn([id]);
        });
      } else {
        if (tableRecord.selectedRows.length) {
          ElMessageBox.confirm(
            `<strong>批量提交</strong><br/>
            已选中${tableRecord.selectedRows.length}项订单，是否提交选中订单？<br/>
            提交后订单将变更为审批中状态`,
            {
              dangerouslyUseHTMLString: true,
              confirmButtonText: "确定",
              cancelButtonText: "取消",
              type: "warning",
            }
          ).then(() => {
            const ids = [];
            tableRecord.selectedRows.map((item) => {
              ids.push(item.id);
            });
            fn(ids);
          });
        } else {
          ElMessage.warning("请至少选择一项");
        }
      }
    };

    const onWithdraw = (type, id) => {
      const fn = (ids) => {
        purchaseOrderApi.orderWithdraw(ids).then((res) => {
          if (res && res.code == 0) {
            if (type == "single") {
              ElMessage.success("撤回成功！");
            } else {
              ElMessage.success(
                `已撤回${tableRecord.selectedRows.length}个订单`
              );
            }
            getTableData();
          } else {
            ElMessage.error(res.message);
          }
        });
      };
      if (type == "single") {
        ElMessageBox.confirm(
          `<strong>提示</strong><br/>
          是否撤回此订单？<br/>
          撤回后订单将恢复草稿状态`,
          {
            dangerouslyUseHTMLString: true,
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          }
        ).then(() => {
          fn([id]);
        });
      } else {
        if (tableRecord.selectedRows.length) {
          ElMessageBox.confirm(
            `<strong>批量撤回</strong><br/>
            已选中${tableRecord.selectedRows.length}项订单，是否要批量撤回？<br/>
            撤回后订单将恢复草稿状态`,
            {
              dangerouslyUseHTMLString: true,
              confirmButtonText: "确定",
              cancelButtonText: "取消",
              type: "warning",
            }
          ).then(() => {
            const ids = [];
            tableRecord.selectedRows.map((item) => {
              ids.push(item.id);
            });
            fn(ids);
          });
        } else {
          ElMessage.warning("请至少选择一项");
        }
      }
    };

    const onPause = (type, id) => {
      const fn = (ids) => {
        purchaseOrderApi.orderSuspend(ids).then((res) => {
          if (res && res.code == 0) {
            if (type == "single") {
              ElMessage.success("暂停成功！");
            } else {
              ElMessage.success(
                `已暂停${tableRecord.selectedRows.length}个订单`
              );
            }
            getTableData();
          } else {
            ElMessage.error(res.message);
          }
        });
      };
      if (type == "single") {
        ElMessageBox.confirm(
          `<strong>暂停订单</strong><br/>
          是否暂停此订单？<br/>
          暂停后订单将变更为暂停状态`,
          {
            dangerouslyUseHTMLString: true,
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          }
        ).then(() => {
          fn([id]);
        });
      } else {
        if (tableRecord.selectedRows.length) {
          ElMessageBox.confirm(
            `<strong>暂停订单</strong><br/>
            已选中${tableRecord.selectedRows.length}项订单，是否暂停选中订单？<br/>
            暂停后订单将变更为暂停状态`,
            {
              dangerouslyUseHTMLString: true,
              confirmButtonText: "确定",
              cancelButtonText: "取消",
              type: "warning",
            }
          ).then(() => {
            const ids = [];
            tableRecord.selectedRows.map((item) => {
              ids.push(item.id);
            });
            fn(ids);
          });
        } else {
          ElMessage.warning("请至少选择一项");
        }
      }
    };

    const onClose = (id) => {
      ElMessageBox.confirm(
        `<strong>关闭订单</strong><br/>
        是否要关闭此订单吗？<br/>
        关闭后订单将变更为关闭状态`,
        {
          dangerouslyUseHTMLString: true,
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).then(() => {
        purchaseOrderApi.orderClose(id).then((res) => {
          if (res && res.code == 0) {
            ElMessage.success("订单已关闭！");
            getTableData();
          } else {
            ElMessage.error(res.message);
          }
        });
      });
    };

    const onEnable = (type, id) => {
      const fn = (ids) => {
        purchaseOrderApi.orderOpen(ids).then((res) => {
          if (res && res.code == 0) {
            if (type == "single") {
              ElMessage.success("启用成功！");
            } else {
              ElMessage.success(
                `已启用${tableRecord.selectedRows.length}个订单，状态变更为审核通过`
              );
            }
            getTableData();
          } else {
            ElMessage.error(res.message);
          }
        });
      };
      if (type == "single") {
        ElMessageBox.confirm(
          `<strong>启用订单</strong><br/>
          是否启用此订单？<br/>
          启用后订单将变更为审核通过`,
          {
            dangerouslyUseHTMLString: true,
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          }
        ).then(() => {
          fn([id]);
        });
      } else {
        if (tableRecord.selectedRows.length) {
          ElMessageBox.confirm(
            `<strong>启用订单</strong><br/>
            已选中${tableRecord.selectedRows.length}项订单，是否启用选中订单？<br/>
            启用后订单将变更为审核通过`,
            {
              dangerouslyUseHTMLString: true,
              confirmButtonText: "确定",
              cancelButtonText: "取消",
              type: "warning",
            }
          ).then(() => {
            const ids = [];
            tableRecord.selectedRows.map((item) => {
              ids.push(item.id);
            });
            fn(ids);
          });
        } else {
          ElMessage.warning("请至少选择一项");
        }
      }
    };

    const onJump = (type, record = {}) => {
      const params = {
        type: tabKey.value,
      };
      let path = "/purchaseOrderEdit";
      if (type == "edit") {
        params.id = record.id;
      }
      if (type == "revise") {
        path = "/purchaseOrderRevision";
        params.id = record.id;
      }
      if (type == "view") {
        path = "/purchaseOrderDetail";
        params.id = record.id;
      }
      router.push({
        path,
        query: {
          type,
          ...params,
        },
      });
    };

    onUnmounted(() => {
      sessionStorage.removeItem("purchaseOrderKey");
    });

    const tableColumns = [
      { label: "序号", prop: "num", width: 60, fixed: "left" },
      {
        label: "供应商",
        prop: "customerName",
        sortable: "custom",
        fixed: "left",
        width: 160,
      },
      { label: "采购公司", prop: "tenantName", sortable: "custom", width: 160 },
      {
        label: "开票客户",
        prop: "invoiceCustomerName",
        sortable: "custom",
        width: 120,
      },
      {
        label: "结算方式",
        prop: "settlementType",
        sortable: "custom",
        width: 120,
        formatter: (row) =>
          ({ 0: "现金", 1: "银行承兑", 2: "商业承兑" }[row.settlementType]),
      },
      {
        label: "结算规则",
        prop: "settlementRule",
        sortable: "custom",
        width: 120,
        formatter: (row) =>
          ({ 0: "发货方为准", 1: "收货方为准", 2: "收发货方取小" }[
            row.settlementType
          ]),
      },
      {
        label: "运输方式",
        prop: "transportType",
        sortable: "custom",
        width: 120,
        formatter: (row) =>
          ({ 0: "自提", 1: "一票制包运", 2: "流向管控自提" }[
            row.settlementType
          ]),
      },
      { label: "部门", prop: "deptName", sortable: "custom", width: 120 },
      { label: "业务员", prop: "salesmanName", sortable: "custom", width: 120 },
      { label: "总数量", prop: "totalAmount", sortable: "custom", width: 120 },
      {
        label: "价税合计",
        prop: "totalTaxPrice",
        sortable: "custom",
        width: 120,
      },
      { label: "单据号", prop: "orderNum", sortable: "custom", width: 120 },
      {
        label: "单据日期",
        prop: "billDate",
        sortable: "custom",
        width: 170,
        formatter: (row) =>
          row.billDate && moment(row.billDate).format("YYYY-MM-DD HH:mm:ss"),
      },
      {
        label: "第三方单据号",
        prop: "thirdCode",
        sortable: "custom",
        width: 140,
      },
      {
        label: "创建人",
        prop: "createUserName",
        sortable: "custom",
        width: 120,
      },
      {
        label: "创建时间",
        prop: "createTime",
        sortable: "custom",
        width: 170,
        formatter: (row) =>
          row.createTime &&
          moment(row.createTime).format("YYYY-MM-DD HH:mm:ss"),
      },
      {
        label: "更新人",
        prop: "updateUserName",
        sortable: "custom",
        width: 120,
      },
      {
        label: "最后更新",
        prop: "updateTime",
        sortable: "custom",
        width: 170,
        formatter: (row) =>
          row.updateTime &&
          moment(row.updateTime).format("YYYY-MM-DD HH:mm:ss"),
      },
      {
        label: "订单状态",
        prop: "status",
        slotName: "status",
        width: 145,
        fixed: "right",
      },
      {
        label: "操作",
        prop: "operation",
        slotName: "operation",
        width: 170,
        fixed: "right",
      },
    ];

    return {
      tabKey,
      tabList,
      ...toRefs(filterRecord),
      ...toRefs(tableRecord),
      tableColumns,
      onTabsClick,
      onSearch,
      onAdvancedStatus,
      onFuzzySearch,
      paginationChange,
      handleSelectionChange,
      sortChange,
      onJump,
      onDelete,
      onAudit,
      onSubmit,
      onWithdraw,
      onPause,
      onClose,
      onEnable,
      getSummaries,
      arraySpanMethod,
      onRowClick,
      onDeliteClose,
    };
  },
};
</script>

<style lang="scss" scoped>
.tab-box {
  padding: 0 24px;
  background: #fff;
}
.purchase-order-table {
  .status-box {
    display: inline-flex;
    padding: 0 8px;
    height: 24px;
    color: $color-orange;
    background: rgba(247, 186, 42, 0.1);
    border-radius: 4px;
    border: 1px solid rgba(247, 186, 42, 0.2);
    align-items: center;
    cursor: pointer;

    .iconfont {
      margin-right: 8px;
      font-size: 10px;
    }
  }
  .el-dropdown-more {
    margin-left: 12px;
    height: 30px;
    color: #5a78a0;
    line-height: 30px;

    .iconfont {
      display: inline-block;
      font-size: 12px;
      transform: rotate(-90deg);
    }
  }
}
</style>
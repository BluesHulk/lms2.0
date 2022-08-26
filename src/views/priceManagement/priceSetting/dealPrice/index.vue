<template>
  <MyContainer>
    <template v-slot:top>
      <el-tabs v-model="activeName" type="card" @tab-change="handleClick">
        <el-tab-pane
          v-for="(item, index) in tabsList"
          :key="index"
          :label="`${item.label}`"
          :name="item.value"
        ></el-tab-pane>
      </el-tabs>
    </template>
    <template v-slot:header>
      <el-button type="primary" @click="onJump('add')">新增价目表</el-button>
      <el-button v-if="activeName == 1" @click="onSelectChange('undo')"
        >批量撤回</el-button
      >
      <el-button
        v-if="activeName == 0 || activeName == 2"
        @click="onSelectChange('del')"
        >批量删除</el-button
      >
    </template>
    <template v-slot:header-right>
      <MySearch
        v-if="!advancedFilterShow"
        :initConditionValue="conditionValue"
        :searchCondition="searchCondition"
        :initSearchEleType="searchEleType"
        @onSearch="onFuzzySearch"
      />
      <el-button-group style="margin-left: 24px">
        <!-- <el-button @click="exportOut">导出</el-button> -->
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
                  <el-dropdown-item @click="onBtnClick(slotProps.data, 'copy')"
                    >复制</el-dropdown-item
                  >
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
          <div v-if="activeName == 1">
            <el-button type="text" @click="onBtnClick(slotProps.data, 'copy')"
              >复制</el-button
            >
            <el-button type="text" @click="onBtnClick(slotProps.data, 'undo')"
              >撤回</el-button
            >
            <el-button type="text" @click="onBtnClick(slotProps.data, 'info')"
              >详情</el-button
            >
          </div>
          <div v-if="activeName == 3">
            <el-button type="text" @click="onBtnClick(slotProps.data, 'copy')"
              >复制</el-button
            >
            <el-button type="text" @click="onBtnClick(slotProps.data, 'info')"
              >详情</el-button
            >
          </div>
          <div v-if="activeName == 5">
            <el-button type="text" @click="onBtnClick(slotProps.data, 'copy')"
              >复制</el-button
            >
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
      <template v-if="currentRow.id && !operatingRecordShow">
        <div class="table-header">
          <span></span>
          <div class="title">
            <i class="iconfont icon-biaoge" />{{ currentRow.priceListName }}
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
      <template v-if="operatingRecordShow">
        <div class="table-header">
          <div>
            <el-button
              type="text"
              @click="() => (operatingRecordShow = false)"
              >{{ currentRow.priceListName }}</el-button
            >
            > {{ detailCurrentRow.productName }}历史价格
          </div>
          <div class="close-btn" @click="onDeliteClose">
            <i class="iconfont icon-biaogeguanbi" />
          </div>
        </div>
        <MyTable
          className="operating-record-table"
          ref="operatetionTableRef"
          :tableData="operatetionTableData"
          :columns="operatetionTableColumns"
          :selection="false"
        />
        <MyPagination
          :total="detailTableTotal"
          :queryData="detailPageParams"
          @paginationChange="detailPaginationChange"
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
import { priceSettingApi } from "@/request/services/priceManagement";
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
          label: "生效",
          value: 3,
          total: 99,
        },
        {
          label: "驳回",
          value: 2,
          total: 99,
        },
        {
          label: "到期",
          value: 5,
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
        //详情
        router.push({
          path: "/priceSetting/dealPriceInfo",
          query: {
            id: record.id,
            type,
          },
        });
      } else if (type == "copy" || type == "edit") {
        //复制

        router.push({
          path: "/priceSetting/dealPriceAdd",
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
          `<strong>删除价目单</strong><br/>
        是否删除该价目单?删除后价目单将从列表移除`,
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
        是否重新提交该价目单?重新提交后价目单状态将变更为审核中状态`,
          {
            dangerouslyUseHTMLString: true,
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          }
        ).then(() => {
          // 重新提交操作
          priceSettingApi
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
      onDeliteClose();
      getTableData();
    };

    const onJump = (type) => {
      if (type == "add") {
        router.push({
          path: "/priceSetting/dealPriceAdd",
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
        checkStatus: activeName.value,
        priceListType: 2,
        ...filterRecord.searchParams,
      };
      priceSettingApi.getTableData(params).then((res) => {
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
        if (type == "audit") {
          //批量审核
          onBatchAudit(ids);
        } else if (type == "undo") {
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

    //批量审核
    const onBatchAudit = (ids) => {
      ElMessageBox.confirm(
        `<strong>批量审核</strong><br/>已选中${tableRecord.selectedRows.length}项价目单，请确定已经完成审阅`,
        {
          dangerouslyUseHTMLString: true,
          confirmButtonText: "批量通过",
          cancelButtonText: "批量驳回",
          type: "warning",
        }
      )
        .then(() => {
          console.log("点击了批量审核");
        })
        .catch(() => {
          console.log("点击了批量驳回");
        });
    };

    //批量撤回
    const onBatchUndo = (ids) => {
      ElMessageBox.confirm(
        `<strong>批量撤回</strong><br/>已选中${tableRecord.selectedRows.length}项价目单，是否要批量撤回<br/>撤回后价目单将恢复草稿状态`,
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
        `<strong>批量删除</strong><br/>已选中${tableRecord.selectedRows.length}项价目单，是否要批量删除<br/>删除后价目单将从列表移除`,
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
      priceSettingApi.onUndo(ids).then((res) => {
        if (res.code == 0) {
          ElMessage.success("撤回成功");
          getTableData();
        } else {
          console.log(123);
          ElMessage.error(res.message);
        }
      });
    };

    //删除的方法
    const onDelPirce = (ids) => {
      priceSettingApi.onDelete(ids).then((res) => {
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
      { label: "价目表名称", prop: "priceListName", width: 160, fixed: "left" },
      { label: "销售公司", prop: "tenantName", width: 160 },
      { label: "客户名称", prop: "customerName", width: 160 },
      { label: "收货地址", prop: "siteName", width: 160 },
      {
        label: "结算方式",
        prop: "payTypeName",
        width: 150,
      },
      {
        label: "整体调价",
        prop: "isAdjust",
        formatter: (row) => {
          return { 0: "不参与", 1: "参与" }[row.isAdjust];
        },
        width: 120,
      },
      {
        label: "价格模式",
        prop: "priceModel",
        formatter: (row) => {
          return { 1: "一票制", 2: "两票制" }[row.priceModel];
        },
        width: 120,
      },
      //暂无
      {
        label: "流向管控",
        prop: "flowControl",
        formatter: (row) => {
          return { 1: "管控流向", 2: "不管控流向" }[row.flowControl];
        },
        width: 120,
      },
      { label: "开始时间", prop: "startExpireTime", width: 150 },
      { label: "结束时间", prop: "endExpireTime", width: 150 },
      { label: "创建人", prop: "createUserName", width: 150 },
      { label: "创建时间", prop: "createTime", width: 150 },
      { label: "更新人", prop: "updateUserName", width: 150 },
      { label: "最后更新", prop: "updateTime", width: 150 },
      {
        label: "状态",
        prop: "checkStatus",
        width: 150,
        formatter: (row) => {
          return { 1: "审核中", 3: "生效", 2: "驳回", 5: "到期", 0: "草稿" }[
            row.checkStatus
          ];
        },
        fixed: "right",
      },
      { label: "操作", slotName: "operation", width: 180, fixed: "right" },
    ];
    //子表
    const detailTableRecord = reactive({
      detailTableRef: null,
      detailTableData: [],
      filterTableData: [],
      filterText: "",
      detailCurrentRow: {},
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
      priceSettingApi.getPriceTableData({ priceListId: id }).then((res) => {
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
    const onOperationBtnClick = (row) => {
      operatetionTableRecord.operatingRecordShow = true;
      detailTableRecord.detailCurrentRow = row;
      getOperatingRecordData(row.id);
    };

    const operatetionTableRecord = reactive({
      operatetionTableRef: null,
      operatetionTableData: [],
      operatingRecordShow: false,
      detailTableTotal: 0,
      detailPageParams: {
        currentPage: 1,
        pageSize: 10,
      },
      selectRowId: "",
    });

    const getOperatingRecordData = (id) => {
      if (id) {
        operatetionTableRecord.selectRowId = id;
      }
      const params = {
        current: operatetionTableRecord.detailPageParams.currentPage,
        size: operatetionTableRecord.detailPageParams.pageSize,
        priceListGoodsId: operatetionTableRecord.selectRowId,
      };
      priceSettingApi.getHistoryPrice(params).then((res) => {
        if (res && res.code == 0) {
          operatetionTableRecord.detailTableTotal = res.data.total;
          operatetionTableRecord.operatetionTableData = res.data.records;
          transformArrayData(
            operatetionTableRecord.operatetionTableData,
            true,
            true,
            operatetionTableRecord.detailPageParams.currentPage,
            operatetionTableRecord.detailPageParams.pageSize
          );
        }
      });
    };
    const detailPaginationChange = (data) => {
      const { currentPage, pageSize } = operatetionTableRecord.detailPageParams;
      if (data.currentPage == currentPage && data.pageSize == pageSize) {
        return;
      }
      operatetionTableRecord.detailPageParams = { ...data };
      getOperatingRecordData();
    };
    const detailTableColumns = [
      { label: "序号", prop: "num", width: 60 },
      {
        label: "物料名称",
        prop: "productName",
      },
      { label: "物料编码", prop: "id" },
      { label: "税率", prop: "taxRate" },
      { label: "物料分类", prop: "categoryName" },
      { label: "计量单位", prop: "unitName" },
      {
        label: "货物单价",
        prop: "productPrice",
      },
      {
        label: "运输单价",
        prop: "transportPrice",
      },
      {
        label: "协议价格",
        prop: "price",
      },
      {
        label: "上一价格",
        prop: "lastPrice",
        operatetion: (row) => {
          return [
            {
              name: row.lastPrice,
              style: { color: "#239cff", textDecoration: "underline" },
              onClick: onOperationBtnClick.bind(this, row),
            },
          ];
        },
      },
      {
        label: "更新时间",
        prop: "updateTime",
      },
      // {
      //   label: "状态",
      //   prop: "status",
      //   width: 150,
      //   formatter: (row) => {
      //     return { 1: "审核中", 3: "生效", 2: "驳回", 5: "到期", 0: "草稿" }[
      //       row.status
      //     ];
      //   },
      //   fixed: "right",
      // },
    ];
    const operatetionTableColumns = [
      { label: "序号", prop: "num", width: 60,fixed:"left" },
      {
        label: "物料名称",
        prop: "productName",
        width: 160,fixed:"left"
      },
      {
        label: "物料编码",
        prop: "productCode",
        width: 160,
      },
      {
        label: "物料分类",
        prop: "categoryName",
        width: 160,
      },
      {
        label: "开始时间",
        prop: "startExpireTime",
        width: 180,
      },
      {
        label: "结束时间",
        prop: "endExpireTime",
        width: 180,
      },
      {
        label: "原货物单价",
        prop: "productOldPrice",
        width: 120,
      },

      {
        label: "货物调价幅度",
        prop: "productPriceRange",
        width: 120,
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
        width: 120,
      },
      {
        label: "原运输单价",
        prop: "transportOldPrice",
        width: 120,
      },

      {
        label: "运输调价幅度",
        prop: "transportPriceRange",
        width: 120,
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
        width: 120,
      },
      {
        label: "原协议价",
        prop: "lastPrice",
        width: 120,
      },
      {
        label: "调后协议价",
        prop: "price",
        width: 120,
      },
      {
        label: "调价方式",
        prop: "adjustType",
        width: 160,
        formatter: (row) => {
          return { 1: "整体调价", 2: "客户调价" }[row.adjustType];
        },
      },
      {
        label: "调价单号",
        prop: "id",
        width: 160,
      },
      {
        label: "调价人",
        prop: "createUserName",
        width: 160,
      },
      {
        label: "调价时间",
        prop: "createTime",
        width: 180,
      },
    ];

    const exportOut = () => {
      if (!tableRecord.selectedRows.length) {
        ElMessage.warning("请选择要导出的数据");
        return;
      }
      ElMessageBox.confirm(
        `<strong>导出价目表数据</strong><br/>
        是否导出选中的价目表数据?`,
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
          const res = await priceSettingApi.download(ids, 2);
          let fileName = "价目表";
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
      ...toRefs(operatetionTableRecord),
      tableColumns,
      detailTableColumns,
      operatetionTableColumns,
      onSearch,
      handleSelectionChange,
      onAdvancedStatus,
      onFuzzySearch,
      paginationChange,
      onSelectChange,
      onBatchAudit,
      onBatchDel,
      onBatchUndo,
      onUndoPirce,
      onDelPirce,
      onDeliteClose,
      onRowClick,
      onOperationBtnClick,
      detailPaginationChange,
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
  margin-top: 30px;
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
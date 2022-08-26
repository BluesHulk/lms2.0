<template>
  <MyContainer>
    <template v-slot:header>
      <el-button type="primary" @click="onJump('add')">结算规则</el-button>
       <el-dropdown style="margin-left:12px">
          <el-button type="primary" > 导出客户价格单<arrow-down /> </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="exportOut('now')">当前价格</el-dropdown-item>
              <el-dropdown-item @click="exportOut('history')">历史价格</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
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
        <el-button @click="onAdvancedStatus"
        style="margin-left: 12px"
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
            <i class="iconfont icon-biaoge" />价格单明细（{{
              currentRow.customerName
            }}）
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
            > {{ currentRow.priceListName }}历史价格
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
  <MyDialog
    :width="500"
    :visible="settlementModel"
    @onUpdateDialogStatus="onModalClose"
    title="结算规则"
  >
    <div class="model-content">
      <div>请选择结算规则</div>
      <el-radio-group v-model="settlement">
        <el-radio :label="1" size="large">发货量为准</el-radio>
        <el-radio :label="2" size="large">收货量为准</el-radio>
        <el-radio :label="3" size="large">收发货取小</el-radio>
      </el-radio-group>
    </div>
    <template v-slot:footer>
      <el-button @click="onModalClose">取消</el-button>
      <el-button type="primary" @click="onSave" :loading="btnLoading">
        确定
      </el-button>
    </template>
  </MyDialog>
</template>

<script>
import { reactive, ref, toRefs, watch } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex"; //高级用
import moment from "moment";
import MyContainer from "@/components/MyContainer.vue";
import MyDialog from "@/components/MyDialog.vue";
import MyTable from "@/components/MyTable.vue";
import MyPagination from "@/components/MyPagination.vue";
import FilterDrawer from "./components/FilterDrawer.vue";
import MySearch from "@/components/MySearch.vue";
import commonApi from "@/request/services/common";
import { customerPriceApi } from "@/request/services/priceManagement";
import { transformArrayData } from "@/utils/index";
import { ElMessage, ElMessageBox } from "element-plus";

export default {
  components: {
    MyContainer,
    MyTable,
    MyPagination,
    MySearch,
    MyDialog,
    FilterDrawer,
  },
  setup() {
    const router = useRouter();
    const store = useStore();
    const settlementModel = ref(false); //结算规则弹窗
    const state = reactive({});
    const btnLoading = ref(false);
    const settlement = ref(1);
    const onJump = () => {
      if (tableRecord.selectedRows.length) {
        settlementModel.value = true;
      } else {
        ElMessage.warning("请至少选择1项");
      }
    };
    //筛选配置项
    const filterRecord = reactive({
      conditionValue: "customerName",
      searchCondition: [
        {
          label: "客户名称",
          value: "customerName",
        },
        {
          label: "客户编码",
          value: "customerCode",
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
        ...filterRecord.searchParams,
      };
      customerPriceApi.getTableData(params).then((res) => {
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
      //  const lastItem = val.pop() || {};
      // tableRecord.currentRow = lastItem;
      // getDetailTableData(lastItem.id);
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
      { label: "客户名称", prop: "customerName", width: 160, fixed: "left" },
      { label: "销售公司", prop: "tenantName" },
      { label: "客户编码", prop: "customerCode" },
      {
        label: "客户分类",
        prop: "customerCategoryName",
      },
       {
        label: "客户销售分类",
        prop: "customerSalesTypeName",
      },
      {
        label: "结算规则",
        prop: "settleVolumeType",
        formatter: (row) => {
          return { 1: "发货量为准", 2: "收货量为准", 3: "收发货取小" }[
            row.settleVolumeType
          ];
        },
      },
      { label: "创建人", prop: "createUserName" },
      { label: "创建时间", prop: "createTime" },
      { label: "更新人", prop: "updateUserName" },
      { label: "最后更新", prop: "updateTime" },
    ];

    const onModalClose = () => {
      settlement.value = 1;
      settlementModel.value = false;
    };
    const onSave = () => {
      btnLoading.value = true;
      let ids = [];
      tableRecord.selectedRows.map((item) => {
        ids.push(item.id);
      });
      const params = {
        ids: ids,
        type: settlement.value,
      };
      customerPriceApi.onUnType(params).then((res) => {
        if (res && res.code == 0) {
          ElMessage.success("操作成功！");
          getTableData();
        } else {
          ElMessage.error(res.message);
        }
        btnLoading.value = false;
      });
    };
    //子表
    const detailTableRecord = reactive({
      detailTableRef: null,
      detailTableData: [],
      filterTableData: [],
      filterText: "",
    });

    const onRowClick = (val, column) => {
      tableRecord.currentRow = val;
      getDetailTableData(val.id);
    };
    const onDeliteClose = () => {
      tableRecord.currentRow = {};
      operatetionTableRecord.operatingRecordShow = false;
    };
    const getDetailTableData = (id) => {
      if (!id) return;
      customerPriceApi
        .getPriceTableData({ priceListCustomerId: id })
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
    const onOperationBtnClick = (id) => {
      operatetionTableRecord.operatingRecordShow = true;
      getOperatingRecordData(id);
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
        priceOrderGoodsId: operatetionTableRecord.selectRowId,
      };
      customerPriceApi.getHistoryPrice(params).then((res) => {
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
      { label: "物料编码", prop: "productCode" },
      { label: "物料分类", prop: "categoryName" },
      {
        label: "计量单位",
        prop: "unitName",
      },
      {
        label: "税率",
        prop: "taxRate",
      },
      { label: "结算方式", prop: "payTypeName" },
      {
        label: "价格模式",
        prop: "priceModel",
        formatter: (row) => {
          return { 1: "一票制", 2: "两票制" }[row.priceModel];
        },
      },
         {
        label: "流向管控",
        prop: "flowControl",
        formatter: (row) => {
          return { 1: "管控流向", 2: "不管控流向" }[row.flowControl];
        },
      },
      {
        label: "收货地址",
        prop: "siteName",
      },

      {
        label: "出厂价",
        prop: "price",
      },
      {
        label: "销售历史",
        operatetion: (row) => {
          return [
            {
              name: "查看",
              style: { color: "#239cff", textDecoration: "underline" },
              onClick: onOperationBtnClick.bind(this, row.priceListGoodsId),
            },
          ];
        },
      },
      {
        label: "开始时间",
        prop: "startExpireTime",
      },
      {
        label: "结束时间",
        prop: "endExpireTime",
      },
      {
        label: "更新时间",
        prop: "updateTime",
      },
      { label: "来源价目表", 
      operatetion: (row) => {
          return [
            {
              name: row.priceListName,
              style: { color: "#239cff", textDecoration: "underline" },
               onClick: jumpPrice.bind(this, row.priceListId,row.priceListType),
            },
          ];
        }, },
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
      { label: "序号", prop: "num", width: 60 },
      {
        label: "物料名称",
        prop: "productName",
      },
      {
        label: "开始时间",
        prop: "outTimeStart",
      },
      {
        label: "结束时间",
        prop: "outTimeEnd",
      },
      {
        label: "出厂价格",
        prop: "outPrice",
      },
      //暂无
      {
        label: "原结算方式",
        prop: "outPrice",
      },
      //暂无
      {
        label: "结算价格",
        prop: "outPrice",
      },
      //暂无
      {
        label: "结算方式",
        prop: "outPrice",
      },
      {
        label: "出库总车次",
        prop: "carNum",
      },
      {
        label: "出库总数量",
        prop: "outAmount",
      },
    ];
    //跳到价目表
    const jumpPrice = (sid,priceListType) => {
      //详情
      // priceListType

         const {href}= router.resolve({
          path: priceListType==2?"/priceSetting/dealPriceInfo":"/priceSetting/listPriceInfo",
          query: {
            id: sid,
            type:'info',
          },
      })
      window.open(href,'_blank')
    }
     const exportOut = (type) => {
      if (!tableRecord.selectedRows.length) {
        ElMessage.warning('请选择要导出的数据')
        return
      }
      ElMessageBox.confirm(
        `<strong>导出客户价格单${type=='history'?'历史价格':'当前价格'}</strong><br/>
        是否导出选中的数据?`,
        {
          dangerouslyUseHTMLString: true,
          confirmButtonText: '导出',
          cancelButtonText: '取消',
          type: 'warning',
          [`close-on-click-modal`]: false,
        },
      )
        .then(async () => {
          const ids = tableRecord.selectedRows.map((item) => item.id)
         const res = await customerPriceApi[type == "now" ? "downloadNow" : "downloadHistory"](ids)
          let fileName = '客户价格单'
          const _res = res
          let blob = new Blob([_res], {
            type: 'application/vnd.ms-excel;charset=utf-8',
          })
          let downloadElement = document.createElement('a')
          let href = window.URL.createObjectURL(blob) //创建下载的链接
          downloadElement.href = href
          downloadElement.download = `${fileName}.xls` //下载后文件名
          document.body.appendChild(downloadElement)
          downloadElement.click() //点击下载
          document.body.removeChild(downloadElement) //下载完成移除元素
          window.URL.revokeObjectURL(href) //释放掉blob对象
        })
        .catch(() => {})
    }
    return {
      settlementModel,
      btnLoading,
      ...toRefs(state),
      ...toRefs(filterRecord),
      ...toRefs(tableRecord),
      ...toRefs(detailTableRecord),
      ...toRefs(operatetionTableRecord),
      tableColumns,
      detailTableColumns,
      operatetionTableColumns,
      onJump,
      settlement,
      onModalClose,
      onSave,
      onSearch,
      handleSelectionChange,
      onAdvancedStatus,
      onFuzzySearch,
      paginationChange,
      onDeliteClose,
      onRowClick,
      onOperationBtnClick,
      detailPaginationChange,
      exportOut,
      jumpPrice
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
}
.model-content {
  padding-left: 24px;
}
::v-deep {
  .el-tabs__nav-scroll {
    background: #fff;
  }
}
</style>
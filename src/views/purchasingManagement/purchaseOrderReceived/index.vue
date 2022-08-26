<template>
  <MyContainer>
    <template v-slot:header>
      <el-button @click="onCancellation()">作废</el-button>
    </template>
    <template v-slot:header-right>
      <MySearch
        :initConditionValue="conditionValue"
        :searchCondition="searchCondition"
        @onSearch="onFuzzySearch"
      />
      <el-button-group style="margin-left: 24px">
        <el-button @click="() => {}">导入</el-button>
        <el-button @click="() => {}">导出</el-button>
      </el-button-group>
    </template>
    <div class="content">
      <MyTable
        className="purchase-order-received-table"
        ref="tableRef"
        :tableData="tableData"
        :columns="tableColumns"
        :selection="true"
        @handleSelectionChange="handleSelectionChange"
      >
        <template v-slot:operation="slotProps">
          <el-button type="text" @click="onStatusChange(slotProps.data)">{{
            slotProps.data.status == 0 ? "作废" : "启用"
          }}</el-button>
          <el-button type="text" @click="onModalShow(slotProps.data)"
            >详情</el-button
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

  <MyDrawer
    :drawerShow="detailShow"
    title="采购到货单详情"
    @onUpdateDrawerStatus="onUpdateDrawerStatus"
  >
    <JDetailCard :detailItems="detailItems" :detailData="detailData" />
    <template #footer>
      <div class="btns">
        <el-button @click="onModalClose">关闭</el-button>
      </div>
    </template>
  </MyDrawer>
</template>

<script>
import { ref, reactive, toRefs } from "vue";
import { useRouter } from "vue-router";
import moment from "moment";
import MyContainer from "@/components/MyContainer.vue";
import MyTable from "@/components/MyTable.vue";
import MyPagination from "@/components/MyPagination.vue";
import MySearch from "@/components/MySearch.vue";
import MyDrawer from "@/components/MyDrawer.vue";
import JDetailCard from "@/components/JDetailCard.vue";
import commonApi from "@/request/services/common";
import { purchaseOrderReceivedApi } from "@/request/services/purchasingManagement";
import { transformArrayData } from "@/utils/index";
import { ElMessage, ElMessageBox } from "element-plus";

export default {
  name: "PaymentOrder",
  components: {
    MyContainer,
    MyTable,
    MyPagination,
    MySearch,
    MyDrawer,
    JDetailCard,
  },
  setup() {
    const router = useRouter();

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
      conditionValue: "dpOrderNum",
      searchCondition: [{ label: "到货单号", value: "dpOrderNum" }],
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

      purchaseOrderReceivedApi.getTableData(params).then((res) => {
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

    const onFuzzySearch = (val) => {
      tableRecord.pageParams.currentPage = 1;
      filterRecord.searchParams = val;
      getTableData();
    };

    const handleSelectionChange = (val) => {
      tableRecord.selectedRows = val;
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
      if (record.status == 0) {
        ElMessageBox.confirm(
          `<strong>提示</strong><br/>
          确定要作废吗？`,
          {
            dangerouslyUseHTMLString: true,
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          }
        ).then(() => {
          purchaseOrderReceivedApi.onStatusChange(record.id).then((res) => {
            if (res && res.code == 0) {
              ElMessage.success("操作成功！");
              getTableData();
            } else {
              ElMessage.error(res.message);
            }
          });
        });
      } else {
        ElMessageBox.confirm(
          `<strong>提示</strong><br/>
          确定要启用吗？`,
          {
            dangerouslyUseHTMLString: true,
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          }
        ).then(() => {
          purchaseOrderReceivedApi.onStatusChange(record.id).then((res) => {
            if (res && res.code == 0) {
              ElMessage.success("操作成功！");
              getTableData();
            } else {
              ElMessage.error(res.message);
            }
          });
        });
      }
    };

    const onCancellation = () => {
      if (!tableRecord.selectedRows.length) {
        ElMessage.warning("请选择单据");
        return;
      } else {
        console.log("批量作废");
      }
    };

    const getDetail = () => {
      purchaseOrderReceivedApi.getDetail(record.id).then((res) => {});
    };

    const tableColumns = [
      { label: "序号", prop: "num", width: 60, fixed: "left" },
      { label: "供应商", prop: "customerName", width: 180 },
      { label: "采购公司", prop: "tenantName", minWidth: 160 },
      { label: "到货单号", prop: "dpOrderNum", width: 150 },
      {
        label: "单据日期",
        prop: "billDate",
        width: 170,
        formatter: (row) =>
          row.billDate && moment(row.billDate).format("YYYY-MM-DD HH:mm:ss"),
      },
      {
        label: "单据状态",
        prop: "status",
        width: 120,
        formatter: (row) =>
          `<span class="status-label" style="background: ${
            row.status == 0 ? "#13CE66" : "#DCE5ED"
          };"></span>${{ 0: "启用", 1: "作废" }[row.status]}`,
      },
      {
        label: "结算方式",
        prop: "settlementType",
        width: 120,
        formatter: (row) =>
          ({ 0: "现金", 1: "银行承兑", 2: "商业承兑" }[row.settlementType]),
      },
      {
        label: "结算规则",
        prop: "settlementRule",
        width: 120,
        formatter: (row) =>
          ({ 0: "发货量为准", 1: "到货量为准", 2: "收发货取小" }[
            row.settlementRule
          ]),
      },
      {
        label: "采购类型",
        prop: "purchaseType",
        width: 120,
        formatter: (row) =>
          ({ 0: "过磅采购", 1: "自制采购" }[row.purchaseType]),
      },
      {
        label: "运输方式",
        prop: "transportType",
        width: 120,
        formatter: (row) =>
          ({ 0: "自提", 1: "一票制包运", 2: "流向管控自提" }[
            row.transportType
          ]),
      },
      { label: "车牌号", prop: "licensePlate", width: 120 },
      { label: "司机姓名", prop: "driverName", width: 120 },
      { label: "司机电话", prop: "driverPhone", width: 120 },
      { label: "物料名称", prop: "productName", width: 120 },
      { label: "物料编码", prop: "productCode", width: 120 },
      { label: "出厂价", prop: "outPrice", width: 120 },
      { label: "折扣单价", prop: "discountUnitPrice", width: 120 },
      { label: "结算价", prop: "settlementPrice", width: 120 },
      { label: "发货量", prop: "outAmount", width: 120 },
      { label: "到货量", prop: "arrivalAmount", width: 120 },
      { label: "货损量", prop: "lossAmount", width: 120 },
      { label: "结算量", prop: "settlementAmount", width: 120 },
      { label: "合理损耗方案", prop: "lossScheme", width: 120 },
      { label: "出厂金额", prop: "outMoney", width: 120 },
      { label: "折扣金额", prop: "discountMoney", width: 120 },
      { label: "结算金额", prop: "settlementMoney", width: 120 },
      { label: "货损金额", prop: "lossMoney", width: 120 },
      { label: "实际收款金额", prop: "actualCollectionMoney", width: 120 },
      {
        label: "收货状态",
        prop: "receivingStatus",
        width: 120,
        formatter: (row) =>
          ({ 0: "待收货", 1: "收货中", 2: "已收货" }[row.receivingStatus]),
      },
      {
        label: "运输状态",
        prop: "transportStatus",
        width: 120,
        formatter: (row) =>
          ({
            0: "自提",
            1: "待运输",
            2: "运输中",
            3: "待回单",
            4: "待签收",
            5: "已签收",
          }[row.transportStatus]),
      },
      {
        label: "结算状态",
        prop: "settlementStatus",
        width: 120,
        formatter: (row) =>
          ({ 0: "未结算", 1: "已结算", 2: "已开票" }[row.settlementStatus]),
      },
      { label: "流向管控结果", prop: "flowControlResults", width: 120 },
      { label: "销售订单号", prop: "orderNum", width: 120 },
      { label: "计量磅单号", prop: "weighNo", width: 120 },
      { label: "运单号", prop: "waybillNum", width: 120 },
      { label: "开票客户", prop: "invoiceCustomerName", width: 120 },
      { label: "业务部门", prop: "deptName", width: 120 },
      { label: "业务员", prop: "salesmanName", width: 120 },
      { label: "第三方单据号", prop: "thirdCode", width: 180 },
      { label: "创建人", prop: "createUserName", width: 120 },
      {
        label: "创建时间",
        prop: "createTime",
        width: 170,
        formatter: (row) =>
          row.createTime &&
          moment(row.createTime).format("YYYY-MM-DD HH:mm:ss"),
      },
      { label: "最后操作人", prop: "updateUserName", width: 120 },
      {
        label: "最后操作时间",
        prop: "updateTime",
        width: 170,
        formatter: (row) =>
          row.updateTime &&
          moment(row.updateTime).format("YYYY-MM-DD HH:mm:ss"),
      },
      { label: "操作", slotName: "operation", width: 120, fixed: "right" },
    ];

    const detailRecord = reactive({
      detailShow: false,
      detailItems: [
        { label: "客户", prop: "customerName", span: 24 },
        { label: "供应商", prop: "customerName", span: 24 },
        { label: "采购公司", prop: "tenantName", span: 24 },
        { label: "到货单号", prop: "dpOrderNum", span: 24 },
        {
          label: "单据日期",
          prop: "billDate",
          span: 24,
          formatter: (data) =>
            data.billDate &&
            moment(data.billDate).format("YYYY-MM-DD HH:mm:ss"),
        },
        {
          label: "单据状态",
          prop: "status",
          span: 24,
          formatter: (data) => ({ 0: "启用", 1: "作废" }[data.status]),
        },
        {
          label: "结算方式",
          prop: "settlementType",
          span: 24,
          formatter: (row) =>
            ({ 0: "现金", 1: "银行承兑", 2: "商业承兑" }[row.settlementType]),
        },
        {
          label: "结算规则",
          prop: "settlementRule",
          span: 24,
          formatter: (row) =>
            ({ 0: "发货量为准", 1: "到货量为准", 2: "收发货取小" }[
              row.settlementRule
            ]),
        },
        {
          label: "采购类型",
          prop: "purchaseType",
          span: 24,
          formatter: (row) =>
            ({ 0: "过磅采购", 1: "自制采购" }[row.purchaseType]),
        },
        {
          label: "运输方式",
          prop: "transportType",
          span: 24,
          formatter: (row) =>
            ({ 0: "自提", 1: "一票制包运", 2: "流向管控自提" }[
              row.transportType
            ]),
        },
        { label: "车牌号", prop: "licensePlate", span: 24 },
        { label: "司机姓名", prop: "driverName", span: 24 },
        { label: "司机电话", prop: "driverPhone", span: 24 },
        { label: "物料名称", prop: "productName", span: 24 },
        { label: "物料编码", prop: "productCode", span: 24 },
        { label: "出厂价", prop: "outPrice", span: 24 },
        { label: "折扣单价", prop: "discountUnitPrice", span: 24 },
        { label: "结算价", prop: "settlementPrice", span: 24 },
        { label: "发货量", prop: "outAmount", span: 24 },
        { label: "到货量", prop: "arrivalAmount", span: 24 },
        { label: "货损量", prop: "lossAmount", span: 24 },
        { label: "结算量", prop: "settlementAmount", span: 24 },
        { label: "合理损耗方案", prop: "lossScheme", span: 24 },
        { label: "出厂金额", prop: "outMoney", span: 24 },
        { label: "折扣金额", prop: "discountMoney", span: 24 },
        { label: "结算金额", prop: "settlementMoney", span: 24 },
        { label: "货损金额", prop: "lossMoney", span: 24 },
        { label: "实际收款金额", prop: "actualCollectionMoney", span: 24 },
        {
          label: "收货状态",
          prop: "receivingStatus",
          span: 24,
          formatter: (row) =>
            ({ 0: "待收货", 1: "收货中", 2: "已收货" }[row.receivingStatus]),
        },
        {
          label: "运输状态",
          prop: "transportStatus",
          span: 24,
          formatter: (row) =>
            ({
              0: "自提",
              1: "待运输",
              2: "运输中",
              3: "待回单",
              4: "待签收",
              5: "已签收",
            }[row.transportStatus]),
        },
        {
          label: "结算状态",
          prop: "settlementStatus",
          span: 24,
          formatter: (row) =>
            ({ 0: "未结算", 1: "已结算", 2: "已开票" }[row.settlementStatus]),
        },
        { label: "流向管控结果", prop: "flowControlResults", span: 24 },
        { label: "销售订单号", prop: "orderNum", span: 24 },
        { label: "计量磅单号", prop: "weighNo", span: 24 },
        { label: "运单号", prop: "waybillNum", span: 24 },
        { label: "开票客户", prop: "invoiceCustomerName", span: 24 },
        { label: "业务部门", prop: "deptName", span: 24 },
        { label: "业务员", prop: "salesmanName", span: 24 },
        { label: "第三方单据号", prop: "thirdCode", span: 24 },
        { label: "创建人", prop: "createUserName", span: 24 },
        {
          label: "创建时间",
          prop: "createTime",
          span: 24,
          formatter: (row) =>
            row.createTime &&
            moment(row.createTime).format("YYYY-MM-DD HH:mm:ss"),
        },
        { label: "最后操作人", prop: "updateUserName", span: 24 },
        {
          label: "最后操作时间",
          prop: "updateTime",
          span: 24,
          formatter: (row) =>
            row.updateTime &&
            moment(row.updateTime).format("YYYY-MM-DD HH:mm:ss"),
        },
      ],
      detailData: {},
    });

    const onUpdateDrawerStatus = (status) => {
      if (!status) {
        onModalClose();
      }
    };

    const onModalShow = (record) => {
      detailRecord.detailShow = true;
      detailRecord.detailData = record;
    };

    const onModalClose = () => {
      detailRecord.detailShow = false;
    };

    return {
      ...toRefs(filterRecord),
      ...toRefs(tableRecord),
      ...toRefs(detailRecord),
      tableColumns,
      onSearch,
      onFuzzySearch,
      paginationChange,
      handleSelectionChange,
      onStatusChange,
      onCancellation,
      onUpdateDrawerStatus,
      onModalShow,
      onModalClose,
    };
  },
};
</script>

<style lang="scss">
.purchase-order-received-table {
  .status-label {
    margin-right: 8px;
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }
}
.btns {
  display: flex;
  justify-content: center;
}
</style>
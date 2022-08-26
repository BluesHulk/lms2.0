<template>
  <JDetailContainer :goBack="goBack">
    <div class="subtitle">采购公司</div>
    <JDetailCard :detailItems="companyItems" :detailData="detailData" />
    <div class="subtitle">供应商信息</div>
    <JDetailCard :detailItems="customerItems" :detailData="detailData" />
    <div class="subtitle">订单信息</div>
    <JDetailCard :detailItems="orderItems" :detailData="detailData" />
    <div class="subtitle">采购物料</div>
    <template v-if="!operatingRecordShow">
      <div class="table-header">
        <el-button class="operating-record-btn" @click="onOperationBtnClick"
          >操作记录</el-button
        >
        <div class="title"><i class="iconfont icon-biaoge" />销售物料表</div>
        <el-input
          class="search-input"
          v-model="filterText"
          placeholder="物料名称"
        >
          <template #suffix>
            <i class="iconfont icon-sousuo"></i>
          </template>
        </el-input>
      </div>
      <MyTable
        className="material-table"
        ref="tableRef"
        :tableData="filterTableData"
        :columns="tableColumns"
      />
    </template>
    <template v-if="operatingRecordShow">
      <div class="table-header">
        <div>
          <el-button type="text" @click="() => (operatingRecordShow = false)">{{
            detailData.orderNum
          }}</el-button>
          <span class="text">> 操作记录 （{{ detailData.orderNum }}）</span>
        </div>
      </div>
      <MyTable
        className="operating-record-table"
        ref="operatetionTableRef"
        :tableData="operatetionTableData"
        :columns="operatetionTableColumns"
        :selection="false"
      />
    </template>

    <template #footer>
      <template v-if="type == 1">
        <el-button type="primary">审批</el-button>
        <el-button @click="onWithdraw">撤回</el-button>
      </template>
      <template v-if="type == 2">
        <el-button @click="onWithdraw">撤回</el-button>
        <el-button @click="onPause">暂停</el-button>
        <el-button @click="onClose">关闭</el-button>
      </template>
      <template v-if="type == 3">
        <el-button @click="onClose">关闭</el-button>
      </template>
      <template v-if="type == 4 || type == 5">
        <el-button @click="onEnable">启用</el-button>
      </template>
      <template v-if="type == 6">
        <el-button type="primary" @click="onSubmit">提交</el-button>
        <el-button @click="onDelete">删除</el-button>
      </template>
    </template>
  </JDetailContainer>
</template>

<script>
import { ref, reactive, toRefs, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import moment from "moment";
import { purchaseOrderApi } from "@/request/services/purchasingManagement";
import MyTable from "@/components/MyTable.vue";
import JDetailContainer from "@/components/JDetailContainer.vue";
import JDetailCard from "@/components/JDetailCard.vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { transformArrayData } from "@/utils/index";

export default {
  components: {
    MyTable,
    JDetailContainer,
    JDetailCard,
  },
  setup() {
    const router = useRouter();
    const route = useRoute();

    const { id, type } = route.query;

    const detailRecord = reactive({
      companyItems: [
        {
          label: "采购公司:",
          prop: "tenantName",
        },
      ],
      customerItems: [
        {
          label: "供应商：",
          prop: "customerName",
        },
        // {
        //   label: "付款方式：",
        //   prop: "tenantId",
        // },
        {
          label: "开票客户：",
          prop: "invoiceCustomerName",
        },
      ],
      orderItems: [
        {
          label: "结算方式：",
          prop: "settlementType",
          formatter: (row) =>
            ({ 0: "现金", 1: "银行承兑", 2: "商业承兑" }[row.settlementType]),
        },
        {
          label: "部门：",
          prop: "deptName",
        },
        {
          label: "业务员：",
          prop: "salesmanName",
        },
        {
          label: "运输方式：",
          prop: "transportType",
          formatter: (row) =>
            ({ 0: "自提", 1: "一票制包运", 2: "流向管控自提" }[
              row.transportType
            ]),
        },
        {
          label: "结算规则：",
          prop: "settlementRule",
          formatter: (row) =>
            ({ 0: "发货量为准", 1: "到货量为准", 2: "收发货取小" }[
              row.settlementRule
            ]),
        },
        {
          label: "装货地：",
          prop: "consignerAddress",
        },
        {
          label: "单据日期：",
          prop: "billDate",
          formatter: (row) =>
            row.billDate && moment(row.billDate).format("YYYY-MM-DD HH:mm:ss"),
        },
        {
          label: "同步创建运单：",
          prop: "isWaybill",
          formatter: (row) => ({ 0: "否", 1: "是" }[row.isWaybill]),
        },
        {
          label: "先票后货：",
          prop: "isInvoice",
          formatter: (row) => ({ 0: "否", 1: "是" }[row.isInvoice]),
        },
        {
          label: "发票号：",
          prop: "invoiceNum",
        },
      ],
      detailData: {},
    });

    const tableRecord = reactive({
      tableRef: null,
      tableData: [],
      filterTableData: [],
    });
    const tableColumns = [
      { label: "序号", prop: "num", width: 60, fixed: "left" },
      { label: "物料名称", prop: "productName", fixed: "left", width: 160 },
      { label: "物料编码", prop: "productCode", width: 140 },
      { label: "规格", prop: "specification", width: 120 },
      { label: "型号", prop: "modelMaterial", width: 120 },
      { label: "计量单位", prop: "amountUnitName", width: 120 },
      { label: "需求部门", prop: "needDeptName", width: 120 },
      { label: "数量", prop: "amount", width: 100, fixed: "right" },
      { label: "出厂价", prop: "outPrice", width: 100, fixed: "right" },
      { label: "价税合计", prop: "taxPrice", width: 100, fixed: "right" },
    ];

    const getDetail = () => {
      purchaseOrderApi.getDetail(id).then((res) => {
        if (res && res.code == 0) {
          detailRecord.detailData = res.data;
          tableRecord.tableData = transformArrayData(
            res.data.orderGoodsList,
            true,
            true
          );
          tableRecord.filterTableData = transformArrayData(
            res.data.orderGoodsList,
            true,
            true
          );
        }
      });
    };
    getDetail();

    const onOperationBtnClick = () => {
      operatetionTableRecord.operatingRecordShow = true;
      getOperatingRecordData();
    };

    const filterText = ref();

    watch(
      () => filterText.value,
      (val) => {
        tableRecord.filterTableData = tableRecord.tableData.filter((item) => {
          return item.productName.includes(val);
        });
      }
    );

    const operatetionTableRecord = reactive({
      operatetionTableRef: null,
      operatetionTableData: [],
      operatingRecordShow: false,
    });

    const operatetionTableColumns = [
      { label: "序号", prop: "num", width: 60 },
      { label: "操作类型", prop: "operateType" },
      { label: "操作人", prop: "createUserName" },
      {
        label: "操作时间",
        prop: "createTime",
        formatter: (row) =>
          moment(row.createTime).format("YYYY-MM-DD HH:mm:ss"),
      },
      { label: "操作结果", prop: "result" },
      { label: "备注", prop: "remark" },
    ];

    const getOperatingRecordData = () => {
      purchaseOrderApi
        .getOperatingRecordData({ orderType: 2, orderId: id })
        .then((res) => {
          if (res && res.code == 0) {
            operatetionTableRecord.operatetionTableData = transformArrayData(
              res.data,
              true,
              true
            );
          }
        });
    };

    const onDelete = () => {
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
        purchaseOrderApi.onDelete([id]).then((res) => {
          if (res && res.code == 0) {
            ElMessage.success("删除成功！");
            goBack();
          } else {
            ElMessage.error(res.message);
          }
        });
      });
    };

    const onSubmit = () => {
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
        purchaseOrderApi.orderSubmit([id]).then((res) => {
          if (res && res.code == 0) {
            ElMessage.success("提交成功！");
            goBack();
          } else {
            ElMessage.error(res.message);
          }
        });
      });
    };

    const onWithdraw = () => {
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
        purchaseOrderApi.orderWithdraw([id]).then((res) => {
          if (res && res.code == 0) {
            ElMessage.success("撤回成功！");
            goBack();
          } else {
            ElMessage.error(res.message);
          }
        });
      });
    };

    const onPause = () => {
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
        purchaseOrderApi.orderSuspend([id]).then((res) => {
          if (res && res.code == 0) {
            ElMessage.success("暂停成功！");
            goBack();
          } else {
            ElMessage.error(res.message);
          }
        });
      });
    };

    const onClose = () => {
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
        purchaseOrderApi.orderClose({ id }).then((res) => {
          if (res && res.code == 0) {
            ElMessage.success("关闭成功！");
            goBack();
          } else {
            ElMessage.error(res.message);
          }
        });
      });
    };

    const onEnable = () => {
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
        purchaseOrderApi.orderOpen([id]).then((res) => {
          if (res && res.code == 0) {
            ElMessage.success("启用成功！");
            goBack();
          } else {
            ElMessage.error(res.message);
          }
        });
      });
    };

    const goBack = () => {
      router.go(-1);
      sessionStorage.setItem("purchaseOrderKey", type);
    };

    return {
      ...toRefs(detailRecord),
      ...toRefs(tableRecord),
      ...toRefs(operatetionTableRecord),
      filterText,
      tableColumns,
      operatetionTableColumns,
      type,
      onSubmit,
      onDelete,
      onWithdraw,
      onPause,
      onClose,
      onEnable,
      goBack,
      onOperationBtnClick,
    };
  },
};
</script>

<style lang="scss" scoped>
.subtitle {
  position: relative;
  margin-bottom: 16px;
  padding-left: 12px;
  font-size: 14px;
  font-family: PingFangSC-Regular, PingFang SC;
  font-weight: 400;
  color: $color-text;
  line-height: 22px;

  &::before {
    content: "";
    position: absolute;
    left: 0;
    top: 50%;
    display: inline-block;
    width: 4px;
    height: 16px;
    background: #3c82fe;
    border-radius: 2px;
    transform: translateY(-50%);
  }
  &::after {
    content: "";
    position: absolute;
    top: 50%;
    right: 0;
    width: calc(100% - 100px);
    height: 1px;
    background: $color-border;
    transform: translateY(-50%);
  }
}

.table-header {
  display: flex;
  padding: 0 16px;
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
  .text {
    font-size: 14px;
    color: $color-text;
  }
}
.material-table,
.operating-record-table {
  margin-top: 0;
}
</style>

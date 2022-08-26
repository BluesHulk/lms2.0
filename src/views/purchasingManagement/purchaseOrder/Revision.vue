<template>
  <div class="header">
    <el-button @click="goBack">返回</el-button>
  </div>
  <div class="content">
    <MyTitle :title="'订单修订'" icon="icon-pingtai" />
    <div class="subtitle">销售物料</div>
    <el-form ref="tableFormRef" :model="tableDataForm">
      <MyTable
        className=""
        ref="tableRef"
        :tableData="tableDataForm.tableData"
        :columns="tableColumns"
        :selection="true"
        @handleSelectionChange="handleSelectionChange"
      >
        <template v-slot:incrementAmount="row">
          <el-form-item
            label-width="0"
            :prop="`tableData.${row.index}.incrementAmount`"
            :show-message="false"
          >
            <el-input-number
              v-model="row.data.incrementAmount"
              controls-position="right"
              :precision="0"
              placeholder="请输入"
            />
          </el-form-item>
        </template>
      </MyTable>
      <div :class="`collapse-content ${isExpanded && 'collapse-content-show'}`">
        <div class="subtitle">采购公司</div>
        <JDetailCard
          :detailItems="detailItems.company"
          :detailData="detailData"
        />
        <div class="subtitle">供应商信息</div>
        <JDetailCard
          :detailItems="detailItems.supplier"
          :detailData="detailData"
        />
        <div class="subtitle">订单信息</div>
        <JDetailCard
          :detailItems="detailItems.order"
          :detailData="detailData"
        />
      </div>
      <div
        :class="`collapse ${isExpanded && 'collapse-expanded'}`"
        @click="onCollapseChange"
      >
        <span>
          <i class="iconfont icon-icon_zuocexialazhankai"></i>
          {{ isExpanded ? "收起订单详情" : "向下展开订单详情" }}
        </span>
      </div>
    </el-form>
  </div>

  <div class="footer">
    <el-button type="primary" @click="onSubmit">重新提交</el-button>
  </div>

  <el-dialog
    v-model="dialogVisible"
    :custom-class="'success-dialog'"
    :width="560"
    :show-close="false"
    :close-on-click-modal="false"
  >
    <div class="dialog-content">
      <div class="icon-success"></div>
      <div class="text">提交成功</div>
      <div class="text1">订单修订成功，订单状态已变更</div>
      
      <el-button type="primary" class="go-back-btn" @click="onJump('goBack')">返回订单列表</el-button>
      <el-button @click="onJump('detail')">查看订单详情</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { ref, reactive, toRefs } from "vue";
import { useRouter, useRoute } from "vue-router";
import moment from "moment";
import MyTitle from "@/components/MyTitle.vue";
import MyTable from "@/components/MyTable.vue";
import JDetailCard from "@/components/JDetailCard.vue";
import { purchaseOrderApi } from "@/request/services/purchasingManagement";
import { transformArrayData } from "@/utils/index";
import { ElMessage } from "element-plus";

export default {
  components: {
    MyTitle,
    MyTable,
    JDetailCard,
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const { id, type } = route.query;

    const dialogVisible = ref(false);

    const tableRecord = reactive({
      tableRef: null,
      tableDataForm: {
        tableData: [],
      },
      tableTotal: 0,
      selectedRows: [],
    });

    const tableColumns = [
      { label: "序号", prop: "num", width: 60, fixed: "left" },
      { label: "物料名称", prop: "productName", fixed: "left", width: 140 },
      { label: "物料编码", prop: "productCode", width: 140 },
      { label: "规格", prop: "specification", width: 120 },
      { label: "型号", prop: "modelMaterial", width: 120 },
      { label: "计量单位", prop: "amountUnitName", width: 120 },
      { label: "需求部门", prop: "needDeptName", width: 120 },
      { label: "数量", prop: "amount", width: 100, fixed: "right" },
      { label: "出厂价", prop: "outPrice", width: 100, fixed: "right" },
      { label: "价税合计", prop: "taxPrice", width: 100, fixed: "right" },
      {
        label: "本次修订数量",
        prop: "incrementAmount",
        slotName: "incrementAmount",
        width: 150,
        fixed: "right",
      },
    ];

    const collapseRecord = reactive({
      isExpanded: false,
    });

    const onCollapseChange = () => {
      collapseRecord.isExpanded = !collapseRecord.isExpanded;
    };

    const detailRecord = reactive({
      detailItems: {
        company: [{ label: "采购公司：", prop: "id" }],
        supplier: [
          { label: "供应商：", prop: "customerName" },
          // { label: "付款方式：", prop: "tenantName" },
          { label: "开票客户：", prop: "invoiceCustomerName" },
        ],
        order: [
          {
            label: "结算方式：",
            prop: "settlementType",
            formatter: (row) =>
              ({ 0: "现金", 1: "银行承兑", 2: "商业承兑" }[row.settlementType]),
          },
          { label: "部门：", prop: "deptName" },
          { label: "业务员：", prop: "salesmanName" },
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
          { label: "装货地：", prop: "consignerAddress" },
          {
            label: "单据日期：",
            prop: "billDate",
            formatter: (row) =>
              row.billDate &&
              moment(row.billDate).format("YYYY-MM-DD HH:mm:ss"),
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
          { label: "发票号：", prop: "invoiceNum" },
        ],
      },
      detailData: {},
    });

    const getDetail = () => {
      purchaseOrderApi.getDetail(id).then((res) => {
        if (res && res.code == 0) {
          detailRecord.detailData = res.data;
          tableRecord.tableDataForm.tableData = transformArrayData(
            res.data.orderGoodsList,
            true,
            true
          );
        }
      });
    };
    getDetail();

    const onSubmit = () => {
      const data = [];
      tableRecord.tableDataForm.tableData.map((item) => {
        if (item.incrementAmount != undefined) {
          data.push({
            incrementAmount: item.incrementAmount,
            id: item.id,
          });
        }
      });
      if (!data.length) {
        ElMessage.warning("请填写修订数量");
        return;
      }
      purchaseOrderApi.onRevise(data).then((res) => {
        if (res && res.code == 0) {
          dialogVisible.value = true;
        } else {
          ElMessage.error(res.message);
        }
      });
    };

    const onJump = (jumpType) => {
      if(jumpType == 'detail') {
        router.push({
        path: "/purchaseOrderDetail",
        query: {
          type,
          id,
        },
      });
      } else {
        goBack();
      }
      dialogVisible.value = false;
    }

    const goBack = () => {
      sessionStorage.setItem("purchaseOrderKey", type);
      router.go(-1);
    };

    return {
      tableColumns,
      dialogVisible,
      ...toRefs(tableRecord),
      ...toRefs(collapseRecord),
      ...toRefs(detailRecord),
      onCollapseChange,
      onSubmit,
      goBack,
      onJump,
    };
  },
};
</script>

<style lang="scss" scoped>
.header {
  padding: 24px;
}
.content {
  position: relative;
  margin: 0 24px;
  padding: 24px;
  width: calc(100% - 48px);
  height: calc(100% - 32px - 48px - 60px - 24px);
  background: #fff;
  box-sizing: border-box;
  overflow-y: auto;

  .title {
    margin-bottom: 24px;
  }

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

  .required-symbol {
    color: $color-red;
  }

  .collapse-content {
    position: relative;
    left: -24px;
    padding: 0 24px;
    width: 100%;
    max-height: 0;
    overflow: hidden;
    transition: all 0.3s;
  }

  .collapse-content-show {
    padding-top: 24px;
    max-height: 1000px;
    border-top: 1px solid $color-border;
  }

  .collapse {
    position: relative;
    left: -24px;
    display: flex;
    padding: 0 24px;
    width: 100%;
    height: 52px;
    border-top: 1px solid $color-border;
    align-items: center;
    cursor: pointer;

    span {
      font-size: 14px;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      color: $color-blue;
      line-height: 20px;
      text-decoration: underline;

      .iconfont {
        display: inline-block;
        transform: rotate(-180deg);
        transition: all 0.3s;
      }
    }
  }
  .collapse-expanded {
    span {
      .iconfont {
        transform: rotate(-90deg);
      }
    }
  }

  ::v-deep {
    .el-table__row {
      .el-form-item {
        margin: 0;
      }
      .el-form-item.is-error {
        input::-webkit-input-placeholder {
          color: #ff9d97;
        }
      }
    }
  }
}

.footer {
  position: absolute;
  bottom: 0;
  left: 0;
  display: flex;
  padding: 24px;
  width: 100%;
  height: 60px;
  box-sizing: border-box;
  background: #fff;
  align-items: center;
}
</style>

<style lang="scss">
.success-dialog {
  .el-dialog__header {
    display: none;
  }
  .el-dialog__body {
    padding: 24px;
  }

  .dialog-content {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .icon-success {
    width: 80px;
    height: 80px;
    background: url("@/assets/imgs/icon-success.png") no-repeat;
    background-size: 100% 100%;
  }
  .text {
    padding: 24px 0 10px;
    font-size: 16px;
    font-family: PingFangSC-Semibold, PingFang SC;
    font-weight: 600;
    color: $color-text;
    line-height: 22px;
  }
  .text1 {
    font-size: 14px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: #5A78A0;
    line-height: 20px;
  }
  .el-button {
    margin: 0;
  }
  .go-back-btn {
    margin: 48px 0 16px;
  }
}
</style>
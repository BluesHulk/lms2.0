<template>
  <JDetailContainer
    :goBack="goBack"
  >

    <div class="subtitle">销售公司</div>
    <JDetailCard
      :detailItems="companyItems"
      :detailData="detailData"
    />
    <div class="subtitle">客户信息</div>
    <JDetailCard
      :detailItems="customerItems"
      :detailData="detailData"
    />
    <div class="blue-box">
      <JDetailCard
        :detailItems="costomerSubItems"
        :detailData="detailData"
      />
      <div class="blue-box-line"></div>
      <div class="blue-box-subtitle">选择扣款账户：</div>
      <div class="blue-box-list">
        <el-row
          v-for="item in accountList"
          class="list-item"
        >
          <el-col :span="5">
            <div class="name">{{item.accountName}}</div>
          </el-col>
          <el-col :span="5">
            <div>可用余额：
              <span class="price-yellow">{{item.money}}</span>
            </div>
          </el-col>
          <el-col :span="5">
            <div>冻结金额：
              <span class="price-grey">{{item.lockMoney}}</span>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>
    <div class="subtitle">订单信息</div>
    <JDetailCard
      :detailItems="orderItems"
      :detailData="detailData"
    />
    <div class="blue-box">
      <div class="blue-box-subtitle">资金核销</div>
      <div class="blue-box-line"></div>
      <div class="blue-box-subtitle">选择扣款账户：</div>
      <div class="blue-box-list">
        <el-row
          v-for="item in receiptList"
          class="list-item"
        >
          <el-col :span="5">
            <div class="name">收款单：
              <span class="price-box">{{payTypeMap.get(item.payType)}}</span>
            </div>
          </el-col>
          <el-col :span="5">
            <div class="">总金额：<span >{{item.money}}</span></div>
          </el-col>
          <el-col :span="5">
            <div>未核销金额：
              <span class="price-yellow">{{item.unVerifyMoney}}</span>
            </div>
          </el-col>
          <el-col :span="4">
            <div>单据类型：
              <span class="price-grey">{{billTypeMap.get(item.billType)}}</span>
            </div>
          </el-col>
          <el-col :span="4">
            <div>单据日期：
              <span class="price-grey">{{item.createTime}}</span>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>
    <div class="subtitle">销售物料</div>
    
    <div v-show="!operatingRecordShow">
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
            <i class="iconfont icon-sousuo1"></i>
          </template>
        </el-input>
      </div>
      <MyTable
        className="material-table"
        ref="tableRef"
        :tableData="filterTableData"
        :columns="tableColumns"
      />
    </div>
    <div v-show="operatingRecordShow">
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
    </div>

    <!-- <MyTable
      className="custom-table"
      ref="tableRef"
      :tableData="tableData"
      :columns="tableColumns"
    /> -->

    <template #footer>
      <div v-if="detailData.status == 0" text="草稿">
        <el-button type="primary" @click="onChangeStatus('submit')">提交</el-button>
        <el-button @click="onChangeStatus('delete')">删除</el-button>
      </div>
      <div v-if="detailData.status == 1" text="审批中">
        <!-- <el-button type="primary">审批</el-button> -->
        <el-button @click="onChangeStatus('withdraw')">撤回</el-button>
      </div>
      <div v-if="detailData.status == 2" text="审批通过">
        <el-button @click="onJump('revision')">修订</el-button>
        <el-button @click="onChangeStatus('suspend')">暂停</el-button>
        <el-button @click="onChangeStatus('close')">关闭</el-button>
      </div>
      <div v-if="detailData.status == 3" text="审批不通过">
        <el-button @click="onChangeStatus('close')">关闭</el-button>
      </div>
      <div v-if="detailData.status == 4" text="暂停">
        <el-button @click="onChangeStatus('open')">启用</el-button>
      </div>
      <div v-if="detailData.status == 5" text="关闭">
        <el-button @click="onChangeStatus('open')">启用</el-button>
      </div>      
    </template>
  </JDetailContainer>

  <SendCarModal
    :visible="sendCarModalShow"
    @onClose="sendCarModalShow=false"
    @getData="getSendCarData"
  >
    <template #header>
      <div class="blue-bg">
        <JDetailCard
          :detailItems="sendCarModalDetailitems"
          :detailData="sendCarModalDetailData"
        />
      </div>
    </template>
  </SendCarModal>


</template>

<script>
import { ref, reactive, toRefs, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { paymentOrderApi } from "@/request/services/fundsManagement";
import MyTable from '@/components/MyTable.vue';
import JDetailContainer from '@/components/JDetailContainer.vue';
import JDetailCard from '@/components/JDetailCard.vue';
import SendCarModal from "@/components/commonModal/SendCarModal.vue";
import { ElMessage, ElMessageBox } from 'element-plus';
import { transformArrayData } from "@/utils/index";
import { saleOrderApi } from "@/request/services/saleMgt";

export default {
  components: {
    MyTable,
    JDetailContainer,
    JDetailCard,
    SendCarModal,
  },
  setup() {
    const router = useRouter()
    const route = useRoute()

    const goBack = () => {
      router.go(-1);
      sessionStorage.setItem("saleOrderKey", route.query.tab);
    }

    const settlementTypeMap = new Map([
      [ 0,'现金' ],
      [ 1,'银行承兑' ],
      [ 2,'商业承兑' ],
    ])
    const settlementRuleMap = new Map([
      [ 0,'发货方为准' ],
      [ 1,'收货方为准' ],
      [ 2,'收发货方取小' ],
    ])
    const transportTypeMap = new Map([
      [ 0,'自提' ],
      [ 1,'一票制包运' ],
      [ 2,'流向管控自提' ],
    ])
    const orderStatusMap = new Map([
      [ 0,'草稿' ],
      [ 1,'审批中' ],
      [ 2,'审批通过' ],
      [ 3,'审批不通过' ],
      [ 4,'暂停' ],
      [ 5,'关闭' ],
    ])
    const payTypeMap = new Map([
      [1, '企业网银'],
      [2, '银行承兑汇票-纸质'],
      [3, '银行承兑汇票-电子'],
      [4, '商业承兑汇票-纸质'],
      [5, '商业承兑汇票-电子'],
      [6, '陕建筑信通'],
      [7, '现金'],
    ])
    const billTypeMap = new Map([
      [1, '银行承兑汇票-纸质'],
      [2, '银行承兑汇票-电子'],
      [3, '商业承兑汇票-纸质'],
      [4, '商业承兑汇票-电子'],
    ])

    const detailRecord = reactive({
      companyItems: [
        {
          label: '销售公司:',
          prop: 'tenantName'
        }
      ],
      customerItems: [
        {
          label: '客户：',
          prop: 'customerName'
        },
        {
          label: '扣款客户：',
          prop: 'deductCustomerName'
        },
        {
          label: '开票客户：',
          prop: 'invoiceCustomerName'
        }
      ],
      costomerSubItems: [
        {
          label: '扣款客户：',
          prop: 'deductCustomerName'
        },
        {
          label: '授信额度：',
          prop: 'creditTotalMoneyPlus'
        },
        {
          label: '可用额度：',
          prop: 'creditMoneyPlus'
        }
      ],
      orderItems: [
        {
          label: '结算方式：',
          prop: 'settlementType',
          formatter: (row) => {
            return settlementRuleMap.get(row.settlementType)
          }
        },
        {
          label: '部门：',
          prop: 'deptName'
        },
        {
          label: '业务员：',
          prop: 'salesmanName'
        },
        {
          label: '运输方式：',
          prop: 'transportType',
          formatter: (row) => {
            return transportTypeMap.get(row.transportType)
          }
        },
        {
          label: '结算规则：',
          prop: 'settlementRule',
          formatter: (row) => {
            return settlementRuleMap.get(row.settlementRule)
          }
        },
        {
          label: '卸货地：',
          prop: 'consignerAddress'
        },
        {
          label: '单据日期：',
          prop: 'billDate'
        },
        {
          label: '散户：',
          prop: 'retailInvestors'
        },
        {
          label: '参与调价：',
          prop: 'isAdjust',
          formatter: (row) => {
            return row.isAdjust? '是': '否'
          }
        },
        {
          label: '支持尾单处理：',
          prop: 'isTail',
          formatter: (row) => {
            return row.isTail? '是': '否'
          }
        },
        {
          label: '同步创建运单：',
          prop: 'isWaybill',
          formatter: (row) => {
            return row.isWaybill? '是': '否'
          }
        },
        {
          label: '先票后货：',
          prop: 'isInvoice',
          formatter: (row) => {
            return row.isInvoice? '是': '否'
          }
        },
        {
          label: '发票号：',
          prop: 'orderNum'
        },
      ],
      detailData: {},
      accountList: [],
      receiptList: [],
      
    })

    const tableRecord = reactive({
      tableRef: null,
      tableData: [],
      filterTableData: [],
    })
    const tableColumns = ref([]);
    const tableColumnsTemp1 =[
      { label: "序号", prop: "num", width: 60, fixed: "left" },
      { label: "物料名称", prop: "productName", fixed: "left", width: 100 },
      { label: "物料编码", prop: "productCode",width: 100 },
      { label: "规格", prop: "specification" },
      { label: "型号", prop: "customerName" },
      { label: "计量单位", prop: "amountUnitName",width: 100 },
      { label: "总数量", prop: "amount" },
      { label: "出厂价", prop: "outPrice" },
      { label: "价税合计", prop: "totalTaxPrice",width: 100 },
      { label: "可派车数量", prop: "dispatchAmount",width: 100 },
      { label: "待提货数量", prop: "takeAmount",width: 100 },
      { label: "累计已执行数量", prop: "executedAmount",width: 130 },
      { label: "待结算数量", prop: "unsettledAmount",width: 130 },
      { label: "累计已结算数量", prop: "settledAmount",width: 130 },
      { label: "累计已开票数量", prop: "invoiceAmount",width: 130 },
      { label: "冻结总金额", prop: "frozenPrice",width: 130 },
      { label: "累计已结算金额", prop: "settledPrice",width: 130 },
      { label: "累计已开票金额", prop: "invoicePrice",width: 130 },
      { label: "价格单号", prop: "orderNum",width: 100 },
      { label: "调价单号", prop: "orderNum",width: 100 },
      { label: "旧订单单据", prop: "orderNum",width: 100 },
      { label: "备注", prop: "remark" },
    ]
    const tableColumnsTemp2 = [
      {
        label: '操作',
        width: 80,
        fixed: 'right',
        operatetion: (row) => {
          return [
            { 
              name: '派车', 
              style: {color: '#239cff'}, 
              onClick: onDispatch.bind(this, row) 
            },
          ]
        }
      },
    ]

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

    const sendCarModalRecord = reactive({
      currRow: {},
      sendCarModalShow: false,
      sendCarModalDetailData: {},
      sendCarModalDetailitems: [
        {
          label: '销售公司:',
          prop: 'tenantName',
          span: 12
        },
        {
          label: '客户：',
          prop: 'customerName',
          span: 12
        },
        {
          label: '物料：',
          prop: 'productName',
          span: 12
        },
        {
          label: '可派车数量：',
          prop: 'dispatchAmount',
          span: 12
        },
      ]
    })

    const onOperationBtnClick = () => {
      operatetionTableRecord.operatingRecordShow = true;
      getOperatingRecordData();
    };

    const getOperatingRecordData = async() => {
      let params = {
        orderId: route.query.id,
        orderType: 1
      }
      const res = await saleOrderApi.getRecordById(params)
      if (res && res.code == 0) {
        operatetionTableRecord.operatetionTableData = transformArrayData(
          res.data,
          true,
          true
        );
      }

    }

    const onDispatch = (row) => {
      sendCarModalRecord.sendCarModalDetailData = {
        tenantName: detailRecord.detailData.tenantName,
        customerName: detailRecord.detailData.customerName,
        productName: row.productName,
        dispatchAmount: row.dispatchAmount,
      }
      sendCarModalRecord.sendCarModalShow = true
      sendCarModalRecord.currRow = row
    }
    const getSendCarData = async(val=[]) => {
      // console.log(val,"std")
      let params = val.map(item => {
        return {
          orderGoodsId: sendCarModalRecord.currRow.id,
          ...item
        }
      })
      // console.log(params,"pp")
      const res = await saleOrderApi.orderDispatch(params)

      if (res && res.code == 0) {
        ElMessage.success(`派车成功，已生成${val.length}张发货单`);
        sendCarModalRecord.sendCarModalShow = false;
      } else {
        ElMessage.error(res.message);
      }
    }

    const getDetail = async() => {
      const { id } = route.query
      const res = await saleOrderApi.getDetail({id})
      if(res && res.code == 0) {
        detailRecord.detailData = res.data  
        tableRecord.tableData = transformArrayData(res.data.orderGoodsList, true, true)
        tableRecord.filterTableData = transformArrayData(res.data.orderGoodsList, true, true)
        
        //动态物料表格
        if(res.data.status ==2 ) {
          tableColumns.value = [
            ...tableColumnsTemp1,
            ...tableColumnsTemp2,
          ]
        } else {
          tableColumns.value = tableColumnsTemp1
        }

        const { capitalAccountVoList=[], capitalReceiptRecordVoList=[]} = res.data
        detailRecord.accountList = capitalAccountVoList
        detailRecord.receiptList = capitalReceiptRecordVoList
        let creditTotalMoneyPlus = 0
        let creditMoney = 0 
        if(capitalAccountVoList[0]) {
          creditTotalMoneyPlus = capitalAccountVoList[0].creditTotalMoney
          creditMoney = capitalAccountVoList[0].creditMoney
        }
        detailRecord.detailData.creditTotalMoneyPlus = creditTotalMoneyPlus
        detailRecord.detailData.creditMoneyPlus = creditMoney
      }
    }



    onMounted(async() => {
      await getDetail();
    })


    const onChangeStatus = async(type) => {
      const ids = [route.query.id]

      const result = await ElMessageBox.confirm(
        `<strong>提示</strong><br/>
        确认操作`,
        {
          dangerouslyUseHTMLString: true,
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
      if(result !== 'confirm') return
          
      let res = null
      if(type=='withdraw') {
        res = await saleOrderApi.orderWithdraw(ids)
      }
      if(type=='suspend') {
        res = await saleOrderApi.orderSuspend(ids)
      }
      if(type=='close') {
        res = await saleOrderApi.orderClose(route.query.id)
      }
      if(type=='open') {
        res = await saleOrderApi.orderOpen(ids)
      }
      if(type=='submit') {
        res = await saleOrderApi.orderSubmit(ids)
      }
      if(type=='delete') {
        res = await saleOrderApi.orderDelete(ids)
      }

      if(res && res.code =='0') {
        ElMessage.success('操作成功')
        getDetail()
      } else {
        ElMessage.error(res.message)
      }
    }

    const onJump = (type, record = {}) => { 
      if(type=='revision') {
        router.push({
          name:'saleOrderRevision',
          query: {
            id: route.query.id
          }
        })
      }
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
  
    return {
      ...toRefs(detailRecord),
      ...toRefs(tableRecord),
      tableColumns,
      ...toRefs(operatetionTableRecord),
      operatetionTableColumns,
      ...toRefs(sendCarModalRecord),
      onOperationBtnClick,
      getSendCarData,
      onChangeStatus,
      onJump,
      goBack,
      filterText,
      payTypeMap,
      billTypeMap,
    }
  }
}
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
  .blue-box {
    margin-bottom: 24px;
    padding: 16px 24px 24px;
    width: 100%;
    border-radius: 4px;
    background: #f0f5ff;
    border: 1px solid #3c82fe;
    box-sizing: border-box;
    color:#5A78A0;
    .blue-box-list {
      width: 100%;
      background-color: #fff;
      padding: 0 16px;
      box-sizing: border-box;
      .list-item-warp {
        width: 100%;
      }
      .list-item {
        width: 100%;
        height: 52px;
        border-bottom: 1px solid #DCE5ED;
        margin-right: 0;
        align-items: center;
        .name {
          color: #092D5C;
          font-weight: 600;
        }
        .price-yellow {
          color: #F7BA2A;
        }
        .price-grey {
          color: #B7C4D7;
        }
        .price-box {
          display: inline-block;
          background: #F7BA2A;
          border-radius: 4px;
          padding: 0px 6px;
          color: #fff;
          font-weight: 400;
        }
      }
      .list-item:last-child {
        border-bottom: none;
      }
    }
    .blue-box-line {
      width: 100%;
      height: 1px;
      background: #DCE5ED;
      margin-bottom: 16px;
    }
    .blue-box-subtitle {
      margin-bottom: 16px;
    }
  }
  .blue-bg {
    width: 100%;
    background: #F0F5FF;
    border-radius: 4px;
    margin-bottom: 24px;
    padding: 16px 16px 0;
    box-sizing: border-box;
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

.el-overlay {
  .my-dialog {
    border-radius: 4px;
    .el-dialog__header {
      padding: 15px 24px;
      font-size: 16px;
      font-family: PingFangSC-Medium, PingFang SC;
      font-weight: 500;
      color: #3A3A3A;
    }
    .el-dialog__body {
      padding: 24px 0;
      border-top: 1px solid #eee;
      border-bottom: 1px solid #eee;
    }
  }
}
</style>

<template>
  <JDetailContainer
    :autoHeight="true"
    :goBack="goBack"
  >
    <div class="content">
      <MyTitle title="订单修订" icon="icon-pingtai" />
      <div class="subtitle">销售物料</div>
      <MyTable
        className="payment-order-table"
        ref="tableRef"
        :tableData="tableData"
        :columns="tableColumns"
        :selection="false"
        @handleSelectionChange="handleSelectionChange"
      >
        <template v-slot:operation="slotProps">
          <el-input-number
            v-model="tableData[slotProps.index].incrementOutPrice"
            controls-position="right"
            @change="handleChange"
            :precision="2"
          />
        </template>
      </MyTable>

      
      <div v-show="showMore" class="more-content">
        <div class="through-line"></div>
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

      </div>

      <div class="through-line"></div>

      <div class="more" @click="onMore">
        <i :class="`iconfont icon-icon_zuocexialazhankai more-icon 
          ${showMore && 'more-show'}`" />
        向下展开订单详情
      </div>
      
    </div>


    <template #footer>
      <el-button type="primary" @click="onSubmit">重新提交</el-button>
    </template>
    
  </JDetailContainer>
</template>

<script>
import { ref, reactive, toRefs, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import moment from "moment";
import MyContainer from "@/components/MyContainer.vue";
import MyTable from "@/components/MyTable.vue";
import MyPagination from "@/components/MyPagination.vue";
import MySearch from "@/components/MySearch.vue";
import JDetailContainer from "@/components/JDetailContainer.vue";
import JDetailCard from '@/components/JDetailCard.vue';
import MyTitle from "@/components/MyTitle.vue";
import commonApi from "@/request/services/common";
import { saleOrderApi } from "@/request/services/saleMgt";
import { transformArrayData } from "@/utils/index";
import { ElMessage, ElMessageBox } from "element-plus";

export default {
  components: {
    MyContainer,
    MyTable,
    MyPagination,
    MySearch,
    MyTitle,
    JDetailContainer,
    JDetailCard,
  },
  setup() {
    const router = useRouter();
    const route = useRoute()

    const goBack = () => {
      router.go(-1);
      sessionStorage.setItem("saleOrderKey", route.query.tab);
    }

    // const tenantList = ref([]);

    // const getTenantList = () => {
    //   commonApi.getCompany().then((res) => {
    //     if (res && res.code == 0) {
    //       res.data.map((item) => {
    //         item.label = item.name;
    //         item.value = item.id;
    //       });
    //       tenantList.value = res.data;
    //     }
    //   });
    // };
    // getTenantList();


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
          prop: 'tenantId'
        },
        {
          label: '可用额度：',
          prop: 'tenantId'
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
          prop: 'tenantId'
        },
        {
          label: '单据日期：',
          prop: 'billDate'
        },
        {
          label: '散户：',
          prop: ''
        },
        {
          label: '参与调价：',
          prop: ''
        },
        {
          label: '支持尾单处理：',
          prop: 'tenantId'
        },
        {
          label: '同步创建运单：',
          prop: 'isWaybill'
        },
        {
          label: '先票后货：',
          prop: 'isInvoice'
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

    const showMore = ref(false)
    const onMore = () => {
      showMore.value = !showMore.value 
    }


    const tableColumns = [
      { label: "序号", prop: "num", width: 60, fixed: "left" },
      { label: "物料名称", prop: "productName", fixed: "left", width: 160 },
      { label: "物料编码", prop: "productCode", width: 180 },
      { label: "规格", prop: "specification", width: 160 },
      { label: "型号", prop: "modelMaterial", width: 150 },
      { label: "计量单位", prop: "unit", width: 120 },
      { label: "价格单号", prop: "money", width: 120 },
      { label: "数量", prop: "amount", width: 80,fixed: "right" },
      { label: "出厂价", prop: "outPrice", width: 120,fixed: "right" },
      { label: "价税合计", prop: "taxPrice", width: 120,fixed: "right" },
      { label: "本次修订金额", slotName: "operation", width: 180, fixed: "right" },
    ];

    const onSubmit = async() => {
      const params = tableRecord.tableData.map(item => {
        return {
          id: item.id,
          incrementOutPrice: item.incrementOutPrice
        }
      })
      const res = await saleOrderApi.orderRevise(params)
      if(res && res.code==0) {
        ElMessage.success('修订成功')
        getDetail()
      } else{
        ElMessage.error(res.message)
      }
    }

    const getDetail = async() => {
      const { id } = route.query
      const res = await saleOrderApi.getDetail({id})
      if(res && res.code == 0) {
        detailRecord.detailData = res.data
        tableRecord.tableData = transformArrayData(res.data.orderGoodsList, true, true)

        const { capitalAccountVoList=[], capitalReceiptRecordVoList=[]} = res.data
        detailRecord.accountList = capitalAccountVoList
        detailRecord.receiptList = capitalReceiptRecordVoList

        detailRecord.detailData.creditTotalMoneyPlus = 
          capitalAccountVoList[0].creditTotalMoney || 0
        detailRecord.detailData.creditMoneyPlus = 
          capitalAccountVoList[0].creditMoney || 0
      
      }
    }

    onMounted(async() => {
      getDetail();
    })

    onMounted(async() => {

    })

    return {
      ...toRefs(tableRecord),
      tableColumns,
      ...toRefs(detailRecord),
      showMore,
      onMore,
      onSubmit,
      goBack,
    };
  },
};
</script>

<style lang="scss" scoped>
.content {
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
  .more-content {
    transition: all 0.2s ease-in-out;
  }
  .more {
    display: inline-block;
    font-size: 14px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: #3C82FE;
    line-height: 20px;
    cursor: pointer;
    border-bottom: 1px solid;
    .more-icon {
      display: inline-block;
      font-size: 14px;
      transition: all 0.2s ease-in-out;
      transform:rotate(180deg);
    }
    .more-show {
      transform:rotate(90deg);
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
}
</style>
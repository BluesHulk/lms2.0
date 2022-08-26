<template>
  <JDetailContainer>
    <JDetailCard
      title='对账单详情'
      :detailItems="detailItems"
      :detailData="detailData"
    />
    <div class="line" />
    <JTotalBar 
      :totalItems="totalItems"
      :totalData="totalData"
    />
    <MyTable
      className="custom-table"
      ref="tableRef"
      :tableData="tableData"
      :columns="tableColumns"
    />
    <!-- <MyPagination
      :total="tableTotal"
      :queryData="pageParams"
      @paginationChange="paginationChange"
    /> -->

  </JDetailContainer>

</template>

<script>
import { reactive, ref, toRefs, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router'
import { accountStatementApi } from "@/request/services/settlementMangement";
import { transformArrayData } from '@/utils/index'
import MyContainer from '@/components/MyContainer.vue';
import MyTable from '@/components/MyTable.vue';
import MyPagination from '@/components/MyPagination.vue';
import MyForm from '@/components/MyForm.vue';
import JDetailContainer from '@/components/JDetailContainer.vue';
import JDetailCard from '@/components/JDetailCard.vue';
import JTotalBar from '@/components/JTotalBar.vue';
import moment from 'moment';

export default {
  components: {
    MyContainer,
    MyTable,
    MyPagination,
    MyForm,
    JDetailContainer,
    JDetailCard,
    JTotalBar,
  },
  setup() {
    const router = useRouter()
    const route = useRoute()

    const detailRecord = reactive({
      detailItems: [
        {
          label:'单据号：', 
          prop: 'id',
        },
        {
          label:'创建人：', 
          prop: 'createUserName'
        },
        {
          label:'创建时间：', 
          prop: 'createTime'
        },
        {
          label:'审核状态：', 
          prop: 'checkStatus',
          formatter:(row) => {
            return ['未审核','已审核'][row.checkStatus]
          }
        },
        {
          label:'审核人：', 
          prop: 'checkUser',
        },
        {
          label:'审核时间：', 
          prop: 'checkTime'
        },
        {
          label:'单据状态：', 
          prop: 'confirmStatus',
          formatter:(row) => {
            return ['未确认','已确认'][row.confirmStatus]
          }
        },
        {
          label:'确认人：', 
          prop: 'confirmUserName',
        },
        {
          label:'确认时间：', 
          prop: 'confirmTime',
        },
        {
          label:'单据日期：', 
          prop: 'createTime',
        },
        {
          label:'对账单位：', 
          prop: 'customerName',
        },
        {
          label:'对账类型：', 
          prop: 'statementType',
          formatter:(row) => {
            return ['贷款销售对账','贷款采购对账'][row.statementType]
          }
        },
        {
          label:'业务主体：', 
          prop: 'tenantName',
        },
      ],
      detailData: {},
      totalItems: [
        {
          prefix:'总金额',
          suffix: '元',
          prop: 'moneyPlus',
        },
        {
          prefix:'总签收',
          suffix: '吨',
          prop: 'realSignNumPlus',
        },
        {
          prefix:'总实发',
          suffix: '吨',
          prop: 'realReceiveNumPlus',
        },
        {
          prefix:'总实收',
          suffix: '吨',
          prop: 'realReceiveNumPlus',
        },
        {
          prefix:'总实扣',
          suffix: '吨',
          prop: 'realSubtractNumPlus',
        },
      ],
      totalData: {
        moneyPlus: 0,
        realReceiveNumPlus: 0,
        realSendNumPlus: 0,
        realSignNumPlus: 0,
        realSubtractNumPlus: 0,
      },
    })

    const tableRecord = reactive({
      tableRef: null,
      tableData: [],
    })
    const tableColumns = [
      { label: '序号', prop: 'num', width: 60, fixed:'left' },
      {
        label: '单据号',
        prop: 'id',
        width: 150,
        fixed:'left'
      },
      { label: '单据类型', prop: 'totalMoney',
        formatter:(row) => {
          return ['销售发货单','采购发货单'][row.billType]
        }
      },
      { label: '单据日期', prop: 'createTime',
        formatter:(row) => {
          return row.createTime?
          moment(row.createTime).format('YYYY-MM-DD HH:mm:ss'):''
        }
      },
      { label: '业务时间', prop: 'updateTime',
        formatter:(row) => {
          return row.updateTime?
          moment(row.updateTime).format('YYYY-MM-DD HH:mm:ss'):''
        }
      },
      { label: '车牌号', prop: 'carNum' },
      { label: '司机', prop: 'driverName' },
      { label: '所属公司', prop: 'tenantName' },
      { label: '业务客户', prop: 'customerName' },
      { label: '扣款客户', prop: 'deductCustomerName' },
      { label: '开票客户', prop: 'invoiceCustomerName' },
      { label: '物料名称', prop: 'productName' },
      { label: '物料编码', prop: 'productCode' },
      { label: '发货量', prop: 'realSendNum' },
      { label: '到货量', prop: 'realReceiveNum' },
      { label: '货损量', prop: 'realSubtractNum' },
      { label: '出厂价', prop: 'price' },
      { label: '结算价', prop: 'payPrice' },
      { label: '业务部门', prop: 'businessDept' },
      { label: '业务员', prop: 'salesmanName' },
      { label: '运输方式', prop: 'transportType',
        formatter:(row) => {
          return ['自提','一票制包运','流向管控自提'][row.transportType]
        }
      },
      { label: '总金额(元）', prop: 'money' },
    ];

    const totalPlus = (data) => {
      const { subAccounts=[]} = data;
      let moneyPlus = 0
      let realReceiveNumPlus = 0
      let realSendNumPlus = 0
      let realSignNumPlus = 0
      let realSubtractNumPlus = 0
      subAccounts.forEach(item => {
        const { money, realReceiveNum, realSendNum,realSignNum,realSubtract } = item
        moneyPlus += money
        realReceiveNumPlus += realReceiveNum
        realSendNumPlus += realSendNum
        realSignNumPlus += realSignNum
        realSubtractNumPlus += realSubtract
      });
      return {
        moneyPlus,
        realReceiveNumPlus,
        realSendNumPlus,
        realSignNumPlus,
        realSubtractNumPlus
      }
    }

    onMounted(async() => {
      const { id } = route.query
      const res = await accountStatementApi.getDetail({id})
      if(res.code == 0) {
        detailRecord.detailData = res.data
        tableRecord.tableData = tableRecord.tableData = transformArrayData(
          res.data.statementRecordVos,
          true,
          true,
        )
        detailRecord.totalData = totalPlus(res.data)
      }
    })
  
    return {
      ...toRefs(detailRecord),
      ...toRefs(tableRecord),
      tableColumns,
    }

  }
}
</script>
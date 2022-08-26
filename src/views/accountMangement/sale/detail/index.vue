<template>
  <JDetailContainer>
    <JDetailCard
      title='账户详情'
      :detailItems="detailItems"
      :detailData="detailData"
    />
    <div class="line" />
    <div class="content-item">
      <el-button @click="onJump">新增收款单</el-button>
    </div>
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

    <!-- 合并表单 -->
    <CombineForm
      v-if="dialogShow"
      :type="formType"
      :visible ="dialogShow"
      :data="detailData"
      :row="rowData"
      @onClose="dialogShow=false"
      @refresh="getDetail"
    />

  </JDetailContainer>

</template>

<script>
import { reactive, ref, toRefs, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router'
import { saleApi } from '@/request/services/accountMangement';
import { transformArrayData } from '@/utils/index'
import MyContainer from '@/components/MyContainer.vue';
import MyTable from '@/components/MyTable.vue';
import MyPagination from '@/components/MyPagination.vue';
import MyForm from '@/components/MyForm.vue';
import JDetailContainer from '@/components/JDetailContainer.vue';
import JDetailCard from '@/components/JDetailCard.vue';
import JTotalBar from '@/components/JTotalBar.vue';
import CombineForm from './CombineForm.vue'

export default {
  components: {
    MyContainer,
    MyTable,
    MyPagination,
    MyForm,
    JDetailContainer,
    JDetailCard,
    JTotalBar,
    CombineForm,
  },
  setup() {
    const router = useRouter()
    const route = useRoute()

    const detailRecord = reactive({
      detailItems: [
        {
          label:'账户编号：', 
          prop: 'id',
        },
        {
          label:'客户名称：', 
          prop: 'customerName'
        },
        {
          label:'所属供应商：', 
          prop: 'tenantName'
        },
        {
          label:'信用总额(元)：', 
          prop: 'creditTotalMoney',
        },
        {
          label:'已用信额(元)：', 
          prop: 'creditUseMoney'
        },
        {
          label:'可用信额(元)：', 
          prop: 'creditMoney',
        },
      ],
      detailData: {
        accountNo: 'testData',
        id: 2
      },
      totalItems: [
        {
          prefix:'总金额',
          suffix: '元',
          prop: 'totalMoneyPlus',
        },
        {
          prefix:'锁定金额',
          suffix: '元',
          prop: 'lockMoneyPlus',
        },
        {
          prefix:'可用金额',
          suffix: '元',
          prop: 'moneyPlus',
        },
      ],
      totalData: {
        totalMoney: 0,
        lockMoney: 0,
        money: 0,
      },
    })

    const tableRecord = reactive({
      tableRef: null,
      tableData: [],
      // tableTotal: 0,
      // pageParams: {
      //   currentPage: 1,
      //   pageSize: 10,
      // },
      // selectedRows: [],
    })
    const tableColumns = [
      { label: '序号', prop: 'num', width: 60, fixed:'left' },
      {
        label: '子账户编码',
        prop: 'id',
        fixed:'left'
      },
      { label: '客户名称', prop: 'customerName', fixed:'left' },
      { label: '账户类型', prop: 'accountType',
        formatter: (row) => {
          if(row.accountType=="1") return '通用账户';
          if(row.accountType=="2") return '客户子账户';
          if(row.accountType=="3") return '私有子账户';
          return ''
        }
      },
      { label: '总金额(元）', prop: 'totalMoney' },
      { label: '锁定金额(元）', prop: 'lockMoney' },
      { label: '可用金额(元）', prop: 'money' },
      {
        label: '状态',
        prop: 'accountStatus',
        width: 80,
        formatter: (row) => (
          `<span class="status-label" style="background: 
          ${row.status == 1 ? '#32D231' : '#FF3B30'};"></span>
          ${{ 1: '启用', 2: '禁用' }[row.status]}`
        )
      },
      {
        label: '操作',
        width: 80,
        fixed: 'right',
        operatetion: (row) => {
          return [
            { 
              name: '权限', 
              style: {color: '#239cff'}, 
              onClick: onDialog.bind(this, 'permissions', row) 
            },
          ]
        }
      },
    ];
    const formRecord = reactive({
      dialogShow: false,
      formType: '',
      rowData: {}      
    })

    const onDialog = (type, row) => {
      formRecord.dialogShow = true
      formRecord.formType = type
      if(row) {
        formRecord.rowData = row
      }
    }

    const onJump = () => {
      router.push({
        name: 'receiptVoucher'
      })
    }

    const subAccountsPlus = (data) => {
      const { subAccounts=[]} = data;
      let totalMoneyPlus = 0
      let lockMoneyPlus = 0
      let moneyPlus = 0
      subAccounts.forEach(item => {
        const { totalMoney, lockMoney, money } = item
        totalMoneyPlus += totalMoney
        lockMoneyPlus += lockMoney
        moneyPlus += money
      });
      return {
        totalMoneyPlus,
        lockMoneyPlus,
        moneyPlus
      }
    }

    onMounted(async() => {
      const { id } = route.query
      const res = await saleApi.getDetail({id})
      if(res.code == 0) {
        detailRecord.detailData = res.data
        tableRecord.tableData = tableRecord.tableData = transformArrayData(
          res.data.subAccounts,
          true,
          true,
        )
        // detailRecord.totalData = res.data
        detailRecord.totalData = subAccountsPlus(res.data)
      }
    })
  
    return {
      ...toRefs(detailRecord),
      ...toRefs(tableRecord),
      tableColumns,
      ...toRefs(formRecord),
      onJump,
    }

  }
}
</script>
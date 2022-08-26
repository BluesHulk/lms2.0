<template>
  <MyContainer>
  
    <div class="content">
      <MyMultipleFilter
        :formItems="filterItems"
        @onSearch="onSearch"
        :formData="searchParams"
        :slotList="['customerId']"
      >
        <template v-slot:customerId>
          <CustomerSelect
            :placeholder="'请选择'"
            :lockType="2"
            :customerId="searchParams.customerId"
            @selectedCustomer="selectedCustomer"
          />
        </template>

      </MyMultipleFilter>
    
      <MyTable
        className="custom-table"
        ref="tableRef"
        :tableData="tableData"
        :columns="tableColumns"
        @handleSelectionChange="handleSelectionChange"
      />
      <MyPagination
        :total="tableTotal"
        :queryData="pageParams"
        @paginationChange="paginationChange"
      />
    </div>
    
  </MyContainer>
</template>

<script>
import { reactive, ref, toRefs, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router'
import { useStore } from "vuex";
import { statementApi } from '@/request/services/accountMangement';
import commonApi from '@/request/services/common'
import { transformArrayData } from '@/utils/index';
import MyContainer from '@/components/MyContainer.vue';
import MyTable from '@/components/MyTable.vue';
import MyPagination from '@/components/MyPagination.vue';
import MyDrawer from '@/components/MyDrawer.vue';
import MyForm from '@/components/MyForm.vue';
import MyMultipleFilter from '@/components/MyMultipleFilter.vue';
import CustomerSelect from '@/components/CustomerSelect.vue';
import moment from 'moment';

export default {
  components: {
    MyContainer,
    MyTable,
    MyPagination,
    MyDrawer,
    MyForm,
    MyMultipleFilter,
    CustomerSelect,
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const store = useStore();

    const tenantList = ref(computed(() => {
      if(store.state.common.tenantList.length) {
        return store.state.common.tenantList;
      } else {
        store.dispatch('common/getTenantList');
      }
    }));

    const filterRecord = reactive({
      searchParams: {},
      filterItems: [
        {
          type: "select",
          label: "公司名称",
          paramName: "tenantId",
          options: tenantList,
          span: 8,
        },
        {
          type: 'labelBlank',
          label: "所在供应商",
          paramName: "customerId",
          slotName: "customerId",
          span: 8,
        },
        {
          type: "rangePicker",
          label: "交易时间",
          paramName: "time",
          span: 8,
        },
        {
          type: "select",
          multiple: true,
          label: "账户类型",
          paramName: "types",
          options: [
            {label:'收入', value: 1},
            {label:'支出', value: 2},
            {label:'锁定', value: 3},
            {label:'解锁', value: 4},
            {label:'额增', value: 5},
            {label:'额减', value: 6},
          ],
          span: 8,
        },
      ],
    })

    const onSearch = (val) => {
      tableRecord.pageParams.currentPage = 1;
      if (val.time && val.time.length) {
        val.startTime = moment(val.time[0]).format("YYYY-MM-DD 00:00:00");
        val.endTime = moment(val.time[1]).format("YYYY-MM-DD 23:59:59");
        delete val.time;
      }
      filterRecord.searchParams = val;
      getTableData()
    }
    const selectedCustomer = (val) => {
      filterRecord.searchParams.customerId = val.id;
    }


    const tableRecord = reactive({
      tableRef: null,
      tableData: [],
      tableTotal: 0,
      pageParams: {
        currentPage: 1,
        pageSize: 10,
      },
      selectedRows: [],
    })
    const accountTypeMap = new Map([
      ['1', '通用账户'],
      ['2', '客户子账户'],
      ['3', '私有子账户'],
    ])
    const orderTypeMap = new Map([
      [ 1, '采购下单'],
      [ 2, '采购结算'],
      [ 3, '采购退款'],
      [ 4, '财务收款'],
      [ 5, '信用借款'],
      [ 6, '信用还款'],
      [ 7, '额度调整'],
    ])
    const typeMap = new Map([
      [ 1, '收入'],
      [ 2, '支出'],
      [ 3, '锁定'],
      [ 4, '解锁'],
      [ 5, '额增'],
      [ 6, '额减'],
    ])
    const tableColumns = [
      { label: '序号', prop: 'num', width: 60, fixed:'left' },
      { label: '流水号', prop: 'id', fixed:'left',width: 150 },
      { label: '交易时间', prop: 'createTime',width: 180 },
      { label: '公司名称', prop: 'tenantName' },
      { label: '所在供应商', prop: 'customerName' },
      { 
        label: '账户类型', 
        prop: 'accountType',
        width: 100,
        formatter:(row) => accountTypeMap.get(row.accountType) 
      },
      { label: '子账户名称', prop: 'accountName', width: 120 },
      { label: '金额(元）', prop: 'changeMoney',width: 100 },
      { label: '类型', prop: 'type',width: 100,
        formatter:(row) => typeMap.get(row.type)
      },
      { label: '交易类型', prop: 'orderType', width: 100,
        formatter:(row) => orderTypeMap.get(row.orderType)
      },
      { label: '交易单号', prop: 'orderId', fixed:'right',width: 150 },
      { label: '对应流水号', prop: 'rid', fixed:'right',width: 150 },
    ];

    
    const paginationChange = (data) => {
      const { currentPage, pageSize } = tableRecord.pageParams
      if (data.currentPage == currentPage && data.pageSize == pageSize) {
        return
      }
      tableRecord.pageParams = { ...data }
      getTableData()
    }

    const getTableData = async(data={}) => {
      let params = {
        current: tableRecord.pageParams.currentPage,
        size: tableRecord.pageParams.pageSize,
        type: 2,
        ...filterRecord.searchParams,
        ...data
      }
      const res = await statementApi.getTableData(params)
      if (res && res.code == 0) {
        tableRecord.tableTotal = res.data.total;
        tableRecord.tableData = transformArrayData(
          res.data.records,
          true,
          true,
          tableRecord.pageParams.currentPage,
          tableRecord.pageParams.pageSize,
        )
      }
    }

    onMounted(async()=>{
      await getTableData()
    })

    return {
      ...toRefs(filterRecord),
      ...toRefs(tableRecord),
      tableColumns,
      paginationChange,
      onSearch,
      selectedCustomer,
    }

  }
}
</script>
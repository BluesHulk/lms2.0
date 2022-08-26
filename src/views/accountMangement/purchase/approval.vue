<template>
  <MyContainer>
    <!-- <template #top>
      <div class="tabs-container">
        <el-tabs 
          v-model="tabActiveName" 
          class="custom-tabs" 
          @tab-change="onTabs">
          <el-tab-pane
            v-for="item in tabPanes"
            :label="item.label" 
            :name="item.name" 
          />
        </el-tabs>
      </div>
    </template> -->

    <div class="content" v-if="tabActiveName=='1'">
      <MyMultipleFilter
        :formItems="filterItems"
        @onSearch="onSearch"
        :formData="searchParams"
        :slotList="['customerId']"
      >
        <template v-slot:customerId>
          <CustomerSelect
            :placeholder="'请选择'"
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

    <div class="content" v-if="tabActiveName=='2'">
      <MyMultipleFilter
        :formData="searchParams2"
        :formItems="filterItems2"
        @onSearch="onSearch2"
        :slotList="['customerId']"
      >
        <template v-slot:customerId>
          <CustomerSelect
            :placeholder="'请选择'"
            :customerId="searchParams2.customerId"
            @selectedCustomer="selectedCustomer2"
          />
        </template>
      </MyMultipleFilter>
      <MyTable
        className="custom-table"
        ref="tableRef"
        :tableData="tableData2"
        :columns="tableColumns2"
        @handleSelectionChange="handleSelectionChange"
      />
      <MyPagination
        :total="tableTotal2"
        :queryData="pageParams2"
        @paginationChange="paginationChange2"
      />
    </div>

    <!-- 合并表单 -->
    <CombineForm
      v-if="dialogShow"
      type="quota"
      :visible ="dialogShow"
      :data="formData"
      :row="rowData"
      :isEdit="true"
      @onClose="dialogShow=false"
      @refresh="getTableData2"
    />
    
  </MyContainer>
</template>

<script>
import { reactive, ref, toRefs, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router'
import { useStore } from "vuex";
import { saleApi } from '@/request/services/accountMangement';
import { transformArrayData } from '@/utils/index'
import { ElMessage, ElMessageBox } from "element-plus";
import MyContainer from '@/components/MyContainer.vue';
import MyTable from '@/components/MyTable.vue';
import MyPagination from '@/components/MyPagination.vue';
import MyDrawer from '@/components/MyDrawer.vue';
import MyForm from '@/components/MyForm.vue';
import MyMultipleFilter from '@/components/MyMultipleFilter.vue';
import CombineForm from './detail/CombineForm.vue'
import CustomerSelect from '@/components/CustomerSelect.vue';

export default {
  components: {
    MyContainer,
    MyTable,
    MyPagination,
    MyDrawer,
    MyForm,
    MyMultipleFilter,
    CombineForm,
    CustomerSelect,
  },
  setup() {
    const router = useRouter()
    const store = useStore();

    const tenantList = ref(computed(() => {
      if(store.state.common.tenantList.length) {
        return store.state.common.tenantList;
      } else {
        store.dispatch('common/getTenantList');
      }
    }));

    const tabsRecord = reactive({
      tabActiveName: '2',
      tabPanes: [
        {label: '账户列表', name: '1'},
        {label: '调额审批', name: '2'}
      ]
    })
    const onTabs = (val) => {

    }

    const filterRecord = reactive({
      searchParams: {},
      searchParams2: {},
      filterItems: [
        // {
        //   type: "select",
        //   label: "所属公司名称",
        //   paramName: "tenantId",
        //   options: tenantList,
        //   span: 8,
        // },
        // {
        //   type: 'labelBlank',
        //   label: "所在供应商名称",
        //   paramName: "customerId",
        //   slotName: "customerId",
        //   span: 8,
        // },
        {
          type: 'labelBlank',
          label: "所属公司名称",
          paramName: "customerId",
          slotName: "customerId",
          span: 8,
        },
        {
          type: "select",
          label: "所在供应商名称",
          paramName: "tenantId",
          options: tenantList,
          span: 8,
        },  
        {
          type: "select",
          label: "账户状态",
          paramName: "status",
          options: [
            {label:'全部',value: ''},
            {label:'启用',value: 1},
            {label:'禁用',value: 2},
          ],
          span: 8,
        },
      ],
      filterItems2: [
        {
          type: "select",
          label: "公司名称",
          paramName: "tenantId",
          options: tenantList,
          span: 8,
        },
        {
          type: 'labelBlank',
          label: "供应商名称",
          paramName: "customerId",
          slotName: "customerId",
          span: 8,
        },
        {
          type: "select",
          label: "账户状态",
          paramName: "checkStatus",
          options: [
            {label:'全部',value: ''},
            {label:'已审核',value: 1},
            {label:'未审核',value: 0},
          ],
          span: 8,
        },
        {
          type: "input",
          label: "子账户编码",
          paramName: "subAccountId",
          span: 8,
        },
        {
          type: "input",
          label: "子账户名称",
          paramName: "subAccountName",
          span: 8,
        },
      ],
    })

    const selectedCustomer = (val) => {
      filterRecord.searchParams.customerId = val.id;
    }
    const selectedCustomer2 = (val) => {
      filterRecord.searchParams2.customerId = val.id;
    }


    const tableRecord = reactive({
      tableRef: null,
      tableData: [],
      tableTotal: 0,
      pageParams: {
        currentPage: 1,
        pageSize: 10,
      },
      // selectedRows: [],
      tableData2: [],
      tableTotal2: 0,
      pageParams2: {
        currentPage: 1,
        pageSize: 10,
      },
    })
    const tableColumns = [
      { label: '序号', prop: 'num', width: 60, fixed:'left' },
      { label: '公司名称', prop: 'customerName'},
      { label: '所在供应商', prop: 'tenantName' },
      { label: '总金额(元）', prop: 'totalMoney' },
      { label: '锁定金额(元）', prop: 'lockMoney' },
      { label: '剩余可用金额(元）', prop: 'money' },
      { label: '信用总额(元）', prop: 'creditTotalMoney' },
      { label: '已用信用(元）', prop: 'creditUseMoney' },
      { label: '剩余信用(元）', prop: 'creditMoney' },
      {
        label: '账户状态',
        prop: 'status',
        width: 80,
        formatter: (row) => (
          `<span class="status-label" style="background: 
          ${row.status == 1 ? '#32D231' : '#FF3B30'};"></span>
          ${{ 1: '启用', 2: '停用' }[row.status]}`
        )
      },
      {
        label: '操作',
        width: 120,
        fixed: 'right',
        operatetion: (row) => {
          return [
            { 
              name: '详情', 
              style: {color: '#239cff'}, 
              onClick: onDetail.bind(this, row.id) 
            },
          ]
        }
      },
    ];
    const tableColumns2 = [
      { label: '序号', prop: 'num', width: 60, fixed:'left' },
      { label: '主账户编号', prop: 'accountId',width: 120},
      { label: '公司名称', prop: 'tenantName',width: 120},
      { label: '所在供应商', prop: 'customerName',width: 120 },
      { label: '子账户编号', prop: 'subCustomerId',width: 120},
      { label: '子账户名称', prop: 'subAccountName',width: 120},
      { label: '客户名称', prop: 'subCustomerName',width: 120},
      { label: '总金额(元）', prop: 'oldTotalMoney',width: 120 },
      { label: '锁定金额(元）', prop: 'lockMoney',width: 120 },
      { label: '剩余可用金额(元）', prop: 'oldMoney',width: 150 },
      { label: '调后总额(元）', prop: 'newTotalMoney',width: 120 },
      { label: '调后可用金额(元）', prop: 'newMoney',width: 150 },
      {
        label: '审核状态',
        prop: 'checkStatus',
        width: 100,
        formatter: (row) => (
          `<span class="status-label" style="background: 
          ${row.checkStatus == 1 ? '#32D231' : '#FF3B30'};"></span>
          ${{ 1: '已审核', 0: '未审核' }[row.checkStatus]}`
        )
      },
      { label: '审核人', prop: 'checkUserName',width: 120 },
      { label: '审核时间', prop: 'checkTime',width: 180, },
      {
        label: '操作',
        width: 150,
        fixed: 'right',
        operatetion: (row) => {
          if(row.checkStatus==1) {
            return [
              { 
                name: '-', 
                style: {color: '#239cff',width: '100%',cursor:"default"},
                onClick: ()=>{}
              }
            ]
          }
          return [
            { 
              name: '审核', 
              style: {color: '#239cff'}, 
              onClick: onCheck.bind(this, row.id) 
            },
            { 
              name: '编辑', 
              style: {color: '#239cff'}, 
              onClick: onEdit.bind(this, row) 
            },
            { 
              name: '删除', 
              style: {color: '#239cff'}, 
              onClick: onDelete.bind(this, row.id) 
            },
          ]
        }
      },
    ];

    const onDetail = (id) => {
      router.push({
        name: 'purchaseDetail',
        query: { id }
      })
    }
    const onCheck = async(id) => {
      const result = await ElMessageBox.confirm(
        `<strong>审核通过</strong><br/>
        该调额信息无误，确定审核通过？`,
        {
          dangerouslyUseHTMLString: true,
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
      if(result!=='confirm') return
      const res = await saleApi.quotaCheck({id})
      if(res.code=='0') {
        ElMessage.success("操作成功！");
        getTableData2()
      } else {
        ElMessage.error(res.message);
      }
    }
    const onDelete = async(id) => {
      const result = await ElMessageBox.confirm(
        `<strong>提示</strong><br/>
        确定该条调额审批？`,
        {
          dangerouslyUseHTMLString: true,
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
      if(result!=='confirm') return
      const res = await saleApi.quotaDelete({id})
      if(res.code=='0') {
        ElMessage.success("操作成功！");
        getTableData2()
      } else {
        ElMessage.error(res.message);
      }
    }
    const onEdit = (row) => {
      formRecord.formData= {id: row.id}
      formRecord.rowData = {
        id: row.accountId,
        accountType: row.accountType,
        accountName: row.subAccountName,
        totalMoney: row.newTotalMoney,
        lockMoney: row.lockMoney,
        money: row.oldMoney,
        newTotalMoney: row.newTotalMoney
      }
      formRecord.dialogShow= true
    }

    const onSearch = (val) => {
      tableRecord.pageParams.currentPage = 1;
      filterRecord.searchParams = val;
      getTableData()
    }
    const onSearch2 = (val) => {
      tableRecord.pageParams2.currentPage = 1;
      filterRecord.searchParams2 = val;
      getTableData2()
    }

    const paginationChange = (data) => {
      const { currentPage, pageSize } = tableRecord.pageParams
      if (data.currentPage == currentPage && data.pageSize == pageSize) {
        return
      }
      tableRecord.pageParams = { ...data }
      getTableData()
    }
    const paginationChange2 = (data) => {
      const { currentPage, pageSize } = tableRecord.pageParams2
      if (data.currentPage == currentPage && data.pageSize == pageSize) {
        return
      }
      tableRecord.pageParams2 = { ...data }
      getTableData2()
    }

    const getTableData = async(data={}) => {
      let params = {
        current: tableRecord.pageParams.currentPage,
        size: tableRecord.pageParams.pageSize,
        ...filterRecord.searchParams,
        ...data
      }
      const res = await saleApi.getTableData(params)
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
    const getTableData2 = async(data={}) => {
      let params = {
        current: tableRecord.pageParams2.currentPage,
        size: tableRecord.pageParams2.pageSize,
        type: 2,
        ...filterRecord.searchParams2,
        ...data
      }
      const res = await saleApi.getQuotaTableData(params)
      if (res && res.code == 0) {
        tableRecord.tableTotal2 = res.data.total;
        tableRecord.tableData2 = transformArrayData(
          res.data.records,
          true,
          true,
          tableRecord.pageParams2.currentPage,
          tableRecord.pageParams2.pageSize,
        )
      }
    }

    const formRecord = reactive({
      dialogShow: false,
      formData: {},
      rowData: {},
    })


    onMounted(async()=>{
      // await getTableData()
      await getTableData2()
    })

    
    return {
      ...toRefs(tabsRecord),
      onTabs,
      ...toRefs(filterRecord),
      ...toRefs(tableRecord),
      tableColumns,
      tableColumns2,
      paginationChange,
      paginationChange2,
      onSearch,
      onSearch2,
      ...toRefs(formRecord),
      getTableData2,
      selectedCustomer,
      selectedCustomer2,
    }

  }
}
</script>
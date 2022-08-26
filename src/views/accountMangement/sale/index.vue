<template>
  <MyContainer>
    <template #header>
      <el-button type="primary" @click="onAdd">新增</el-button>
    </template>
    <template v-slot:header-right>
      <MySearch
        :initConditionValue="conditionValue"
        :searchCondition="searchCondition"
        @onSearch="onFuzzySearch"
      />
      <AdvancedFilterBtn
        style="margin-left: 12px"
        @getBtnStatus="getAdvancedBtnStatus"
      />
    </template>
    <div class="content">
      
      <MyMultipleFilter
        v-if="advancedFilterShow"
        :formItems="filterItems"
        @onSearch="onSearch"
        :formData="searchParams"
        :slotList="['customerId']"
      >
        <template v-slot:customerId>
          <CustomerSelect
            :placeholder="'请选择'"
            :lockType="1"
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

    <!-- 隐藏新增 -->
    <!-- <div style="display: none;">
      <CustomerSelect
        ref="addRef"
        @selectedCustomer="selectedAddCustomer"
      />
    </div> -->

    <div style="display: none;">
      <PersonnelModal
        modalTitle="选择客户"
        ref="addRef"
        type="1"
        :data="selectedCustomerData"
        @getSelected="selectedAddCustomer"
      >
      </PersonnelModal>
    </div>

  </MyContainer>
</template>

<script>
import { reactive, ref, toRefs, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from "vuex";
import { saleApi } from '@/request/services/accountMangement';
import { ElMessage, ElMessageBox } from "element-plus";
import { transformArrayData } from '@/utils/index'
import MyContainer from '@/components/MyContainer.vue';
import MyTable from '@/components/MyTable.vue';
import MyPagination from '@/components/MyPagination.vue';
import MyDrawer from '@/components/MyDrawer.vue';
import MyForm from '@/components/MyForm.vue';
import MyMultipleFilter from '@/components/MyMultipleFilter.vue';
import MySearch from "@/components/MySearch.vue";
import AdvancedFilterBtn from "@/components/AdvancedFilterBtn.vue";
import CustomerSelect from '@/components/CustomerSelect.vue';
import PersonnelModal from "@/components/commonModal/Multiple/PersonnelModal.vue";

export default {
  components: {
    MyContainer,
    MyTable,
    MyPagination,
    MyDrawer,
    MyMultipleFilter,
    MySearch,
    AdvancedFilterBtn,
    MyForm,
    CustomerSelect,
    PersonnelModal,
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

    const filterRecord = reactive({
      advancedFilterShow: false,
      searchParams: {},
      conditionValue: "tenantName",
      searchCondition: [
        {
          label: "所属公司名称",
          value: "tenantName",
        },
      ],
      filterItems: [
        {
          type: "select",
          label: "所属公司名称",
          paramName: "tenantId",
          options: tenantList,
          span: 8,
        },
        {
          type: 'labelBlank',
          label: "客户名称",
          paramName: "customerId",
          slotName: "customerId",
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
    })

    const getAdvancedBtnStatus = (status) => {
      filterRecord.advancedFilterShow = status;
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
    })
    const tableColumns = [
      { label: '序号', prop: 'num', width: 60, fixed:'left' },
      {
        label: '账户编号',
        prop: 'id',
        width: 150,
        fixed:'left'
      },
      { label: '公司名称', prop: 'tenantName' },
      { label: '客户名称', prop: 'customerName' },
      { label: '总金额(元）', prop: 'totalMoney' },
      { label: '锁定金额(元）', prop: 'lockMoney' },
      { label: '剩余可用金额(元）', prop: 'money' },
      // { label: '信用总额(元）', prop: 'creditTotalMoney' },
      // { label: '已用信用(元）', prop: 'creditUseMoney' },
      // { label: '剩余信用(元）', prop: 'creditMoney' },
      {
        label: '账户状态',
        prop: 'status',
        width: 90,
        formatter: (row) => (
          `<span class="status-label" style="background: 
          ${row.status == 1 ? '#32D231' : '#FF3B30'};"></span>
          ${{ 1: '启用', 2: '禁用' }[row.status]}`
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
            {
              name: row.status===2?'启用': '禁用',
              style: {color: '#239cff'},
              onClick: onUpdateStatus.bind(this, row)
            }
          ]
        }
      },
    ];

    const onDetail = (id) => {
      router.push({
        name: 'saleDetail',
        query: { id }
      })
    }
    const onUpdateStatus = async(row) => {
      const result = await ElMessageBox.confirm(
        `<strong>提示</strong><br/>
        确定${row.status===2?'启用': '禁用'}该账户？`,
        {
          dangerouslyUseHTMLString: true,
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
      if(result=="confirm") {
        let params = {
          id: row.id,
          status: row.status===1?2:1
        }
        const res = await saleApi.updateSatus(params)
        if(res && res.code==0) {
          ElMessage.success("操作成功！");
          getTableData()
        }
      }
    }

    const onSearch = (val) => {
      tableRecord.pageParams.currentPage = 1;
      filterRecord.searchParams = val;
      getTableData()
    }
    const selectedCustomer = (val) => {
      filterRecord.searchParams.customerId = val.id;
    }

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
        type: 1, //销售
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

    onMounted(async()=>{
      await getTableData()
    })

    const addRef= ref(null)
    const selectedCustomerData = ref([])
    const onAdd = () => {
      // console.log(addRef.value)
      addRef.value.$el.nextElementSibling.click()
      // document.getElementById('personnelModal').click();
      // addRef.value.onShow()
    }
    const selectedAddCustomer = async (val=[]) => {
      // console.log(val, "addCustomer")
      selectedCustomerData.value = val
      if(val.length<1) {
        return ElMessage.warning('请至少选择1个客户')
      }
      const result = await ElMessageBox.confirm(
        `<strong>提示</strong><br/>
        确定新增${val.length}条客户账户？`,
        {
          dangerouslyUseHTMLString: true,
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
      if(result !== 'confirm') return
      selectedCustomerData.value = []
      // const homeInfoStr = sessionStorage.getItem("homeInfo")
      // const homeInfo = JSON.parse(homeInfoStr)
      // let params = {
      //   customerId: val.id,
      //   customerName: val.name,
      //   tenantId: homeInfo.tenantId,
      //   tenantName: homeInfo.tenantName,
      // }
      let params = val.map(item => {
        return {
          customerId: item.id,
          customerName: item.name,
          tenantId: item.tenantId,
          tenantName: item.tenantName,
        }
      })
      const res = await saleApi.addAccountBacth(params)
      if(res && res.code==0) {
        ElMessage.success('添加成功')
        getTableData()
      } else {
        ElMessage.error(res.message)
      }
    }

    return {
      ...toRefs(filterRecord),
      ...toRefs(tableRecord),
      tableColumns,
      paginationChange,
      onSearch,
      selectedCustomer,
      addRef,
      selectedCustomerData,
      onAdd,
      selectedAddCustomer,
      getAdvancedBtnStatus,
    }

  }
}
</script>
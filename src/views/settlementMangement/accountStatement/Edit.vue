<template>
  <JDetailContainer>
    <MyTitle :title="'新增对账单'" icon="icon-pingtai" style="margin-bottom: 24px"/>
    <MyForm
      ref="formRef"
      labelPosition="left"
      :formItems="formItems"
      :rules="formRules"
      :formData="formData"
      @onFormItemChange="onFormItemChange"
      @submitForm="submitForm"
    >
      <template v-slot:customerSlot>
        <CustomerSelect
          placeholder="请选择"
          :customerId="formData.customerId"
          @selectedCustomer="val => selectedCustomer(val, 'customer')"
        />
      </template>
      <template v-slot:deductCustomerSlot>
        <CustomerSelect
          placeholder="请选择"
          :customerId="formData.deductCustomerId"
          @selectedCustomer="val => selectedCustomer(val, 'deductCustomer')"
        />
      </template>
      <template v-slot:invoiceCustomerSlot>
        <CustomerSelect
          placeholder="请选择"
          :customerId="formData.invoiceCustomerId"
          @selectedCustomer="val => selectedCustomer(val, 'invoiceCustomer')"
        />
      </template>
    </MyForm>
    <div class="content-item btns">
      <el-button type="primary" @click="onSearch">搜索</el-button>
      <el-button @click="onReset">清空</el-button>
    </div>
    <div class="line" />
    <JTotalBar 
      :totalItems="totalItems"
      :totalData="totalData"
    />
    <MyTable
      className="custom-table"
      ref="tableRef"
      :selection="true"
      :tableData="tableData"
      :columns="tableColumns"
      @handleSelectionChange="handleSelectionChange"
      tableHeight="310"
    />
    <!-- <MyPagination
      :total="tableTotal"
      :queryData="pageParams"
      @paginationChange="paginationChange"
    /> -->
    <template #footer>
      <el-button type="primary" @click="onSubmit">
        生成对账单
      </el-button>

    </template>

  </JDetailContainer>

</template>

<script>
import { reactive, ref, toRefs, onMounted, computed } from "vue";
import moment from "moment";
import { useStore } from "vuex";
import { ElMessage, ElMessageBox } from "element-plus";
import MyContainer from "@/components/MyContainer.vue";
import MyForm from "@/components/MyForm.vue";
import MyTitle from "@/components/MyTitle.vue";
import MyTable from "@/components/MyTable.vue";
import JDetailContainer from "@/components/JDetailContainer.vue";
import JTotalBar from '@/components/JTotalBar.vue';
import config from "@/utils/config";
import commonApi from "@/request/services/common";
import { accountStatementApi } from "@/request/services/settlementMangement";
import { transformArrayData } from "@/utils/index";
import CustomerSelect from "@/components/CustomerSelect.vue";

export default {
  components: { 
    MyContainer, 
    MyForm, 
    MyTitle, 
    MyTable, 
    JDetailContainer,
    JTotalBar,
    CustomerSelect
  },
  setup() {
    const store = useStore();

    const tenantList = ref(computed(() => {
      if(store.state.common.tenantList.length) {
        return store.state.common.tenantList;
      } else {
        store.dispatch('common/getTenantList');
      }
    }));

    const formRecord = reactive({
      formRef: null,
      formData: {
        statementType: 1,
      },
      formDataCache: {}, //当前搜索结果数据,
      formItems: [
        {
          type: "select",
          label: "对账类型",
          paramName: "statementType",
          options: [
            {label:'贷款销售对账', value:1},
            {label:'贷款采购对账', value:2},
          ],
          span: 8,
          disabled: true,
        },
        {
          type: "rangePicker",
          label: "业务时间",
          paramName: "time",
          span: 8,
        },
        {
          type: "select",
          label: "业务主体",
          paramName: "tenantId",
          options: tenantList,
          span: 8,
        },        
        {
          type: "labelBlank",
          label: "扣款客户",
          paramName: "deductCustomerId",
          slotName: "deductCustomerSlot",
          span: 8,
        },
        {
          type: "labelBlank",
          label: "业务客户",
          paramName: "customerId",
          slotName: "customerSlot",
          span: 8,
        },
        {
          type: "labelBlank",
          label: "开票客户",
          paramName: "invoiceCustomerId",
          slotName: "invoiceCustomerSlot",
          span: 8,
        },
      ],

      formRules: {
        statementType: [config.rules({ type: "required" })],
        tenantId: [config.rules({ type: "required" })],
        customerId: [config.rules({ type: "required" })],
      }
    });

    const totalRecord = reactive({
      totalItems: [
        {
          prefix:'已选',
          suffix: '单',
          prop: 'selectedNum',
        },
        {
          prefix:'共计',
          suffix: '元',
          prop: 'totalMoney',
        },
        {
          prefix:'总结算量',
          suffix: '吨',
          prop: 'totalWeight',
        },
      ],
      totalData: {
        selectedNum: 0,
        totalMoney: 0,
        totalWeight: 0,
      },
    })

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

    const tableColumns = [
      { label: '序号', prop: 'num', width: 60, fixed:'left' },
      {
        label: '单据号',
        prop: 'id',
        fixed:'left'
      },
      { label: '单据类型', prop: 'billType' },
      { label: '单据日期', prop: 'billDate' },
      { label: '车牌', prop: 'licensePlate' },
      { label: '司机', prop: 'driverName' },
      { label: '所属公司', prop: 'tentantName' },
      { label: '业务客户', prop: 'customerName' },
      { label: '扣款客户', prop: 'deductCustomerName' },
      { label: '开票客户', prop: 'invoiceCustomerName' },
      { label: '物料名称', prop: 'productName' },
      { label: '物料编码', prop: 'productCode' },
      { label: '发货量', prop: 'outAmount' },
      { label: '到货量', prop: 'arrivalAmount' },
      { label: '货损量', prop: 'lossAmount' },
      { label: '出厂价', prop: 'outPrice' },
      { label: '结算价', prop: 'settlementPrice' },
      { label: '业务部门', prop: 'deptName' },
      { label: '业务员', prop: 'salesmanName' },
      { label: '运输方式', prop: 'transportType',
        formatter: (row) => {
          return ['自提','一票制包运','流向管控自提'][row.transportType]
        }
      },
      { label: '总金额(元）', prop: 'totalMoney' },
    ];

    const toSearchParams = () => {
      let params = {
        ...formRecord.formData
      }
      if(params.time && params.time[0]) {
        params.outTimeStart = moment(params.time[0]).format('YYYY-MM-DD 00:00:00')
        params.outTimeEnd = moment(params.time[1]).format('YYYY-MM-DD 23:59:59')
        delete params.time
      }
      return params

    }

    const getTableData = async() => {
      let params={
        current: 1,
        size: 9999,
        // ...formRecord.formData
        ...toSearchParams()
      }
      
      const res = await accountStatementApi.getDpOrderList(params)
      if(res && res.code==0) {
        tableRecord.tableTotal = res.data.total;
        tableRecord.tableData = res.data.records;
        transformArrayData(
          tableRecord.tableData,
          true,
          true,
          tableRecord.pageParams.currentPage,
          tableRecord.pageParams.pageSize
        );

        formRecord.formDataCache = formRecord.formData
      }
    }

    // 客户
    const selectedCustomer = (val, type) => {
      if(type=='customer') {
        // console.log(val,"customer")
        formRecord.formData.customerId = val.id;
        formRecord.formData.customerName = val.name;
      }
      if(type=='deductCustomer') {
        formRecord.formData.deductCustomerId = val.id;
        formRecord.formData.deductCustomerName = val.name;
      }
      if(type=='invoiceCustomer') {
        formRecord.formData.invoiceCustomerId = val.id;
        formRecord.formData.invoiceCustomerName = val.name;
      }
    };

    const handleSelectionChange = (val) => {
      tableRecord.selectedRows = val
      let totalMoney = 0
      let totalWeight = 0
      val.forEach(i => {
        totalMoney += i.settlementMoney
        totalMoney += i.settlementAmount
      })
      totalRecord.totalData= {
        selectedNum: val.length,
        totalMoney,
        totalWeight,
      }
    }

    const onSearch = async() => {
      const result = await formRecord.formRef.submitForm()
      if(result) {
        getTableData()
      }    
    }
    const onReset = async() => {
      formRecord.formData = { statementType: 1, }
      tableRecord.tableData = []
    }

    const toParams = () => {
      let params ={
        tenantId: formRecord.formDataCache.tenantId,
        tenantName:'',
        customerId: formRecord.formDataCache.customerId,
        customerName: formRecord.formDataCache.customerName,
        statementType: formRecord.formDataCache.statementType,
        statementRecordQos: []
      }
      params.statementRecordQos = toStatementRecords(tableRecord.selectedRows)
      if(formRecord.formDataCache.tenantId) {
        const obj = tenantList.value.find(i => 
          i.value == formRecord.formDataCache.tenantId)
        params.tenantName = obj.label
      }
      return params
    }

    const toStatementRecords = (data=[]) => {
      return data.map(row => {
        const {
          deptName,
          licensePlate,

          settlementPrice,
          outPrice,
          outAmount,
          arrivalAmount,
          lossAmount

        } = row

        return {
          ...row,
          billType: 1,
          carNum: licensePlate,
          // deductCustomerId:'',
          // deductCustomerName:'',
          // money:'',
          payPrice: settlementPrice,
          price: outPrice,
          // productId:'',
          realReceiveNum:arrivalAmount,
          realSendNum:outAmount,
          // realSignNum: '',
          realSubtractNum:lossAmount,
        }
      })

      

    }

    const onSubmit = async() => {
      if(tableRecord.selectedRows.length==0) {
        return ElMessage.warning('至少选择一项')
      }
      const result = await ElMessageBox.confirm(
        `<strong>生成提示</strong><br/>
        确定生成对账单？`,
        {
          dangerouslyUseHTMLString: true,
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
      if(result!=='confirm') return

      const params = toParams()
      const res = await accountStatementApi.toSave(params)
      if(res && res.code == 0) {
        ElMessage.success('操作成功')
      } else {
        ElMessage.error(res.message)
      }
    }

    onMounted(() => {
      // getTableData()
    })

    return {
      ...toRefs(formRecord),
      ...toRefs(totalRecord),
      ...toRefs(tableRecord),
      tableColumns,
      selectedCustomer,
      handleSelectionChange,
      onSearch,
      onReset,
      onSubmit,
    };
  },
};
</script>

<style lang="scss" scoped>
.btns {
  text-align: center;
  margin-top: 12px;
}
</style>
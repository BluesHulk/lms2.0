<template>
  <JDetailContainer
    :goBack="goBack"
  >
  <div class="content">
    <MyTitle :title="temp==2?'价格单新增':'自制新增'" icon="icon-pingtai" />
    <div class="subtitle">销售公司</div>
    <MyForm
      ref="companyFormRef"
      labelPosition="left"
      :formItems="companyFormItems"
      :rules="companyRules"
      :formData="formData"
      @onFormItemChange="onFormItemChange"
      @submitForm="submitForm"
    />
    <div class="subtitle">客户信息</div>
    <div class="placeholder-box" v-if="!formData.tenantId">
      请先选择销售公司
    </div>
    <template v-else>
      <MyForm
        ref="customerFormRef"
        labelPosition="left"
        :formItems="customerFormItems"
        :rules="customerRules"
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
            :disabled="true"
          />
        </template>
        <template v-slot:invoiceCustomerSlot>
          <CustomerSelect
            placeholder="请选择"
            :customerId="formData.invoiceCustomerId"
            @selectedCustomer="val => selectedCustomer(val, 'invoiceCustomer')"
            :disabled="true"
          />
        </template>
        <template v-slot:customerOrderSlot>
          <!-- <CustomerSelect
            placeholder="请选择"
            :customerId="formData.customerOrder"
            @selectedCustomer="selectedCustomer"
          /> -->
          <el-input
            v-model="formData.priceId"
            placeholder="请先选择客户"
            @click="priceOrderModalShow=true" 
            :disabled="customerPriceDisable"
            readonly
          >
            <template #suffix>
              <i class="iconfont icon-a-16search"></i>
            </template>
          </el-input>
        </template>
      </MyForm>
      <div v-if="accountShow" class="blue-box">
        <el-row style="margin-bottom: 12px">
          <el-col :span="8">
            <div class="name">扣款客户：{{formData.deductCustomerName}}</div>
          </el-col>
          <el-col :span="8">
            <div>授信额度：
              <span class="price-yellow">{{creditPlus.creditTotalMoneyPlus}}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div>可用额度：
              <span class="price-grey">{{creditPlus.creditMoneyPlus}}</span>
            </div>
          </el-col>
        </el-row>
        <JDetailCard />
        <div class="blue-box-line"></div>
        <div class="blue-box-subtitle">选择扣款账户：</div>
        <div class="blue-box-list">
          <el-radio-group 
            v-model="formRelatedData.deductAccountId" 
            class="list-item-warp"
          >
            <el-radio  
              v-for="(item,index) in accountList" 
              :label="item.id" 
              size="large"
              class="list-item"
            >
              <el-row>
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
            </el-radio>
          </el-radio-group>
        </div>
      </div>
    </template>
    
    <div class="subtitle">订单信息</div>
    <div class="placeholder-box" v-if="!formData.tenantId">
      请先选择销售公司
    </div>
    <template v-else>
      <MyForm
        ref="orderFormRef"
        labelPosition="left"
        :formItems="orderFormItems"
        :rules="orderRules"
        :formData="formData"
        @onFormItemChange="onFormItemChange"
        @submitForm="submitForm"
      >
        <template v-slot:deptName>
          <el-input
            v-model="formData.deptName"
            placeholder="请选择"
            @click="depModalShow=true"
            readonly
          >
            <template #suffix>
              <i class="iconfont icon-a-16search"></i>
            </template>
          </el-input>
        </template>
        <template v-slot:salesmanName>
          <el-input
            v-model="formData.salesmanName"
            placeholder="请选择"
            @click="salesmanModalShow = true" 
            readonly
          >
            <template #suffix>
              <i class="iconfont icon-a-16search"></i>
            </template>
          </el-input>
        </template>
      </MyForm>
      <div v-if="receiptOrderShow" class="blue-box">
        <div class="blue-box-subtitle">资金核销：</div>
        <div class="blue-box-line"></div>
        <div class="blue-box-subtitle">选择核销单据：</div>
        <div class="blue-box-list">
          <el-checkbox-group 
            v-model="formRelatedData.receiptRecordIds" 
            class="list-item-warp"
          >
            <el-checkbox  
              v-for="(item,index) in receiptOrderList" 
              :label="item.id" 
              size="large"
              class="list-item"
            >
            <el-row>
              <el-col :span="5">
                <div class="name">收款单：
                  <span class="price-box">{{ payTypeMap.get(item.payType) }}</span>
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
                  <span class="price-grey">{{ billTypeMap.get(item.billType) }}</span>
                </div>
              </el-col>
              <el-col :span="4">
                <div>单据日期：
                  <span class="price-grey">{{item.createTime}}</span>
                </div>
              </el-col>
            </el-row>
            </el-checkbox>
          </el-checkbox-group>
        </div>
      </div>
      <div class="type-box">
        <el-checkbox 
          v-model="formRelatedData.isAdjust" 
          :label="1" size="large">
          参与调价
        </el-checkbox>
        <el-checkbox 
          v-model="formRelatedData.isTail" 
          :label="1" size="large">
          支持尾单处理
        </el-checkbox>
        <el-checkbox 
          v-model="formRelatedData.isInvoice" 
          :label="1" size="large">
          先票后货
        </el-checkbox>
        <el-checkbox 
          v-model="formRelatedData.isWaybill" 
          :label="1" size="large" :disabled="formData.transportType">
          同步创建运单
        </el-checkbox>
        <el-form
          v-if="invoiceNumShow"
          :model="formRelatedData" 
          label-position="left" 
          label-width="80px"
        >
          <el-form-item label="发票号:" prop="invoiceNum"
            :rules="[{required:true, message:'不能为空',trigger:'change'}]"
          >
            <el-input 
              v-model="formRelatedData.invoiceNum" 
              style="width:200px"
            />
          </el-form-item>
        </el-form>
      </div>
      <MyForm
        v-if="formData.tenantId"
        ref="remarkFormRef"
        labelPosition="left"
        :formItems="remarkFormItems"
        :formData="formData"
        @onFormItemChange="onFormItemChange"
        @submitForm="submitForm"
      />
    </template>

    <div class="subtitle">销售物料</div>
    <div class="placeholder-box" v-if="!formData.tenantId">
      请先选择销售公司
    </div>
    <template v-else>
      <div v-if="temp==1" class="btn-box">
        <el-button type="text" class="btn-item" @click="modalShow=true">
          <i class="iconfont icon-tianjia3"></i>
          <span>添加物料</span>
        </el-button>
        <el-button type="text" class="btn-item" @click="onDeleteMaterial">
          <i class="iconfont icon-yichu"></i>
          <span>批量移除</span>
        </el-button>
      </div>
      <MyTable
        className=""
        ref="tableRef"
        :tableData="tableData"
        :columns="tableColumns"
        :selection="true"
        @handleSelectionChange="handleSelectionChange"
      >
        <template v-slot:amount="slotProps">
          <el-input-number
            v-model="tableData[slotProps.index].amount"
            controls-position="right"
            :precision="0"
            placeholder="请输入"
            @change="val => handleChangeNumber(val, slotProps.index,'amount')"
          />
        </template>
        <template v-slot:outPrice="slotProps">
          <el-input-number
            v-model="tableData[slotProps.index].outPrice"
            controls-position="right"
            :precision="2"
            placeholder="请输入"
            @change="val => handleChangeNumber(val, slotProps.index,'outPrice')"
            :disabled="temp==2"
          />
        </template>
        <template v-slot:taxPrice="slotProps">
          <el-input-number
            v-model="tableData[slotProps.index].taxPrice"
            controls-position="right"
            :precision="2"
            placeholder="等待计算"
            :disabled="true"
          />
        </template>
      </MyTable>
    </template>
  </div>

  <template #footer>
    <el-button @click="onSubmit(0)">保存草稿</el-button>
    <el-button type="primary" @click="onSubmit(1)">完成新建</el-button>
  </template>
  </JDetailContainer>

  <MaterialModal 
    :visible="modalShow"
    @onClose="modalShow=false" 
    @getSelected="getSelected"
  />
  <DepartmentModal 
    :visible="depModalShow"
    @onClose="depModalShow=false"
    @onSelected="getDepModal"
  />
  <!-- <SalesmanModal
    :visible="salesmanModalShow"
    @onClose="salesmanModalShow=false"
    @onSelected="getSalesmanModal"
  /> -->
  <PersonnelTreeModal
    :visible="salesmanModalShow"
    modalTitle="专管业务员"
    @onClose="salesmanModalShow=false"
    @onSelected="getSalesmanModal"
  />
  <PriceOrderModal
    :visible="priceOrderModalShow"
    @onClose="priceOrderModalShow=false"
    @onSelected="getPriceOrderModal"
    :initData="priceOrderModalInitData"
  />
  

</template>

<script>
import { ref, reactive, toRefs, onMounted, watch, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useStore } from "vuex";
import commonApi from "@/request/services/common";
import { saleOrderApi } from "@/request/services/saleMgt";
import MyTitle from "@/components/MyTitle.vue";
import MyForm from "@/components/MyForm.vue";
import MyTable from "@/components/MyTable.vue";
import CustomerSelect from "@/components/CustomerSelect.vue";
import JDetailContainer from "@/components/JDetailContainer.vue";
import JDetailCard from "@/components/JDetailCard.vue";
import MaterialModal from "@/components/commonModal/MaterialModal.vue";
import DepartmentModal from "@/components/commonModal/DepartmentModal.vue";
import SalesmanModal from "@/components/commonModal/SalesmanModal.vue";
import PersonnelTreeModal from "@/components/commonModal/PersonnelTreeModal.vue";
import PriceOrderModal from "@/components/commonModal/PriceOrderModal.vue";
import { transformArrayData } from "@/utils/index";
import config from "@/utils/config";
import { ElMessage, ElMessageBox } from "element-plus";
import moment from "moment";


export default {
  components: {
    MyTitle,
    MyForm,
    MyTable,
    CustomerSelect,
    JDetailCard,
    JDetailContainer,
    MaterialModal,
    DepartmentModal,
    SalesmanModal,
    PersonnelTreeModal,
    PriceOrderModal,
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const store = useStore();
    const temp = ref(route.query.temp) //模板页类型

    const goBack = () => {
      router.go(-1);
      sessionStorage.setItem("saleOrderKey", route.query.tab);
    }

    const tenantList = ref(computed(() => {
      if(store.state.common.tenantList.length) {
        return store.state.common.tenantList;
      } else {
        store.dispatch('common/getTenantList');
      }
    }));
    
    const tenantId = sessionStorage.getItem("tenantId") || localStorage.getItem("tenantId");
    const formData = ref({ 
      tenantId: tenantId ? tenantId * 1 : undefined,
    });
    
    const formRelatedRecord = reactive({
      accountShow: false,
      receiptOrderShow: false,
      invoiceNumShow: false,
      accountList: [],
      receiptOrderList: [],
      addressList: [],
      formRelatedData: {
        isAdjust: true,
        isTail: true,
      },
      
      creditPlus: {},
    })
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

    

    /** 表单相关 */
    const settlementTypeOp = ref([])
    // const settlementTypeOp = [
    //   {label:'现金', value:1},
    //   {label:'银行承兑', value:2},
    //   {label:'商业承兑', value:3},
    // ]
    const transportOp = [
      {label:'自提', value:0},
      {label:'一票制包运', value:1},
      {label:'流向管控自提', value:2},
    ]
    const settlementRuleOp = [
      {label:'发货方为准', value:0},
      {label:'收货方为准', value:1},
      {label:'收发货取小', value:2},
    ]

    const companyFormRecord = reactive({
      companyFormRef: null,
      companyFormItems: [
        {
          type: "select",
          label: "销售公司",
          paramName: "tenantId",
          options: tenantList,
          span: 12,
          disabled: true
        },
      ],
      companyRules: {
        tenantId: [config.rules({ type: "required" })],
      },
    });
    const customerFormRecord = reactive({
      customerFormRef: null,
      customerFormItems: [
        {
          type: "labelBlank",
          label: "客户",
          paramName: "customerId",
          slotName: "customerSlot",
          span: 12,
        },
        {
          type: "labelBlank",
          label: "扣款客户",
          paramName: "deductCustomerId",
          slotName: "deductCustomerSlot",
          span: 12,
        },
        {
          type: "labelBlank",
          label: "开票客户",
          paramName: "invoiceCustomerId",
          slotName: "invoiceCustomerSlot",
          span: 12,
        },
        ...(temp.value==2?
          [
            {type: "labelBlank",
              label: "客户价格单",
              paramName: "priceId",
              slotName: "customerOrderSlot",
              span: 12,
              }]
            :[]
        )
      ],

      customerRules: {
        customerId: [config.rules({ type: "required" })],
        deductCustomerId: [config.rules({ type: "required" })],
        invoiceCustomerId: [config.rules({ type: "required" })],
        priceId: temp.value==2?[config.rules({ type: "required" })]:[]
      },
    }); 
    const orderFormRecord = reactive({
      orderFormRef: null,
      orderFormItems: [
        {
          type: "select",
          label: "结算方式",
          paramName: "settlementType",
          options: settlementTypeOp,
          disabled: route.query.temp==2,
          span: 12,
        },
        {
          type: "labelBlank",
          label: "部门",
          paramName: "deptName",
          slotName: 'deptName',
          span: 12,
        },
        {
          type: "labelBlank",
          label: "业务员",
          paramName: "salesmanName",
          slotName: 'salesmanName',
          span: 12,
        },
        
        {
          type: "select",
          label: "运输方式",
          paramName: "transportType",
          options: transportOp,
          span: 12,
        },
        {
          type: "select",
          label: "结算规则",
          paramName: "settlementRule",
          options: settlementRuleOp,
          span: 12,
        },
        {
          type: "select",
          label: "装货地",
          paramName: "consignerAddressId",
          options: formRelatedRecord.addressList,
          span: 12,
        },
        {
          type: "datePicker",
          label: "单据日期",
          paramName: "billDate",
          span: 12,
        },
        ...(temp.value==1?
          [{
            type: "input",
            label: "散户",
            paramName: "retailInvestors",
            span: 12,
          },]:[]
        )
      ],
      orderRules: {
        settlementType: [config.rules({ type: "required" })],
        deptName: [config.rules({ type: "required" })],
        salesmanName: [config.rules({ type: "required" })],
        transportType: [config.rules({ type: "required" })],
        settlementRule: [config.rules({ type: "required" })],
      },
    });

    const remarkFormRecord = reactive({
      remarkFormRef: null,
      remarkFormItems: [
        {
          type: "textArea",
          label: "备注",
          paramName: "remark",
          span: 12,
        },
      ],
    });

    const tableRecord = reactive({
      tableRef: null,
      tableData: [],
      tableTotal: 0,
      selectedRows: [],
    });
    const handleSelectionChange = (val) => {
      tableRecord.selectedRows = val
    }

    const tableColumns = [
      { label: "序号", prop: "num", width: 60, fixed: "left" },
      { label: "物料名称", prop: "productName", fixed: "left", width: 160 },
      { label: "物料编码", prop: "productCode", width: 180 },
      { label: "规格", prop: "specification", width: 160 },
      { label: "型号", prop: "modelMaterial", width: 150 },
      { label: "计量单位", prop: "unit", width: 120 },
      { label: "税率", prop: "taxRate", width: 120 },
      { label: "价格单号", prop: "priceListCustomerId", width: 120 },
      { label: "数量", slotName: "amount", width: 180, fixed: "right" },
      { label: "出厂价", slotName: "outPrice", width: 180, fixed: "right" },
      { label: "价税合计", slotName: "taxPrice", width: 180, fixed: "right" },
    ];

    /** 弹窗数据相关 **/  
    const modalRecord = reactive({
      modalShow: false,
      depModalShow: false,
      salesmanModalShow: false,
      priceOrderModalShow: false,
      customerPriceDisable: true,
      priceOrderModalInitData: {
        tenantId: '',
        tenantName: '',
        customerId: '',
        customerName: ''
      }
    });
    // 物料
    const onDeleteMaterial = () => {
      const ids = tableRecord.selectedRows.map(item => item.id)
      const newData = tableRecord.tableData.filter(item => !ids.includes(item.id))
      tableRecord.tableData = newData
    }
    const getSelected = (val) => {
      tableRecord.tableData = transformArrayData(val, true, true)
    }
    // 客户
    const selectedCustomer = (val, type) => {
      if(type=='customer') {
        // console.log(val,"customer")
        formData.value.customerId = val.id;
        formData.value.customerName = val.name;
      }
      if(type=='deductCustomer') {
        formData.value.deductCustomerId = val.id;
        formData.value.deductCustomerName = val.name;
      }
      if(type=='invoiceCustomer') {
        formData.value.invoiceCustomerId = val.id;
        formData.value.invoiceCustomerName = val.name;
      }
    };
    //营业员
    const getSalesmanModal = (val) => {
      // formData.value.salesmanName = val.userName
      // formData.value.salesmanId= val.userId
      formData.value.salesmanName = val.name;
      formData.value.salesmanId = val.id;
    }
    //部门
    const getDepModal = (val) => {
      formData.value.deptName = val.label
      formData.value.deptId= val.id
    }
    //客户价格单
    const getPriceOrderModal = async(val) => {
      // console.log(val, "xxx")
      formData.value.priceId = val.priceListCustomerId
      formData.value.priceGoodsId = val.id
      formData.value.settlementType = val.payType
      // tableRecord.tableData = [val]
      // val.productCode
      let params = {
        current:1,
        size: 9999,
        productCode: val.productCode,
        productName: val.productName
      }
      const res = await commonApi.getMaterialTableData(params)
      if(res && res.code==0) {
        tableRecord.tableData = res.data.records
        tableRecord.tableData[0].outPrice = val.price
      }
      
    }
    

    /** 提交相关 **/  
    const toParams = () => {
      let params = {
        ...formData.value,
        ...formRelatedRecord.formRelatedData,
        isAdjust: formRelatedRecord.formRelatedData.isAdjust? 1: 0,
        isTail: formRelatedRecord.formRelatedData.isTail? 1: 0,
        isInvoice: formRelatedRecord.formRelatedData.isInvoice? 1: 0,
        isWaybill: formRelatedRecord.formRelatedData.isWaybill? 1: 0,
      }
      params.orderGoodsInfoList = tableRecord.tableData
      if(formData.value.billDate) {
        params.billDate = moment(formData.value.billDate).format('YYYY-MM-DD HH:mm:ss');
      }
      
      if(formRelatedRecord.formRelatedData.deductAccountId) {
        params.deductAccountName = formRelatedRecord.accountList.find(i => 
          i.id == formRelatedRecord.formRelatedData.deductAccountId
        ).accountName
      }

      if(formData.value.tenantId) {
        const obj = tenantList.value.find(i => i.value == formData.value.tenantId)
        params.tenantName = obj.label
      }

      return params
    }


    const onSubmit = async (isSubmit) => {
      const result1 = await companyFormRecord.companyFormRef.submitForm()
      const result2 = await customerFormRecord.customerFormRef.submitForm()
      const result3 = await orderFormRecord.orderFormRef.submitForm()
      if(!(result1 && result2 && result3)) return

      if(isSubmit==0) {
        const result = await ElMessageBox.confirm(
          `<strong>提示</strong><br/>
          是否将订单保存为草稿状态？`,
          {
            dangerouslyUseHTMLString: true,
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          }
        )
        if(result!=='confirm') return
      }
   
      const params = toParams()
      params.isSubmit = isSubmit
 
      let res = null
      if(temp.value == 2) {
        res = await saleOrderApi.addItemPrice(params)
      } else {
        res = await saleOrderApi.addItemSelf(params)
      }  
      
      if(res && res.code==0) {
        ElMessage.success('操作成功')
        goBack()
      } else {
        ElMessage.error(res.message)
      }

    };


    const getAccountList = async() => {
      if(!formData.value.deductCustomerId) {
        return
      }
      const homeInfo = JSON.parse(sessionStorage.getItem('homeInfo'))
      let params = {
        // accessId: homeInfo.id,
        tenantId: homeInfo.tenantId,
        customerId: formData.value.deductCustomerId
      }
      const res = await saleOrderApi.getAccountList(params)
      const { data =[] } =res
      formRelatedRecord.accountList = data
      let creditTotalMoneyPlus = 0
      let creditMoneyPlus = 0
      data.forEach(item => {
        creditTotalMoneyPlus += item.creditTotalMoney
        creditMoneyPlus += item.creditMoney
      })
      formRelatedRecord.creditPlus = {creditTotalMoneyPlus,creditMoneyPlus}
    }
    const getReceiptOrderList = async() => {
      let params ={
        current: 1,
        size: 999,
      }
      params.tenantId = formData.value.tenantId
      params.customerId = formData.value.deductCustomerId

      const res = await saleOrderApi.getReceiptOrderList(params)
      formRelatedRecord.receiptOrderList = res.data.records
    }
    const getAddressList = async() => {
      let params = {
        clientId: 51
      }
      const res = await saleOrderApi.getAddress(params) 
      const { data= []} = res
      const op = data.map(item => {
        return {
          label: item.address,
          value: item.id
        }
      })
      formRelatedRecord.addressList = op
    }
    const getSettlementTypeDict = async() => {
      const res = await commonApi.getDictionaryList('LMS_PAYTYPE')
      const { data= []} = res
      const op = data.map(item => {
        return {
          label: item.name,
          value: item.id
        }
      })
      settlementTypeOp.value = op
    }
    

    onMounted(async()=> {
      
      await getSettlementTypeDict()
      getAddressList()
    })

    watch(()=>formData.value.customerId, (val, oldVal) => {
      if(temp.value ==2 ) { //控制客单价disable
        if(val) {
          modalRecord.customerPriceDisable = false,
          modalRecord.priceOrderModalInitData={ 
            customerId: formData.value.customerId,
            customerName: formData.value.customerName,
            tenantId: formData.value.tenantId,
            tenantName: tenantList.value.find(item => 
              item.value == formData.value.tenantId).label
          }
        } else {
          modalRecord.customerPriceDisable = true
        }
        if(val!==oldVal) {
          formData.value.priceId =""
          formData.value.settlementType = ""
          tableRecord.tableData = []
        }
      }

     

      // 客户 同步  扣款开票客户
      // if(formData.value.deductCustomerId) return
      formData.value.deductCustomerId = formData.value.customerId
      formData.value.deductCustomerName = formData.value.customerName
      formData.value.invoiceCustomerId = formData.value.customerId
      formData.value.invoiceCustomerName = formData.value.customerName
      
      
    })
    watch(()=>formData.value.deductCustomerId, async(val) => {
      // 扣款客户--账号框显示
      if(val) {
        await getAccountList()
        formRelatedRecord.accountShow = true 
      } else {
        formRelatedRecord.accountShow = false
      }

      // 扣款客户--收款框显示
      if(val && formData.value.settlementType ) {
        await getReceiptOrderList()
        formRelatedRecord.receiptOrderShow = true
      } else {
        formRelatedRecord.receiptOrderShow = false
      }
      
    })
    watch(()=>formData.value.settlementType, async(val) => {
      // 结算方式--收款框显示
      if(val && formData.value.deductCustomerId ) {
        await getReceiptOrderList()
        formRelatedRecord.receiptOrderShow = true
      } else {
        formRelatedRecord.receiptOrderShow = false
      }
    })

    const oldTenantId = ref(null)

    watch(()=>formData.value.tenantId, (val, oldVal)=> {
      //切换销售公司--清空

      if(!oldVal) return
      if(oldTenantId.value == val) {
        oldTenantId.value = null
        return
      }

      ElMessageBox.confirm(
        `<strong>温馨提示</strong><br/>
        选择其他公司将清空当前公司下的销售订单数据，是否继续？`,
        {
          dangerouslyUseHTMLString: true,
          confirmButtonText: '继续',
          cancelButtonText: '取消',
          type: 'warning',
        },
      ).then(() => {
        formData.value = {
          tenantId: val
        }
        formRelatedRecord.formRelatedData = {
          isAdjust: true,
          isTail: true,
        } 
      }).catch(() => {
        oldTenantId.value = oldVal
        formData.value.tenantId = oldVal
      })

      // if(val !== oldVal) {
      //   formData.value = {
      //     tenantId: val
      //   }
      //   formRelatedRecord.formRelatedData = {}
      // }
    })

    watch(()=>formRelatedRecord.formRelatedData.isInvoice, (val, oldVal)=> {
      //先票后货--显示发票号
      if(val) {
        formRelatedRecord.invoiceNumShow = true
      } else {
        formRelatedRecord.invoiceNumShow = false
      }
    })

    watch(()=>formData.value.transportType, (val) => {
      //运输方式控制是否同步创建运单
      if(val) {
        formRelatedRecord.formRelatedData.isWaybill = true
      } else {
        formRelatedRecord.formRelatedData.isWaybill = false
      }
      
    })

    

    const handleChangeNumber = (val, index, type)=> {
      const { outPrice, amount} = tableRecord.tableData[index]
      if(outPrice && amount) {
        tableRecord.tableData[index].taxPrice = outPrice*amount
      }
    }
  

    return {
      goBack,
      formData,
      temp,
      ...toRefs(companyFormRecord),
      ...toRefs(customerFormRecord),
      ...toRefs(orderFormRecord),
      ...toRefs(remarkFormRecord),
      tableColumns,
      ...toRefs(tableRecord),
      onSubmit,
      ...toRefs(modalRecord),
      handleSelectionChange,
      onDeleteMaterial,
      getSelected,
      getSalesmanModal,
      getDepModal,
      getPriceOrderModal,
      selectedCustomer,
      ...toRefs(formRelatedRecord),
      payTypeMap,
      billTypeMap,
      handleChangeNumber,
      
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

  .placeholder-box {
    display: flex;
    margin-bottom: 24px;
    width: 300px;
    height: 36px;
    font-size: 14px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: #accaff;
    background: #ffffff;
    border-radius: 4px;
    border: 1px solid #accaff;
    justify-content: center;
    align-items: center;
  }

  .my-form-container {
    max-width: 790px;
  }
  .type-box {
    // display: flex;
    margin-bottom: 24px;
    padding: 0 24px;
    width: 100%;
    // height: 48px;
    background: #f0f5ff;
    border-radius: 4px;
    border: 1px solid #3c82fe;
    box-sizing: border-box;
    align-items: center;
  }
  .blue-box {
    margin-bottom: 24px;
    padding: 16px 24px 24px;
    width: 100%;
    border-radius: 4px;
    background: #f0f5ff;
    border: 1px solid #3c82fe;
    box-sizing: border-box;
    color:#606266;
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
        ::v-deep {
          .el-radio__label {
            width: 100%;
          }
          .el-checkbox__label {
            width: 100%;
          }
        }

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
          line-height: 16px;
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

  .btn-box {
    display: flex;
    .btn-item {
      display: flex;
      margin-right: 24px;
      padding: 0;
      height: 22px;
      align-items: center;

      span {
        padding-left: 8px;
        font-size: 14px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: $color-blue;
      }
    }
  }

}

</style>
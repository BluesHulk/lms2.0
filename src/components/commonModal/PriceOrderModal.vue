<template>
  <el-dialog
    v-model="visible"
    title="选择客户价格单"
    width="1200px"
    custom-class="customer-dialog"
    @close="onClose"
    :close-on-click-modal="false"
  >
    <div class="modal-content">   
      <div class="content-header">
        <div class="content-header-left">
          <div class="item">销售公司：{{initData.tenantName}}</div>
          <div class="item">客户：{{initData.customerName}}</div>

        </div>
        <div class="content-header-right">
          <!-- <el-input 
            v-model="searchModel.product" 
            placeholder="物料名称/物料编码"
            class="item"
          /> -->

          <el-select 
            v-model="searchModel.payType" 
            placeholder="结算方式"
            class="item"
          >
            <el-option
              v-for="item in settlementTypeOp"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>

          <el-button type="primary" @click="onSearch" >查询</el-button>
          <el-button @click="onReset">重置</el-button>
        </div>

      </div>

      <MyTable
        className=""
        ref="tableRef"
        :tableData="tableData"
        :columns="tableColumns"
        :radioSelection="true"
        @handleRadioChange="handleRadioChange"
      />
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="onClose">关闭</el-button>
        <el-button type="primary" @click="onSubmit">确定选择</el-button>
      </span>
    </template>
  </el-dialog>

</template>

<script>
import {
  computed,
  watch,
  watchEffect,
  ref,
  reactive,
  toRefs,
  onMounted,
} from "vue";
import commonApi from "@/request/services/common";
import MyTable from "@/components/MyTable.vue";
import { transformArrayData } from "@/utils/index";
export default {
  components: {
    MyTable,
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    initData: {
      type: Object,
      default: {}
    }
  },
  setup(props, { emit }) {

    const defaultRecord = reactive({
      searchModel: {},
      list: [],
      selected:'',
      
      settlementTypeOp: [
        { label: '现金', value: 0 },
        { label: '银行承兑', value: 1 },
        { label: '商业承兑', value: 2 },
      ],
    });

    const tableRecord = reactive({
      tableRef: null,
      tableData: [{},{}],
      tableTotal: 0,
      selectedRows: [],
      selectedRow: {}
    });



    const tableColumns = [
      { label: "序号", prop: "num", width: 60, fixed: "left" },
      { label: "物料名称", prop: "productName", fixed: "left", width: 160 },
      { label: "物料编码", prop: "productCode" },
      { label: "价格来源", prop: "priceListName" },
      { label: "结算方式", prop: "payTypeName" },
      { label: "价格模式", prop: "priceModel",
        formatter: (row) => {
          return ['一票制','两票制'][row.priceModel]
        }
      },
      { label: "站点", prop: "siteName" },
      { label: "开始时间", prop: "startExpireTime" },
      { label: "结束时间", prop: "endExpireTime" },
      { label: "更新时间", prop: "updateTime" },
      { label: "出厂价", prop: "price", fixed: "right" },
    ];

    const handleRadioChange = (val) => {
      tableRecord.selectedRow = val;
    };

    const onSearch = () => {
      getTableData()
    }

    const onReset = () => {
      defaultRecord.searchModel ={}
      getTableData()
    }

    const getTableData = async() => {
      let params= {
        customerId: props.initData.customerId,
        tenantId: props.initData.tenantId,
        ...defaultRecord.searchModel
      }
      const res = await commonApi.getCustomerPrice(params)
      tableRecord.tableData = transformArrayData(
        res.data,
        true,
        true,
      );
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
      defaultRecord.settlementTypeOp = op
    }
    getSettlementTypeDict()

    
    
    watch(()=>props.initData.customerId, (val) => {
      getTableData()
    })

    const onClose = () => {
      emit('onClose',false)
    };

    const onSubmit = () => {
      // console.log(tableRecord.selectedRow)
      emit("onSelected", tableRecord.selectedRow);
      onClose()
    };


    return {
      ...toRefs(defaultRecord),
      ...toRefs(tableRecord),
      tableColumns,
      handleRadioChange,
      onSearch,
      onReset,
      onClose,
      onSubmit,
    };
  },
};
</script>
<style lang="scss" scoped>
.modal-content {
  padding: 0 24px;
  .content-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    .content-header-left {
      display: flex;
      .item {
        min-width: 180px;
      }
    }
    .content-header-right {
      display: flex;
      .item {
        margin-right: 12px;
        width: 200px;
      }
    }
  }
  
}
</style>
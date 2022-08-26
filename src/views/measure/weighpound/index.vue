<template>
  <MyContainer>
    <template v-slot:header>
      <el-button type="primary" @click="handleDialogOpen('add')">补单</el-button>
      <el-button @click="onOperations('batchAdjust')">核算</el-button>
      <el-button @click="onOperations('batchReject')">核算驳回</el-button>
    </template>
    <template v-slot:header-right>
      <MySearch
        v-if="!advancedFilterShow"
        :initConditionValue="conditionValue"
        :searchCondition="searchCondition"
        @onSearch="onFuzzySearch"
      />
      <el-button-group style="margin-left:12px">
        <el-button>打印</el-button>
        <el-button>导出</el-button>
      </el-button-group>
      <el-button-group style="margin-left: 12px">
        <el-button @click="onAdvancedStatus"
          ><i class="iconfont icon-share1" />{{
            Object.keys(searchParams).length
          }}项</el-button
        >
        <el-button @click="() => {}"
          ><i class="iconfont icon-install"
        /></el-button>
      </el-button-group>
    </template>
    <div class="content">
      <div class="btns">
        <!-- <el-button type="primary" @click="handleDialogOpen('add')">补单</el-button>
        <el-button type="primary" @click="onOperations('batchAdjust')">核算</el-button>
        <el-button type="primary" @click="onOperations('batchReject')">核算驳回</el-button> -->
        <template v-for="btn in processTypeOptions">
          <el-button 
            type="primary"
            :disabled="!activeBtns.includes(btn.type)"
            @click="handleDialogOpen(btn.type)"
          >
            {{btn.name}}
          </el-button>
        </template>
      </div>
      <MyTable
        className="receipt-voucher-table"
        ref="tableRef"
        :tableData="tableData"
        :columns="tableColumns"
        :showSummary="true"
        :selection="true"
        @handleSelectionChange="handleSelectionChange"
        @getSummaries="getSummaries"
        @arraySpanMethod="arraySpanMethod"
      >
        <template v-slot:operationEmpty="slotProps">
          <el-switch
            v-model="value"
            inline-prompt
            active-text="开"
            inactive-text="关"
            :disabled="true"
          />
        </template>
        <template v-slot:operationStatus="slotProps">
          <el-button type="text" @click="onOperations('fallback',slotProps.data)">回退</el-button>
          <el-button type="text" @click="onOperations('forward',slotProps.data)">前进</el-button>
        </template>
        <template v-slot:operation="slotProps">
          <el-button type="text" @click="handleDialogOpen('detail')">详情</el-button>
          <el-dropdown>
            <span class="el-dropdown-more">
            编辑
            <i class="iconfont icon-icon_zuocexialazhankai custom-icon" />
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item 
                  :disabled="slotProps.data.nodeNow=='888'"
                  @click="handleDialogOpen('changeCar',slotProps.data)"
                  >更换车辆</el-dropdown-item
                >
                <el-dropdown-item
                  :disabled="slotProps.data.nodeNow=='888'"
                  @click="handleDialogOpen('changeDriver',slotProps.data)"
                  >更换司机</el-dropdown-item
                >
                <el-dropdown-item 
                  :disabled="slotProps.data.nodeNow=='888'"
                  @click="handleDialogOpen('changeMeterage',slotProps.data)"
                  >调整计量</el-dropdown-item
                >
                <el-dropdown-item 
                  :disabled="slotProps.data.nodeNow=='888'"
                  @click="handleDialogOpen('changeOrder',slotProps.data)"
                  >更换订单</el-dropdown-item
                >
                <el-dropdown-item 
                  :disabled="slotProps.data.businessType !=='1'"
                  @click="handleDialogOpen('changeAccept',slotProps.data)"
                  >更换验收</el-dropdown-item
                >
              </el-dropdown-menu>
            </template>
          </el-dropdown>

          <el-button
            type="text"
            style="margin-left: 12px"
            :disabled="slotProps.data.nodeNow<'140'"
            @click="handleDialogOpen('invalid',slotProps.data)"
          >
            作废
          </el-button>
          
          <!-- <el-dropdown>
            <span class="el-dropdown-more">
            更多
            <i class="iconfont icon-icon_zuocexialazhankai custom-icon" />
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="handleDialogOpen('invalid',slotProps.data)"
                  >作废</el-dropdown-item
                >
                <el-dropdown-item @click="handleDialogOpen('changeCard',slotProps.data)"
                  >换卡</el-dropdown-item
                >
              </el-dropdown-menu>
            </template>
          </el-dropdown> -->

        </template>
      </MyTable>
      <MyPagination
        :total="tableTotal"
        :queryData="pageParams"
        @paginationChange="paginationChange"
      />
    </div>

    <MyDialog
      :visible="dialogVisible"
      :title="dialogTitle"
      :width="dialogWidth"
      @onUpdateDialogStatus="handleDialogClose"
      :closeOnCloseModal="false"
    >
      <div class="dialog-content">   
        <DetailPound
          v-if="dialogType=='detail'"
          ref="dialogContentRef"
        />
        <EditPound 
          v-if="dialogType=='add'"
          ref="dialogContentRef"
        />
        <EditMeterage
          v-if="dialogType=='changeMeterage'"
          ref="dialogContentRef"
        />
        <EditOrder
          v-if="dialogType=='changeOrder'"
          ref="dialogContentRef"
        />
        <EditAccept
          v-if="dialogType=='changeAccept'"
          ref="dialogContentRef"
        />
        <EditProcess
          v-if="processVisible"
          ref="dialogContentRef"
          :type="dialogType"
          :data="processSelectRow"
        />
      </div>
      <template v-slot:footer>
        <el-button @click="handleDialogClose">取消</el-button>
        <el-button
          v-if="dialogType !='detail'"
          type="primary"
          @click="handleOk"
        >
          确定
        </el-button>
      </template>
    </MyDialog>

    <CarModal 
      :visible="carModalVisible"
      @onClose="carModalVisible=false"
      @onSelected="selectedCarModal"
    />
    <DriverModal 
      :visible="driverModalVisible"
      @onClose="driverModalVisible=false"
      @onSelected="selectedDriverModal"
    />

  
  </MyContainer>
  <teleport to="#filter-aside" v-if="advancedFilterShow">
    <FilterDrawer
      :visible="advancedFilterShow"
      :data="{ ...searchParams }"
      @onSearch="onSearch"
      @onClose="onAdvancedStatus"
    />
  </teleport>
</template>

<script>
import { ref, reactive, toRefs, onMounted } from "vue";
import { useStore } from "vuex";
import moment from "moment";
import MyContainer from "@/components/MyContainer.vue";
import MyTable from "@/components/MyTable.vue";
import MyPagination from "@/components/MyPagination.vue";
import MyMultipleFilter from "@/components/MyMultipleFilter.vue";
import MySearch from "@/components/MySearch.vue";
import MyDrawer from "@/components/MyDrawer.vue";
import MyDialog from '@/components/MyDialog.vue';
import CarModal from '@/components/commonModal/CarModal.vue';
import DriverModal from '@/components/commonModal/DriverModal.vue';
import AdvancedFilterBtn from "@/components/AdvancedFilterBtn.vue";
import { weighpondApi } from "@/request/services/messureWeighpond";
import { transformArrayData } from "@/utils/index";
import { ElMessage, ElMessageBox } from "element-plus";
import DetailPound from "./DetailPound.vue"
import EditPound from "./EditPound.vue"
import EditMeterage from "./EditMeterage.vue"
import EditOrder from "./EditOrder.vue"
import EditAccept from "./EditAccept.vue"
import EditProcess from "./EditProcess.vue"
import FilterDrawer from "./components/FilterDrawer.vue";

export default {
  name: "ReceiptVoucher",
  components: {
    MyContainer,
    MyTable,
    MyPagination,
    MyMultipleFilter,
    MySearch,
    AdvancedFilterBtn,
    MyDrawer,
    MyDialog,
    CarModal,
    DriverModal,
    DetailPound,
    EditPound,
    EditMeterage,
    EditOrder,
    EditAccept,
    EditProcess,
    FilterDrawer,
  },
  setup() {
    const store = useStore();

    const filterRecord = reactive({
      conditionValue: "customerName",
      searchCondition: [
        { label: "客户名称",value: "customerName" },
        { label: "车牌号", value: "licensePlate"},
        { label: "物料名称",value: "productName" },
        { label: "磅单编号", value: "logisticsNum"},
        { label: "运单号", value: "waybillNum"},
        { label: "订单号", value: "orderNum"},
        { label: "发货单号",value: "xxx" },
        { label: "到货单号", value: "xxxxx"},
      ],
      advancedFilterShow: false,
      searchParams: {},
    });

    const onAdvancedStatus = () => {
      filterRecord.advancedFilterShow = !filterRecord.advancedFilterShow;
      store.commit(
        "common/setAsideFilterShow",
        filterRecord.advancedFilterShow
      );
    };

    const onSearch = (val) => {
      tableRecord.pageParams.currentPage = 1;
      filterRecord.searchParams = val;
      getTableData();
    };

    const onFuzzySearch = (val) => {
      tableRecord.pageParams.currentPage = 1;
      filterRecord.searchParams = val;
      getTableData();
    };

    const handleFilterData = (params) => {
      if (params.settlementTypeList && params.settlementTypeList.length) {
        params.settlementTypeList = params.settlementTypeList.join(",");
      }
      if (params.time && params.time.length) {
        params.billDateStart = moment(params.time[0]).format("YYYY-MM-DD 00:00:00");
        params.billDateEnd = moment(params.time[1]).format("YYYY-MM-DD 23:59:59");
      }
      if (params.time1 && params.time1.length) {
        params.createTimeStart = moment(params.time1[0]).format(
          "YYYY-MM-DD 00:00:00"
        );
        params.createTimeEnd = moment(params.time1[1]).format(
          "YYYY-MM-DD 23:59:59"
        );
      }
      if (params.time2 && params.time2.length) {
        params.updateTimeStart = moment(params.time2[0]).format(
          "YYYY-MM-DD 00:00:00"
        );
        params.updateTimeEnd = moment(params.time2[1]).format(
          "YYYY-MM-DD 23:59:59"
        );
      }
      delete params.time;
      delete params.time1;
      delete params.time2;

      return params;
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
      btns: true,
      activeBtns:[],
    });

    const paginationChange = (data) => {
      const { currentPage, pageSize } = tableRecord.pageParams;
      if (data.currentPage == currentPage && data.pageSize == pageSize) {
        return;
      }
      tableRecord.pageParams = { ...data };
      getTableData();
    };

    const handleSelectionChange = async(val) => {
      tableRecord.selectedRows = val
      
      if(val && val.length==1) {
        let params = {
          businessTypeCode: val[0].businessType,
        }
        const res = await weighpondApi.getBusinessProcess(params)
        if(res && res.code==0) {
          btnsStatus(val[0].nodeNow, res.data.processList)
        } else {
          btnsStatus(false)
        }
      } else {
        btnsStatus(false)
      }
      
    }

    //按钮状态
    const btnsStatus = (nodeNow, processList=[]) => {
      if(!nodeNow) {
        return tableRecord.activeBtns = []  
      }
      let actives = []
      let nextNode = ''
      if(processList && processList.length>0) {
        const index = processList.findIndex(i => i.pnodeCode == nodeNow)
        nextNode = processList[index+1].pnodeCode
      }
      processTypeOptions.forEach(item=> {
        let pass = false
        if(item.type === 'back') {
          const limitNode = ['010','888','999']
          if(!limitNode.includes(nodeNow)) {
            pass = true
          }
        }
        if(item.type === 'changeCard') {
          const limitNode = ['888','999']
          if(!limitNode.includes(nodeNow)) {
            pass = true
          }
        }
        if(item.type === 'outFactoryEmpty') {
          if(nodeNow>='130') { pass = true }
        }
        if(item.type === 'enterFactory') {
          if(nextNode=='060') { pass = true }
        }
        if(item.type === 'grantCard') {
          if(nextNode=='030') { pass = true }
        }
        if(item.type === 'weigh') {
          if(nextNode=='080' || nextNode=='140') { pass = true }
        }
        if(item.type === 'startLoad') {
          if(nextNode=='110' ) { pass = true }
        }
        if(item.type === 'endLoad') {
          if(nextNode=='120') { pass = true }
        }
        if(item.type === 'endLoad') {
          if(nextNode=='130') { pass = true }
        }
        if(item.type === 'check') {
          if(nextNode=='130') { pass = true }
        }
        if(item.type === 'outFactory') {
          if(nextNode=='160') { pass = true }
        }
        if(item.type === 'recycleCard') {
          if(nextNode=='180') { pass = true }
        }

        //符合
        if(pass) {
          actives.push(item.type)
        }

      })

      tableRecord.activeBtns = actives
    } 

    const businessTypeMap = new Map([
      ['1','采购'],
      ['2','销售'],
      ['3','短倒'],
      ['4','厂外短倒'],
      ['5','调拨'],
    ])
    const packTypeMap =new Map([
      ['D','袋装'],
      ['S','散装'],
    ])

    const tableColumns = [
      { label: "序号", prop: "num", width: 60, fixed: "left" },
      { label: "单据状态", prop: "status", width: 100,
        formatter: (row)=>{
          return ['未开始','进行中','已完成','已作废'][row.status]
        }
      },
      { label: "核算状态", prop: "accountFlag", width: 100,
        formatter: (row)=>{
          return ['未核算','已核算'][row.accountFlag]
        }
      },
      { label: "客户名称", prop: "customerName", width: 160,},
      { label: "所属公司", prop: "tenantName", width: 160 },

      { label: "车牌号", prop: "licensePlate", width: 120 },
      { label: "进厂时间", prop: "inTime", width: 180,
        formatter: (row)=> {
          return row.inTime?moment(row.inTime).format('YYYY-MM-DD HH:mm:ss'):''
        }
      },
      { label: "出厂时间", prop: "outTime", width: 180,
        formatter: (row)=> {
          return row.outTime?moment(row.outTime).format('YYYY-MM-DD HH:mm:ss'):''
        }
      },
      { label: "物料名称", prop: "productName", width: 120 },
      { label: "包装类型", prop: "packType", width: 100,
        formatter: (row) => {
          return packTypeMap.get(row.packType)
        }
      },
      { label: "毛重", prop: "gross", width: 160 },
      { label: "皮重", prop: "tare", width: 160 },
      { label: "净重", prop: "net", width: 160 },
      { label: "结算重量", prop: "settlement", width: 160 },
      { label: "实重", prop: "actual", width: 160 },
      { label: "扣杂(吨)", prop: "totalDeducted", width: 160 },
      { label: "扣吨(吨)", prop: "deducted", width: 160 },
      { label: "预发数量", prop: "predictWeigh", width: 160 },
      { label: "供应方发货数", prop: "outAmount", width: 160 },
      { label: "司机姓名", prop: "driverName", width: 160 },
      { label: "身份证", prop: "driverIdCard", width: 160 },
      { label: "磅单编号", prop: "logisticsNum", width: 160 },
      { label: "订单号", prop: "orderNum", width: 160 },
      { label: "运单号", prop: "waybillNum", width: 160 },
      { label: "发货单号", prop: "id", width: 160 },
      { label: "到货单号", prop: "id", width: 160 },
      { label: "水泥批次号", prop: "id", width: 160 },
      { label: "承运单位", prop: "id", width: 160 },
      { label: "空车出厂", prop: "id", width: 160 },
      { label: "业务类型", prop: "businessType", width: 120,
        formatter: (row) => {
          return businessTypeMap.get(row.businessType)
        }
      },
      { label: "ID卡号", prop: "cardIdNo", width: 160 },
      { label: "IC卡号", prop: "cardNo", width: 160 },
      { label: "空车出厂", slotName: "operationEmpty", width: 100, fixed: 'right', },
      { label: "车辆状态", prop: "id", width: 100, fixed: 'right', },
      // { label: "状态流转", slotName: "operationStatus", width: 100, fixed: 'right', },
      { label: "操作", slotName: "operation", width: 180, fixed: "right" },
    ];

    const getSummaries = (params, callback) => {
      const { columns, data } = params;
      const sums = [];
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = "合计";
          return;
        }
        if(column.property == "licensePlate") {
          sums[index] = 999;
        }
        if(column.property == "net") {
          sums[index] = 888;
        }
        if(column.property == "settlement") {
          sums[index] = 777;
        }
        if(column.property == "actual") {
          sums[index] = 666;
        }
        if(column.property == "totalDeducted") {
          sums[index] = 555;
        }
        if(column.property == "deducted") {
          sums[index] = 444;
        }
        if(column.property == "predictWeigh") {
          sums[index] = 333;
        }

      });
      callback && callback(sums);
    };
    const arraySpanMethod = () => {
      if (tableRecord.tableRef.$el) {
        const current = tableRecord.tableRef.$el
          .querySelector(".el-table__footer-wrapper")
          .querySelector(".el-table__footer");
        const cell = current.rows[0].cells;
        if (cell.length) {
          cell[0].colSpan = "2";
          cell[1].style.display = "none";
        }
      }
    };

    const getTableData = async() => {
      const params = {
        current: tableRecord.pageParams.currentPage,
        size: tableRecord.pageParams.pageSize,
        ...handleFilterData({ ...filterRecord.searchParams }),
        // ...filterRecord.searchParams,
      };
      delete params.time;

      const res = await weighpondApi.getTableData(params)

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
      }
    };

    const dialogRecord = reactive({
      dialogVisible: false,
      dialogTitle: '补单',
      dialogType: 'add',
      dialogWidth: 1100,
      dialogContentRef: null,

      carModalVisible: false,
      driverModalVisible: false,
      processVisible: false,
      processSelectRow: {},
      currRow: {},
    })
    //流程按钮
    const processTypeOptions = [
      {type:'back', name: '回退'},
      {type:'changeCard', name: '换卡'},  
      {type:'outFactoryEmpty', name: '空车出厂'},
      {type:'enterFactory', name: '进厂'},
      {type:'grantCard', name: '发卡'},
      {type:'weigh', name: '过磅'},
      {type:'startLoad', name: '开始装货'},
      {type:'endLoad', name: '结束装货'},
      {type:'check', name: '验收'},
      {type:'outFactory', name: '出厂'},
      {type:'recycleCard', name: '收卡'},
      {type:'outFactoryEmptyOver', name: '空车出厂完结'},
      {type:'openGate', name: '手工开闸'},
      {type:'closeGate', name: '手工关闸'},
    ]
    
    const handleDialogClose = () => {
      dialogRecord.dialogVisible = false
      dialogRecord.processVisible = false
    }
    const handleDialogOpen = (type, row) => {
      if(type=="changeCar") {
        dialogRecord.carModalVisible = true
        dialogRecord.currRow = row
        return
      }
      if(type=="changeDriver") {
        dialogRecord.driverModalVisible = true
        dialogRecord.currRow = row
        return
      }

      let title = ''
      let width = 750
      if(type =='add') {
        title='补单'
        width = 1100
      }
      if(type =='detail') {
        title='磅单详情'
        width = 750
        dialogRecord.currRow = row
      }
      if(type == 'changeMeterage') {
        title='调整计量'
        width = 1100
        dialogRecord.currRow = row
      }
      if(type == 'changeOrder') {
        title='更换订单'
        width = 1100
        dialogRecord.currRow = row
      }
      if(type == 'changeAccept') {
        title='更换验收'
        width = 750
        dialogRecord.currRow = row
      }

      if(type == "invalid") {
        title= '作废',
        width = 500,
        dialogRecord.processSelectRow = row
        dialogRecord.processVisible = true
      }
      
      
      //流程相关
      const result = processTypeOptions.find(item =>item.type === type);
      if(result) {
        title= result.name,
        width = 500,
        // dialogRecord.currRow = row
        dialogRecord.processVisible = true
        if(row) {
          dialogRecord.processSelectRow = row
        } else {
          dialogRecord.processSelectRow = tableRecord.selectedRows[0]
        }
      }
      
      dialogRecord.dialogType = type
      dialogRecord.dialogTitle = title
      dialogRecord.dialogWidth = width
      dialogRecord.dialogVisible = true
      
    }

    const selectedCarModal = (val) => {
      console.log(val,"car")
      alert('缺接口')
    }
    const selectedDriverModal = (val) => {
      console.log(val,"driver")
      alert('缺接口')
    }

    const handleOk = async() => {
      //弹窗获取参数
      const params = await dialogRecord.dialogContentRef.onSubmit()
      // console.log(params,'pppp')
      if(!params) return

      //接口
      let res = null
      if(dialogRecord.dialogType =='back') {
        res = await weighpondApi.toBack(params)
      }
      if(dialogRecord.dialogType =='changeCard') {
        res = await weighpondApi.toChangeCard(params)
      }
      if(dialogRecord.dialogType =='grantCard') {
        res = await weighpondApi.toGrantCard(params)
      }
      if(dialogRecord.dialogType =='recycleCard') {
        res = await weighpondApi.toRecycleCard(params)
      }
      if(dialogRecord.dialogType =='outFactoryEmpty' ||
        dialogRecord.dialogType =='outFactoryEmptyOver'
      ) {
        res = await weighpondApi.toNotMaterial(params)
      }
      if(dialogRecord.dialogType =='enterFactory' || 
        dialogRecord.dialogType =='outFactory'
      ) {
        res = await weighpondApi.toPassDoor(params)
      }
      if(dialogRecord.dialogType =='weigh') {
        res = await weighpondApi.toWeighting(params)
      }
      if(dialogRecord.dialogType =='startLoad' || 
        dialogRecord.dialogType =='endLoad'
      ) {
        res = await weighpondApi.toLoad(params)
      }
      if(dialogRecord.dialogType =='check') {
        res = await weighpondApi.toCheck(params)
      }
      if(dialogRecord.dialogType =='openGate') {
        // res = await weighpondApi.toWeighting(params)
      }
      if(dialogRecord.dialogType =='closeGate') {
        // res = await weighpondApi.toWeighting(params)
      }
      

      //反馈
      if(res) {
        if(res.code ==0) {
          ElMessage.success('操作成功')
        } else {
          ElMessage.error(res.message)
        }
      }
      

    }


    onMounted(async()=>{
      getTableData();
    })



    //所有按钮操作
    const onOperations = async(type) => {
      let params = {}
      // 数据处理   
      if(type.indexOf('batch')>-1) { //批量操作
        const length = tableRecord.selectedRows.length
        const strs = ['核算','核算驳回']
        const index = type == 'batchReject'? 1 : 0
        if(length==0) {
          return ElMessage.warning("请至少选择一项")
        }
        const result = await ElMessageBox.confirm(
          `<strong>${strs[index]}</strong><br/>
          已选中${length}项，是否${strs[index]}选中项？<br/>
          ${strs[index]}后将变更为${index?'未':'已'}核算状态
          `,
          {
            dangerouslyUseHTMLString: true,
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          }
        )
        if(result!=='confirm') return
        const arr = tableRecord.selectedRows.map(item => item.id)
        params = { 
          ids: arr.join()
        }
      }

      

      //接口处理
      let res = null
      if(type==='batchAdjust') {
        res = await weighpondApi.toAdjust(params)
      }
      if(type==='batchReject') {
        res = await weighpondApi.toCancel(params)
      }

      if(res && res.code=='') {
        ElMessage.success("操作成功")
        getTableData()
      }else {
        ElMessage.error(res.message)
      }

    }


    return {
      ...toRefs(filterRecord),
      onSearch,
      onAdvancedStatus,
      onFuzzySearch,
      ...toRefs(tableRecord),
      tableColumns,
      getSummaries,
      arraySpanMethod,
      paginationChange,
      handleSelectionChange,
      ...toRefs(dialogRecord),
      handleDialogOpen,
      handleDialogClose,
      selectedCarModal,
      selectedDriverModal,
      processTypeOptions,
      onOperations,
      handleOk,

    };
  },
};
</script>

<style lang="scss" scoped>
.receipt-voucher-table {
  .el-dropdown-more {
    margin-left: 12px;
    height: 30px;
    color: #5a78a0;
    line-height: 30px;
    .custom-icon {
      display: inline-block;
      font-size: 14px;
      transform: rotate(-90deg);
    }
  }
}
.dialog-content {
  padding: 0 24px;
}
.content {
  .btns {
    .el-button {
      margin-bottom: 12px;
    }
  }
}
</style>
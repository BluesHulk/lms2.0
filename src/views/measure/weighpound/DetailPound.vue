<template>
  <div class="poundDetail-container">
    <el-tabs 
      v-model="tabActiveName" 
      @tab-change="onTabs">
      <el-tab-pane
        v-for="item in tabPanes"
        :label="item.label" 
        :name="item.name" 
      >
      </el-tab-pane>
    </el-tabs>

    <div v-show="tabActiveName=='1'" class="tab-container orderInfo">
      <template v-for="(item,index) in billList">
        <div class="subtitle">
          {{item}}
        </div>
        <JDetailCard
          :detailItems="billGroup[index]"
          :detailData="billData"
        />
      </template>
    </div>

    <div v-show="tabActiveName=='2'" class="tab-container annex">
      <MyTable
        :tableData="annexTableData"
        :columns="annexTableColums"
      >
        <template v-slot:op="slotProps">
          <div>img</div>
        </template>
      </MyTable>
    </div>

    <div v-show="tabActiveName=='3'" class="tab-container record">
      <MyTable
        ref="formRef"
        :tableData="tableData"
        :columns="tableColumns"
        :selection="false"
      />
    </div>

    
  </div>
</template>

<script>
import { reactive, ref, toRefs, watch, onMounted } from 'vue';
import JDetailCard from '@/components/JDetailCard.vue';
import MyTable from "@/components/MyTable.vue";

export default {
  components: {
    MyTable,
    JDetailCard,
  },
  props: {
    totalItems: {
      type: Array,
      default: () => [],
    },
    totalData: {
      type: Object,
      default: () => {},
    },
  },
  setup(props, { emit }) {

    const tabsRecord = reactive({
      tabActiveName: '1',
      tabPanes: [
        {label: '单据信息', name: '1'},
        {label: '附件', name: '2'},
        {label: '操作记录', name: '3'},
      ]
    })

    const billRecord = reactive({
      billList: ['业务信息','计量信息','关联单据信息'],
      billData: {},
    })
    const billGroup = [
      [
        {label:'车牌号：', prop: 'id'},
        {label:'物料名称：', prop: 'id'},
        {label:'客户名称：', prop: 'id'},
        {label:'业务类型：', prop: 'id'},
        {label:'司机：', prop: 'id'},
        {label:'司机身份证号：', prop: 'id'},
        {label:'磅单编号：', prop: 'id'},
        {label:'磅单类型：', prop: 'id'},
        {label:'过磅类型：', prop: 'id'},
      ],
      [
        {label:'皮重：', prop: 'id'},
        {label:'皮重时间：', prop: 'id'},
        {label:'皮重类型：', prop: 'id'},
        {label:'毛重：', prop: 'id'},
        {label:'毛重时间：', prop: 'id'},
        {label:'预发数量：', prop: 'id'},
        {label:'结算数量：', prop: 'id'},
        {label:'净重：', prop: 'id'},
        {label:'扣重：', prop: 'id'},
        {label:'供方发货数量：', prop: 'id'},
        {label:'供方发货时间：', prop: 'id'},
        {label:'进厂时间：', prop: 'id'},
        {label:'出厂时间：', prop: 'id'},
      ],
      [
        {label:'派车单号：', prop: 'id'},
        {label:'订单号：', prop: 'id'},
        {label:'派车计划单号：', prop: 'id'},
        {label:'水泥批次号：', prop: 'id'},
        {label:'IC卡号：', prop: 'id'},
        {label:'ID卡号：', prop: 'id'},
      ],
    ]



    const annexRecord = reactive({
      annexTableData: [{},{}],
    })
    const annexTableColums = [
      { label: "项目", prop: "num" },
      { label: "附件", slotName: "op" },
      { label: "时间", prop: "accountFlag"},
    ]

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
      { label: "序号", prop: "num", },
      { label: "操作", prop: "status" },
      { label: "时间", prop: "accountFlag"},
      { label: "操作人", prop: "accountFlag"},
      { label: "数据", prop: "accountFlag"},
      { label: "说明", prop: "accountFlag"},
    ]

   
    
  
    return {
      ...toRefs(tabsRecord),
      ...toRefs(billRecord),
      billGroup,
      ...toRefs(annexRecord),
      annexTableColums,
      ...toRefs(tableRecord),
      tableColumns,
    }
  }
}
</script>

<style lang="scss" scoped>
.poundDetail-container {
  .tab-container {
  } 
  .orderInfo {
    .subtitle {
      width: calc(100% + 24px);
      height: 40px;
      background: #F0F5FF;
      border-left: 3px solid #3C82FE;
      margin: 0 -24px 24px;
      padding-left: 21px;
      color: #092D5C;
      line-height: 40px;
      font-size: 16px;
      font-weight: 600;  
    }
  }

}
  
</style>
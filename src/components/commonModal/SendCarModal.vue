<template>
  <el-dialog
    v-model="visible"
    title="订单派车"
    width="900px"
    custom-class="customer-dialog"
    @close="onClose"
    :close-on-click-modal="false"
  >
    <div class="modal-content">   
      <slot name="header"></slot>

      <el-button type="primary" @click="addItem">添加车次</el-button>

      <MyTable
        className=""
        ref="tableRef"
        :tableData="tableData"
        :columns="tableColumns"
        @handleSelectionChange="handleSelectionChange"
      >
        <template v-slot:licensePlate="slotProps">
          <el-input
            v-model="tableData[slotProps.index].licensePlate"
            placeholder="请选择"
            @click="onModal('car',slotProps.index)" 
            readonly
          >
            <template #suffix>
              <i class="iconfont icon-lishixuanze"></i>
            </template>
          </el-input>
        </template>
        <template v-slot:driverName="slotProps">
          <el-input
            v-model="tableData[slotProps.index].driverName"
            placeholder="请选择"
            @click="onModal('driver',slotProps.index)" 
            readonly
          >
            <template #suffix>
              <i class="iconfont icon-lishixuanze"></i>
            </template>
          </el-input>
        </template>
        <template v-slot:amount="slotProps">
          <el-input
            v-model="tableData[slotProps.index].amount"
            placeholder="请输入"
          />
        </template>
        <template v-slot:num="slotProps">
          <el-input
            v-model="tableData[slotProps.index].num"
            placeholder="请输入"
          />
        </template>
      </MyTable>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="onClose">取消</el-button>
        <el-button type="primary" @click="onSubmit">立即派车</el-button>
      </span>
    </template>
  </el-dialog>


  <CarModal 
    :visible="carModalShow"
    @onClose="carModalShow=false"
    @onSelected="selectedCarModal"
  />
  <DriverModal 
    :visible="driverModalShow"
    @onClose="driverModalShow=false"
    @onSelected="selectedDriverModal"
  />

</template>

<script>
import {
  watch,
  watchEffect,
  ref,
  reactive,
  toRefs,
  onMounted,
} from "vue";
import commonApi from "@/request/services/common";
import MyTable from "@/components/MyTable.vue";
import CarModal from '@/components/commonModal/CarModal.vue';
import DriverModal from '@/components/commonModal/DriverModal.vue';
import { ElMessage } from "element-plus";

export default {
  components: {
    MyTable,
    CarModal,
    DriverModal,
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    type: {
      type: String, // 销售：sale 采购：purchase
      default: "sale"
    }
  },
  setup(props, { emit }) {

    
    const tableRecord = reactive({
      tableRef: null,
      tableData: [],
      tableTotal: 0,
      selectedRows: [],
    });



    const tableColumns = [
      { label: "序号",  width: 60, formatter: (row, index) => index+1 },
      { label: "车牌号", slotName: "licensePlate"},
      { label: "司机", slotName: "driverName" },
      { label: "预发数量", slotName: "amount" },
      { label: "计量单位", width:90, formatter: () => '吨'},
      { label: "趟次", slotName: "num"},
      // ...(
      //   props.type == "sale" ?
      //   [{ label: "趟次", slotName: "num" }] : [{ label: "供方发货数", slotName: "num" }]
      // ),
      {
        label: '操作',
        width: 60,
        operatetion: (row) => {
          return [
            { 
              name: '删除', 
              style: {color: '#239cff'}, 
              onClick: deleteItem.bind(this, row.uniqueKey) 
            },
          ]
        }
      },
    ];

    const defaultRecord = reactive({
      carModalShow: false,
      driverModalShow: false,
      currIndex: 0 
    });

    const selectedCarModal = (val) => {
      // console.log(val,"car")
      let obj = tableRecord.tableData[defaultRecord.currIndex]
      obj.licensePlate = val.licensePlate
    }

    const selectedDriverModal =(val) => {
      // console.log(val,"driver")
      let obj = tableRecord.tableData[defaultRecord.currIndex]
      obj.driverPhone = val.phone
      obj.driverName = val.driverName?val.driverName: `司机${val.phone.slice(-4)}`
      obj.driverId = val.id
    }

    const onModal = (type, index) => {
      if(type === 'car') {
        defaultRecord.carModalShow = true 
      }
      if(type == 'driver') {
        defaultRecord.driverModalShow = true
      }
      defaultRecord.currIndex = index
    }

    const addItem = () => {
      let uniqueKey = 0
      tableRecord.tableData.forEach(item => {
        if(item.uniqueKey>=uniqueKey) {
          uniqueKey = item.uniqueKey + 1
        }
      })

      tableRecord.tableData.push({uniqueKey})
    }
    const deleteItem = (uniqueKey)=> {
      tableRecord.tableData = tableRecord.tableData.filter(
        item => item.uniqueKey !== uniqueKey
      )
    }


    const onClose = () => {
      emit('onClose',false)
    };

    const onSubmit = () => {
      // console.log(tableRecord.tableData, "data")
      checkData()
      emit("getData", tableRecord.tableData);
    };

    const checkData = () => {
      if(tableRecord.tableData.length == 0) {
        ElMessage.warning("请填写派车单信息")
        throw Error('校验错误')
      }
      
      tableRecord.tableData.forEach(item => {
        const {licensePlate, driverName, amount, num} = item
        if(licensePlate && driverName && amount && num) {
            const reg = /^[1-9]\d*$/
            if(!reg.test(amount)) {
              ElMessage.warning("预发数量为正整数")
              throw Error('校验错误')
            }
            if(!reg.test(num)) {
              ElMessage.warning(props.type == "sale" ? "趟次为正整数" : "共发货数为整数")
              throw Error('校验错误')
            }
          } else {
            ElMessage.warning("请填写派车单信息")
            throw Error('校验错误')
          }
      })
    }




    return {
      ...toRefs(defaultRecord),
      ...toRefs(tableRecord),
      tableColumns,
      onSubmit,
      onClose,
      onModal,
      selectedCarModal,
      selectedDriverModal,
      addItem,
      deleteItem,
      
    };
  },
};
</script>
<style lang="scss" scoped>
.modal-content {
  padding: 0 24px
}

</style>
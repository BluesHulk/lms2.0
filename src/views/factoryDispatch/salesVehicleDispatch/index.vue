<template>
  <MyContainer>
    <!-- 销售车辆调度 -->
    <MyMultipleFilter
      :formItems="filterItems"
      :formData="searchParams"
      :initData="initParams"
      @onSearch="onSearch"
    />
    <MyTable
      className="examination-roomSetting-table"
      ref="tableRef"
      :tableData="tableData"
      :columns="tableColumns"
      @handleSelectionChange="handleSelectionChange"
    >
      <template v-slot:operation="{data}">
        <el-button type="text" @click="specifyLane(data)"
          >指定车道</el-button
        >
        <el-button type="text"
          :class="{leaveTeamStyle:
            data.queueStatus === 0 ||
            data.queueStatus === -20 ||
            data.queueStatus === -10
          }"
          @click="setLineup(data)"
          >指定位置</el-button
        >
        <el-button class="setColor"
          :class="{leaveTeamStyle: 
            data.queueStatus === 100 ||
            data.queueStatus === -10 ||
            data.queueStatus === 0 ||
            data.queueStatus === -20
          }"
          type="text" @click="leaveTeam(data)"
          >移出队列</el-button
        >
      </template>
    </MyTable>
    <MyPagination
      :total="tableTotal"
      :queryData="pageParams"
      @paginationChange="paginationChange"
    />
    <el-dialog
      title="车辆调度提示"
      v-model="dialogLeaveTeamVisible"
      width="400px"
    >
      <div>车辆: {{licensePlate}}</div>
      <div>将被移出队列，确定要进行操作吗？</div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogLeaveTeamVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitLeaveTeam">确 定</el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog
      title="指定车道调度"
      v-model="dialogSpecifyLaneVisible"
      width="400px"
    >
      <div>
        <div>车牌号: {{licensePlate}}</div>
        <div>物料品种: {{productName}}</div>
        <div>开单数量: {{outAmount}}</div>
        <div>当前车道: {{loadLaneName}}</div>
        <div>
          <span>目标车道：</span>
          <el-select v-model="vehicleLaneId" class="m-2" placeholder="请选择">
            <el-option
              v-for="item in vehicleLaneList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogSpecifyLaneVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitSpecifyLane">确 定</el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog
      title="指定位置调度"
      v-model="dialogLineUpVisible"
      width="500px"
    >
      <div>车牌号: {{licensePlate}}</div>
      <div>当前车道: {{loadLaneName}}</div>
      <div class="setLineStyle">
        <div class="setLocation">指定位置：</div>
        <el-radio-group v-model="radio1" class="ml-4" @change="radioChange">
          <el-radio :label="1">队首</el-radio>
          <el-radio :label="2">队尾</el-radio>
          <el-radio :label="3">指定</el-radio>
        </el-radio-group>
        <el-input class="reset-style" v-model="customLane" @change="customLaneChange" :disabled= isDisabled />
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogLineUpVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitSetLineup">确 定</el-button>
        </span>
      </template>
    </el-dialog>
  </MyContainer>
</template>

<script>
import { ref, reactive, toRefs } from "vue";
import moment from "moment";
import MyContainer from "@/components/MyContainer.vue";
import MyMultipleFilter from "@/components/MyMultipleFilter.vue";
import MyTable from "@/components/MyTable.vue";
import MyPagination from "@/components/MyPagination.vue";
import commonApi from "@/request/services/common";
import { salesVehicleDispatchApi } from "@/request/services/factoryDispatch";
import { transformArrayData } from "@/utils/index";
import { positiveInteger } from '@/utils/validate'

import { ElMessage } from "element-plus";
export default {
  name: "salesVehicleDispatch",
  components: {
    MyContainer,
    MyMultipleFilter,
    MyTable,
    MyPagination
  },
  setup() {
    const tenantList = ref([]);
    const getTenantList = () => {
      commonApi.getCompany().then((res) => {
        if (res && res.code == 0) {
          res.data.map((item) => {
            item.label = item.name;
            item.value = item.id;
          });
          tenantList.value = res.data;
        }
      });
    };
    getTenantList();

    const filterItems = ref([
      {
        type: "select",
        label: "所属公司",
        paramName: "tenantId",
        options: tenantList,
        span: 8,
      },
      {
        type: "input",
        label: "车道名称",
        paramName: "loadLaneName",
        span: 8,
      },
      {
        type: "input",
        label: "车牌号",
        paramName: "licensePlate",
        span: 8,
      }
    ]);

    const filterRecord = reactive({
      initParams: {
        tenantId: sessionStorage.getItem("tenantId") * 1 || "",
      },
      searchParams: {
        tenantId: sessionStorage.getItem("tenantId") * 1 || "",
      },
    });

    const tableRecord = reactive({
      tableRef: null,
      tableData: [],
      tableTotal: 0,
      pageParams: {
        currentPage: 1,
        pageSize: 10,
      },
    })

    const tableColumns = [
      { label: "序号", prop: "num", width: 60, fixed: "left" },
      { label: "车牌号", prop: "licensePlate", fixed: "left", width: 140 },
      { label: "单据状态", prop: "nodeNowName", fixed: "left", width: 140 },
      { 
        label: "队列状态",
        prop: "queueStatus",
        width: 140,
        formatter: (row) => ({
          '-20': "人工出队",
          '-10': "超时出队",
          0: "待入队",
          10: "预入队",
          20: "待装车",
          100: "装车中"
        }[row.queueStatus])
      },
      { label: "车道编号", prop: "loadLaneCode", width: 140 },
      { label: "车道名称", prop: "loadLaneName", width: 140 },
      { label: "物料名称", prop: "productName", width: 140 },
      { label: "物料编号", prop: "productCode", width: 140 },
      { label: "提货单号", prop: "logisticsNum", width: 140 },
      { label: "提货量", prop: "outAmount", width: 140 },
      { label: "客户编号", prop: "customerCode", width: 140 },
      { label: "客户名称", prop: "customerName", width: 180 },
      {
        label: "开单时间",
        prop: "dpOrderTime",
        width: 170,
        formatter: (row) => (
          row.dpOrderTime && moment(row.dpOrderTime).format("YYYY-MM-DD HH:mm:ss")
        )
      },
      {
        label: "进队时间",
        prop: "joinQueueTime",
        width: 170,
        formatter: (row) => (
          row.joinQueueTime && moment(row.joinQueueTime).format("YYYY-MM-DD HH:mm:ss")
        )
      },
      {
        label: "进厂时间",
        prop: "joinFactoryTime",
        width: 170,
        formatter: (row) => (
          row.joinFactoryTime && moment(row.joinFactoryTime).format("YYYY-MM-DD HH:mm:ss")
        )
      },
      { label: "公司编号", prop: "tenantId", width: 120 },
      { label: "所属公司", prop: "tenantName", minWidth: 180 },
      { label: "调度人", prop: "updateUserName", width: 140 },
      {
        label: "操作时间",
        prop: "updateTime",
        width: 170,
        formatter: (row) => (
          row.updateTime && moment(row.updateTime).format("YYYY-MM-DD HH:mm:ss")
        )
      },
      { label: "操作", slotName: "operation", width: 250, fixed: "right" },
    ];

    const getTableData = () => {
      const params = {
        current: tableRecord.pageParams.currentPage,
        size: tableRecord.pageParams.pageSize,
        ...filterRecord.searchParams,
      };

      salesVehicleDispatchApi.getTableData(params).then((res) => {
        if (res && res.code == 0) {
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
      });
    };
    getTableData();

    const onSearch = (val) => {
      tableRecord.pageParams.currentPage = 1;
      filterRecord.searchParams = val;
      getTableData();
    };
    
    const paginationChange = (data) => {
      const { currentPage, pageSize } = tableRecord.pageParams;
      if (data.currentPage == currentPage && data.pageSize == pageSize) {
        return;
      }
      tableRecord.pageParams = { ...data };
      getTableData();
    };

    const dialogLeaveTeamVisible = ref(false)
    const licensePlate = ref('')
    const isRow = ref('')
    const leaveTeam = (data) => {
      dialogLeaveTeamVisible.value = true
      licensePlate.value = data.licensePlate
      isRow.value = {...data}
    };
    const submitLeaveTeam = () => {
      salesVehicleDispatchApi.onLeaveTeam(isRow.value.id).then((res) => {
        if (res && res.code == 0) {
          dialogLeaveTeamVisible.value = false
          ElMessage.success("操作成功！");
          getTableData();
        } else {
          dialogLeaveTeamVisible.value = false
          ElMessage.error(res.message);
        }
      });
    }
    
    const vehicleLaneId = ref('')
    const productName = ref('')
    const outAmount = ref('')
    const loadLaneName = ref('')

    const vehicleLaneList = ref([])
    const dialogSpecifyLaneVisible = ref(false)
    const specifyLane = (data) => {
      vehicleLaneId.value = ''
      dialogSpecifyLaneVisible.value = true
      licensePlate.value = data.licensePlate
      productName.value = data.productName
      outAmount.value = data.outAmount
      loadLaneName.value = data.loadLaneName

      isRow.value = {...data}
      const params = {
        customerId: isRow.value.customerId,
        productCode: isRow.value.productCode,
        tenantId: isRow.value.tenantId,
      }
      salesVehicleDispatchApi.getCustomerList(params).then((res) => {
        if (res && res.code == 0) {
          vehicleLaneList.value = [...res.data]
        } else {
          vehicleLaneList.value = []
        }
      });
    }

    const submitSpecifyLane = () => {
      if (!vehicleLaneId.value) {
        ElMessage.error('请选择目标车道!');
        return
      }
      salesVehicleDispatchApi.onSpecifyLane(vehicleLaneId.value, isRow.value.id).then((res) => {
        if (res && res.code == 0) {
          dialogSpecifyLaneVisible.value = false
          ElMessage.success("操作成功！");
          getTableData();
        } else {
          dialogSpecifyLaneVisible.value = false
          ElMessage.error(res.message);
        }
      });
    }

    const dialogLineUpVisible = ref(false)
    const radio1 = ref(1)
    const customLane = ref('')
    const isDisabled = ref(true)
    
    const setLineup = (data) => {
      dialogLineUpVisible.value = true
      licensePlate.value = data.licensePlate
      loadLaneName.value = data.loadLaneName
      isRow.value = {...data}
    }

    const radioChange = (data) => {
      if (data === 3) {
        isDisabled.value = false
      } else {
        isDisabled.value = true
        customLane.value = ''
      }
    }
    const customLaneChange = (data) => {
      if (data) {
        if (!positiveInteger(data)) {
          ElMessage.warning('请输入正整数!');
          customLane.value = ''
        }
      }
    }

    const submitSetLineup = () => {
      // 1队首 2队尾
      let type = null
      if (radio1.value === 3) {
        if (!customLane.value) {
          ElMessage.error('请输入指定位置！');
          return
        } else {
          type = customLane.value
        }
      } else {
        type = radio1.value
      }
      console.log(type, 'type')
      salesVehicleDispatchApi.onSetLineup(isRow.value.id, type).then((res) => {
        if (res && res.code == 0) {
          dialogLineUpVisible.value = false
          ElMessage.success("操作成功！");
          getTableData();
        } else {
          dialogLineUpVisible.value = false
          ElMessage.error(res.message);
        }
      });
    }

    return {
      ...toRefs(filterRecord),
      ...toRefs(tableRecord),
      filterItems,
      tableColumns,
      onSearch,
      paginationChange,
      leaveTeam,
      submitLeaveTeam,
      isRow,
      dialogLeaveTeamVisible,
      licensePlate,
      productName,
      outAmount,
      loadLaneName,
      specifyLane,
      submitSpecifyLane,
      dialogSpecifyLaneVisible,
      vehicleLaneId,
      vehicleLaneList,
      setLineup,
      radioChange,
      submitSetLineup,
      dialogLineUpVisible,
      radio1,
      customLane,
      customLaneChange,
      isDisabled,
    };
  },
}
</script>

<style lang="scss" scoped>
.setColor{
  font-size: 14px;
  font-family: PingFangSC-Regular, PingFang SC;
  color: #FF3B30;
}
.leaveTeamStyle{
  color: #B7C4D7;
  pointer-events:none;
}
.setLineStyle{
  display: flex;
}
.setLocation{
  line-height: 32px;
}
.reset-style{
  width: 116px;
  height: 30px;
  margin-left: 7px;
  background: #EFF2F7;
  border-radius: 4px;
  border: 1px solid #DCE5ED;
}
// .tab-box {
//   padding: 0 24px;
//   background: #fff;
// }
// ::v-deep {
//   .my-multiple-filter-container {
//     display: flex;
//     justify-content: space-between;
//     // .my-form-container {
//     //   // min-width: calc(100% / 3 * 2);

//     //   // .el-form-item {
//     //   //   margin: 0;
//     //   // }
//     // }
//     // .button-box {
//     //   min-width: 145px;
//     // }
//   }
// }
</style>
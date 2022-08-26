<template>
  <MyContainer>
    <MyMultipleFilter
      :formItems="filterItems"
      :formData="searchParams"
      :initData="initParams"
      :slotList="['productCode']"
      @onSearch="onSearch"
    >
      <template #productCode>
        <el-select
          clearable
          v-model="productName"
          :popper-class="'select-poper-hidden'"
          placeholder="请选择"
          style="width: 100%"
          @click="onModalShow('material')"
          @clear="onClear('material')"
        />
      </template>
    </MyMultipleFilter>
    <MyTable
      className="examination-roomSetting-table"
      ref="tableRef"
      :tableData="tableData"
      :columns="tableColumns"
      @handleSelectionChange="handleSelectionChange"
    >
      <template v-slot:operation="slotProps">
        <el-button v-if="slotProps.data.status === 10" type="text" @click="confirm(slotProps.data)"
          >确认</el-button
        >
      </template>
    </MyTable>
    <MyPagination
      :total="tableTotal"
      :queryData="pageParams"
      @paginationChange="paginationChange"
    />

    <MaterialModal
      :visible="materialModalShow"
      :isRequired="true"
      :modalType="'single'"
      @onClose="onModalClose('material')"
      @getSelected="getSelected"
    />

    <el-dialog
      title="车辆调度提示"
      v-model="dialogConfirmVisible"
      width="400px"
    >
      <div>车辆号码: {{licensePlate}}</div>
      <div>卸袋数量: {{taskQuantity ? taskQuantity : 0}} 袋</div>
      <div>将确认该车完成卸料，确定要进行操作么？</div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogConfirmVisible = false">取 消</el-button>
          <el-button type="primary" @click="sumbitConfirm">确 定</el-button>
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
import MaterialModal from "@/components/commonModal/MaterialModal.vue";
import commonApi from "@/request/services/common";
import { reinstallationRecordQueryApi } from "@/request/services/factoryDispatch";
import { transformArrayData } from "@/utils/index";
import { ElMessage } from "element-plus";

export default {
  name: "reinstallationRecordQuery",
  components: {
    MyContainer,
    MyMultipleFilter,
    MyTable,
    MyPagination,
    MaterialModal
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

    const loadingLaneList = ref([]);
    const getLoadingLaneList = () => {
      reinstallationRecordQueryApi.getLoadingLaneList().then((res) => {
        if (res && res.code == 0) {
          res.data.map((item) => {
            item.label = item.name;
            item.value = item.id;
          });
          loadingLaneList.value = res.data;
        }
      });
    };
    getLoadingLaneList();

    const filterItems = ref([
      {
        type: "select",
        label: "所属公司",
        paramName: "tenantId",
        options: tenantList,
        span: 8,
      },
      {
        type: "labelBlank",
        label: "物料名称",
        paramName: "productCode",
        slotName: "productCode",
        span: 8,
      },
      {
        type: "select",
        label: "车道名称",
        paramName: "loadLaneId",
        options: loadingLaneList,
        span: 8,
      },
      {
        type: "select",
        label: "状态",
        paramName: "status",
        options: [
          {label:'已完成', value: 100},
          {label:'待确认', value: 10}
        ],
        span: 8,
      },
      {
        type: "input",
        label: "车牌号",
        paramName: "licensePlate",
        span: 8,
      },
    ]);

    const filterRecord = reactive({
      initParams: {
        tenantId: sessionStorage.getItem("tenantId") * 1 || "",
      },
      searchParams: {
        tenantId: sessionStorage.getItem("tenantId") * 1 || "",
      },
    });
   
    const productName = ref('')
 
    const modalRecord = reactive({
      materialModalShow: false,
    });
    const onModalShow = (type) => {
      if (type == "material") {
        modalRecord.materialModalShow = true;
      }
    };
    const onModalClose = (type) => {
      if (type == "material") {
        modalRecord.materialModalShow = false;
      }
    };
    const getSelected = (val) => {
      productName.value = val.productName
      filterRecord.searchParams.productCode = val.productCode
    };
    const onClear = (type) => {
      if (type == "material") {
        filterRecord.searchParams.productCode = null
        productName.value = null;
      }
    };

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
      {
        label: "时间",
        prop: "createTime",
        width: 170,
        fixed: "left",
        formatter: (row) => (
          row.createTime && moment(row.createTime).format("YYYY-MM-DD HH:mm:ss")
        )
      },
      { label: "车牌号", prop: "licensePlate", fixed: "left", width: 140 },
      { label: "车道编号", prop: "loadLaneCode", width: 140 },
      { label: "车道名称", prop: "loadLaneName", width: 140 },
      { label: "物料名称", prop: "productName", width: 140 },
      { label: "物料编号", prop: "productCode", width: 140 },
      { label: "提货单号", prop: "dpOrderNum", width: 140 },
      { label: "开单量", prop: "settlementAmount", width: 140 },
      { label: "作业量(袋)", prop: "taskQuantity", width: 140 },
      { label: "客户编号", prop: "customerCode", width: 140 },
      { label: "客户名称", prop: "customerName", width: 180 },
      {
        label: "状态",
        prop: "status",
        width: 120,
        formatter: (row) => ({ 10: "待确认", 100: "已完成" }[row.status]),
      },
      { label: "操作人", prop: "updateUserName", width: 180 },
      {
        label: "操作时间",
        prop: "updateTime",
        width: 170,
        formatter: (row) => (
          row.createTime && moment(row.createTime).format("YYYY-MM-DD HH:mm:ss")
        )
      },
      { label: "公司编号", prop: "tenantId", width: 120 },
      { label: "所属公司", prop: "tenantName", minWidth: 180 },
      { label: "操作", slotName: "operation", width: 120, fixed: "right" },
    ];

    const getTableData = () => {
      const params = {
        current: tableRecord.pageParams.currentPage,
        size: tableRecord.pageParams.pageSize,
        ...filterRecord.searchParams,
      };

      reinstallationRecordQueryApi.getTableData(params).then((res) => {
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

    const dialogConfirmVisible = ref(false)
    const licensePlate = ref('')
    const taskQuantity = ref('')
    const replenishRecordId = ref('')

    const confirm = (data) => {
      dialogConfirmVisible.value = true
      licensePlate.value = data.licensePlate
      taskQuantity.value = data.taskQuantity
      replenishRecordId.value = data.id
    };

    const sumbitConfirm = () => {
      reinstallationRecordQueryApi.onConfirm(replenishRecordId.value).then((res) => {
        if (res && res.code == 0) {
          dialogConfirmVisible.value = false
          ElMessage.success("操作成功！");
          getTableData();
        } else {
          dialogConfirmVisible.value = false
          ElMessage.error(res.message);
        }
      });
    };
    
    return {
      ...toRefs(filterRecord),
      ...toRefs(tableRecord),
      ...toRefs(modalRecord),
      filterItems,
      tableColumns,
      productName,
      onModalShow,
      onModalClose,
      getSelected,
      onClear,
      onSearch,
      paginationChange,
      confirm,
      sumbitConfirm,
      dialogConfirmVisible,
      licensePlate,
      taskQuantity,
      replenishRecordId,
    };
  },
}
</script>

<style lang="scss">
.el-select__popper.select-poper-hidden {
  display: none;
}
</style>
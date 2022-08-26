<template>
  <MyContainer>
    <template v-slot:header>
      <el-button type="primary" @click="onModalShow('add')">新增</el-button>
    </template>
    <div class="content">
      <MyMultipleFilter
        :formItems="filterItems"
        :formData="searchParams"
        @onSearch="onSearch"
      />
      <MyTable
        className="receipt-voucher-table"
        ref="tableRef"
        :tableData="tableData"
        :columns="tableColumns"
        :selection="true"
        @handleSelectionChange="handleSelectionChange"
      >
        <template v-slot:operation="slotProps">
          <el-button type="text" @click="onModalShow('edit', slotProps.data)"
            >编辑</el-button
          >
          <el-button type="text" @click="onModalShow('view', slotProps.data)"
            >详情</el-button
          >
          <el-button type="text" @click="onDelete(slotProps.data)"
            >删除</el-button
          >
        </template>
      </MyTable>
      <MyPagination
        :total="tableTotal"
        :queryData="pageParams"
        @paginationChange="paginationChange"
      />
    </div>
  </MyContainer>
  <DetailModal
    v-if="detailModalShow"
    :modalShow="detailModalShow"
    :modalData="modalData"
    @onClose="onModalClose('view')"
  />
  <EditModal
    v-if="modalShow"
    :modalType="modalType"
    :modalTitle="modalTitle"
    :modalShow="modalShow"
    :modalData="modalData"
    @onClose="onModalClose"
    @onRefresh="getTableData"
  />
</template>

<script>
import { ref, reactive, toRefs ,computed} from "vue";
import moment from "moment";
import MyContainer from "@/components/MyContainer.vue";
import MyTable from "@/components/MyTable.vue";
import MyPagination from "@/components/MyPagination.vue";
import MyMultipleFilter from "@/components/MyMultipleFilter.vue";
import MySearch from "@/components/MySearch.vue";
import AdvancedFilterBtn from "@/components/AdvancedFilterBtn.vue";
import commonApi from "@/request/services/common";
import { testRecordApi } from "@/request/services/examinationRoom.js";
import { ElMessage, ElMessageBox } from "element-plus";
import { transformArrayData } from "@/utils/index";
import { useRouter } from "vue-router";
import DetailModal from "./components/DetailModal.vue";
import EditModal from "./components/EditModal.vue";
import { useStore } from "vuex";
export default {
  name: "BatchReceipt",
  components: {
    MyContainer,
    MyTable,
    MyPagination,
    MyMultipleFilter,
    MySearch,
    AdvancedFilterBtn,
    DetailModal,
    EditModal,
  },
  setup() {
    const router = useRouter();
    const store = useStore();
    const tenantList = ref(
      computed(() => {
        if (store.state.common.tenantList.length) {
          return store.state.common.tenantList;
        } else {
          store.dispatch("common/getTenantList");
        }
      })
    );
    const deliveryFactory = ref([]);
    const getDictionaryList = (code, setData) => {
      commonApi.getDictionaryList(code).then((res) => {
        if (res && res.code == 0) {
          res.data.map((item) => {
            item.label = item.name;
            item.value = item.code;
          });
          setData.value = res.data;
        }
      });
    };
    getDictionaryList("LMS_DELIVERY_FACTORY", deliveryFactory);
    const filterRecord = reactive({
      searchParams: {},
    });

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
    });

    const modalRecord = reactive({
      detailModalShow: false,
      modalShow: false,
      modalData: {},
      modalTitle: "",
      modalType: "",
    });
    const getTableData = () => {
      // tableRecord.tableData.push(
      //   {
      //     customerName:122
      //   }
      // )
      const params = {
        current: tableRecord.pageParams.currentPage,
        size: tableRecord.pageParams.pageSize,
        ...filterRecord.searchParams,
      };
      testRecordApi.getTableData(params).then((res) => {
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
      if (val.time && val.time.length) {
        val.startTime = moment(val.time[0]).format("YYYY-MM-DD 00:00:00");
        val.endTime = moment(val.time[1]).format("YYYY-MM-DD 23:59:59");

        delete val.time;
      }
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

    const onModalShow = (type, record) => {
      if (type == "view") {
        modalRecord.modalData = record;
        modalRecord.detailModalShow = true;
        return;
      }
      modalRecord.modalType = type;
      modalRecord.modalShow = true;
      modalRecord.modalTitle = type == "add" ? "新增检验记录" : "编辑检验记录";
      modalRecord.modalData = record;
    };

    const onModalClose = (type) => {
      if (type == "view") {
        modalRecord.detailModalShow = false;
      } else {
        modalRecord.modalShow = false;
      }
    };

    const filterItems = ref([
      {
        type: "select",
        label: "所属公司",
        paramName: "tenantId",
        options: tenantList,
        span: 8,
      },
      {
        type: "select",
        label: "发货工厂",
        paramName: "billFactoryCode",
        options: deliveryFactory,
        span: 8,
      },
      {
        type: "input",
        label: "批次号",
        paramName: "batchId",
        span: 8,
      },
      //  {
      //   type: "select",
      //   label: "物料类型",
      //   paramName: "checkStatus",
      //   options: [
      //     { value: 0, label: "未审核" },
      //     { value: 1, label: "已审核" },
      //   ],
      //   span: 8,
      // },
      {
        type: "rangePicker",
        label: "选择日期",
        paramName: "time",
        span: 8,
      },
    ]);

    const tableColumns = [
      { label: "序号", prop: "num", width: 60, fixed: "left" },
      { label: "物料编号", prop: "productCode", fixed: "left", width: 180 },
      { label: "物料名称", prop: "productName", width: 180 },
      { label: "批次编号", prop: "batchId", width: 180 },
      { label: "物料类型", prop: "productName", width: 160 }, //wu
      { label: "创建人", prop: "customerName", width: 160 },
      { label: "创建时间", prop: "createTime", width: 180 },
      { label: "修改人", prop: "customerName", width: 160 },
      { label: "修改时间", prop: "createTime", width: 180 },
      { label: "操作", slotName: "operation", width: 220, fixed: "right" },
    ];

    const selectedCustomer = (val) => {
      filterRecord.searchParams.customerId = val.id;
    };

    const onDelete = (record) => {
      ElMessageBox.confirm(
        `<strong>提示</strong><br/>
        确定删除该条记录？`,
        {
          dangerouslyUseHTMLString: true,
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).then(() => {
        testRecordApi.onDelete(record.id).then((res) => {
          if (res && res.code == 0) {
            ElMessage.success("操作成功！");
            getTableData();
          } else {
            ElMessage.error(res.message);
          }
        });
      });
    };
    return {
      ...toRefs(filterRecord),
      ...toRefs(tableRecord),
      ...toRefs(modalRecord),
      getTableData,
      filterItems,
      tableColumns,
      onSearch,
      getAdvancedBtnStatus,
      paginationChange,
      onModalShow,
      onDelete,
      selectedCustomer,
      onModalClose,
    };
  },
};
</script>
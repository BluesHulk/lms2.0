<template>
  <MyContainer>
    <template v-slot:header>
      <el-button type="primary" @click="onModalShow('add')">新增</el-button>
    </template>
    <div class="content">
      <MyTable
        className="receipt-voucher-table"
        ref="tableRef"
        :tableData="tableData"
        :columns="tableColumns"
      >
        <template v-slot:operation="slotProps">
          <el-button type="text" @click="onModalShow('edit', slotProps.data)"
            >修改</el-button
          >
          <el-button type="text" @click="onDelete(slotProps.data)"
            >删除</el-button
          >
          <el-button type="text" @click="onModalShow('view', slotProps.data)"
            >详情</el-button
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

  <EditModal
    v-if="editModalShow"
    :visible="editModalShow"
    :modalType="editModalType"
    :modalTitle="editModalTitle"
    :modalData="addFlowData"
    @onClose="onModalClose"
    @onRefresh="getTableData"
  />
   <AddModal
    v-if="addModalShow"
    :visible="addModalShow"
    @onClose="onModalClose"
    @onRefresh="setFlowData"
  />
  <DetailModal
    v-if="detailModalShow"
    :visible="detailModalShow"
    :modalData="addFlowData"
    @onClose="onModalClose"
    @onRefresh="setFlow"
  />
</template>

<script>
import { ref, reactive, toRefs } from "vue";
import moment from "moment";
import MyContainer from "@/components/MyContainer.vue";
import MyTable from "@/components/MyTable.vue";
import MyPagination from "@/components/MyPagination.vue";
import AddModal from "./components/AddModal.vue";
import EditModal from "./components/EditModal.vue";
import DetailModal from "./components/DetailModal.vue";
import commonApi from "@/request/services/common";
import { flowMangementApi } from "@/request/services/messure";
import { ElMessage, ElMessageBox } from "element-plus";
import { transformArrayData } from "@/utils/index";

export default {
  name: "MaterialBatchManagement",
  components: {
    MyContainer,
    MyTable,
    MyPagination,
    AddModal,
    EditModal,
    DetailModal,
  },
  setup() {

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

    const getTableData = () => {
      const params = {
        current: tableRecord.pageParams.currentPage,
        size: tableRecord.pageParams.pageSize,
      };
      flowMangementApi.getTableData(params).then((res) => {
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

    const paginationChange = (data) => {
      const { currentPage, pageSize } = tableRecord.pageParams;
      if (data.currentPage == currentPage && data.pageSize == pageSize) {
        return;
      }
      tableRecord.pageParams = { ...data };
      getTableData();
    };


    const onDelete = (record) => {
      ElMessageBox.confirm(
        `<strong>提示</strong><br/>
        您确定要删除此条数据？`,
        {
          dangerouslyUseHTMLString: true,
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).then(() => {
        flowMangementApi.onDelete(record.id).then((res) => {
          if (res && res.code == 0) {
            ElMessage.success("操作成功！");
            getTableData();
          } else {
            ElMessage.error(res.message);
          }
        });
      });
    };

    const modalRecord = reactive({
      addModalShow: false,
      detailModalShow: false,
      editModalShow: false,
      editModalType:'',
      editModalTitle:'',
      addFlowData:{}
    });

    const onModalShow = (type, record = {}) => {
      if(type == 'add'){
        modalRecord.addModalShow = true;
      }else if(type == 'edit'){
        modalRecord.addFlowData = record;
        modalRecord.editModalShow = true;
        modalRecord.editModalType = type;
        modalRecord.editModalTitle = "调整流程";
      }else if(type == 'set'){
        modalRecord.editModalShow = true;
        modalRecord.editModalType = type;
        modalRecord.editModalTitle = "配置流程";
      }else{
        modalRecord.addFlowData = record;
        modalRecord.detailModalShow = true;
      }
    };

    const onModalClose = () => {
      modalRecord.addModalShow = false;
      modalRecord.detailModalShow = false;
      modalRecord.editModalShow = false;
    };
    const tableColumns = [
      { label: "序号", prop: "num", width: 60, fixed: "left" },
     { label: "公司编号", prop: "tenantId"},
      { label: "所属公司", prop: "tenantName"},
      { label: "流程编码", prop: "code"},
      { label: "流程名称", prop: "name"},
      { label: "创建人", prop: "createUserName"},
      {
        label: "创建时间",
        prop: "createTime",
        formatter: (row) => (
          row.createTime && moment(row.createTime).format('YYYY-MM-DD HH:mm:ss')
        )
      },
      { label: "修改人", prop: "updateUserName"},
      {
        label: "修改时间",
        prop: "updateTime",
        formatter: (row) => (
          row.updateTime && moment(row.updateTime).format('YYYY-MM-DD HH:mm:ss')
        )
      },
      { label: "操作", slotName: "operation", width: 200, fixed: "right" },
    ];
//点击下一步传过来新增的对象
const setFlowData = (data) => {
modalRecord.addFlowData = {...data}
onModalShow('set')
}
const setFlow = (data) => {
  modalRecord.detailModalShow = false;
onModalShow('edit',data)
}
    return {
      ...toRefs(tableRecord),
      ...toRefs(modalRecord),
      tableColumns,
      paginationChange,
      onDelete,
      onModalShow,
      onModalClose,
      getTableData,
      setFlowData,
      setFlow
    };
  },
};
</script>
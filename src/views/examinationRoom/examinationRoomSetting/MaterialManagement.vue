<template>
  <MyMultipleFilter
    :formItems="filterItems"
    :formData="searchParams"
    @onSearch="onSearch"
  />
  <MyTable
    className="examination-roomSetting-table"
    ref="tableRef"
    :tableData="tableData"
    :columns="tableColumns"
    :selection="true"
    @handleSelectionChange="handleSelectionChange"
  >
    <template v-slot:operation="slotProps">
      <el-button type="text" @click="onDelete(slotProps.data.id)"
        >删除</el-button
      >
    </template>
  </MyTable>
  <MyPagination
    :total="tableTotal"
    :queryData="pageParams"
    @paginationChange="paginationChange"
  />

  <MyDialog
    :className="'material-management-modal'"
    v-if="modalShow"
    :visible="modalShow"
    title="新增设置物料"
    :width="694"
    @onUpdateDialogStatus="onUpdateDialogStatus"
  >
    <div class="content">
      <MyForm
        ref="formRef"
        :formItems="formItems"
        :rules="formRules"
        :formData="formData"
        @onFormItemChange="onFormItemChange"
      >
        <template #productId>
          <el-input
            v-model="formData.productName"
            clearable
            placeholder="请选择"
            @click="onModalShow('material')"
            @clear="onClear"
          >
            <template #suffix>
              <i class="iconfont icon-sousuo"></i>
            </template>
          </el-input>
        </template>
        <template #productCode>
          {{ formData.productCode }}
        </template>
      </MyForm>
    </div>
    <template v-slot:footer>
      <el-button @click="onModalClose">取消</el-button>
      <el-button type="primary" @click="onConfirm" :loading="btnLoading">
        确定
      </el-button>
    </template>
  </MyDialog>

  <MaterialModal
    :visible="materialModalShow"
    :isRequired="true"
    :modalType="'single'"
    @onClose="onModalClose('material')"
    @getSelected="getSelected"
  />
</template>

<script>
import { ref, reactive, toRefs, watch } from "vue";
import moment from "moment";
import MyTable from "@/components/MyTable.vue";
import MyPagination from "@/components/MyPagination.vue";
import MyMultipleFilter from "@/components/MyMultipleFilter.vue";
import MyDialog from "@/components/MyDialog.vue";
import MyForm from "@/components/MyForm.vue";
import MaterialModal from "@/components/commonModal/MaterialModal.vue";
import commonApi from "@/request/services/common";
import { examinationRoomSettingApi } from "@/request/services/examinationRoom";
import { transformArrayData } from "@/utils/index";
import { ElMessage, ElMessageBox } from "element-plus";
import config from "@/utils/config";

export default {
  name: "examinationRoomSetting",
  props: {
    tabKey: {
      type: Number,
    },
  },
  components: {
    MyTable,
    MyPagination,
    MyMultipleFilter,
    MyDialog,
    MyForm,
    MaterialModal,
  },
  setup(props) {
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
        type: props.tabKey,
        ...filterRecord.searchParams,
      };
      delete params.time;

      examinationRoomSettingApi.getTableData(params).then((res) => {
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

    const onDelete = (id) => {
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
        examinationRoomSettingApi.onDelete(id).then((res) => {
          if (res && res.code == 0) {
            ElMessage.success("操作成功！");
            getTableData();
          } else {
            ElMessage.error(res.message);
          }
        });
      });
    };

    watch(
      () => props.tabKey,
      () => {
        getTableData();
      }
    );

    const modalRecord = reactive({
      modalShow: false,
      materialModalShow: false,
    });

    const onUpdateDialogStatus = (status) => {
      if (!status) {
        onModalClose();
      }
    };

    const onModalShow = (type, record = {}) => {
      if (type == "add") {
        modalRecord.modalShow = true;
        formRecord.formData = { ...record };
      }
      if (type == "material") {
        modalRecord.materialModalShow = true;
      }
    };

    const onModalClose = (type) => {
      if (type == "material") {
        modalRecord.materialModalShow = false;
      } else {
        modalRecord.modalShow = false;
      }
    };

    const formRecord = reactive({
      formRef: null,
      formItems: [
        {
          type: "select",
          label: "所属公司",
          paramName: "tenantId",
          options: tenantList,
        },
        {
          type: "labelBlank",
          label: "物料名称",
          paramName: "productId",
          slotName: "productId",
        },
        {
          type: "labelBlank",
          label: "物料编号",
          paramName: "productCode",
          slotName: "productCode",
        },
        {
          type: "select",
          label: "发货工厂",
          paramName: "billFactoryCode",
          options: deliveryFactory,
        },
      ],
      formRules: {
        tenantId: [config.rules({ type: "required", trigger: "change" })],
        productId: [config.rules({ type: "required", trigger: "change" })],
        productCode: [config.rules({ type: "required", trigger: "change" })],
        billFactoryCode: [config.rules({ type: "required", trigger: "change" })],
      },
      formData: {},
    });

    const onFormItemChange = (data, paramName) => {
      if (paramName == "tenantId") {
        tenantList.value.map((item) => {
          if (item.value == data.tenantId) {
            formRecord.formData.tenantName = item.label;
          }
        });
      }
      if (paramName == "billFactoryCode") {
        deliveryFactory.value.map((item) => {
          if (item.value == data.billFactoryCode) {
            formRecord.formData.consignmentCompany = item.label;
            formRecord.formData.billFactoryId = item.id;
          }
        });
      }
    };

    const onConfirm = () => {
      formRecord.formRef.submitForm().then((valid) => {
        if (valid) {
          examinationRoomSettingApi
            .onAdd({ type: props.tabKey, ...formRecord.formData })
            .then((res) => {
              if (res && res.code == 0) {
                ElMessage.success("操作成功！");
                getTableData();
                onModalClose();
              } else {
                ElMessage.error(res.message);
              }
            });
        }
      });
    };

    const getSelected = (val = {}) => {
      formRecord.formData.productName = val.productName;
      formRecord.formData.productId = val.id;
      formRecord.formData.productCode = val.productCode;
    };

    const onClear = () => {
      formRecord.formData.productName = "";
      formRecord.formData.productId = "";
      formRecord.formData.productCode = "";
    };

    const filterItems = ref([
      {
        type: "select",
        label: "所属公司",
        paramName: "tenantId",
        options: tenantList,
        span: 12,
      },
      {
        type: "select",
        label: "发货工厂",
        paramName: "billFactoryCode",
        options: deliveryFactory,
        span: 12,
      },
    ]);

    const tableColumns = [
      { label: "序号", prop: "num", width: 60, fixed: "left" },
      { label: "物料编号", prop: "productCode", fixed: "left", width: 140 },
      { label: "物料名称", prop: "productName", fixed: "left", width: 180 },
      { label: "规格", prop: "specification", width: 140 },
      { label: "计量单位", prop: "unitName", width: 140 },
      { label: "创建人", prop: "createUserName", width: 120 },
      {
        label: "创建时间",
        prop: "createTime",
        width: 170,
        formatter: (row) => (
          row.createTime && moment(row.createTime).format("YYYY-MM-DD HH:mm:ss")
        )
      },
      { label: "发货工厂", prop: "consignmentCompany", minWidth: 160 },
      { label: "公司编号", prop: "tenantId", width: 120 },
      { label: "所属公司", prop: "tenantName", minWidth: 180 },
      { label: "操作", slotName: "operation", width: 120, fixed: "right" },
    ];

    return {
      ...toRefs(filterRecord),
      ...toRefs(tableRecord),
      ...toRefs(modalRecord),
      ...toRefs(formRecord),
      filterItems,
      tableColumns,
      onSearch,
      paginationChange,
      onDelete,
      onUpdateDialogStatus,
      onFormItemChange,
      onModalShow,
      onModalClose,
      onConfirm,
      getSelected,
      onClear,
    };
  },
};
</script>

<style lang="scss" scoped>
::v-deep {
  .my-multiple-filter-container {
    display: flex;
    justify-content: space-between;
    .my-form-container {
      min-width: calc(100% / 3 * 2);

      .el-form-item {
        margin: 0;
      }
    }
    .button-box {
      min-width: 145px;
    }
  }
}
</style>

<style lang="scss">
.el-overlay {
  .material-management-modal {
    .my-form {
      padding: 0 166px 0 24px;
    }
  }
}
</style>
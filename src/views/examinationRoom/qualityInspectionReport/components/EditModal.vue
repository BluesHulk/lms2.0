<template>
  <MyDialog
    :className="'receipt-modal'"
    v-if="visible"
    :visible="visible"
    :title="modalTitle + '质检报告单'"
    :width="812"
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
        <template #batchId>
          <el-input
            v-model="formData.batchNum"
            clearable
            placeholder="请选择"
            @click="onModalShow"
            @clear="onClear"
          >
            <template #suffix>
              <i class="iconfont icon-a-16search"></i>
            </template>
          </el-input>
        </template>
        <template v-slot:customerId>
          <CustomerSelect
            :modalTitle="'选择客户'"
            :customerId="formData.customerId"
            @selectedCustomer="selectedCustomer"
          />
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
  <BatchModal
    :visible="modalShow"
    :isRequired="true"
    :modalType="'single'"
    @onClose="onModalClose('batch')"
    @getSelected="getSelected"
  />
</template>

<script>
import { ref, reactive, toRefs,computed } from "vue";
import { ElMessage } from "element-plus";
import MyDialog from "@/components/MyDialog.vue";
import MyForm from "@/components/MyForm.vue";
import BatchModal from "@/components/commonModal/BatchModal.vue";
import commonApi from "@/request/services/common";
import { qualityInspectionApi } from "@/request/services/examinationRoom";
import CustomerSelect from "@/components/commonModal/CustomerModal.vue";
import config from "@/utils/config";
import { useStore } from "vuex";

export default {
  name: "TakeNumModal",
  components: {
    MyDialog,
    MyForm,
    CustomerSelect,
    BatchModal,
  },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    modalType: {
      type: String,
    },
    modalTitle: {
      type: String,
      default: "",
    },
    modalData: {
      type: Object,
      default: () => ({}),
    },
  },
  setup(props, { emit }) {
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
    const formRecord = reactive({
      formRef: null,
      formItems: [
        {
          type: "labelBlank",
          label: "批次编号",
          paramName: "batchNum",
          slotName: "batchId",
          span: 12,
        },
        {
          type: "select",
          label: "所属公司",
          paramName: "tenantId",
          options: tenantList,
          span: 12,
        },
        {
          type: "input",
          label: "发货工厂",
          paramName: "billFactoryName",
          disabled: true,
          span: 12,
        },
        {
          type: "labelBlank",
          label: "客户名称",
          paramName: "customerId",
          slotName: "customerId",
          span: 12,
        },
        {
          type: "input",
          label: "客户编号",
          paramName: "customerCode",
          disabled: true,
          span: 12,
        },
        {
          type: "input",
          label: "开单客户",
          paramName: "billCustomerName",
          maxlength: 50,
        },
        {
          type: "input",
          label: "物料名称",
          paramName: "productName",
          disabled: true,
          span: 12,
        },
        {
          type: "input",
          label: "物料编号",
          paramName: "productCode",
          disabled: true,
          span: 12,
        },
        {
          type: "input",
          label: "车牌号",
          paramName: "licensePlate",
          maxlength: 20,
          span: 12,
        },
        {
          type: "number",
          label: "提货吨数",
          paramName: "amount",
          maxlength: 10,
          span: 12,
        },
        {
          type: "input",
          label: "提货单号",
          paramName: "num",
          maxlength: 50,
        },
        {
          type: "textArea",
          label: "备注",
          paramName: "remark",
        },
      ],
      formRules: {
        tenantId: [config.rules({ type: "required" })],
        billFactoryName: [config.rules({ type: "required" })],
        productName: [config.rules({ type: "required" })],
        productCode: [config.rules({ type: "required" })],
        customerId: [config.rules({ type: "required" })],
        customerCode: [config.rules({ type: "required" })],
        batchNum: [config.rules({ type: "required" })],
        licensePlate: [config.rules({ type: "required" })],
      },
      formData: {
        ...props.modalData,
      },
    });

    const getDetail = () => {
      qualityInspectionApi.getDetail(props.modalData.id).then((res) => {
        if (res && res.code == 0) {
          formRecord.formData = res.data;
        }
      });
    };
    props.modalData.id && getDetail();

    const onFormItemChange = (data, paramName) => {
      if (paramName == "tenantId") {
        tenantList.value.map((item) => {
          if (item.value == data.tenantId) {
            formRecord.formData.tenantName = item.label;
          }
        });
      }
    };

    const onUpdateDialogStatus = (status) => {
      if (!status) {
        emit("onClose", status);
      }
    };

    const onModalClose = (type) => {
      if (type == "batch") {
        modalRecord.modalShow = false;
      } else {
        emit("onClose", false);
      }
    };

    const onConfirm = () => {
      formRecord.formRef.submitForm().then((valid) => {
        if (valid) {
          const data = { ...formRecord.formData };
          qualityInspectionApi[props.modalType == "add" ? "onAdd" : "onEdit"](
            data
          ).then((res) => {
            if (res && res.code == 0) {
              ElMessage.success("操作成功！");
              onModalClose();
              emit("onRefresh");
            } else {
              ElMessage.error(res.message);
            }
          });
        }
      });
    };

    const modalRecord = reactive({
      modalShow: false,
    });

    const onModalShow = (type) => {
      modalRecord.modalShow = true;
    };

    const getSelected = (val = {}) => {
      formRecord.formData.productName = val.productName;
      formRecord.formData.productId = val.productId;
      formRecord.formData.productCode = val.productCode;
      formRecord.formData.packType = val.packType;
      formRecord.formData.batchId = val.id;
      formRecord.formData.batchNum = val.batchNum;
      formRecord.formData.billFactoryCode = val.billFactoryCode;
      formRecord.formData.billFactoryName = val.billFactoryName;
    };

    const onClear = () => {
      formRecord.formData.productName = "";
      formRecord.formData.productId = "";
      formRecord.formData.productCode = "";
      formRecord.formData.batchId = "";
      formRecord.formData.batchNum = "";
      formRecord.formData.billFactoryCode = "";
      formRecord.formData.billFactoryName = "";
    };
    const selectedCustomer = (val) => {
      formRecord.formData.customerId = val.id;
      formRecord.formData.customerCode = val.code;
      formRecord.formData.customerName = val.name;
    };
    return {
      ...toRefs(formRecord),
      ...toRefs(modalRecord),
      onUpdateDialogStatus,
      onModalClose,
      onConfirm,
      onFormItemChange,
      onModalShow,
      getSelected,
      onClear,
      selectedCustomer,
    };
  },
};
</script>

<style lang="scss" scoped>
.content {
  padding: 0 184px 0 24px;

  .info {
    display: flex;
    flex-direction: column;

    .info-item {
      display: flex;
      margin-bottom: 16px;

      .label {
        padding-left: 12px;
        width: 124px;
      }
    }
  }
  .text {
    padding: 0 8px;
    width: 160px;
    color: $color-blue;
    line-height: 16px;
  }
}
</style>
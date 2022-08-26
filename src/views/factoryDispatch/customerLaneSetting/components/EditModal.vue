<template>
  <MyDialog
    v-if="visible"
    :visible="visible"
    :title="modalTitle + '客户车道设置'"
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
        <template #customerId>
          <CustomerModal
            :modalTitle="'选择客户'"
            :lockType="1"
            :customerId="formData.customerId"
            @selectedCustomer="selectedCustomer"
          />
        </template>
        <template #customerCode>{{ formData.customerCode }}</template>
        <template #millCode>{{ formData.millCode }}</template>
      </MyForm>
    </div>
    <template v-slot:footer>
      <el-button @click="onModalClose">取消</el-button>
      <el-button type="primary" @click="onConfirm" :loading="btnLoading">
        确定
      </el-button>
    </template>
  </MyDialog>
</template>

<script>
import { ref, reactive, toRefs, computed } from "vue";
import { ElMessage } from "element-plus";
import MyDialog from "@/components/MyDialog.vue";
import MyForm from "@/components/MyForm.vue";
import CustomerModal from "@/components/commonModal/CustomerModal.vue";
import { customerLaneSettingApi } from "@/request/services/factoryDispatch";
import { millManagementApi } from "@/request/services/factoryDispatch";
import config from "@/utils/config";
import { useStore } from "vuex";

export default {
  name: "EditModal",
  components: {
    MyDialog,
    MyForm,
    CustomerModal,
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

    const tenantList = ref(computed(() => {
      if(store.state.common.tenantList.length) {
        return store.state.common.tenantList;
      } else {
        store.dispatch('common/getTenantList');
      }
    }));

    const millList = ref([]);

    const getMillList = () => {
      millManagementApi.getMillList().then((res) => {
        if (res && res.code == 0) {
          res.data.map((item) => {
            item.label = item.name;
            item.value = item.id;
          });
          millList.value = res.data;
        }
      });
    };
    getMillList();

    const formRecord = reactive({
      formRef: null,
      formItems: [
        {
          type: "select",
          label: "所属公司",
          paramName: "tenantId",
          options: tenantList,
          disabled: true,
        },
        {
          type: "labelBlank",
          label: "客户名称",
          paramName: "customerId",
          slotName: "customerId",
        },
        {
          // type: "labelBlank",
          type: "input",
          label: "客户编号",
          paramName: "customerCode",
          // slotName: "customerCode",
          disabled: true,
        },
        {
          type: "select",
          label: "磨机名称",
          paramName: "millId",
          options: millList,
        },
        {
          // type: "labelBlank",
          type: "input",
          label: "磨机编号",
          paramName: "millCode",
          // slotName: "millCode",
          disabled: true,
        },
        {
          type: "select",
          label: "车道类型",
          paramName: "laneType",
          options: [
            { label: "普通", value: "ordinary" },
            { label: "VIP", value: "vip" },
          ],
        },
      ],
      formRules: {
        tenantId: [config.rules({ type: "required" })],
        customerId: [config.rules({ type: "required", trigger: "change" })],
        customerCode: [config.rules({ type: "required", trigger: "change" })],
        millId: [config.rules({ type: "required", trigger: "change" })],
        millCode: [config.rules({ type: "required", trigger: "change" })],
        // laneType: [config.rules({ type: "required", trigger: "change" })],
      },
      formData: {
        tenantId: sessionStorage.getItem("tenantId")
          ? sessionStorage.getItem("tenantId") * 1
          : undefined,
        laneType: "vip",
        ...props.modalData,
      },
    });

    const onFormItemChange = (data, paramName) => {
      if (paramName == "tenantId") {
        tenantList.value.map((item) => {
          if (item.value == data.tenantId) {
            formRecord.formData.tenantName = item.label;
          }
        });
      }
      if (paramName == "millId") {
        millList.value.map((item) => {
          if (item.value == data.millId) {
            formRecord.formData.millCode = item.code;
          } 
          if (!data.millId) {
            formRecord.formData.millCode = '';
          }
        });
      }
    };

    const onUpdateDialogStatus = (status) => {
      if (!status) {
        emit("onClose", status);
      }
    };

    const onModalClose = () => {
      emit("onClose", false);
    };

    const onConfirm = () => {
      // if (!formRecord.formData.millId && !formRecord.formData.laneType) {
      //   ElMessage.warning("磨机与车道类型至少填写一项");
      //   return;
      // }
      formRecord.formRef.submitForm().then((valid) => {
        if (valid) {
          customerLaneSettingApi[props.modalType == "add" ? "onAdd" : "onEdit"](
            formRecord.formData
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

    const selectedCustomer = (val) => {
      formRecord.formData.customerId = val.id;
      formRecord.formData.customerName = val.name;
      formRecord.formData.customerCode = val.code;
    };

    return {
      ...toRefs(formRecord),
      onUpdateDialogStatus,
      onModalClose,
      onConfirm,
      onFormItemChange,
      selectedCustomer,
    };
  },
};
</script>

<style lang="scss" scoped>
.content {
  padding: 0 166px 0 24px;
}
</style>
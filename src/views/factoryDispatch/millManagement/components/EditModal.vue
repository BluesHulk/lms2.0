<template>
  <MyDialog
    v-if="visible"
    :visible="visible"
    :title="modalTitle + '磨机'"
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
        <template #code>{{ formData.code }}</template>
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
import { useStore } from "vuex";
import { ElMessage } from "element-plus";
import MyDialog from "@/components/MyDialog.vue";
import MyForm from "@/components/MyForm.vue";
import { millManagementApi } from "@/request/services/factoryDispatch";
import config from "@/utils/config";

export default {
  name: "EditModal",
  components: {
    MyDialog,
    MyForm,
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
        ...(
          props.modalTitle == '编辑' ?
          [{
            type: 'labelBlank',
            label: "磨机编号",
            slotName: "code",
          }] : []
        ),
        {
          type: "input",
          label: "磨机名称",
          paramName: "name",
          maxlength: 30,
        },
      ],
      formRules: {
        tenantId: [config.rules({ type: "required" })],
        name: [config.rules({ type: "required" })],
      },
      formData: {
        tenantId: sessionStorage.getItem("tenantId") ? sessionStorage.getItem("tenantId") * 1 : undefined,
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
      formRecord.formRef.submitForm().then((valid) => {
        if (valid) {
          millManagementApi[props.modalType == "add" ? "onAdd" : "onEdit"](
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

    return {
      ...toRefs(formRecord),
      onUpdateDialogStatus,
      onModalClose,
      onConfirm,
      onFormItemChange,
    };
  },
};
</script>

<style lang="scss" scoped>
.content {
  padding: 0 166px 0 24px;
}
</style>
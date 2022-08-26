<template>
  <MyDialog
    v-if="visible"
    :visible="visible"
    :title="modalTitle + '分组物料设置'"
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
            @click="onModalShow"
            @clear="onClear"
          >
            <template #suffix>
              <i class="iconfont icon-sousuo"></i>
            </template>
          </el-input>
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
    :visible="modalShow"
    :isRequired="true"
    :modalType="'single'"
    @onClose="onModalClose('material')"
    @getSelected="getSelected"
  />
</template>

<script>
import { ref, reactive, toRefs, computed } from "vue";
import { ElMessage } from "element-plus";
import MyDialog from "@/components/MyDialog.vue";
import MyForm from "@/components/MyForm.vue";
import MaterialModal from "@/components/commonModal/MaterialModal.vue";
import commonApi from "@/request/services/common";
import { groupMaterialSettingApi } from "@/request/services/factoryDispatch";
import config from "@/utils/config";
import { useStore } from "vuex";

export default {
  name: "EditModal",
  components: {
    MyDialog,
    MyForm,
    MaterialModal,
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

    const groupList = ref([]);
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
    getDictionaryList("PRODUCT_GROUP_TYPE", groupList);

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
          label: "物料名称",
          paramName: "productName",
          slotName: "productId",
        },
        {
          type: "input",
          label: "物料编号",
          paramName: "productCode",
          disabled: true,
        },
        {
          type: "select",
          label: "分组名称",
          paramName: "type",
          options: groupList,
        },
        {
          type: "input",
          label: "分组编号",
          paramName: "type",
          disabled: true,
        },
      ],
      formRules: {
        tenantId: [config.rules({ type: "required" })],
        productName: [config.rules({ type: "required", trigger: "change" })],
        productCode: [config.rules({ type: "required", trigger: "change" })],
        type: [config.rules({ type: "required", trigger: "change" })],
      },
      formData: {
        tenantId: sessionStorage.getItem("tenantId")
          ? sessionStorage.getItem("tenantId") * 1
          : undefined,
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

    const onModalClose = (type) => {
      if (type == "material") {
        modalRecord.modalShow = false;
      } else {
        emit("onClose", false);
      }
    };

    const onConfirm = () => {
      formRecord.formRef.submitForm().then((valid) => {
        if (valid) {
          groupMaterialSettingApi[props.modalType == "add" ? "onAdd" : "onEdit"](
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

    const modalRecord = reactive({
      modalShow: false,
    });

    const onModalShow = (e) => {
      e.target.blur();
      modalRecord.modalShow = true;
    };

    const getSelected = (val) => {
      formRecord.formData.productName = val.productName;
      formRecord.formData.productId = val.id;
      formRecord.formData.productCode = val.productCode;
    };

    const onClear = () => {
      formRecord.formData.productName = "";
      formRecord.formData.productId = "";
      formRecord.formData.productCode = "";
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
    };
  },
};
</script>

<style lang="scss" scoped>
.content {
  padding: 0 166px 0 24px;
}
</style>
<template>
  <MyDialog
    :className="'receipt-modal'"
    v-if="visible"
    :visible="visible"
    :title="'新增业务流程'"
    :width="788"
    :closeOnCloseModal="false"
    @onUpdateDialogStatus="onUpdateDialogStatus"
  >
    <div class="content">
      <div class="type-steps">
        <el-steps :active="1" align-center space="320px" class="type-step">
          <el-step title="创建业务" />
          <el-step title="配置流程" />
        </el-steps>
      </div>
      <MyForm
        ref="formRef"
        :formItems="formItems"
        :rules="formRules"
        :formData="formData"
        @onFormItemChange="onFormItemChange"
      />
    </div>
    <template v-slot:footer>
      <el-button @click="onModalClose">取消</el-button>
      <el-button type="primary" @click="onConfirm"> 下一步 </el-button>
    </template>
  </MyDialog>
</template>

<script>
import { ref, reactive, toRefs, computed } from "vue";
import { ElMessage } from "element-plus";
import MyDialog from "@/components/MyDialog.vue";
import MyForm from "@/components/MyForm.vue";
import commonApi from "@/request/services/common";
import { flowMangementApi } from "@/request/services/messure";
import config from "@/utils/config";
import { useStore } from "vuex";

export default {
  name: "TakeNumModal",
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
          type: "input",
          label: "流程名称",
          paramName: "name",
          span: 24,
        },
        {
          type: "select",
          label: "所属公司",
          paramName: "tenantId",
          options: tenantList,
          span: 24,
        },
        {
          type: "select",
          label: "业务类型",
          paramName: "code",
          options: [
            {
              value: 1,
              label: "采购",
            },
            {
              value: 2,
              label: "销售",
            },
            {
              value: 3,
              label: "场内短倒",
            },
            {
              value: 4,
              label: "厂外短倒",
            },
            {
              value: 5,
              label: "调拨",
            },
          ],
          span: 24,
        },
      ],
      formRules: {
        tenantId: [config.rules({ type: "required" })],
        code: [config.rules({ type: "required" })],
        name: [config.rules({ type: "required" })],
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
          const data = { ...formRecord.formData };
          onModalClose();
          emit("onRefresh", data);
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
.type-steps {
  width: 90%;
  margin-top: 40px;
  margin-bottom: 40px;
  .type-step {
    margin: 0 74px;
  }
}
.my-form-container {
  width: 60%;
}
::v-deep .el-steps {
  .el-step__title.is-process {
    color: #092d5c;
    font-weight: 600;
  }
  .el-step__title.is-finish {
    color: #3c82fe;
    font-weight: 600;
  }
  .is-finish {
    .el-step__icon {
      background-color: #3c82fe;
      border-color: #3c82fe;
      .el-step__icon-inner {
        color: #fff;
        font-weight: bold;
      }
    }
  }
  .is-process {
    .el-step__icon {
      background-color: #dce5ed;
      border-color: #dce5ed;
      .el-step__icon-inner {
        color: #fff;
        font-weight: bold;
      }
    }
  }
}
.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>
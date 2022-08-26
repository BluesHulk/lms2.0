<template>
  <MyDialog
    :className="'receipt-modal'"
    v-if="modalShow"
    :visible="modalShow"
    :title="modalTitle"
    :width="712"
    @onUpdateDialogStatus="onUpdateDialogStatus"
  >
    <div class="content">
      <MyForm
        ref="formRef"
        :formItems="formItems"
        :rules="formRules"
        :formData="formData"
        @onFormItemChange="onFormItemChange"
        @submitForm="submitForm"
      >
        <template v-slot:info>
          <div class="info">
            <div
              class="info-item"
              v-for="(item, index) in infoList"
              :key="index"
            >
              <div class="label">{{ item.label }}：</div>
              <div class="value">{{ item.data }}</div>
            </div>
          </div>
        </template>
        <template v-slot:extraInfo>
          <div class="number-info">前面有位</div>
        </template>
      </MyForm>
    </div>
    <template v-slot:footer>
      <el-button @click="onModalClose">取消</el-button>
      <el-button
        type="primary"
        @click="onConfirm"
        :loading="btnLoading"
      >
        确定
      </el-button>
    </template>
  </MyDialog>
</template>

<script>
import { ref, reactive, toRefs } from "vue";
import { ElMessage } from "element-plus";
import MyDialog from "@/components/MyDialog.vue";
import MyForm from "@/components/MyForm.vue";
import { billsPayableApi } from "@/request/services/fundsManagement";
import config from "@/utils/config";

export default {
  name: "TakeNumModal",
  components: {
    MyDialog,
    MyForm,
  },
  props: {
    modalShow: {
      type: Boolean,
      default: false,
    },
    modalTitle: {
      type: String,
      default: "插队",
    },
    modalData: {
      type: Object,
      default: () => ({}),
    },
  },
  setup(props, { emit }) {
    const infoList = ref([
      {
        label: "车牌号",
        data: props.modalData["a"] || "浙A12345",
      },
      {
        label: "物料名称",
        data: props.modalData["a"] || "原料",
      },
      {
        label: "排队序号",
        data: props.modalData["a"] || "10",
      },
    ]);

    const formRecord = reactive({
      formRef: null,
      formItems: [
        {
          type: "blank",
          slotName: "info",
        },
        {
          type: "number",
          label: "前移位数",
          paramName: "num",
          suffix: "位",
          extraSlot: "extraInfo",
          extraSlotClass: "extra-info",
        },
      ],
      formRules: {
        num: [config.rules({ type: "required" })],
      },
      formData: {},
    });

    const onUpdateDialogStatus = (status) => {
      if (!status) {
        emit("onClose", status);
      }
    };

    const onModalClose = () => {
      emit("onClose", false);
    };

    const submitForm = (val) => {
      console.log(val, 111111);
    }

    const onConfirm = () => {
      formRecord.formRef.submitForm();
    };

    return {
      infoList,
      ...toRefs(formRecord),
      onUpdateDialogStatus,
      onModalClose,
      submitForm,
      onConfirm,
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
  .number-info {
    padding: 0 8px;
    width: 160px;
    color: $color-blue;
  }
}
</style>
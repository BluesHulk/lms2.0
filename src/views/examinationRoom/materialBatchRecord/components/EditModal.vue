<template>
  <MyDialog
    :className="'receipt-modal'"
    v-if="visible"
    :visible="visible"
    :title="modalTitle + '物料批次'"
    :width="860"
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
        <template #productCode>{{ formData.productCode }}</template>
        <template #line>
          <div class="line"></div>
        </template>
        <template #extraInfo>
          <div class="text"><span>*</span>每多少吨为一个批次，检测一次</div>
        </template>
        <template #extraInfo1>
          <div class="text"><span>*</span>批号开始第一车分配N天内有效，超出换下一批次</div>
        </template>
        <template #extraInfo2>
          <div class="text"><span>*</span>已发量达到检测量设定百分比，发送取样消息</div>
        </template>
        <template #extraInfo3>
          <div class="text"><span>*</span>已发量达到检测量设定百分比，换下一批次</div>
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
import { ref, reactive, toRefs } from "vue";
import { ElMessage } from "element-plus";
import MyDialog from "@/components/MyDialog.vue";
import MyForm from "@/components/MyForm.vue";
import MaterialModal from "@/components/commonModal/MaterialModal.vue";
import commonApi from "@/request/services/common";
import { batchRecordApi } from "@/request/services/examinationRoom";
import config from "@/utils/config";

export default {
  name: "TakeNumModal",
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

    const formRecord = reactive({
      formRef: null,
      formItems: [
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
        {
          type: "input",
          label: "批次编号",
          paramName: "batchNum",
          maxlength: 30,
          span: 12,
        },
        {
          type: "select",
          label: "批次分组",
          paramName: "batchType",
          options: [{ label: "普通", value: 0 }],
          span: 12,
        },
        {
          type: "labelBlank",
          label: "物料名称",
          paramName: "productId",
          slotName: "productId",
          span: 12,
        },
        {
          type: "labelBlank",
          label: "物料编号",
          paramName: "productCode",
          slotName: "productCode",
          span: 12,
        },
        { type: 'blank', span: 24, slotName: 'line' },
        {
          type: "number",
          label: "检测量(t)",
          paramName: "amount",
          extraSlot: "extraInfo",
          extraSlotClass: "extra-info",
          span: 12,
        },
        { type: 'blank', span: 12 },
        {
          type: "number",
          label: "周期(天)",
          paramName: "period",
          extraSlot: "extraInfo1",
          extraSlotClass: "extra-info",
          span: 12,
        },
        { type: 'blank', span: 12 },
        {
          type: "number",
          label: "预警量(%)",
          paramName: "warningAmount",
          extraSlot: "extraInfo2",
          extraSlotClass: "extra-info",
          span: 12,
        },
        { type: 'blank', span: 12 },
        {
          type: "number",
          label: "禁超量(%)",
          paramName: "banSurpassAmount",
          extraSlot: "extraInfo3",
          extraSlotClass: "extra-info",
          span: 12,
        },
      ],
      formRules: {
        tenantId: [config.rules({ type: "required", trigger: "change" })],
        billFactoryCode: [config.rules({ type: "required", trigger: "change" })],
        batchNum: [config.rules({ type: "required" })],
        batchType: [config.rules({ type: "required" })],
        productId: [config.rules({ type: "required", trigger: "change" })],
        productCode: [config.rules({ type: "required", trigger: "change" })],
        amount: [
          config.rules({ type: "maxLength", maxLength: 6, trigger: "change" }),
          config.rules({ type: "required" }),
          config.rules({ type: "intrger" }),
        ],
        period: [
          config.rules({ type: "maxLength", maxLength: 3, trigger: "change" }),
          config.rules({ type: "required" }),
          config.rules({ type: "intrger" }),
        ],
        warningAmount: [
          config.rules({ type: "maxLength", maxLength: 3, trigger: "change" }),
          config.rules({ type: "required" }),
          config.rules({ type: "intrger" }),
        ],
        banSurpassAmount: [
          config.rules({ type: "maxLength", maxLength: 3, trigger: "change" }),
          config.rules({ type: "required" }),
          config.rules({ type: "intrger" }),
        ],
      },
      formData: {
        batchType: 0,
        warningAmount: 80,
        banSurpassAmount: 100,
        ...props.modalData,
      },
    });

    const getDetail = () => {
      batchRecordApi.getDetail(props.modalData.id)
        .then(res => {
          if(res && res.code == 0) {
            formRecord.formData = res.data;
          }
        })
    }
    // props.modalData.id && getDetail();

    const onFormItemChange = (data, paramName) => {
      if(paramName == 'tenantId') {
        tenantList.value.map(item => {
          if(item.value == data.tenantId) {
            formRecord.formData.tenantName = item.label;
          }
        })
      }
      if(paramName == 'billFactoryCode') {
        deliveryFactory.value.map(item => {
          if(item.value == data.billFactoryCode) {
            formRecord.formData.billFactoryName = item.label;
            formRecord.formData.billFactoryId = item.id;
          }
        })
      }
    }

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
          batchRecordApi[props.modalType == 'add' ? 'onAdd' : 'onEdit'](formRecord.formData).then((res) => {
            if (res && res.code == 0) {
              ElMessage.success('操作成功！');
              onModalClose();
              emit('onRefresh');
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

    const onModalShow = () => {
      modalRecord.modalShow = true;
    };

    const getSelected = (val) => {
      formRecord.formData.productName = val.productName;
      formRecord.formData.productId = val.id;
      formRecord.formData.productCode = val.productCode;
    };

    const onClear = () => {
      formRecord.formData.productName = '';
      formRecord.formData.productId = '';
      formRecord.formData.productCode = '';
    }

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
  padding: 0 72px 0 24px;

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
  .line {
    position: relative;
    left: -24px;
    margin-bottom: 24px;
    width: 860px;
    height: 1px;
    background: #F2F5F8;
  }
  .text {
    padding: 0 24px;
    width: 350px;
    color: $color-orange;

    span {
      color: $color-red;
    }
  }
}
</style>
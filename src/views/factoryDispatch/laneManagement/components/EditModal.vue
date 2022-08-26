<template>
  <MyDialog
    :className="'receipt-modal'"
    v-if="visible"
    :visible="visible"
    :title="modalTitle + '装车道'"
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
        <template #productCode>{{ formData.productCode }}</template>
        <template #volumeLabel>
          车道容量<span style="margin: 0 5px 0 1px">:</span>
          <el-tooltip
            effect="dark"
            content="车道队列可容纳最多多少辆车"
            placement="top"
          >
            <i class="iconfont icon-wenhao" />
          </el-tooltip>
        </template>
        <template #bagWeightLabel>
          单袋净重(kg)<span style="margin: 0 5px 0 1px">:</span>
          <el-tooltip
            effect="dark"
            content="包装规格，系统依此参数计算装车袋数"
            placement="top"
          >
            <i class="iconfont icon-wenhao" />
          </el-tooltip>
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
import {
  laneManagementApi,
  millManagementApi,
} from "@/request/services/factoryDispatch";
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

    const bagWeightList = ref([]);
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
    getDictionaryList("LMS_BAG_WEIGHT", bagWeightList);

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
          type: "input",
          label: "车道编号",
          paramName: "code",
          maxlength: 30,
        },
        {
          type: "input",
          label: "车道名称",
          paramName: "name",
          maxlength: 30,
        },
        {
          type: "labelBlank",
          label: "物料名称",
          paramName: "productName",
          slotName: "productId",
        },
        {
          // type: "labelBlank",
          type: "input",
          label: "物料编号",
          paramName: "productCode",
          // slotName: "productCode",
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
        {
          type: "select",
          label: "隶属磨机",
          paramName: "millId",
          options: millList,
        },
        {
          type: "number",
          label: "车道容量",
          paramName: "volume",
          labelSlot: "volumeLabel",
        },
        {
          type: "select",
          label: "单袋袋重(kg)",
          paramName: "bagWeight",
          options: bagWeightList,
          labelSlot: "bagWeightLabel",
        },
        {
          type: "radio",
          label: "车道状态",
          paramName: "isEnable",
          options: [
            { label: "启用", value: true },
            { label: "停用", value: false },
          ],
        },
      ],
      formRules: {
        tenantId: [config.rules({ type: "required" })],
        code: [
          config.rules({ type: "required" }),
          { min: 6, message: '最少输入6个字符', trigger: "blur" },
          // { pattern: /^[0-9A-Za-z]+$/, message: '只能输入英文字母跟数字', trigger: "blur" },
          { pattern: /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,30}$/, message: '请输入6-30位的英文字母、数字组合', trigger: "blur" }
        ],
        name: [config.rules({ type: "required" })],
        productName: [config.rules({ type: "required", trigger: "change" })],
        productId: [config.rules({ type: "required" })],
        productCode: [config.rules({ type: "required", trigger: "change" })],
        laneType: [config.rules({ type: "required", trigger: "change" })],
        millId: [config.rules({ type: "required", trigger: "change" })],
        volume: [
          config.rules({ type: "required" }),
          config.rules({ type: "integer1" }),
        ],
        bagWeight: [config.rules({ type: "required", trigger: "change" })],
        isEnable: [config.rules({ type: "required", trigger: "change" })],
      },
      formData: {
        tenantId: sessionStorage.getItem("tenantId")
          ? sessionStorage.getItem("tenantId") * 1
          : undefined,
        laneType: 'ordinary',
        volume: 3,
        bagWeight: "50",
        isEnable: true,
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
          laneManagementApi[props.modalType == "add" ? "onAdd" : "onEdit"](
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
      formRecord.formData.packType = val.packType;
    };

    const onClear = () => {
      formRecord.formData.productName = "";
      formRecord.formData.productId = "";
      formRecord.formData.productCode = "";
      formRecord.formData.packType = "";
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
    padding: 0 24px;
    width: 350px;
    color: $color-orange;

    span {
      color: $color-red;
    }
  }
}
</style>
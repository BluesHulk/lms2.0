<template>
  <MyDialog
    :className="'receipt-modal'"
    v-if="modalShow"
    :visible="modalShow"
    :title="modalTitle"
    :width="1540"
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
        <template #treestrength>
          <div class="soltinput">
            <el-input-number
              v-model="formData.treestrength1"
              :precision="2"
              :controls="false"
            />
            <el-input-number
              v-model="formData.treestrength2"
              :precision="2"
              :controls="false"
            />
            <el-input-number
              v-model="formData.treestrength3"
              :precision="2"
              :controls="false"
            />
          </div>
        </template>
        <template #treeabliity>
          <div class="soltinput">
            <el-input-number
              v-model="formData.treeabliity1"
              :precision="2"
              :controls="false"
            />
            <el-input-number
              v-model="formData.treeabliity2"
              :precision="2"
              :controls="false"
            />
            <el-input-number
              v-model="formData.treeabliity3"
              :precision="2"
              :controls="false"
            />
          </div>
        </template>
        <template #treehyd>
          <div class="soltinput">
            <el-input-number
              v-model="formData.treehyd1"
              :precision="2"
              :controls="false"
            />
            <el-input-number
              v-model="formData.treehyd2"
              :precision="2"
              :controls="false"
            />
          </div>
        </template>
        <template #sevenstrength>
          <div class="soltinput">
            <el-input-number
              v-model="formData.sevenstrength1"
              :precision="2"
              :controls="false"
            />
            <el-input-number
              v-model="formData.sevenstrength2"
              :precision="2"
              :controls="false"
            />
            <el-input-number
              v-model="formData.sevenstrength3"
              :precision="2"
              :controls="false"
            />
          </div>
        </template>
        <template #sevenabliity>
          <div class="soltinput">
            <el-input-number
              v-model="formData.sevenabliity1"
              :precision="2"
              :controls="false"
            />
            <el-input-number
              v-model="formData.sevenabliity2"
              :precision="2"
              :controls="false"
            />
            <el-input-number
              v-model="formData.sevenabliity3"
              :precision="2"
              :controls="false"
            />
          </div>
        </template>
        <template #sevenhyd>
          <div class="soltinput">
            <el-input-number
              v-model="formData.sevenhyd1"
              :precision="2"
              :controls="false"
            />
            <el-input-number
              v-model="formData.sevenhyd2"
              :precision="2"
              :controls="false"
            />
          </div>
        </template>
        <template #tweightstrength>
          <div class="soltinput">
            <el-input-number
              v-model="formData.tweightstrength1"
              :precision="2"
              :controls="false"
            />
            <el-input-number
              v-model="formData.tweightstrength2"
              :precision="2"
              :controls="false"
            />
            <el-input-number
              v-model="formData.tweightstrength3"
              :precision="2"
              :controls="false"
            />
          </div>
        </template>
        <template #tweightabliity>
          <div class="soltinput">
            <el-input-number
              v-model="formData.tweightabliity1"
              :precision="2"
              :controls="false"
            />
            <el-input-number
              v-model="formData.tweightabliity2"
              :precision="2"
              :controls="false"
            />
            <el-input-number
              v-model="formData.tweightabliity3"
              :precision="2"
              :controls="false"
            />
          </div>
          <!-- <div class="soltinput">
            <el-input-number
              v-model="formData.wulminc"
              :precision="2"
              :controls="false"
            />
            <el-input-number
              v-model="formData.wulminc"
              :precision="2"
              :controls="false"
            />
            <el-input-number
              v-model="formData.wulminc"
              :precision="2"
              :controls="false"
            />
          </div> -->
        </template>
        <template #tweighthyd>
          <div class="soltinput">
            <el-input-number
              v-model="formData.tweighthyd1"
              :precision="2"
              :controls="false"
            />
            <el-input-number
              v-model="formData.tweighthyd2"
              :precision="2"
              :controls="false"
            />
          </div>
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
    :visible="materialModalShow"
    :isRequired="true"
    :modalType="'single'"
    @onClose="onModalClose('batch')"
    @getSelected="getSelected"
  />
</template>

<script>
import { ref, reactive, toRefs ,computed} from "vue";
import { ElMessage } from "element-plus";
import MyDialog from "@/components/MyDialog.vue";
import MyForm from "@/components/MyForm.vue";
import { testRecordApi } from "@/request/services/examinationRoom.js";
import commonApi from "@/request/services/common";
import BatchModal from "@/components/commonModal/BatchModal.vue";
import { useStore } from "vuex";
import config from "@/utils/config";
import { forIn } from "lodash-es";

export default {
  name: "EditModal",
  components: {
    MyDialog,
    MyForm,
    BatchModal,
  },
  props: {
    modalShow: {
      type: Boolean,
      default: false,
    },
    modalTitle: {
      type: String,
    },
    modalType: {
      type: String,
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
          type: "select",
          label: "所属公司",
          paramName: "tenantId",
          options: tenantList,
          span: 6,
        },
        {
          type: "labelBlank",
          label: "批次编号",
          paramName: "batchNum",
          slotName: "batchId",
          span: 6,
        },
        {
          type: "input",
          label: "物料名称",
          paramName: "productName",
          disabled: true,
          span: 6,
        },
        {
          type: "input",
          label: "物料编号",
          paramName: "productCode",
          disabled: true,
          span: 6,
        },
        {
          type: "input",
          label: "发货工厂",
          paramName: "billFactoryName",
          disabled: true,
          span: 6,
        },
        {
          type: "datePicker",
          label: "取样日期",
          paramName: "samplingDate",
          span: 6,
        },
        {
          type: "datePicker",
          label: "试验日期",
          paramName: "experimentDate",
          span: 6,
        },
        {
          type: "datePicker",
          label: "报告日期",
          paramName: "reportDate",
          span: 6,
        },
        {
          span: 24,
        },
        {
          type: "inputNumber",
          label: "细度",
          paramName: "fineness",
          precision: 2,
          controls: false,
          span: 4,
        },
        {
          type: "inputNumber",
          label: "稠度",
          paramName: "consistence",
          precision: 2,
          controls: false,
          span: 4,
        },
        {
          type: "inputNumber",
          label: "氧化镁",
          paramName: "oxide",
          precision: 2,
          controls: false,
          span: 4,
        },
        {
          type: "inputNumber",
          label: "三氧化硫",
          paramName: "sulfur",
          precision: 2,
          controls: false,
          span: 4,
        },
        {
          type: "inputNumber",
          label: "烧失量",
          paramName: "ignition",
          precision: 2,
          controls: false,
          span: 4,
        },
        {
          type: "inputNumber",
          label: "碱含量",
          paramName: "alkail",
          precision: 2,
          controls: false,
          span: 4,
        },
        {
          type: "inputNumber",
          label: "游离钙",
          paramName: "calcium",
          precision: 2,
          controls: false,
          span: 4,
        },
        {
          type: "inputNumber",
          label: "氯离子",
          paramName: "chlorine",
          precision: 2,
          controls: false,
          span: 4,
        },
        {
          type: "inputNumber",
          label: "铝酸三钙",
          paramName: "aluminium",
          precision: 2,
          controls: false,
          span: 4,
        },
        {
          type: "input",
          label: "助磨剂",
          paramName: "grin",
          span: 4,
        },
        {
          type: "inputNumber",
          label: "助磨剂量",
          paramName: "grining",
          precision: 2,
          controls: false,
          span: 4,
        },
        {
          type: "inputNumber",
          label: "表比面积",
          paramName: "show",
          precision: 2,
          controls: false,
          span: 4,
        },
        {
          type: "inputNumber",
          label: "不溶物",
          paramName: "insoluble ",
          precision: 2,
          controls: false,
          span: 4,
        },
        {
          type: "inputNumber",
          label: "初凝时间",
          paramName: "initle",
          precision: 2,
          controls: false,
          span: 4,
        },
        {
          type: "inputNumber",
          label: "终凝时间",
          paramName: "endle",
          precision: 2,
          controls: false,
          span: 4,
        },
        {
          type: "input",
          label: "安定性",
          paramName: "stablity",
          span: 4,
        },
        {
          type: "inputNumber",
          label: "保水率",
          paramName: "water",
          precision: 2,
          controls: false,
          span: 4,
        },
        {
          type: "inputNumber",
          label: "钙硅比",
          paramName: "gaiguibi",
          precision: 2,
          controls: false,
          span: 4,
        },
        {
          type: "inputNumber",
          label: "硅酸盐",
          paramName: "guisuanyan",
          precision: 2,
          controls: false,
          span: 4,
        },
        {
          type: "inputNumber",
          label: "C4AF",
          paramName: "c4fa",
          precision: 2,
          controls: false,
          span: 4,
        },
        {
          type: "inputNumber",
          label: "C3S",
          paramName: "c3s",
          precision: 2,
          controls: false,
          span: 4,
        },
        {
          type: "input",
          label: "石膏育种",
          paramName: "sgyz",
          precision: 2,
          controls: false,
          span: 4,
        },
        {
          type: "inputNumber",
          label: "石膏量",
          paramName: "shigaoliang",
          precision: 2,
          controls: false,
          span: 4,
        },
        {
          type: "input",
          label: "混合材类",
          paramName: "material",
          precision: 2,
          controls: false,
          span: 4,
        },
        {
          type: "inputNumber",
          label: "混合材量",
          paramName: "materialing",
          precision: 2,
          controls: false,
          span: 4,
        },
        {
          type: "inputNumber",
          label: "干缩率",
          paramName: "shrink",
          precision: 2,
          controls: false,
          span: 4,
        },
        {
          type: "input",
          label: "耐磨性",
          paramName: "naimoxing",
          precision: 2,
          controls: false,
          span: 4,
        },
        {
          span: 24,
        },
        {
          type: "labelBlank",
          label: "3天抗折强度",
          paramName: "treestrength",
          slotName: "treestrength",
          span: 8,
        },
        {
          type: "labelBlank",
          label: "3天抗压强度",
          paramName: "treeabliity",
          slotName: "treeabliity",
          span: 8,
        },
        {
          type: "labelBlank",
          label: "3天水化热",
          paramName: "treehyd",
          slotName: "treehyd",
          span: 8,
        },
        {
          type: "labelBlank",
          label: "7天抗折强度",
          paramName: "sevenstrength",
          slotName: "sevenstrength",
          span: 8,
        },
        {
          type: "labelBlank",
          label: "7天抗压强度",
          paramName: "sevenabliity",
          slotName: "sevenabliity",
          span: 8,
        },
        {
          type: "labelBlank",
          label: "7天水化热",
          paramName: "sevenhyd",
          slotName: "sevenhyd",
          span: 8,
        },
        {
          type: "labelBlank",
          label: "28天抗折强度",
          paramName: "tweightstrength",
          slotName: "tweightstrength",
          span: 8,
        },
        {
          type: "labelBlank",
          label: "28天抗压强度",
          paramName: "tweightabliity",
          slotName: "tweightabliity",
          span: 8,
        },
        {
          type: "labelBlank",
          label: "28天水化热",
          paramName: "tweighthyd",
          slotName: "tweighthyd",
          span: 8,
        },
      ],
      formRules: {
        tenantId: [config.rules({ type: "required" })],
        billFactoryName: [config.rules({ type: "required" })],
        productName: [config.rules({ type: "required" })],
        productCode: [config.rules({ type: "required" })],
        batchNum: [config.rules({ type: "required" })],
        samplingDate: [config.rules({ type: "required" })],
        experimentDate: [config.rules({ type: "required" })],
        reportDate: [config.rules({ type: "required" })],
      },
      formData: {},
      detailData: {},
      laboratoryRecordsContentList: [],
    });
    const getDetail = () => {
      testRecordApi.getDetail(props.modalData.id).then((res) => {
        if (res && res.code == 0) {
          res.data.laboratoryRecordsContentList.map((item) => {
            formRecord.formData[item.contKey] = item.contValue;
          });
          formRecord.laboratoryRecordsContentList =
            res.data.laboratoryRecordsContentList;
          formRecord.formData.tenantId = formRecord.formData.tenantId * 1;
        }
      });
    };
    props.modalData.id && getDetail();
    const onUpdateDialogStatus = (status) => {
      if (!status) {
        emit("onClose", status);
      }
    };

    const onModalClose = (type) => {
      if (type == "batch") {
        modalRecord.materialModalShow = false;
      } else {
        emit("onClose", false);
      }
    };

    const submitForm = (val) => {
      console.log(val, 111111);
    };

    const onFormItemChange = (data, paramName) => {
      if (paramName == "tenantId") {
        tenantList.value.map((item) => {
          if (item.value == data.tenantId) {
            formRecord.formData.tenantName = item.label;
          }
        });
      }
    };

    const onConfirm = () => {
      formRecord.formRef.submitForm().then((valid) => {
        if (valid) {
          const data = { ...formRecord.formData };
          const objList = [];
          if (props.modalType == "add") {
            for (let i in data) {
              objList.push({
                contKey: i,
                contValue: data[i],
                status: 0,
                tenantId: data.tenantId,
                tenantName: data.tenantName,
              });
            }
          } else {
            let editObjlist = formRecord.laboratoryRecordsContentList;
            for (let i in data) {
              let edItem = editObjlist.find((val) => val.contKey == i);
              if (edItem != undefined) {
                edItem.contValue = data[i];
                objList.push(edItem);
              } else {
                objList.push({
                  contKey: i,
                  contValue: data[i],
                  status: 0,
                  tenantId: data.tenantId,
                  tenantName: data.tenantName,
                });
              }
            }
          }

          const params = {
            batchId: data.batchId,
            experimentDate: data.experimentDate,
            reportDate: data.reportDate,
            samplingDate: data.samplingDate,
            tenantId: data.tenantId,
            tenantName: data.tenantName,
            laboratoryRecordsContentList: objList,
            status: 0,
          };
          if (props.modalType == "edit") {
            params.id = props.modalData.id;
          }
          testRecordApi[props.modalType == "add" ? "onAdd" : "onEdit"](
            params
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
      materialModalShow: false,
    });

    const onModalShow = () => {
      modalRecord.materialModalShow = true;
    };

    const getSelected = (val = {}) => {
      formRecord.formData.productName = val.productName;
      formRecord.formData.productId = val.productId;
      formRecord.formData.productCode = val.productCode;
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

    return {
      tenantList,
      onFormItemChange,
      ...toRefs(formRecord),
      ...toRefs(modalRecord),
      onUpdateDialogStatus,
      onModalShow,
      onModalClose,
      submitForm,
      onConfirm,
      getSelected,
      onClear,
    };
  },
};
</script>

<style lang="scss" scoped>
.content {
  padding: 0 24px;
  .soltinput {
    display: flex;
  }
}
::v-deep {
  .el-input-number .el-input__inner {
    text-align: left;
  }
}
</style>
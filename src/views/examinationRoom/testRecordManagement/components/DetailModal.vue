<template>
  <MyDialog
    :className="'receipt-modal'"
    v-if="modalShow"
    :visible="modalShow"
    :title="'检验记录详情'"
    :width="1640"
    @onUpdateDialogStatus="onUpdateDialogStatus"
  >
    <div class="content">
      <JDetailCard :detailItems="detailItems" :detailData="detailData" />
    </div>
  </MyDialog>
</template>

<script>
import { ref, reactive, toRefs } from "vue";
import { ElMessage } from "element-plus";
import MyDialog from "@/components/MyDialog.vue";
import { testRecordApi } from "@/request/services/examinationRoom.js";
import JDetailCard from "@/components/JDetailCard.vue";
export default {
  name: "EditModal",
  components: {
    MyDialog,
    JDetailCard,
  },
  props: {
    modalShow: {
      type: Boolean,
      default: false,
    },
    modalData: {
      type: Object,
      default: () => ({}),
    },
  },
  setup(props, { emit }) {
    const formRecord = reactive({
      formRef: null,
      detailItems: [
        {
          label: "所属公司:",
          prop: "tenantName",
          span: 6,
        },
        {
          label: "发货工厂",
          prop: "billFactoryName",
          span: 6,
        },
        {
          label: "物料名称：",
          prop: "productName",
          span: 6,
        },
        {
          label: "物料编号：",
          prop: "productCode",
          span: 6,
        },
        {
          label: "批次编号：",
          prop: "batchNum",
          span: 6,
        },
        {
          label: "取样日期：",
          prop: "samplingDate",
          span: 6,
        },
        {
          label: "试验日期：",
          prop: "experimentDate",
          span: 6,
        },
        {
          label: "报告日期：",
          prop: "reportDate",
          span: 6,
        },
        {
          span: 24,
        },
        {
          label: "细度：",
          prop: "fineness",
          span: 4,
        },
        {
          label: "稠度：",
          prop: "consistence",
          span: 4,
        },
        {
          label: "氧化镁：",
          prop: "oxide",
          span: 4,
        },
        {
          label: "三氧化硫：",
          prop: "sulfur",
          span: 4,
        },
        {
          label: "烧失量：",
          prop: "ignition",
          span: 4,
        },
        {
          label: "碱含量：",
          prop: "alkail",
          span: 4,
        },
        {
          label: "游离钙：",
          prop: "calcium",
          span: 4,
        },
        {
          label: "氯离子：",
          prop: "chlorine",
          span: 4,
        },
        {
          label: "铝酸三钙：",
          prop: "aluminium",
          span: 4,
        },
        {
          label: "助磨剂：",
          prop: "grin",
          span: 4,
        },
        {
          label: "助磨剂量：",
          prop: "grining",
          span: 4,
        },
        {
          label: "表比面积：",
          prop: "show",
          span: 4,
        },
        {
          label: "不溶物：",
          prop: "insoluble",
          span: 4,
        },
        {
          label: "初凝时间：",
          prop: "initle",
          span: 4,
        },
        {
          label: "终凝时间：",
          prop: "endle",
          span: 4,
        },
        {
          label: "安定性：",
          prop: "stablity",
          span: 4,
        },
        {
          label: "保水率：",
          prop: "water",
          span: 4,
        },
        {
          label: "钙硅比：",
          prop: "gaiguibi",
          span: 4,
        },
        {
          label: "硅酸盐：",
          prop: "guisuanyan",
          span: 4,
        },
        {
          label: "C4AF：",
          prop: "c4fa",
          span: 4,
        },
        {
          label: "C3S：",
          prop: "c3s",
          span: 4,
        },
        {
          label: "石膏育种：",
          prop: "sgyz",
          span: 4,
        },
        {
          label: "石膏量：",
          prop: "shigaoliang",
          span: 4,
        },
        {
          label: "混合材类：",
          prop: "material",
          span: 4,
        },
        {
          label: "混合材量：",
          prop: "materialing",
          span: 4,
        },
        {
          label: "干缩率：",
          prop: "shrink",
          span: 4,
        },
        {
          label: "耐磨性：",
          prop: "naimoxing",
          span: 4,
        },
        {
          span: 24,
        },
        {
          label: "3天抗折强度：",
          prop: "treestrength",
          span: 8,
        },
        {
          label: "3天抗压强度：",
          prop: "treeabliity",
          span: 8,
        },
        {
          label: "3天水化热：",
          prop: "treehyd",
          span: 8,
        },
        {
          label: "7天抗折强度：",
          prop: "sevenstrength",
          span: 8,
        },
        {
          label: "7天抗压强度：",
          prop: "sevenabliity",
          span: 8,
        },
        {
          label: "7天水化热：",
          prop: "sevenhyd",
          span: 8,
        },
        {
          label: "28天抗折强度：",
          prop: "tweightstrength",
          span: 8,
        },
        {
          label: "28天抗压强度：",
          prop: "tweightabliity",
          span: 8,
        },
        {
          label: "28天水化热：",
          prop: "tweighthyd",
          span: 8,
        },
      ],
      detailData: {},
    });
    const getDetail = () => {
      testRecordApi.getDetail(props.modalData.id).then((res) => {
        let obj = {};
        if (res && res.code == 0) {
          res.data.laboratoryRecordsContentList.map((item) => {
            obj[item.contKey] = item.contValue;
          });
        }
        obj.samplingDate = obj.samplingDate.split("T")[0];
        obj.experimentDate = obj.experimentDate.split("T")[0];
        obj.reportDate = obj.reportDate.split("T")[0];
        obj.treestrength = `${obj.treestrength1 || ""}  ${
          obj.treestrength2 || ""
        }  ${obj.treestrength3 || ""}`;
        obj.treeabliity = `${obj.treeabliity1 || ""}  ${
          obj.treeabliity2 || ""
        }  ${obj.treeabliity3 || ""}`;
        obj.treehyd = `${obj.treehyd1 || ""}  ${obj.treehyd2 || ""}`;
        obj.sevenstrength = `${obj.sevenstrength1 || ""}  ${
          obj.sevenstrength2 || ""
        }  ${obj.sevenstrength3 || ""}`;
        obj.sevenabliity = `${obj.sevenabliity1 || ""}  ${
          obj.sevenabliity2 || ""
        }  ${obj.sevenabliity3 || ""}`;
        obj.sevenhyd = `${obj.sevenhyd1 || ""}  ${obj.sevenhyd2 || ""}`;
        obj.tweightstrength = `${obj.tweightstrength1 || ""}  ${
          obj.tweightstrength2 || ""
        }  ${obj.tweightstrength3 || ""}`;
        obj.tweightabliity = `${obj.tweightabliity1 || ""}  ${
          obj.tweightabliity2 || ""
        }  ${obj.tweightabliity3 || ""}`;
        obj.tweighthyd = `${obj.tweighthyd1 || ""}  ${obj.tweighthyd2 || ""}`;

        formRecord.detailData = obj;
      });
    };
    props.modalData.id && getDetail();

    const onUpdateDialogStatus = (status) => {
      if (!status) {
        emit("onClose", status);
      }
    };

    const onModalClose = () => {
      emit("onClose", false);
    };

    return {
      ...toRefs(formRecord),
      onUpdateDialogStatus,
      onModalClose,
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
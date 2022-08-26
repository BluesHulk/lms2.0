<template>
  <MyDialog
    :className="'receipt-modal'"
    v-if="visible"
    :visible="visible"
    :title="'流程详情'"
    :width="876"
    :closeOnCloseModal="false"
    @onUpdateDialogStatus="onUpdateDialogStatus"
  >
    <div class="content">
      <JDetailCard :detailItems="detailItems" :detailData="detailData" />
      <el-button type="primary" @click="setFlow">调整流程</el-button>
      <div class="type-steps">
        <el-steps :active="tableList.length" simple class="type-step">
          <el-step
            v-for="(item, index) in tableList"
            :key="index"
            :title="item.title"
          />
        </el-steps>
      </div>
      <div class="content-box">
        <div class="box-item" v-for="(item, index) in tableList" :key="index">
          <div class="text" v-for="val in item.tableData" :key="val.pnodeOrder">
            {{ val.pnodeName }}
          </div>
        </div>
      </div>
    </div>
  </MyDialog>
</template>

<script>
import { ref, reactive, toRefs } from "vue";
import { ElMessage } from "element-plus";
import MyDialog from "@/components/MyDialog.vue";
import { flowMangementApi } from "@/request/services/messure";
import JDetailCard from "@/components/JDetailCard.vue";
export default {
  name: "EditModal",
  components: {
    MyDialog,
    JDetailCard,
  },
  props: {
    visible: {
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
          label: "流程名称:",
          prop: "name",
          span: 12,
        },
        {
          label: "流程编号:",
          prop: "code",
          span: 12,
        },
        {
          label: "所属公司:",
          prop: "tenantName",
          span: 12,
        },
        {
          label: "公司编号:",
          prop: "tenantId",
          span: 12,
        },
        {
          label: "业务类型：",
          prop: "businessTypeName",
          span: 12,
        },
        {
          label: "创建时间：",
          prop: "createTime",
          span: 12,
        },
        {
          label: "创建人：",
          prop: "createUserName",
          span: 12,
        },
        {
          label: "修改时间：",
          prop: "updateTime",
          span: 12,
        },
        {
          label: "修改人：",
          prop: "updateUserName",
          span: 12,
        },
      ],
      detailData: {},
      tableList: [
        {
          title: "开始节点",
          tableData: [],
        },
        {
          title: "入场流程",
          tableData: [],
        },
        {
          title: "一次过磅流程",
          tableData: [],
        },
        {
          title: "二次过磅流程",
          tableData: [],
        },
        {
          title: "出厂流程",
          tableData: [],
        },
        {
          title: "结束节点",
          tableData: [],
        },
      ],
    });
    const getDetail = () => {
      flowMangementApi.getDetail({ id: props.modalData.id }).then((res) => {
        if (res && res.code == 0) {
          res.data.businessTypeName = {
            1: "采购",
            2: "销售",
            3: "场内短倒",
            4: "厂外短倒",
            5: "调拨",
          }[res.data.code];
          formRecord.detailData = res.data;
          res.data.processList.map((item) => {
            if (item.pnodeStatus == "1" && item.type != 1 && item.type != 6) {
              formRecord.tableList[item.type - 1].tableData.push(item);
            }
          });
          let newArr = formRecord.tableList.filter(
            (item) => item.tableData.length > 0
          );
          formRecord.tableList = newArr;
        }
      });
    };
    getDetail();
    const onUpdateDialogStatus = (status) => {
      if (!status) {
        emit("onClose", status);
      }
    };

    const setFlow = () => {
      emit("onRefresh", formRecord.detailData);
    };

    const onModalClose = () => {
      emit("onClose", false);
    };

    return {
      ...toRefs(formRecord),
      onUpdateDialogStatus,
      setFlow,
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
  .type-steps {
    margin-top: 24px;
  }
  .content-box {
    display: flex;
    .box-item {
      width: 25%;
      display: flex;
      flex-direction: column;
      align-items: center;
      .text {
        text-align: left;
        padding-top: 12px;
      }
    }
  }
}
::v-deep {
  .el-input-number .el-input__inner {
    text-align: left;
  }
  .el-steps--simple {
    background: #3c82fe;
    .el-step__title {
      font-size: 14px;
    }
    .el-step__title.is-finish {
      color: #fff;
    }
    .el-step__icon {
      width: 0px;
      height: 0px;
    }
    .el-step.is-simple .el-step__arrow::after,
    .el-step.is-simple .el-step__arrow::before {
      background: #fff;
    }
  }
}
</style>
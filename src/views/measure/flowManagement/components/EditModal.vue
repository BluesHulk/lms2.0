<template>
  <MyDialog
    :className="'receipt-modal'"
    v-if="visible"
    :visible="visible"
    :title="modalTitle"
    :width="788"
    :closeOnCloseModal="false"
    @onUpdateDialogStatus="onUpdateDialogStatus"
  >
    <div class="content">
      <div class="info-box">
        <i class="iconfont icon-wenhao" style="color: #3c82fe" />
        帮助提示：点击操作栏小图标，上下拖拽即可排序
      </div>
      <div class="type-steps" v-if="modalType == 'set'">
        <el-steps :active="2" align-center space="380px" class="type-step">
          <el-step title="创建业务" />
          <el-step title="配置流程" />
        </el-steps>
      </div>
      <div style="width: 100%; margin-left: 24px; margin-top: 24px" v-else>
        <MyForm
          ref="formRef"
          :formItems="formItems"
          :rules="formRules"
          :formData="formData"
        />
      </div>
      <div class="table-content">
        <template :key="index" v-for="(item, index) in tableList">
          <template v-if="item.class != 't1' && item.class != 't6'">
            <div class="title">
              <span class="icon"></span>
              <span class="text">{{ item.title }}</span>
            </div>
            <div class="tablebox">
              <MyTable
                ref="tableRef"
                :rowKey="'pnodeOrder'"
                :className="item.class"
                :tableData="item.tableData"
                :columns="tableColumns"
              >
                <template v-slot:num="slotProps">
                  <span>{{ slotProps.index + 1 }}</span>
                </template>
                <template v-slot:tableselect="slotProps">
                  <el-checkbox
                    :true-label="'1'"
                    :false-label="'0'"
                    v-model="slotProps.data.pnodeStatus"
                    :label="slotProps.data.pnodeName"
                    size="large"
                  />
                </template>
                <template v-slot:operation>
                  <i class="iconfont icon-yidong move" />
                </template>
              </MyTable>
            </div>
          </template>
        </template>
      </div>
    </div>
    <template v-slot:footer>
      <el-button @click="onModalClose">取消</el-button>
      <el-button type="primary" @click="onConfirm" :loading="btnLoading">
        保存
      </el-button>
    </template>
  </MyDialog>
</template>

<script>
import { ref, reactive, toRefs, onMounted, nextTick } from "vue";
import { ElMessage } from "element-plus";
import MyDialog from "@/components/MyDialog.vue";
import commonApi from "@/request/services/common";
import MyForm from "@/components/MyForm.vue";
import MyTable from "@/components/MyTable.vue";
import { flowMangementApi } from "@/request/services/messure";
import config from "@/utils/config";
import Sortable from "sortablejs";

export default {
  name: "TakeNumModal",
  components: {
    MyDialog,
    MyForm,
    MyTable,
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
    const getPnodeEnumList = () => {
      flowMangementApi.getPnodeEnum().then((res) => {
        if (res && res.code == 0) {
          res.data.map((item) => {
            item.label = item.name;
            item.value = item.code;
          });
        }
      });
    };
    getPnodeEnumList();
    const formRecord = reactive({
      formRef: null,
      formItems: [
        {
          type: "input",
          label: "流程名称",
          paramName: "name",
          span: 24,
        },
      ],
      formRules: {
        name: [config.rules({ type: "required" })],
      },
      formData: {},
    });
    const tableRecord = reactive({
      tableList: [
        {
          title: "开始节点",
          tableRef: null,
          class: "t1",
          tableData: [
            {
              pnodeOrder: 1,
              pnodeCode: "010",
              pnodeStatus: "1",
              pnodeName: "激活",
            },
          ],
        },
        {
          title: "入场流程",
          tableRef: null,
          class: "t2",
          tableData: [
            {
              pnodeOrder: 1,
              pnodeStatus: "0",
              pnodeCode: "020",
              pnodeName: "流向管控，预约检查",
            },
            {
              pnodeOrder: 2,
              pnodeStatus: "0",
              pnodeCode: "030",
              pnodeName: "发卡",
            },
            {
              pnodeOrder: 3,
              pnodeStatus: "0",
              pnodeCode: "040",
              pnodeName: "场外排队",
            },
            {
              pnodeOrder: 4,
              pnodeStatus: "0",
              pnodeCode: "050",
              pnodeName: "采样任务推送",
            },
            {
              pnodeOrder: 5,
              pnodeStatus: "0",
              pnodeCode: "060",
              pnodeName: "入厂",
            },
            {
              pnodeOrder: 6,
              pnodeStatus: "0",
              pnodeCode: "070",
              pnodeName: "采样结果检查",
            },
          ],
        },
        {
          title: "一次过磅流程",
          tableRef: null,
          class: "t3",
          tableData: [
            {
              pnodeOrder: 1,
              pnodeStatus: "0",
              pnodeCode: "080",
              pnodeName: "一次过磅",
            },
            {
              pnodeOrder: 2,
              pnodeStatus: "0",
              pnodeCode: "090",
              pnodeName: "厂内排队",
            },
            {
              pnodeOrder: 3,
              pnodeStatus: "0",
              pnodeCode: "100",
              pnodeName: "采样任务推送",
            },
            {
              pnodeOrder: 4,
              pnodeStatus: "0",
              pnodeCode: "110",
              pnodeName: "开始装卸",
            },
          ],
        },
        {
          title: "二次过磅流程",
          tableRef: null,
          class: "t4",
          tableData: [
            {
              pnodeOrder: 1,
              pnodeStatus: "0",
              pnodeCode: "120",
              pnodeName: "结束装卸",
            },
            {
              pnodeOrder: 2,
              pnodeStatus: "0",
              pnodeCode: "130",
              pnodeName: "PDA验收",
            },
            {
              pnodeOrder: 3,
              pnodeStatus: "0",
              pnodeCode: "140",
              pnodeName: "过二次磅",
            },
            {
              pnodeOrder: 4,
              pnodeStatus: "0",
              pnodeCode: "150",
              pnodeName: "采样结果检查",
            },
          ],
        },
        {
          title: "出厂流程",
          tableRef: null,
          class: "t5",
          tableData: [
            {
              pnodeOrder: 1,
              pnodeStatus: "0",
              pnodeCode: "160",
              pnodeName: "出厂",
            },
            {
              pnodeOrder: 2,
              pnodeStatus: "0",
              pnodeCode: "170",
              pnodeName: "打印票据",
            },
            {
              pnodeOrder: 3,
              pnodeStatus: "0",
              pnodeCode: "180",
              pnodeName: "收卡",
            },
          ],
        },
        {
          title: "结束节点",
          tableRef: null,
          class: "t6",
          tableData: [
            {
              pnodeOrder: 1,
              pnodeStatus: "1",
              pnodeCode: "888",
              pnodeName: "作废",
            },
            {
              pnodeOrder: 2,
              pnodeStatus: "1",
              pnodeCode: "999",
              pnodeName: "完结",
            },
          ],
        },
      ],
    });
    const getDetail = () => {
      flowMangementApi.getDetail({ id: props.modalData.id }).then((res) => {
        if (res && res.code == 0) {
          formRecord.formData = res.data;
          res.data.processList.map((item) => {
            tableRecord.tableList[item.type - 1].tableData.push(item);
          });
        }
      });
    };
    if (props.modalType == "set") {
      formRecord.formData = props.modalData;
    } else {
      tableRecord.tableList = [
        {
          title: "开始节点",
          tableRef: null,
          class: "t1",
          tableData: [],
        },
        {
          title: "入场流程",
          tableRef: null,
          class: "t2",
          tableData: [],
        },
        {
          title: "一次过磅流程",
          tableRef: null,
          class: "t3",
          tableData: [],
        },
        {
          title: "二次过磅流程",
          tableRef: null,
          class: "t4",
          tableData: [],
        },
        {
          title: "出厂流程",
          tableRef: null,
          class: "t5",
          tableData: [],
        },
        {
          title: "结束节点",
          tableRef: null,
          class: "t6",
          tableData: [],
        },
      ];
      getDetail();
    }
    const onUpdateDialogStatus = (status) => {
      if (!status) {
        emit("onClose", status);
      }
    };

    const onModalClose = () => {
      emit("onClose", false);
    };

    const onConfirm = () => {
      let paramsArr = {
        ...formRecord.formData,
        processList: [],
      };
      let isFlag = false;
      tableRecord.tableList.map((item) => {
        item.tableData.map((values, index) => {
          if (
            values.pnodeStatus == "1" &&
            item.class != "t1" &&
            item.class != "t6"
          ) {
            isFlag = true;
          }
          paramsArr.processList.push({
            ...values,
            pnodeOrder: index + 1,
            type: item.class.substr(1, 1) * 1,
          });
        });
      });
      if (isFlag) {
        flowMangementApi[props.modalType == "set" ? "onAdd" : "onEdit"](
          paramsArr
        ).then((res) => {
          if (res && res.code == 0) {
            ElMessage.success("操作成功！");
            onModalClose();
            emit("onRefresh");
          } else {
            ElMessage.error(res.message);
          }
        });
      } else {
        ElMessage.warning("至少选择一个操作流程");
      }
    };
    const tableColumns = [
      { label: "顺序", slotName: "num", width: 60 },
      { label: "节点选择", slotName: "tableselect" },
      { label: "操作", slotName: "operation", width: 80 },
    ];

    // 创建sortable实例
    const initSortable = (className) => {
      // 获取表格row的父节点
      const table = document.querySelector(
        "." + className + " .el-table__body-wrapper tbody"
      );
      // 创建拖拽实例
      Sortable.create(table, {
        animation: 150, //动画
        disabled: false, // 拖拽不可用? false 启用（刚刚渲染表格的时候起作用，后面不起作用）
        handle: ".move", //指定拖拽目标，点击此目标才可拖拽元素
        // 开始拖动事件
        onStart: () => {
          console.log("开始拖动");
        },
        // 结束拖动事件
        onEnd: ({ newIndex, oldIndex }) => {
          tableRecord.tableList.map((item) => {
            if (item.class == className) {
              const currRow = item.tableData.splice(oldIndex, 1)[0];
              item.tableData.splice(newIndex, 0, currRow);
            }
          });
        },
      });
    };

    onMounted(() => {
      nextTick(() => {
        for (var i = 2; i <= tableRecord.tableList.length - 1; i++) {
          initSortable(`t${i}`);
        }
      });
    });

    return {
      ...toRefs(formRecord),
      ...toRefs(tableRecord),
      tableColumns,
      onUpdateDialogStatus,
      onModalClose,
      onConfirm,
      initSortable,
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
  .info-box {
    padding-left: 24px;
    width: 740px;
    height: 40px;
    line-height: 40px;
    background: #edf5ff;
    border: 1px solid #97c3ff;
    color: $color-text;
  }
  .table-content {
    width: 100%;
    max-height: 600px;
    overflow-y: auto;
    .tablebox {
      padding: 0 24px;
    }
    .title {
      padding: 0 24px;
      .icon {
        display: inline-block;
        width: 5px;
        height: 18px;
        background: #3c82fe;
        border-radius: 2px;
      }
      .text {
        padding-left: 5px;
        width: 120px;
        height: 22px;
        font-size: 16px;
        font-family: PingFangSC-Semibold, PingFang SC;
        font-weight: 600;
        color: #092d5c;
        line-height: 22px;
      }
    }
  }
}
</style>
<template>
  <MyContainer>
    <template v-slot:header>
      <el-button @click="goBack">返回</el-button>
    </template>
    <div class="content">
      <MyTitle :title="'新增付款单'" icon="icon-shoukuandan" />
      <MyForm
        ref="formRef"
        labelPosition="left"
        :formItems="formItems"
        :rules="formRules"
        :formData="formData"
        @onFormItemChange="onFormItemChange"
        @submitForm="submitForm"
      >
        <template #customerId>
          <CustomerSelect
            :isRequired="true"
            :placeholder="'请选择'"
            :lockType="1"
            :customerId="formData.customerId"
            @selectedCustomer="selectedCustomer"
          />
        </template>
      </MyForm>
      <el-button @click="onModalShow('add')">添加明细</el-button>
      <MyTable
        ref="tableRef"
        :tableData="tableData"
        :columns="tableColumns"
        :selection="false"
      >
        <template v-slot:operation="slotProps">
          <el-button type="text" @click="onModalShow('edit', slotProps.data)"
            >编辑</el-button
          >
          <el-button type="text" @click="onDetailDelete(slotProps.data)"
            >删除</el-button
          >
        </template>
      </MyTable>
    </div>
    <template v-slot:footer>
      <div class="footer">
        <el-button type="primary" @click="onSave" :loading="btnLoading"
          >保存</el-button
        >
      </div>
    </template>
  </MyContainer>

  <MyDialog
    :className="'payment-order-dialog'"
    :visible="modalShow"
    :title="modalTitle"
    :width="640"
    @onUpdateDialogStatus="onUpdateDialogStatus"
  >
    <div class="payment-order-content">
      <MyForm
        ref="modalFormRef"
        :formItems="modalFormItems"
        :rules="modalFormRules"
        :formData="modalFormData"
        @onFormItemChange="onFormItemChange"
        @submitForm="submitDetail"
      >
      </MyForm>
    </div>
    <template v-slot:footer>
      <el-button @click="onModalClose">取消</el-button>
      <el-button type="primary" @click="onAddDetail" :loading="btnLoading">
        确定添加
      </el-button>
    </template>
  </MyDialog>
</template>

<script>
import { computed, reactive, ref, toRefs, watch } from "vue";
import moment from "moment";
import { ElMessage, ElMessageBox } from "element-plus";
import { useRouter } from "vue-router";
import MyContainer from "@/components/MyContainer.vue";
import MyForm from "@/components/MyForm.vue";
import MyTitle from "@/components/MyTitle.vue";
import MyTable from "@/components/MyTable.vue";
import MyDialog from "@/components/MyDialog.vue";
import CustomerSelect from "@/components/CustomerSelect.vue";
import config from "@/utils/config";
import commonApi from "@/request/services/common";
import { paymentOrderApi } from "@/request/services/fundsManagement";
import { transformArrayData } from "@/utils/index";
import { useStore } from "vuex";

export default {
  components: {
    MyContainer,
    MyForm,
    MyTitle,
    MyTable,
    MyDialog,
    CustomerSelect,
  },
  setup() {
    const store = useStore();
    const router = useRouter();

    const { type, id } = router.currentRoute.value.query;

    const tenantList = ref(
      computed(() => {
        if (store.state.common.tenantList.length) {
          return store.state.common.tenantList;
        } else {
          store.dispatch("common/getTenantList");
        }
      })
    );

    const clientList = ref([]);
    const businessTypeList = ref([]);

    const getClientList = () => {
      commonApi.getCustomer({ type: 1 }).then((res) => {
        if (res && res.code == 0) {
          res.data.map((item) => {
            item.label = item.name;
            item.value = item.id;
          });
          clientList.value = res.data;
        }
      });
    };
    getClientList();

    const getDictionaryList = (code, setData) => {
      commonApi.getTenantDictionaryList(code).then((res) => {
        if (res && res.code == 0) {
          res.data.map((item) => {
            item.label = item.name;
            item.value = item.id;
          });
          setData.value = res.data;
        }
      });
    };
    getDictionaryList("PAYMENT_BUSINESS_TYPE", businessTypeList);

    const formRecord = reactive({
      formRef: null,
      formData: {
        tenantId: sessionStorage.getItem("tenantId") ? sessionStorage.getItem("tenantId") * 1 : '',
        tenantName: computed(() => {
          let name = "";
          tenantList.value.map(item => {
            if(item.value == sessionStorage.getItem("tenantId")) {
              name = item.label;
            }
          })
          return name;
        }),
        billTime: moment(),
        payTime: moment(),
      },
      formRules: {
        tenantId: [config.rules({ type: "required", trigger: "change" })],
        customerId: [config.rules({ type: "required", trigger: "change" })],
        billTime: [config.rules({ type: "required" })],
        payTime: [config.rules({ type: "required" })],
      },
      formItems: [
        {
          type: "select",
          label: "付款主体",
          paramName: "tenantId",
          options: tenantList,
          disabled: true,
          span: 8,
        },
        {
          type: "labelBlank",
          label: "付款对象",
          paramName: "customerId",
          slotName: "customerId",
          span: 8,
        },
        {
          type: "datePicker",
          label: "单据日期",
          paramName: "billTime",
          disabled: true,
          span: 8,
        },
        {
          type: "datePicker",
          label: "支付日期",
          paramName: "payTime",
          span: 8,
        },
        {
          type: "textArea",
          label: "备注",
          paramName: "remark",
          span: 8,
        },
      ],
      btnLoading: false,
    });

    const tableRecord = reactive({
      tableRef: null,
      tableData: [],
    });

    const modalRecord = reactive({
      modalFormRef: null,
      modalShow: false,
      modalTitle: "",
      modalFormItems: [],
      modalFormRules: {
        customerId: [config.rules({ type: "required" })],
        businessType: [config.rules({ type: "required" })],
        money: [
          config.rules({ type: "required" }),
          config.rules({ type: "price" }),
        ],
        payType: [config.rules({ type: "required" })],
        billNum: [config.rules({ type: "required" })],
        payAccount: [
          config.rules({ type: "required" }),
          config.rules({ type: "integer1", message: "请输入正确的账户" })
        ],
      },
      modalFormData: {},
    });

    const getDetail = () => {
      paymentOrderApi.getDetail(id).then((res) => {
        if (res && res.code == 0) {
          res.data.billTime = moment(res.data.createTime);
          res.data.payTime = moment(res.data.payTime);
          formRecord.formData = res.data;
          tableRecord.tableData = transformArrayData(
            res.data.paymentRecords,
            true,
            true
          );
        }
      });
    };
    id && getDetail();

    const handleModalFormItems = () => {
      let arr = [];
      if (modalRecord.modalFormData.payType == 1) {
        arr = [
          {
            type: "input",
            label: "付款账户",
            paramName: "payAccount",
            maxlength: 50,
          },
          {
            type: "input",
            label: "空白收据编号",
            paramName: "blankBillNum",
          },
        ];
      }
      if (
        modalRecord.modalFormData.payType == 2 ||
        modalRecord.modalFormData.payType == 3 ||
        modalRecord.modalFormData.payType == 4 ||
        modalRecord.modalFormData.payType == 5
      ) {
        arr = [
          {
            type: "select",
            label: "票据类型",
            paramName: "billType",
            options: [
              { label: "银行承兑汇票-纸质", value: 2 },
              { label: "银行承兑汇票-电子", value: 3 },
              { label: "商业承兑汇票-纸质", value: 4 },
              { label: "商业承兑汇票-电子", value: 5 },
            ],
            disabled: true,
          },
          {
            type: "input",
            label: "票据号",
            paramName: "billNum",
          },
          {
            type: "input",
            label: "空白收据编号",
            paramName: "blankBillNum",
          },
        ];
      }
      if (modalRecord.modalFormData.payType == 7) {
        arr = [
          {
            type: "input",
            label: "空白收据编号",
            paramName: "blankBillNum",
          },
        ];
      }
      modalRecord.modalFormItems = [
        {
          type: "select",
          label: "付款对象",
          paramName: "customerId",
          options: clientList,
          disabled: true,
        },
        {
          type: "select",
          label: "付款业务类型",
          paramName: "businessType",
          options: businessTypeList,
        },
        {
          type: "number",
          label: "付款金额",
          paramName: "money",
        },
        {
          type: "select",
          label: "结算方式",
          paramName: "payType",
          options: [
            { label: "企业网银", value: 1 },
            { label: "银行承兑汇票-纸质", value: 2 },
            { label: "银行承兑汇票-电子", value: 3 },
            { label: "商业承兑汇票-纸质", value: 4 },
            { label: "商业承兑汇票-电子", value: 5 },
            { label: "陕建筑信通", value: 6 },
            { label: "现金", value: 7 },
          ],
        },
        ...arr,
      ];
    };

    watch(
      () => modalRecord.modalShow,
      (newVal) => {
        if (newVal) {
          handleModalFormItems();
        }
      }
    );

    const onUpdateDialogStatus = (status) => {
      if (!status) {
        onModalClose();
      }
    };

    const onFormItemChange = (data, paramName) => {
      if (paramName == "tenantId") {
        tenantList.value.map((item) => {
          if (item.value == data.tenantId) {
            formRecord.formData.tenantName = item.label;
          }
        });
      }
      if (paramName == "customerId") {
        clientList.value.map((item) => {
          if (item.value == data.customerId) {
            formRecord.formData.customerName = item.label;
          }
        });
      }
      if (paramName == "payType") {
        if (data.payType == 2 || data.payType == 3 || data.payType == 4 || data.payType == 5) {
          modalRecord.modalFormData.billType = data.payType;
        }
        handleModalFormItems();
      }
    };

    const onAddDetail = () => {
      modalRecord.modalFormRef.submitForm();
    };

    const submitDetail = (val) => {
      clientList.value.map((item) => {
        if (item.value == val.customerId) {
          val.customerName = item.label;
        }
      });
      businessTypeList.value.map((item) => {
        if (item.value == val.businessType) {
          val.businessTypeName = item.label;
        }
      });
      // 编辑
      if (val.id || val.num) {
        tableRecord.tableData[val.key] = val;
      } else {
        tableRecord.tableData.push(val);
      }
      transformArrayData(tableRecord.tableData, true, true);
      modalRecord.modalShow = false;
    };

    const onDetailDelete = (record) => {
      ElMessageBox.confirm(
        `<strong>提示</strong><br/>
        确定删除该付款明细？`,
        {
          dangerouslyUseHTMLString: true,
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).then(() => {
        tableRecord.tableData.splice(record, 1);
      });
    };

    const onModalShow = (type, record = {}) => {
      if (!formRecord.formData.customerId) {
        ElMessage.warning("请先选择付款对象");
        return;
      }
      modalRecord.modalTitle =
        type == "add" ? "添加付款明细单" : "编辑付款明细单";
      modalRecord.modalShow = true;
      if (type == "add") {
        record.customerId = formRecord.formData.customerId;
      }
      modalRecord.modalFormData = { ...record };
    };

    const onModalClose = () => {
      modalRecord.modalShow = false;
    };

    const onSave = () => {
      formRecord.formRef.submitForm();
    };

    const submitForm = () => {
      if (!tableRecord.tableData.length) {
        ElMessage.warning("请添加明细！");
        return;
      }

      formRecord.btnLoading = true;

      const data = {
        ...formRecord.formData,
        paymentRecordQos: tableRecord.tableData,
      };
      data.payTime && (data.payTime = moment(data.payTime).format("YYYY-MM-DD HH:mm:ss"));
      paymentOrderApi[type == "add" ? "onAdd" : "onEdit"](data)
        .then((res) => {
          if (res && res.code == 0) {
            ElMessage.success("操作成功！");
            goBack();
          } else {
            ElMessage.error(res.message);
          }
          formRecord.btnLoading = false;
        })
        .catch((err) => {
          formRecord.btnLoading = false;
        });
    };

    const goBack = () => {
      router.go(-1);
    };

    const tableColumns = [
      { label: "序号", prop: "num", width: 60 },
      { label: "付款对象", prop: "customerName" },
      { label: "付款业务类型", prop: "businessTypeName" },
      { label: "金额(元)", prop: "money" },
      {
        label: "结算方式",
        prop: "payType",
        formatter: (row) =>
          ({
            1: "企业网银",
            2: "银行承兑汇票-纸质",
            3: "银行承兑汇票-电子",
            4: "商业承兑汇票-纸质",
            5: "商业承兑汇票-电子",
            6: "陕建筑信通",
            7: "现金",
          }[row.payType]),
      },
      {
        label: "票据类型",
        prop: "billType",
        formatter: (row) =>
          ({ 2: "银行承兑汇票-纸质", 3: "银行承兑汇票-电子" }[row.billType]),
      },
      { label: "单据号", prop: "billNum" },
      { label: "付款账户", prop: "payAccount" },
      { label: "操作", slotName: "operation" },
    ];

    const selectedCustomer = (val) => {
      if(!val.id) {
        ElMessage.warning('请选择付款对象！');
      }
      
      formRecord.formData.customerId = val.id;
      formRecord.formData.customerName = val.name;
    };

    return {
      ...toRefs(formRecord),
      ...toRefs(tableRecord),
      tableColumns,
      ...toRefs(modalRecord),
      goBack,
      onUpdateDialogStatus,
      onModalShow,
      onModalClose,
      onFormItemChange,
      onAddDetail,
      onDetailDelete,
      submitDetail,
      onSave,
      submitForm,
      selectedCustomer,
    };
  },
};
</script>

<style lang="scss" scoped>
.content {
  padding: 24px;
  background: #fff;

  .title {
    margin-bottom: 24px;
  }
}
.footer {
  padding: 24px;
  width: 100%;
  background: #fff;
  border-top: 1px solid $color-border;
  box-sizing: border-box;
}
</style>

<style lang="scss">
.el-overlay-dialog {
  .payment-order-dialog {
    .payment-order-content {
      padding: 0 112px 0 24px;
    }
  }
}
</style>
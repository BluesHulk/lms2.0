<template>
  <div class="header">
    <el-button @click="goBack">返回</el-button>
  </div>
  <div class="content">
    <MyTitle :title="'自制新增'" icon="icon-xinzneg" />
    <div class="subtitle">采购公司</div>
    <MyForm
      ref="companyFormRef"
      labelPosition="left"
      :formItems="companyFormItems"
      :rules="companyRules"
      :formData="formData"
      @onFormItemChange="onFormItemChange"
      @submitForm="submitForm"
    />
    <div class="subtitle">供应商信息</div>
    <div class="placeholder-box" v-if="!formData.currentTenantId">
      请先选择采购公司
    </div>
    <MyForm
      v-else
      ref="supplierFormRef"
      labelPosition="left"
      :formItems="supplierFormItems"
      :rules="supplierRules"
      :formData="formData"
      @onFormItemChange="onFormItemChange"
      @submitForm="submitForm"
    >
      <template #customerId>
        <CustomerModal
          :modalTitle="'选择供应商'"
          :customerId="formData.customerId"
          @selectedCustomer="selectedCustomer('customerId', $event)"
        />
      </template>
      <template #invoiceCustomerId>
        <CustomerModal
          :modalTitle="'选择开票客户'"
          :customerId="formData.invoiceCustomerId"
          @selectedCustomer="selectedCustomer('invoiceCustomerId', $event)"
        />
      </template>
    </MyForm>
    <div class="subtitle">订单信息</div>
    <div class="placeholder-box" v-if="!formData.currentTenantId">
      请先选择采购公司
    </div>
    <template v-else>
      <MyForm
        ref="orderFormRef"
        labelPosition="left"
        :formItems="orderFormItems"
        :rules="orderRules"
        :formData="formData"
        @onFormItemChange="onFormItemChange"
        @submitForm="submitForm"
      >
        <template #deptId>
          <el-input
            v-model="formData.deptName"
            clearable
            placeholder="请选择"
            @click="onModalShow('deptModal')"
            @clear="onClear"
          >
            <template #suffix>
              <i class="iconfont icon-sousuo"></i>
            </template>
          </el-input>
        </template>
        <template v-slot:salesmanName>
          <el-input
            v-model="formData.salesmanName"
            placeholder="请选择"
            @click="salesmanModalShow = true"
            readonly
          >
            <template #suffix>
              <i class="iconfont icon-sousuo"></i>
            </template>
          </el-input>
        </template>
        <template v-slot:typeSlot> </template>
      </MyForm>
      <div class="type-box">
        <MyForm
          ref="boxFormRef"
          labelPosition="left"
          :formItems="boxFormItems"
          :rules="boxRules"
          :formData="formData"
          @onFormItemChange="onFormItemChange"
          @submitForm="submitForm"
        />
      </div>
      <MyForm
        ref="remarkFormRef"
        labelPosition="left"
        :formItems="remarkFormItems"
        :formData="formData"
        @onFormItemChange="onFormItemChange"
        @submitForm="submitForm"
      />
    </template>

    <div class="subtitle">销售物料</div>
    <div class="placeholder-box" v-if="!formData.currentTenantId">
      请先选择采购公司
    </div>
    <template v-else>
      <div class="btn-box">
        <el-button
          type="text"
          class="btn-item"
          @click="onModalShow('materialModal')"
        >
          <img :src="getAssetsImg('tianjia.png')" />
          <span>添加物料</span>
        </el-button>
        <el-button type="text" class="btn-item" @click="onDelete">
          <img :src="getAssetsImg('yichu.png')" />
          <span>批量移除</span>
        </el-button>
      </div>
      <MyTable
        className=""
        ref="tableRef"
        :tableData="tableData"
        :columns="tableColumns"
        :selection="true"
        @handleSelectionChange="handleSelectionChange"
      >
        <template #amount="slotProps">
          <el-input-number
            v-model="tableData[slotProps.index].amount"
            controls-position="right"
            :precision="0"
            @change="handleChange(slotProps.index, $event)"
          />
        </template>
        <template #outPrice="slotProps">
          <el-input-number
            v-model="tableData[slotProps.index].outPrice"
            controls-position="right"
            :precision="2"
            @change="handleChange(slotProps.index, $event)"
          />
        </template>
        <template #taxPrice="slotProps">
          <el-input-number
            v-model="tableData[slotProps.index].taxPrice"
            controls-position="right"
            :precision="2"
            :disabled="true"
            @change="handleChange"
          />
        </template>
      </MyTable>
    </template>
  </div>

  <div class="footer">
    <el-button @click="onSubmit(0)">保存为草稿</el-button>
    <el-button type="primary" @click="onSubmit(1)">完成新建</el-button>
  </div>

  <MaterialModal
    :visible="modalShow"
    @onClose="onModalClose('materialModal')"
    @getSelected="getSelected"
  />

  <DepartmentModal
    :visible="deptModalShow"
    @onClose="onModalClose('deptModal')"
    @onSelected="getDeptSelected"
  />
  <!-- <SalesmanModal
    :visible="salesmanModalShow"
    @onClose="onModalClose('salesmanModal')"
    @onSelected="getSalesmanSelected"
  /> -->
  <PersonnelTreeModal
    :visible="salesmanModalShow"
    modalTitle="专管业务员"
    @onClose="onModalClose('salesmanModal')"
    @onSelected="getSalesmanSelected"
  />
</template>

<script>
import { ref, reactive, toRefs, watch } from "vue";
import { useRouter } from "vue-router";
import commonApi from "@/request/services/common";
import MyTitle from "@/components/MyTitle.vue";
import MyForm from "@/components/MyForm.vue";
import MyTable from "@/components/MyTable.vue";
import CustomerModal from "@/components/commonModal/CustomerModal.vue";
import MaterialModal from "@/components/commonModal/MaterialModal.vue";
import DepartmentModal from "@/components/commonModal/DepartmentModal.vue";
import SalesmanModal from "@/components/commonModal/SalesmanModal.vue";
import PersonnelTreeModal from "@/components/commonModal/PersonnelTreeModal.vue";
import config from "@/utils/config";
import { purchaseOrderApi } from "@/request/services/purchasingManagement";
import { getAssetsImg, transformArrayData } from "@/utils/index";
import { ElMessage, ElMessageBox } from "element-plus";
import moment from "moment";

export default {
  components: {
    MyTitle,
    MyForm,
    MyTable,
    CustomerModal,
    MaterialModal,
    DepartmentModal,
    SalesmanModal,
    PersonnelTreeModal,
  },
  setup() {
    const router = useRouter();

    const tenantList = ref([]);
    const addressList = ref([]);

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

    const getAddressList = () => {
      purchaseOrderApi.getAddress().then((res) => {
        if (res && res.code == 0) {
          res.data.map((item) => {
            item.value = item.id;
            item.label = item.name;
          });
          addressList.value = res.data;
        }
      });
    };
    getAddressList();

    const tenantId =
      sessionStorage.getItem("tenantId") || localStorage.getItem("tenantId");

    const formData = ref({
      tenantId: tenantId ? tenantId * 1 : undefined,
      currentTenantId: tenantId ? tenantId * 1 : undefined,
      billDate: moment(),
    });

    const companyFormRecord = reactive({
      companyFormRef: null,
      companyFormItems: [
        {
          type: "select",
          label: "采购公司",
          paramName: "tenantId",
          options: tenantList,
          disabled: true,
          span: 12,
        },
      ],
      companyRules: {
        tenantId: [config.rules({ type: "required", trigger: "change" })],
      },
    });

    const supplierFormRecord = reactive({
      supplierFormRef: null,
      supplierFormItems: [
        {
          type: "labelBlank",
          label: "供应商",
          paramName: "customerId",
          slotName: "customerId",
          span: 12,
        },
        // {
        //   type: "select",
        //   label: "付款方式",
        //   paramName: "",
        //   options: [],
        //   span: 12,
        // },
        {
          type: "labelBlank",
          label: "开票客户",
          paramName: "invoiceCustomerId",
          slotName: "invoiceCustomerId",
          span: 12,
        },
      ],
      supplierRules: {
        customerId: [config.rules({ type: "required", trigger: "change" })],
        invoiceCustomerId: [
          config.rules({ type: "required", trigger: "change" }),
        ],
      },
    });

    const selectedCustomer = (paramName, val) => {
      formData.value[paramName] = val.id;
      if (paramName == "customerId") {
        formData.value.customerName = val.name;
      } else {
        formData.value.invoiceCustomerName = val.name;
      }
    };

    const orderFormRecord = reactive({
      orderFormRef: null,
      orderFormItems: [
        {
          type: "select",
          label: "结算方式",
          paramName: "settlementType",
          options: [
            { label: "现金", value: 0 },
            { label: "银行承兑", value: 1 },
            { label: "商业承兑", value: 2 },
          ],
          span: 12,
        },
        {
          type: "labelBlank",
          label: "部门",
          paramName: "deptId",
          slotName: "deptId",
          span: 12,
        },
        {
          type: "labelBlank",
          label: "业务员",
          paramName: "salesmanId",
          slotName: "salesmanName",
          span: 12,
        },
        {
          type: "select",
          label: "运输方式",
          paramName: "transportType",
          options: [
            { label: "自提", value: 0 },
            { label: "一票制包运", value: 1 },
            { label: "流向管控自提", value: 2 },
          ],
          span: 12,
        },
        {
          type: "select",
          label: "结算规则",
          paramName: "settlementRule",
          options: [
            { label: "发货方为准", value: 0 },
            { label: "收货方为准", value: 1 },
            { label: "收发货方取小", value: 2 },
          ],
          span: 12,
        },
        {
          type: "select",
          label: "装货地",
          paramName: "consignerAddressId",
          options: addressList,
          span: 12,
        },
        {
          type: "datePicker",
          label: "单据日期",
          paramName: "billDate",
          span: 12,
        },
        {
          type: "input",
          label: "散户",
          paramName: "retailInvestors",
          span: 12,
        },
        {
          type: "blank",
          paramName: "typeId",
          slotName: "typeSlot",
          span: 24,
        },
      ],
      orderRules: {
        settlementType: [config.rules({ type: "required", trigger: "change" })],
        deptId: [config.rules({ type: "required" })],
        salesmanId: [config.rules({ type: "required" })],
        transportType: [config.rules({ type: "required", trigger: "change" })],
        settlementRule: [config.rules({ type: "required", trigger: "change" })],
        billDate: [config.rules({ type: "required" })],
      },
    });

    const boxFormRecord = reactive({
      boxFormRef: null,
      boxFormItems: [],
      boxRules: {
        invoiceNum: [config.rules({ type: "required" })],
      },
    });

    const handleBoxFormItems = () => {
      boxFormRecord.boxFormItems = [
        {
          type: "checkbox",
          label: "",
          paramName: "isInvoice",
          options: [{ label: "是否先票后货", value: 1 }],
          span: 6,
          labelWidth: "0px",
        },
        {
          type: "checkbox",
          label: "",
          paramName: "isWaybill",
          options: [{ label: "是否同步创建运单", value: 1 }],
          span: 6,
          labelWidth: "0px",
        },
        ...(formData.value.isInvoice && formData.value.isInvoice.length
          ? [
              {
                type: "input",
                label: "发票号",
                paramName: "invoiceNum",
                span: 14,
              },
            ]
          : []),
      ];
    };
    handleBoxFormItems();

    const remarkFormRecord = reactive({
      remarkFormRef: null,
      remarkFormItems: [
        {
          type: "textArea",
          label: "备注",
          paramName: "remark",
          span: 12,
        },
      ],
    });

    const onFormItemChange = (data, paramName) => {
      if (paramName == "deptId") {
        tenantList.value.map((item) => {
          if (data[paramName] == item.id) {
            formData.value.deptName = item.name;
          }
        });
      }
      if (paramName == "isInvoice") {
        handleBoxFormItems();
      }
    };

    watch(
      () => formData.value.tenantId,
      (newVal, oldVal) => {
        if (formData.value.currentTenantId == newVal) {
          return;
        }
        if (oldVal) {
          formData.value.currentTenantId = oldVal;
          ElMessageBox.confirm(
            `<strong>温馨提示</strong><br/>
        选择其他公司将清空当前公司下的采购订单数据，是否继续`,
            {
              dangerouslyUseHTMLString: true,
              confirmButtonText: "确定",
              cancelButtonText: "取消",
              type: "warning",
            }
          )
            .then(() => {
              formData.value = {
                tenantId: newVal,
                currentTenantId: newVal,
                billDate: moment(),
              };
              tenantList.value.map((item) => {
                if (newVal == item.id) {
                  formData.value.tenantName = item.name;
                }
              });
            })
            .catch(() => {
              formData.value.tenantId = oldVal;
              tenantList.value.map((item) => {
                if (oldVal == item.id) {
                  formData.value.tenantName = item.name;
                }
              });
            });
        } else {
          formData.value.currentTenantId = newVal;
        }
      }
    );

    const modalRecord = reactive({
      modalShow: false,
      deptModalShow: false,
      salesmanModalShow: false,
    });

    const tableRecord = reactive({
      tableRef: null,
      tableData: [],
      tableTotal: 0,
      selectedRows: [],
    });

    const handleSelectionChange = (val) => {
      tableRecord.selectedRows = val;
    };

    const getSelected = (val) => {
      const list = [];
      val.map((item) => {
        list.push({
          productCode: item.productCode,
          productId: item.productId,
          productName: item.productName,
          specification: item.specification,
          modelMaterial: item.modelMaterial,
          amountUnitName: item.unit,
        });
      });
      tableRecord.tableData = transformArrayData(list, true, true);
    };

    const onDelete = () => {
      if (tableRecord.selectedRows.length) {
        const list = [...tableRecord.tableData];
        tableRecord.selectedRows.map((item) => {
          for (let i = 0; i < list.length; i++) {
            if (list[i].key == item.key) {
              list.splice(i, 1);
            }
          }
        });
        tableRecord.tableData = transformArrayData(list, true, true);
      } else {
        ElMessage.warning("请选择要移除的物料");
      }
    };

    const getDeptSelected = (val) => {
      formData.value.deptName = val.label;
      formData.value.deptId = val.id;
    };

    const getSalesmanSelected = (val) => {
      formData.value.salesmanName = val.name;
      formData.value.salesmanId = val.id;
    };

    const onSubmit = async (submit) => {
      let success = [];
      await companyFormRecord.companyFormRef.submitForm().then((res) => {
        success.push(res);
      });
      await supplierFormRecord.supplierFormRef.submitForm().then((res) => {
        success.push(res);
      });
      await orderFormRecord.orderFormRef.submitForm().then((res) => {
        success.push(res);
      });
      await boxFormRecord.boxFormRef.submitForm().then((res) => {
        success.push(res);
      });
      if (success.indexOf(false) < 0) {
        const fn = () => {
          const data = { ...formData.value };
          data.isSubmit = submit;
          console.log(formData.value, 1212);
          data.billDate = moment(data.billDate).format("YYYY-MM-DD HH:mm:ss");
          data.isInvoice = data.isInvoice == 1 ? 1 : 0;
          data.isWaybill = data.isWaybill == 1 ? 1 : 0;
          data.orderGoodsInfoList = tableRecord.tableData;

          purchaseOrderApi.onAdd(data).then((res) => {
            if (res && res.code == 0) {
              ElMessage.success(
                submit ? "成功新建1个订单" : "订单已保存为草稿状态"
              );
              goBack();
            } else {
              ElMessage.error(res.message);
            }
          });
        };
        if (submit) {
          fn();
        } else {
          ElMessageBox.confirm(
            `<strong>提示</strong><br/>
            是否将该订单保存为草稿状态`,
            {
              dangerouslyUseHTMLString: true,
              confirmButtonText: "确定",
              cancelButtonText: "取消",
              type: "warning",
            }
          ).then(() => {
            fn();
          });
        }
      }
    };

    const tableColumns = [
      { label: "序号", prop: "num", width: 60, fixed: "left" },
      { label: "物料名称", prop: "productName", fixed: "left", width: 160 },
      { label: "物料编码", prop: "productCode", width: 140 },
      { label: "规格", prop: "specification", width: 120 },
      { label: "型号", prop: "modelMaterial", width: 120 },
      { label: "计量单位", prop: "amountUnitName", width: 120 },
      { label: "需求部门", prop: "needDeptName", width: 120 },
      { label: "数量", slotName: "amount", width: 180 },
      { label: "出厂价", slotName: "outPrice", width: 180 },
      { label: "价税合计", slotName: "taxPrice", width: 180 },
    ];

    const onModalShow = (type) => {
      if (type == "materialModal") {
        modalRecord.modalShow = true;
      }
      if (type == "deptModal") {
        modalRecord.deptModalShow = true;
      }
      if (type == "salesmanModal") {
        modalRecord.salesmanModalShow = true;
      }
    };

    const onModalClose = (type) => {
      if (type == "materialModal") {
        modalRecord.modalShow = false;
      }
      if (type == "deptModal") {
        modalRecord.deptModalShow = false;
      }
      if (type == "salesmanModal") {
        modalRecord.salesmanModalShow = false;
      }
    };

    const handleChange = (index, val) => {
      const { outPrice, amount} = tableRecord.tableData[index];
      if(outPrice && amount) {
        tableRecord.tableData[index].taxPrice = outPrice * amount;
      } else {
        tableRecord.tableData[index].taxPrice = undefined;
      }
    }

    const goBack = () => {
      router.go(-1);
      sessionStorage.setItem(
        "purchaseOrderKey",
        router.currentRoute.value.query.type
      );
    };

    return {
      formData,
      ...toRefs(companyFormRecord),
      ...toRefs(supplierFormRecord),
      ...toRefs(orderFormRecord),
      ...toRefs(boxFormRecord),
      ...toRefs(remarkFormRecord),
      ...toRefs(modalRecord),
      ...toRefs(tableRecord),
      tableColumns,
      goBack,
      onSubmit,
      getAssetsImg,
      onFormItemChange,
      selectedCustomer,
      getSelected,
      getDeptSelected,
      getSalesmanSelected,
      onModalShow,
      onModalClose,
      handleSelectionChange,
      onDelete,
      handleChange,
    };
  },
};
</script>

<style lang="scss" scoped>
.header {
  padding: 24px;
}
.content {
  position: relative;
  margin: 0 24px;
  padding: 24px;
  width: calc(100% - 48px);
  height: calc(100% - 32px - 48px - 60px);
  background: #fff;
  box-sizing: border-box;
  overflow-y: auto;

  .title {
    margin-bottom: 24px;
  }

  .subtitle {
    position: relative;
    margin-bottom: 16px;
    padding-left: 12px;
    font-size: 14px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: $color-text;
    line-height: 22px;

    &::before {
      content: "";
      position: absolute;
      left: 0;
      top: 50%;
      display: inline-block;
      width: 4px;
      height: 16px;
      background: #3c82fe;
      border-radius: 2px;
      transform: translateY(-50%);
    }
    &::after {
      content: "";
      position: absolute;
      top: 50%;
      right: 0;
      width: calc(100% - 100px);
      height: 1px;
      background: $color-border;
      transform: translateY(-50%);
    }
  }

  .placeholder-box {
    display: flex;
    margin-bottom: 24px;
    width: 300px;
    height: 36px;
    font-size: 14px;
    font-family: PingFangSC-Regular, PingFang SC;
    font-weight: 400;
    color: #accaff;
    background: #ffffff;
    border-radius: 4px;
    border: 1px solid #accaff;
    justify-content: center;
    align-items: center;
  }

  .my-form-container {
    max-width: 790px;
  }
  .type-box {
    display: flex;
    margin-bottom: 24px;
    padding: 12px 24px 6px;
    width: 100%;
    min-height: 48px;
    background: #f0f5ff;
    border-radius: 4px;
    border: 1px solid #3c82fe;
    box-sizing: border-box;
    align-items: center;

    .my-form-container {
      width: 670px;
    }
  }

  .btn-box {
    display: flex;
    .btn-item {
      display: flex;
      margin-right: 24px;
      padding: 0;
      height: 22px;
      align-items: center;

      span {
        padding-left: 8px;
        font-size: 14px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: $color-blue;
      }
    }
  }
}

.footer {
  position: absolute;
  bottom: 0;
  left: 0;
  display: flex;
  padding: 24px;
  width: 100%;
  height: 60px;
  box-sizing: border-box;
  background: #fff;
  align-items: center;
  box-shadow: 0px -4px 16px 0px rgba(0, 0, 0, 0.1);
}
</style>
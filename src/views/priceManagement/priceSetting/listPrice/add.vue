<template>
  <JDetailContainer>
    <div class="price-list-content-info">
      <MyTitle title="基本信息" imgUrl="jichuxinxi.png" />
      <div class="content-form">
        <MyForm
          ref="formRef"
          :formItems="formItems"
          :rules="formRules"
          :formData="formData"
          @onFormItemChange="onFormItemChange"
          @submitForm="submitForm"
        >
          <template v-slot:beginDate>
            <el-date-picker
              v-model="formData.startExpireTime"
              type="datetime"
              style="width: 100%"
              placeholder="请选择开始时间"
              value-format="YYYY-MM-DD HH:mm:ss"
              :disabledDate="disabledStartDate"
            />
          </template>
          <template v-slot:endDate>
            <el-date-picker
              v-model="formData.endExpireTime"
              type="datetime"
              style="width: 100%"
              placeholder="请选择结束时间"
              value-format="YYYY-MM-DD HH:mm:ss"
              :default-time="new Date(2000, 1, 1, 23, 59, 59)"
              :disabledDate="disabledEndDate"
            />
          </template>
        </MyForm>
      </div>
      <div class="content-table">
        <MyTitle title="物料价格" imgUrl="jiageguanli.png" />
        <div class="content-topbut" v-if="formData.tenantId">
          <div class="t-item" @click="addMaterial">
            <img :src="getAssetsImg('tianjia.png')" />
            <span>添加物料</span>
          </div>
          <div
            class="t-item"
            @click="onSelectChange"
            style="padding-left: 14px"
          >
            <img :src="getAssetsImg('yichu.png')" />
            <span>移除物料</span>
          </div>
        </div>
        <el-form ref="tableFrom" :model="tableDataFrom" :rules="tableRules">
          <MyTable
            ref="tableRef"
            :tableData="tableDataFrom.tableData"
            :columns="tableColumns"
            :selection="true"
            @handleSelectionChange="handleSelectionChange"
            :tableHeight="400"
            :emptyText="'选择销售公司后添加物料价格'"
          >
            <template v-slot:productPriceHeader>
              货物单价<span class="required-symbol">*</span>
            </template>
            <template v-slot:transportPriceHeader>
              运输单价<span class="required-symbol">*</span>
            </template>
            <template v-slot:priceHeader>
              挂牌价格<span class="required-symbol">*</span>
            </template>
            <template v-slot:productPrice="row">
              <div>
                <el-form-item
                  v-if="row.data.key != undefined"
                  :prop="'tableData.' + row.data.key + '.productPrice'"
                  :rules="tableRules.productPrice"
                >
                  <el-input-number
                    v-model="row.data.productPrice"
                    :min="0"
                    :precision="2"
                    @change="priceChange(row.data)"
                    controls-position="right"
                    placeholder="请输入"
                  />
                </el-form-item>
              </div>
            </template>
            <template v-slot:transportPrice="row">
              <div>
                <el-form-item
                  v-if="row.data.key != undefined"
                  :prop="'tableData.' + row.data.key + '.transportPrice'"
                  :rules="tableRules.transportPrice"
                >
                  <el-input-number
                    v-model="row.data.transportPrice"
                    :min="0"
                    :precision="2"
                    @change="priceChange(row.data)"
                    controls-position="right"
                  />
                </el-form-item>
              </div>
            </template>
            <template v-slot:price="row">
              <div>
                <el-form-item
                  v-if="row.data.key != undefined"
                  :prop="'tableData.' + row.data.key + '.price'"
                  :rules="tableRules.price"
                >
                  <el-input-number
                    v-model="row.data.price"
                    :min="0"
                    :precision="2"
                    controls-position="right"
                  />
                </el-form-item>
              </div>
            </template>
          </MyTable>
        </el-form>
      </div>
    </div>
  </JDetailContainer>

  <div class="price-list-footer">
    <el-button @click="saveDrafts" :loading="btnLoading">保存并关闭</el-button>
    <el-button type="primary" @click="onSubmit" :loading="btnLoading"
      >提交并关闭</el-button
    >
  </div>
  <MaterialModal
    :visible="modalShow"
    @onClose="onModalClose"
    @getSelected="getSelected"
  />
</template>

<script>
import { defineComponent, toRefs, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import MyTitle from "@/components/MyTitle.vue";
import MyTable from "@/components/MyTable.vue";
import JDetailContainer from "@/components/JDetailContainer.vue";
import MyForm from "@/components/MyForm.vue";
import config from "@/utils/config";
import { getAssetsImg, transformArrayData } from "@/utils/index";
import { priceSettingApi } from "@/request/services/priceManagement";
import commonApi from "@/request/services/common";
import MaterialModal from "@/components/commonModal/MaterialModal.vue";
import moment from "moment";
export default defineComponent({
  components: {
    MyTitle,
    MyTable,
    MyForm,
    JDetailContainer,
    MaterialModal,
  },
  setup() {
    const router = useRouter();
    const type = router.currentRoute.value.query.type;
    const selectId = router.currentRoute.value.query.id;
    const tenantList = ref([]);
    const payTypeList = ref([]);
    //获取数据字典
    const getDictionaryList = (code, setData) => {
      commonApi.getDictionaryList(code).then((res) => {
        if (res && res.code == 0) {
          res.data.map((item) => {
            item.label = item.name;
            item.value = item.id;
          });
          setData.value = res.data;
        }
      });
    };
    getDictionaryList("LMS_PAYTYPE", payTypeList);

    const tableColumns = [
      { label: "序号", prop: "num", width: 60 },
      {
        label: "物料名称",
        prop: "productName",
      },
      { label: "物料编码", prop: "productCode" },
      { label: "税率", prop: "taxRate" },
      { label: "物料分类", prop: "categoryName" },
      { label: "计量单位", prop: "unitName" },
      {
        label: "货物单价",
        prop: "productPrice",
        headerSlotName: "productPriceHeader",
        slotName: "productPrice",
      },
      {
        label: "运输单价",
        prop: "transportPrice",
        headerSlotName: "transportPriceHeader",
        slotName: "transportPrice",
      },
      {
        label: "挂牌价格",
        prop: "price",
        headerSlotName: "priceHeader",
        slotName: "price",
      },
    ];

    const formItems = ref();

    const handleFormItems = () => {
      formItems.value = [
        {
          type: "input",
          label: "价目表名称",
          paramName: "priceListName",
          class: "item-width",
          maxlength: 50,
          span: 12,
        },
        {
          type: "select",
          label: "销售公司",
          paramName: "tenantId",
          span: 12,
          disabled: type != "add",
          options: tenantList,
        },
        {
          type: "select",
          label: "结算方式",
          paramName: "payType",
          span: 12,
          options: payTypeList,
        },
        {
          type: "select",
          label: "币种",
          paramName: "currency",
          span: 12,
          options: [{ value: "人民币", label: "人民币" }],
        },
        {
          label: "开始时间",
          placeholder: "请选择",
          slotName: "beginDate",
          paramName: "startExpireTime",
          type: "labelBlank",
          span: 12,
        },
        {
          label: "结束时间",
          placeholder: "请选择",
          slotName: "endDate",
          paramName: "endExpireTime",
          type: "labelBlank",
          span: 12,
        },
        {
          type: "select",
          label: "价格模式",
          paramName: "priceModel",
          span: 12,
          options: [
            {
              label: "一票制",
              value: 1,
            },
            {
              label: "两票制",
              value: 2,
            },
          ],
        },
        {
          type: "select",
          label: "流向管控",
          paramName: "flowControl",
          span: 12,
          options: [
            {
              label: "管控流向",
              value: 1,
            },
            {
              label: "不管控流向",
              value: 2,
            },
          ],
        },
      ];
    };
    handleFormItems();
    const onFormItemChange = (data, paramName) => {
      if (paramName == "tenantId") {
        tenantList.value.map((item) => {
          if (item.value == data.tenantId) {
            state.formData.tenantName = item.label;
          }
        });
      }
      if (paramName == "payType") {
        payTypeList.value.map((item) => {
          if (item.value == data.payType) {
            state.formData.payTypeName = item.label;
          }
        });
      }
    };
    const modalRecord = reactive({
      modalShow: false,
    });
    const state = reactive({
      formData: {},
      formRef: null,
      tableFrom: null,
      tableDataFrom: {
        tableData: [],
      },
      selectedRows: [],
      btnLoading: false,
    });

    const formRules = {
      priceListName: [
        config.rules({ type: "required" }),
        config.rules({ type: "maxLength" }),
      ],
      priceModel: [config.rules({ type: "required" })],
      startExpireTime: [config.rules({ type: "required" })],
      tenantId: [config.rules({ type: "required" })],
      payType: [config.rules({ type: "required" })],
      flowControl: config.rules({ type: "required" }),
    };

    const tableRules = {
      price: [config.rules({ type: "required" })],
      productPrice: [config.rules({ type: "required" })],
      transportPrice: [config.rules({ type: "required" })],
    };

    const onSubmit = () => {
      if (!state.tableDataFrom.tableData.length) {
        ElMessage.warning("请添加物料明细！");
      } else {
        state.tableFrom.validate((valid) => {
          if (valid) {
            state.formRef.submitForm();
          }
        });
      }
    };
    const submitForm = () => {
      state.btnLoading = true;
      const data = {
        ...state.formData,
        priceListGoodsQos: state.tableDataFrom.tableData,
        priceListType: 1,
        isAdjust: 1,
      };
      if (type == "copy") {
        delete data.id;
      }
      priceSettingApi[type == "add" || type == "copy" ? "onAdd" : "onEdit"](
        data
      )
        .then((res) => {
          if (res && res.code == 0) {
            ElMessage.success("操作成功！");
            router.back();
          } else {
            ElMessage.error(res.message);
          }
          state.btnLoading = false;
        })
        .catch((err) => {
          state.btnLoading = false;
        });
    };

    //保存为草稿
    const saveDrafts = () => {
      ElMessageBox.confirm(
        `<strong>温馨提示</strong><br/>
        是否将该价目表保存`,
        {
          dangerouslyUseHTMLString: true,
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).then(() => {
        state.formData.checkStatus = 0;
        if (!state.tableDataFrom.tableData.length) {
          ElMessage.warning("请添加物料明细！");
          return;
        }
        state.tableFrom.validate((valid) => {
          if (valid) {
            state.formRef.submitForm();
          }
        });
      });
    };

    // 获取用户所属企业
    const getuserbussiness = () => {
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
    getuserbussiness();
    //获取详情
    const getDetail = () => {
      priceSettingApi.getDetail(selectId).then((res) => {
        if (res && res.code == 0) {
          state.formData = res.data;
          state.tableDataFrom.tableData = transformArrayData(
            res.data.priceListGoodsVos,
            true,
            true
          );
          console.log(
            "state.tableDataFrom.tableData",
            state.tableDataFrom.tableData
          );
        }
      });
    };
    selectId && getDetail();

    //多选
    const handleSelectionChange = (val) => {
      state.selectedRows = val;
    };
    //批量操作
    const onSelectChange = () => {
      if (state.selectedRows.length) {
        let ids = [];
        state.selectedRows.map((item) => {
          ids.push(item.productId);
        });
        //批量移除
        delMaterial(ids);
      } else {
        ElMessage.warning("请至少选择1项");
      }
    };

    //添加物料
    const addMaterial = () => {
      modalRecord.modalShow = true;
    };

    //移除物料
    const delMaterial = (ids) => {
      ElMessageBox.confirm(
        `<strong>温馨提示</strong><br/>
        确定要移除选中物料?`,
        {
          dangerouslyUseHTMLString: true,
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).then(() => {
        let tableDataList = state.tableDataFrom.tableData.filter((row) => {
          delete row.key;
          if (!ids.includes(row.productId)) {
            return row;
          }
        });
        state.tableDataFrom.tableData = transformArrayData(
          tableDataList,
          true,
          true
        );
        console.log(
          "state.tableDataFrom.tableData",
          state.tableDataFrom.tableData
        );
      });
    };

    const disabledStartDate = (time) => {
      return time.getTime() < Date.now() - 8.64e7;
    };
    const disabledEndDate = (time) => {
      if (state.formData.startExpireTime) {
        return (
          time.getTime() < moment(state.formData.startExpireTime).format("x")
        );
      } else {
        return time.getTime() < Date.now() - 8.64e7;
      }
    };
    const priceChange = (row) => {
      console.log(row);
      state.tableDataFrom.tableData[row.key].price =
        row.productPrice + row.transportPrice;
    };
    const onModalClose = () => {
      modalRecord.modalShow = false;
    };
    const getSelected = (val) => {
      let materialData = state.tableDataFrom.tableData;
      val.map((item, index) => {
        let addData = materialData.find((val) => val.productId == item.id);
        if (!addData) {
          materialData.push({
            categoryId: item.categoryId,
            productId: item.id,
            productName: item.productName,
            productCode: item.productCode,
            categoryName: item.category,
            unitName: item.unit,
            unitId: item.unitId,
            price: 0,
            productPrice: null,
            transportPrice: 0,
            taxRate: item.taxRate,
          });
        }
      });
      state.tableDataFrom.tableData = transformArrayData(
        materialData,
        true,
        true
      );
    };

    return {
      formItems,
      getSelected,
      type,
      selectId,
      tenantList,
      payTypeList,
      ...toRefs(state),
      ...toRefs(modalRecord),
      onSubmit,
      saveDrafts,
      getAssetsImg,
      tableColumns,
      onFormItemChange,
      handleFormItems,
      formRules,
      tableRules,
      handleSelectionChange,
      addMaterial,
      delMaterial,
      onSelectChange,
      getDetail,
      submitForm,
      getuserbussiness,
      disabledStartDate,
      disabledEndDate,
      priceChange,
      onModalClose,
      getDictionaryList,
    };
  },
});
</script>

<style lang="scss" scoped>
.price-list {
  &-footer {
    width: 100%;
    height: 50px;
    line-height: 50px;
    background: #fff;
    position: fixed;
    bottom: 0px;
    padding-left: 24px;
    z-index: 999;
  }
  &-content {
    display: flex;
    padding: 24px;
    &-info {
      .content-topbut {
        display: flex;
        align-items: center;
        padding-top: 20px;

        .t-item {
          height: 20px;
          display: flex;
          align-items: center;
          cursor: pointer;
          img {
            width: 16px;
          }
          span {
            padding-left: 5px;
            font-size: 16px;
            color: #3c82fe;
          }
        }
      }
      .required-symbol {
        color: $color-red;
      }
      .content-form {
        .my-form-container {
          max-width: 790px;
        }
        padding-top: 20px;
        width: 80%;
        .item-width {
          width: 140px;
        }
      }
    }
  }
}
</style>

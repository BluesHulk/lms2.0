<template>
  <JDetailContainer>
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="124px"
      label-position="left"
    >
      <el-row>
        <div class="info-box">
          <i class="iconfont icon-wenhao" style="color: #3c82fe" />
          提示：出厂价只可调整未来时间，物料出厂后，出库单出厂价不再变更
        </div>
        <el-col :span="24" style="padding-bottom: 24px">
          <MyTitle title="基本信息" imgUrl="jichuxinxi.png" />
        </el-col>
      </el-row>
      <el-row class="my-form-container">
        <el-col :span="12">
          <el-form-item label="销售公司：" prop="tenantId">
            <el-select
              v-model="formData.tenantId"
              style="width: 100%"
              placeholder="请选择"
              clearable
              @change="tenantChange"
            >
              <el-option
                v-for="(item, index) in tenantList"
                :key="index"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="调价方式：" prop="adjustType">
            <el-select
              v-model="formData.adjustType"
              placeholder="请选择"
              clearable
              style="width: 100%"
            >
              <el-option label="整体调价" :value="1" />
              <el-option label="客户调价" :value="2" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="调价开始时间：" prop="startExpireTime">
            <el-date-picker
              v-model="formData.startExpireTime"
              type="datetime"
              style="width: 100%"
              :disabledDate="disabledStartDate"
              placeholder="请选择调价开始时间"
              value-format="YYYY-MM-DD HH:mm:ss"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="调价结束时间：" prop="endExpireTime">
            <el-date-picker
              v-model="formData.endExpireTime"
              type="datetime"
              style="width: 100%"
              :disabledDate="disabledEndDate"
              :default-time="new Date(2000, 1, 1, 23, 59, 59)"
              placeholder="请选择调价结束时间"
              value-format="YYYY-MM-DD HH:mm:ss"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <div class="content-table">
            <MyTitle title="物料调价" imgUrl="jiageguanli.png" />
            <template
              v-if="
                formData.tenantId &&
                formData.adjustType &&
                formData.startExpireTime
              "
            >
              <div class="content-title">调价范围</div>
              <el-row class="my-form-container">
                <el-col :span="12">
                  <el-form-item label="选择价目表：" prop="priceListIds">
                    <ListSelect
                      :modelTitle="'选择价目表'"
                      :treeData="priceNameData"
                      :selectIds="formData.priceListIds"
                      :defaultSelectNames="formData.priceListNames"
                      @onTreeChange="priceListChange"
                    >
                      <template v-slot:header>
                        <div>
                          当前搜索范围:
                          <el-tag>{{ formData.tenantName }}</el-tag>
                          <el-tag style="margin-left: 12px">{{
                            formData.customerName || "所有客户"
                          }}</el-tag>
                        </div>
                      </template>
                    </ListSelect>
                  </el-form-item>
                </el-col>
                <el-col :span="12" style="padding-left: 16px">
                  <el-form-item
                    label="选择客户："
                    prop="customerId"
                    :rules="{
                      required: formData.adjustType == 2,
                      message: '请选择客户',
                    }"
                  >
                    <CustomerSelect
                      :size="''"
                      :customerId="formData.customerId"
                      @selectedCustomer="selectedCustomer"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="结算方式：" prop="payType">
                    <el-select
                      v-model="formData.payType"
                      style="width: 100%"
                      clearable
                      placeholder="请选择"
                      @change="payTypeChange"
                    >
                      <el-option
                        v-for="(item, index) in payTypeList"
                        :key="index"
                        :label="item.label"
                        :value="item.value"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12" style="padding-left: 16px">
                  <el-form-item
                    label="选择物料:"
                    prop="productIds"
                    :rules="{
                      required: formData.adjustType == 1,
                      message: '请选择物料',
                    }"
                  >
                    <div
                      class="input-box"
                      @click="materialShow"
                      :style="{ borderColor: isRed }"
                    >
                      <div class="item-list">
                        <template
                          v-for="(item, index) in formData.productNames"
                          :key="index"
                        >
                          <span class="item" v-if="index < 2">{{ item }}</span>
                        </template>
                        <span
                          class="item"
                          v-if="formData.productNames?.length > 2"
                          >...</span
                        >
                      </div>
                      <i class="iconfont icon-sousuo"></i>
                    </div>
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-button type="primary" @click="getTableData">
                    查找
                  </el-button>
                </el-col>
              </el-row>
              <div class="content-topbut">
                <div class="t-item" @click="onSelectChange('add')">
                  <img :src="getAssetsImg('tianjia.png')" />
                  <span>批量调价</span>
                </div>
                <div
                  class="t-item"
                  @click="onSelectChange('del')"
                  style="padding-left: 14px"
                >
                  <img :src="getAssetsImg('yichu.png')" />
                  <span>批量移除</span>
                </div>
              </div>
              <MyTable
                ref="tableRef"
                :tableData="formData.priceListAdjustGoodsQos"
                :columns="tableColumns"
                :selection="true"
                @handleSelectionChange="handleSelectionChange"
                :tableHeight="400"
                :emptyText="emptyText"
              >
                <template v-slot:productPriceRange="row">
                  <div>
                    <el-form-item
                      label-width="1px"
                      :prop="
                        'priceListAdjustGoodsQos.' +
                        row.data.key +
                        '.productPriceRange'
                      "
                    >
                      <el-input-number
                        v-model="row.data.productPriceRange"
                        :precision="2"
                        :min="-row.data.productOldPrice"
                        @change="priceRangeChange(row.data)"
                        controls-position="right"
                      />
                    </el-form-item>
                  </div>
                </template>
                <template v-slot:productPrice="row">
                  <div>
                    <el-form-item
                      label-width="1px"
                      :prop="
                        'priceListAdjustGoodsQos.' +
                        row.data.key +
                        '.productPrice'
                      "
                    >
                      <el-input-number
                        v-model="row.data.productPrice"
                        :precision="2"
                        :min="0"
                        @change="priceChange(row.data)"
                        controls-position="right"
                      />
                    </el-form-item>
                  </div>
                </template>
                <template v-slot:transportPriceRange="row">
                  <div>
                    <el-form-item
                      label-width="1px"
                      :prop="
                        'priceListAdjustGoodsQos.' +
                        row.data.key +
                        '.transportPriceRange'
                      "
                    >
                      <el-input-number
                        v-model="row.data.transportPriceRange"
                        :precision="2"
                        :min="-row.data.transportOldPrice"
                        @change="priceRangeChange(row.data)"
                        controls-position="right"
                      />
                    </el-form-item>
                  </div>
                </template>
                <template v-slot:transportPrice="row">
                  <div>
                    <el-form-item
                      label-width="1px"
                      :prop="
                        'priceListAdjustGoodsQos.' +
                        row.data.key +
                        '.transportPrice'
                      "
                      :rules="formRules.transportPrice"
                    >
                      <el-input-number
                        v-model="row.data.transportPrice"
                        :precision="2"
                        controls-position="right"
                        @change="priceChange(row.data)"
                        :min="0"
                      />
                    </el-form-item>
                  </div>
                </template>
              </MyTable>
              <div class="content-title">
                <span>调价说明</span>
              </div>
              <div class="my-form-container">
                <el-form-item label="调价说明：" prop="adjustContent">
                  <el-input
                    v-model="formData.adjustContent"
                    :autosize="{ minRows: 2, maxRows: 4 }"
                    type="textarea"
                    placeholder="请输入"
                  />
                </el-form-item>
              </div>
            </template>
            <template v-else>
              <div class="no-select">请先完成基础信息设置</div>
            </template>
          </div>
        </el-col>
      </el-row>
    </el-form>
  </JDetailContainer>
  <MyDialog
    :width="400"
    :visible="setPriceModel"
    @onUpdateDialogStatus="onModalClose('setprice')"
    :closeOnCloseModal="false"
    title="批量调价"
  >
    <div class="setprice">
      <div class="text">
        共选择了{{ selectedRows.length }}条数据可进行批量调价
      </div>
      <div class="content">
        <div>
          <span>货物单价调整</span>
          <el-input-number
            v-model="setProductPrice"
            :precision="2"
            controls-position="right"
          />
        </div>
        <div>
          <span>货物单价调整</span>
          <el-input-number
            v-model="setTransportPirce"
            :precision="2"
            controls-position="right"
          />
        </div>
      </div>
    </div>
    <template v-slot:footer>
      <el-button @click="onModalClose('setprice')">取消</el-button>
      <el-button type="primary" @click="setPriceSave" :loading="btnLoading">
        确定
      </el-button>
    </template>
  </MyDialog>
    <div class="price-list-footer">
    <el-button @click="saveDrafts" :loading="btnLoading">保存并关闭</el-button>
    <el-button type="primary" @click="onSubmit" :loading="btnLoading"
      >提交并关闭</el-button
    >
  </div>
  <MaterialModal
    v-if="modalShow"
    :visible="modalShow"
    @getSelected="getSelected"
    @onClose="onModalClose('material')"
  />
</template>

<script>
import {
  defineComponent,
  toRefs,
  reactive,
  ref,
  computed,
  onMounted,
} from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import MyTitle from "@/components/MyTitle.vue";
import MyTable from "@/components/MyTable.vue";
import MyDialog from "@/components/MyDialog.vue";
import PriceSelect from "./components/priceSelect.vue";
import ListSelect from "@/components/ListSelect.vue";
import MaterialModal from "@/components/commonModal/MaterialModal.vue";
import JDetailContainer from "@/components/JDetailContainer.vue";
import CustomerSelect from "@/components/commonModal/CustomerModal.vue";
import MyForm from "@/components/MyForm.vue";
import config from "@/utils/config";
import { getAssetsImg, transformArrayData } from "@/utils/index";
import { priceSettingApi } from "@/request/services/priceManagement";
import commonApi from "@/request/services/common";
import { dadjapManagementApi } from "@/request/services/priceManagement";
import moment from "moment";
export default defineComponent({
  name: "ListPriceInfo",
  components: {
    MyTitle,
    MyTable,
    MyForm,
    JDetailContainer,
    MyDialog,
    PriceSelect,
    CustomerSelect,
    MaterialModal,
    ListSelect,
  },
  setup() {
    const router = useRouter();
    const type = router.currentRoute.value.query.type;
    const selectId = router.currentRoute.value.query.id;
    const emptyText = ref("完成设置调价范围后查找调价物料");
    const tenantList = ref([]);
    const setPrice = ref(0);
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
    const tableColumns = [
      { label: "序号", prop: "num", width: 60, fixed: "left" },
      {
        label: "物料名称",
        prop: "productName",
        width: 160,
        fixed: "left",
      },
      { label: "价格来源", prop: "priceListName", width: 160 },
      { label: "客户名称", prop: "customerName", width: 160 },
      { label: "物料分类", prop: "categoryName", width: 160 },
      {
        label: "结算方式",
        prop: "payTypeName",
        width: 160,
      },
      {
        label: "价格模式",
        prop: "priceModel",
        width: 160,
        formatter: (row) => {
          return { 1: "一票制", 2: "两票制" }[row.priceModel];
        },
      },
      {
        label: "原货物单价",
        prop: "productOldPrice",
        width: 120,
        fixed: "right",
      },

      {
        label: "货物调价幅度",
        prop: "productPriceRange",
        slotName: "productPriceRange",
        width: 160,
        fixed: "right",
      },
      {
        label: "调后货物单价",
        prop: "productPrice",
        slotName: "productPrice",
        width: 160,
        fixed: "right",
      },
      {
        label: "原运输单价",
        prop: "transportOldPrice",
        width: 120,
        fixed: "right",
      },

      {
        label: "运输调价幅度",
        prop: "transportPriceRange",
        slotName: "transportPriceRange",
        width: 160,
        fixed: "right",
      },
      {
        label: "调后运输单价",
        prop: "transportPrice",
        slotName: "transportPrice",
        width: 160,
        fixed: "right",
      },
    ];
    const modalRecord = reactive({
      modalShow: false,
      setPriceModel: false,
      setProductPrice: 0,
      setTransportPirce: 0,
    });
    const priceRecord = reactive({
      priceNameData: [],
    });
    const state = reactive({
      formData: {
        productIds: [],
        priceListAdjustGoodsQos: [],
        adjustType: null,
      },
      formRef: null,
      tableFrom: null,
      tableDataFrom: {},
      selectedRows: [],
      btnLoading: false,
      isRed: "#e4e7ed",
    });

    const formRules = ref({
      startExpireTime: [config.rules({ type: "required", trigger: "change" })],
      tenantId: [config.rules({ type: "required", trigger: "change" })],
      adjustType: [config.rules({ type: "required", trigger: "change" })],
      transportPrice: [
        {
          type: "number",
          min: 0,
          message: "调后价格必须大于0",
          trigger: "blur",
        },
      ],
      productPrice: [
        {
          type: "number",
          min: 0,
          message: "调后价格必须大于0",
          trigger: "blur",
        },
      ],
    });

    // 获取价目表
    const getPriceNameList = () => {
      let params = {
        current: 1,
        size: 9999,
      };
      if (state.formData.customerId) {
        params.customerId = state.formData.customerId;
      }
      if (state.formData.tenantId) {
        params.tenantId = state.formData.tenantId;
      }
      priceSettingApi.getTableData(params).then((res) => {
        priceRecord.priceNameData = res.data.records.map((item) => {
          item.label = item.priceListName;
          return item;
        });
      });
    };
    getPriceNameList();

    const onSubmit = () => {
      state.formRef.validate((valid) => {
        if (
          state.formData.adjustType == 1 &&
          state.formData.productIds.length == 0
        ) {
          state.isRed = "#f56c6c";
        } else {
          state.isRed = "#e4e7ed";
        }
        if (valid) {
          if (!state.formData.priceListAdjustGoodsQos.length) {
            ElMessage.warning("请先选择范围进行调价！");
            return;
          }
          state.btnLoading = true;
          const data = {
            ...state.formData,
          };
          const selectConditions = {};
          if (state.formData.priceListNames?.length > 0) {
            selectConditions.priceListNames = state.formData.priceListNames;
            selectConditions.priceListIds = state.formData.priceListIds;
          }
          if (state.formData.productNames?.length > 0) {
            selectConditions.productNames = state.formData.productNames;
            selectConditions.productIds = state.formData.productIds;
          }
          data.selectConditions = JSON.stringify(selectConditions);
          dadjapManagementApi[type == "add" ? "onAdd" : "onEdit"](data)
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
        }
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
        onSubmit();
      });
    };

    //获取详情
    const getDetail = () => {
      dadjapManagementApi.getDetail(selectId).then((res) => {
        if (res && res.code == 0) {
          const selectConditions = JSON.parse(res.data.selectConditions);
          res.data.priceListNames = selectConditions?.priceListNames || [];
          res.data.priceListIds = selectConditions?.priceListIds || [];
          res.data.productNames = selectConditions?.productNames || [];
          res.data.productIds = selectConditions?.productIds || [];
          state.formData.tenantId = res.data.tenantId;
          state.formData = res.data;
          state.formData.priceListAdjustGoodsQos = transformArrayData(
            res.data.priceListAdjustGoodsVos,
            true,
            true
          );
        }
      });
    };
    selectId && getDetail();

    const getTableData = () => {
      if (
        state.formData.adjustType == 1 &&
        state.formData.productIds.length < 1
      ) {
        ElMessage.warning("请选择物料后查询");
        return;
      }
      if (state.formData.adjustType == 2 && !state.formData.customerId) {
        ElMessage.warning("请选择客户后查询");
        return;
      }
      const params = {
        tenantId: state.formData.tenantId,
        priceListIds: state.formData.priceListIds || null,
        productIds: state.formData.productIds || null,
        customerId: state.formData.customerId || null,
        payType: state.formData.payType || null,
        adjustType: state.formData.adjustType,
        startTime: state.formData.startExpireTime,
      };
      dadjapManagementApi.getDetailTable(params).then((res) => {
        if (res && res.code == 0) {
          emptyText.value = "暂无数据";
          res.data.forEach((item) => {
            item.productPriceRange = 0;
            item.transportPriceRange = 0;
            item.productOldPrice = item.productPrice;
            item.transportOldPrice = item.transportPrice;
            item.priceListGoodsId = item.id;
            delete item.id;
          });
          state.formData.priceListAdjustGoodsQos = transformArrayData(
            res.data,
            true,
            true
          );
        }
      });
    };

    const priceListChange = (item) => {
      let selectStr = [];
      let selectIds = [];
      item.map((item) => {
        selectStr.push(item.label);
        selectIds.push(item.id);
      });
      state.formData.priceListIds = selectIds;
      state.formData.priceListNames = selectStr;
    };
    //多选
    const handleSelectionChange = (val) => {
      state.selectedRows = val;
    };
    const selectedCustomer = (val) => {
      state.formData.customerId = val.id;
      state.formData.customerName = val.name;
      state.formData.customerShortName = val.shortName || "";
      state.formData.customerCategoryName = val.customerCategoryName;
      state.formData.customerCategoryId = val.customerCategoryId;
      state.formData.customerSalesType = val.saleCustomerCategoryId;
      state.formData.customerSalesTypeName = val.saleCustomerCategoryName;
      getPriceNameList();
    };
    //批量操作
    const onSelectChange = (ckType) => {
      if (state.selectedRows.length) {
        let ids = [];
        state.selectedRows.map((item) => {
          ids.push(item.priceListGoodsId);
        });
        if (ckType == "add") {
          modalRecord.setPriceModel = true;
        } else if (ckType == "del") {
          //批量移除
          delMaterial(ids);
        }
      } else {
        ElMessage.warning("请至少选择1项");
      }
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
        let tableDataList = state.formData.priceListAdjustGoodsQos.filter(
          (row) => {
            delete row.key;
            if (!ids.includes(row.priceListGoodsId)) {
              return row;
            }
          }
        );
        state.formData.priceListAdjustGoodsQos = transformArrayData(
          tableDataList,
          true,
          true
        );
      });
    };
    //选择公司
    const tenantChange = (val) => {
      state.formData.tenantName = tenantList.value.find(
        (item) => item.value == val
      ).label;
    };
    //选择价格模式
    const payTypeChange = (val) => {
      state.formData.payTypeName = payTypeList.value.find(
        (item) => item.value == val
      ).label;
    };
    //批量调价弹窗关闭
    const onModalClose = (type) => {
      if (type == "setprice") {
        modalRecord.setPriceModel = false;
        setPrice.value = 0;
      } else {
        modalRecord.modalShow = false;
      }
    };
    const setPriceSave = () => {
      let ids = [];
      state.selectedRows.map((item) => {
        ids.push(item.priceListGoodsId);
      });
      state.formData.priceListAdjustGoodsQos.forEach((row) => {
        if (ids.includes(row.priceListGoodsId)) {
          row.productPriceRange = modalRecord.setProductPrice;
          row.productPrice = row.productOldPrice + modalRecord.setProductPrice;
          row.transportPriceRange = modalRecord.setTransportPirce;
          row.transportPrice =
            row.transportOldPrice + modalRecord.setTransportPirce;
        }
      });
      onModalClose("setprice");
    };
    const priceChange = (row) => {
      state.formData.priceListAdjustGoodsQos[row.key].productPriceRange =
        row.productPrice - row.productOldPrice;
      state.formData.priceListAdjustGoodsQos[row.key].transportPriceRange =
        row.transportPrice - row.transportOldPrice;
    };
    const priceRangeChange = (row) => {
      state.formData.priceListAdjustGoodsQos[row.key].productPrice =
        row.productOldPrice + row.productPriceRange;
      state.formData.priceListAdjustGoodsQos[row.key].transportPrice =
        row.transportOldPrice + row.transportPriceRange;
    };
    const materialShow = () => {
      modalRecord.modalShow = true;
    };
    const getSelected = (val) => {
      state.formData.productIds = val.map((item) => {
        return item.id;
      });
      state.formData.productNames = val.map((item) => {
        return item.productName;
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
    return {
      formRules,
      type,
      selectId,
      setPrice,
      payTypeList,
      tenantList,
      emptyText,
      ...toRefs(modalRecord),
      ...toRefs(priceRecord),
      ...toRefs(state),
      getTableData,
      onSubmit,
      saveDrafts,
      getAssetsImg,
      tableColumns,
      handleSelectionChange,
      getuserbussiness,
      delMaterial,
      tenantChange,
      onSelectChange,
      getDetail,
      priceListChange,
      selectedCustomer,
      onModalClose,
      setPriceSave,
      priceChange,
      priceRangeChange,
      materialShow,
      getSelected,
      getPriceNameList,
      payTypeChange,
      disabledStartDate,
      disabledEndDate,
      getDictionaryList,
    };
  },
});
</script>

<style lang="scss" scoped>
.input-box {
  display: flex;
  padding: 0 8px;
  width: 100%;
  height: 32px;
  border-radius: 4px;
  border: 1px solid #ddd;
  box-sizing: border-box;
  justify-content: space-between;
  align-items: center;

  .item-list {
    display: flex;
    align-items: center;
    .item {
      display: inline-block;
      padding: 0 4px;
      max-width: 100px;
      height: 22px;
      font-size: 14px;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      color: #239cff;
      background: #f2f9ff;
      line-height: 22px;
      border-radius: 4px;
      box-sizing: border-box;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;

      &:not(:last-child) {
        margin-right: 5px;
      }
    }
  }

  .iconfont {
    font-size: 16px;
    color: #ccc;
  }
}
.price-list-footer {
  width: 100%;
  height: 50px;
  line-height: 50px;
  background: #fff;
  position: fixed;
  bottom: 0px;
  padding-left: 24px;
  z-index: 999;
}

.content-title {
  position: relative;
  margin-bottom: 16px;
  margin-top: 16px;
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
.no-select {
  margin-top: 40px;
  width: 268px;
  height: 40px;
  background: #ffffff;
  border-radius: 4px;
  border: 1px solid #3c82fe;
  line-height: 40px;
  text-align: center;
  color: #3c82fe;
}
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
.info-box {
  margin-bottom: 24px;
  padding-left: 24px;
  width: 790px;
  height: 40px;
  line-height: 40px;
  background: #edf5ff;
  border: 1px solid #97c3ff;
  color: $color-text;
}
.my-form-container {
  max-width: 790px;
}
.setprice {
  color: $color-text;
  padding-left: 24px;
  .text {
    height: 40px;
    line-height: 40px;
  }
  .content {
    display: flex;
    justify-content: space-between;
    span {
      padding-top: 20px;
    }
  }
}
</style>

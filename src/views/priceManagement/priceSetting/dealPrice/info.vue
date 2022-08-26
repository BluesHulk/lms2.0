<template>
  <JDetailContainer :goBack="goBack">
    <JDetailCard
      title="基础信息"
      :detailItems="detailItems"
      :detailData="detailData"
    />
    <MyTitle title="物料价格" imgUrl="jiageguanli.png" />
    <MyTable
      className="custom-table"
      ref="tableRef"
      :tableData="tableData"
      :columns="tableColumns"
    />

    <template #footer>
      <el-button
        type="primary"
        v-if="detailData.checkStatus == 0 || detailData.checkStatus == 2"
        @click="onBtnClick(detailData, 'edit')"
        >编辑</el-button
      >
      <el-button
        type="primary"
        v-if="detailData.checkStatus == 0 || detailData.checkStatus == 2"
        @click="onBtnClick(detailData, 'submit')"
        >提交</el-button
      >
      <el-button
        type="primary"
        v-if="detailData.checkStatus == 1"
        @click="onBtnClick(detailData, 'undo')"
        >撤回</el-button
      >
      <el-button
        type="primary"
        v-if="detailData.checkStatus == 1 || detailData.checkStatus == 3"
        @click="onBtnClick(detailData, 'copy')"
        >复制</el-button
      >
      <el-button
        type="primary"
        v-if="detailData.checkStatus == 0 || detailData.checkStatus == 2"
        @click="onBtnClick(detailData, 'del')"
        >删除</el-button
      >
    </template>
    </JDetailContainer
  >
</template>

<script>
import { reactive, toRefs } from "vue";
import { useRouter,useRoute } from "vue-router";
import { priceSettingApi } from "@/request/services/priceManagement";
import MyTable from "@/components/MyTable.vue";
import MyTitle from "@/components/MyTitle.vue";
import JDetailContainer from "@/components/JDetailContainer.vue";
import JDetailCard from "@/components/JDetailCard.vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { transformArrayData } from "@/utils/index";

export default {
  components: {
    MyTable,
    JDetailContainer,
    JDetailCard,
    MyTitle,
  },
  setup() {
    const router = useRouter();
    const route = useRoute();

    const detailRecord = reactive({
      detailItems: [
        {
          label: "销售公司：",
          prop: "tenantName",
        },
        {
          label: "客户名称：",
          prop: "customerName",
        },
        {
          label: "价目表名称：",
          prop: "priceListName",
        },
        {
          label: "价目表编码：",
          prop: "id",
        },
        {
          label: "结算方式：",
          prop: "payTypeName",
        },
        {
          label: "价格模式：",
          prop: "priceModelName",
        },
        {
          label: "流向管控：",
          prop: "flowControlName",
        },
        {
          label: "币种：",
          prop: "currency",
        },
        {
          label: "开始时间：",
          prop: "startExpireTime",
        },
        {
          label: "结束时间：",
          prop: "endExpireTime",
        },
        {
          label: "创建人",
          prop: "createUserName",
        },
        {
          label: "创建时间：",
          prop: "createTime",
        },
        {
          label: "更新人",
          prop: "updateUserName",
        },
        {
          label: "最后更新：",
          prop: "updateTime",
        },
        {
          label: "状态：",
          prop: "checkStatusName",
        },
      ],
      detailData: {},
    });

    const tableRecord = reactive({
      tableRef: null,
      tableData: [],
    });
    const tableColumns = [
      { label: "序号", prop: "num", width: 60 },
      {
        label: "物料名称",
        prop: "productName",
      },
      { label: "物料编码", prop: "id" },
      { label: "税率", prop: "taxRate" },
      { label: "物料分类", prop: "categoryName" },
      { label: "计量单位", prop: "unitName" },
      {
        label: "货物单价",
        prop: "productPrice",
      },
      {
        label: "运输单价",
        prop: "transportPrice",
      },
      {
        label: "挂牌价格",
        prop: "price",
      },
    ];

    const getDetail = () => {
      priceSettingApi.getDetail(route.query.id).then((res) => {
        if (res && res.code == 0) {
          res.data.checkStatusName = {
            0: "草稿",
            1: "待审核",
            2: "驳回",
            3: "生效",
            5: "到期",
          }[res.data.checkStatus];
          res.data.priceModelName = { 1: "一票制", 2: "两票制" }[
            res.data.priceModel
          ];
          res.data.flowControlName = { 1: "管控流向", 2: "不管控流向" }[
            res.data.flowControl
          ];
          detailRecord.detailData = res.data;
          tableRecord.tableData = transformArrayData(
            res.data.priceListGoodsVos,
            true,
            true
          );
        }
      });
    };
    getDetail();
    const onBtnClick = (record, type) => {
      console.log(router)
      if (type == "copy" || type == "edit") {
        //复制
        router.replace({
          path: "/priceSetting/dealPriceAdd",
          query: {
            id: record.id,
            type,
          },
        });
      } else if (type == "undo") {
        ElMessageBox.confirm(
          `<strong>撤回价目单</strong><br/>
        是否撤回该价目单?撤回后价目单将恢复草稿状态`,
          {
            dangerouslyUseHTMLString: true,
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          }
        ).then(() => {
          //撤回操作
          let ids = [record.id];
          onUndoPirce(ids);
        });
      } else if (type == "del") {
        ElMessageBox.confirm(
          `<strong>删除价目单</strong><br/>
        是否删除该价目单?删除后价目单将从列表移除`,
          {
            dangerouslyUseHTMLString: true,
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          }
        ).then(() => {
          //删除操作
          let ids = [record.id];
          onDelPirce(ids);
        });
      } else if (type == "submit") {
        ElMessageBox.confirm(
          `<strong>重新提交</strong><br/>
        是否重新提交该价目单?重新提交后价目单状态将变更为审核中状态`,
          {
            dangerouslyUseHTMLString: true,
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          }
        ).then(() => {
          // 重新提交操作
          priceSettingApi
            .onUnStatus({ id: record.id, checkStatus: 1 })
            .then((res) => {
              if (res.code == 0) {
                ElMessage.success("提交成功");
                goBack();
              } else {
                ElMessage.error(res.message);
              }
            });
        });
      }
    };
    //撤回的方法
    const onUndoPirce = (ids) => {
      priceSettingApi.onUndo(ids).then((res) => {
        if (res.code == 0) {
          ElMessage.success("撤回成功");
          goBack();
        } else {
          ElMessage.error(res.message);
        }
      });
    };

    //删除的方法
    const onDelPirce = (ids) => {
      priceSettingApi.onDelete(ids).then((res) => {
        if (res.code == 0) {
          ElMessage.success("删除成功");
          goBack();
        } else {
          ElMessage.error(res.message);
        }
      });
    };
    const goBack = () => {
     router.push({
          path: "/priceSetting",
        });
    };

    return {
      ...toRefs(detailRecord),
      ...toRefs(tableRecord),
      onBtnClick,
      onUndoPirce,
      onDelPirce,
      goBack,
      tableColumns,
    };
  },
};
</script>

<style lang="scss" scoped>
</style>
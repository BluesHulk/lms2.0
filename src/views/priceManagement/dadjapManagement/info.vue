<template>
  <JDetailContainer>
    <JDetailCard
      title="基本信息"
      :detailItems="detailItems"
      :detailData="detailData"
    />
    <MyTitle title="物料调价" imgUrl="jiageguanli.png" />
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
        v-if="detailData.checkStatus == 0 || detailData.checkStatus == 2"
        @click="onBtnClick(detailData, 'del')"
        >删除</el-button
      >
    </template>
  </JDetailContainer>
</template>

<script>
import { reactive, toRefs } from "vue";
import { useRouter,useRoute } from "vue-router";
import { dadjapManagementApi } from "@/request/services/priceManagement";
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
          label: "公司编号：",
          prop: "tenantId",
        },
        // {
        //   label: "价目表名称：",
        //   prop: "priceListName",
        // },
        {
          label: "调价单号：",
          prop: "id",
        },
        {
          label: "调价方式：",
          prop: "adjustTypeName",
        },
        {
          label: "调价开始时间：",
          prop: "startExpireTime",
        },
        {
          label: "调价结束时间：",
          prop: "endExpireTime",
        },
        {
          label: "调价人：",
          prop: "createUserName",
        },
        {
          label: "调价时间：",
          prop: "createTime",
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
      { label: "价格来源", prop: "priceListName" },
      { label: "客户名称", prop: "customerName" },
      {
        label: "原货物单价",
        prop: "productOldPrice",
      },

      {
        label: "货物调价幅度",
        prop: "productPriceRange",
         formatter: (row) => {
            if (row.productPriceRange >0) {
              return `<span style="color:#13CE66">+${row.productPriceRange}</span>`;
            } else if (row.productPriceRange <0) {
              return `<span style="color:#FF3B30">${row.productPriceRange}</span>`;
            } else if (row.productPriceRange ==0) {
              return `<span style="color:#F7BA2A">${row.productPriceRange}</span>`;
            }
          },
      },
      {
        label: "调后货物单价",
        prop: "productPrice",
      },
      {
        label: "原运输单价",
        prop: "transportOldPrice",
      },

      {
        label: "运输调价幅度",
        prop: "transportPriceRange",
        formatter: (row) => {
            if (row.transportPriceRange >0) {
              return `<span style="color:#13CE66">+${row.transportPriceRange}</span>`;
            } else if (row.transportPriceRange <0) {
              return `<span style="color:#FF3B30">${row.transportPriceRange}</span>`;
            } else if (row.transportPriceRange ==0) {
              return `<span style="color:#F7BA2A">${row.transportPriceRange}</span>`;
            }
          },
      },
      {
        label: "调后运输单价",
        prop: "transportPrice"
      },
    ];

    const getDetail = () => {
      dadjapManagementApi.getDetail(route.query.id).then((res) => {
        if (res && res.code == 0) {
          res.data.checkStatusName = {
            0: "草稿",
            1: "待审核",
            2: "驳回",
            3: "审核通过",
          }[res.data.checkStatus];
           res.data.adjustTypeName = {
            1: "整体调价",
            2: "客户调价",
          }[res.data.adjustType];
          detailRecord.detailData = res.data;
          tableRecord.tableData = transformArrayData(
            res.data.priceListAdjustGoodsVos,
            true,
            true
          );
        }
      });
    };
    getDetail();
const onBtnClick = (record,type) => {
 if (type == 'edit'){
        router.replace({
          path: "/dadjapManagement/dadjapAdd",
          query: {
            id:record.id,
            type,
          },
        });
    }else if (type == 'undo'){
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
    }else if (type == 'del'){
           ElMessageBox.confirm(
        `<strong>删除调价单</strong><br/>
        是否删除该价目单?删除后调价单将从列表移除`,
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
    }else if (type == 'submit'){
           ElMessageBox.confirm(
        `<strong>重新提交</strong><br/>
        是否重新提交该调价单?重新提交后调价单状态将变更为审核中状态`,
        {
          dangerouslyUseHTMLString: true,
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).then(() => {
       // 重新提交操作
          dadjapManagementApi
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
      dadjapManagementApi.onUndo( ids ).then((res) => {
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
      dadjapManagementApi.onDelete(ids).then((res) => {
        if (res.code == 0) {
          ElMessage.success("删除成功");
          goBack();
        } else {
          ElMessage.error(res.message);
        }
      });
    };
    const goBack = () => {
      router.go(-1);
    };
    return {
      ...toRefs(detailRecord),
      ...toRefs(tableRecord),
      onBtnClick,
      tableColumns,
      onUndoPirce,
      onDelPirce,
      goBack
    };
  },
};
</script>

<style lang="scss" scoped>
</style>
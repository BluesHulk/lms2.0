<template>
  <MyContainer>
    <!-- 装车统计 -->
    <MyMultipleFilter
      :formItems="filterItems"
      :formData="searchParams"
      :initData="initParams"
      @onSearch="onSearch"
    />
    <div class="item-container">
      <ul>
        <li class="item" v-for="(item, index) in productGroupTypeAmounts" :key="index + 'aa'">
          <div class="imgBox">
            <img v-if="item.sortValue < 5" :src="getAssetsImg(`iconfont${Number(item.sortValue)}.svg`)" alt="">
            <img v-else :src="getAssetsImg('moren.svg')" alt="">
          </div>
          <div>
            <div class="item-title">{{item.name}}</div>
            <div class="tiem-num">
              {{item.amount}}<span class="unit">吨</span>
            </div>
          </div>
        </li>
      </ul>
    </div>
    <MyTable
      className="examination-roomSetting-table"
      ref="tableRef"
      :tableData="tableData"
      :columns="tableColumns"
      @handleSelectionChange="handleSelectionChange"
    />
    <MyPagination
      :total="tableTotal"
      :queryData="pageParams"
      @paginationChange="paginationChange"
    />
  </MyContainer>
</template>

<script>
import { ref, reactive, toRefs } from "vue";
import moment from "moment";
import MyContainer from "@/components/MyContainer.vue";
import MyMultipleFilter from "@/components/MyMultipleFilter.vue";
import MyTable from "@/components/MyTable.vue";
import MyPagination from "@/components/MyPagination.vue";
import commonApi from "@/request/services/common";
import { loadingStatisticsApi } from "@/request/services/factoryDispatch";
import { transformArrayData } from "@/utils/index";
import { getAssetsImg } from "@/utils/index";

export default {
  name: "loadingStatistics",
  components: {
    MyContainer,
    MyMultipleFilter,
    MyTable,
    MyPagination
  },
  setup() {
    const tenantList = ref([]);
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

    const filterItems = ref([
      {
        type: "select",
        label: "所属公司",
        paramName: "tenantId",
        options: tenantList,
        span: 12,
      },
      {
        type: "rangePicker",
        label: "日期",
        paramName: "time",
        span: 12,
      },
    ]);

    const filterRecord = reactive({
      initParams: {
        tenantId: sessionStorage.getItem("tenantId") * 1 || "",
      },
      searchParams: {
        tenantId: sessionStorage.getItem("tenantId") * 1 || "",
      },
    });

    const tableRecord = reactive({
      tableRef: null,
      tableData: [],
      tableTotal: 0,
      pageParams: {
        currentPage: 1,
        pageSize: 10,
      },
    })

    const tableColumns = [
      { label: "序号", prop: "num", width: 60, fixed: "left" },
      { label: "物料编号", prop: "productCode", minWidth: 140 },
      { label: "物料名称", prop: "productName", minWidth: 140 },
      { label: "数量（吨）", prop: "settlementAmount", minWidth: 140 },
      { label: "统计分组", prop: "productGroupTypeName", minWidth: 140 },
      { label: "公司编号", prop: "tenantId", minWidth: 120 },
      { label: "所属公司", prop: "tenantName", minWidth: 180 }
    ];

    const deliveryFactory = ref([]);
    const getDictionaryList = (code, setData) => {
      commonApi.getDictionaryList(code).then((res) => {
        if (res && res.code == 0) {
          setData.value = res.data;
        }
      });
    };
    getDictionaryList("PRODUCT_GROUP_TYPE", deliveryFactory);

    const productGroupTypeAmounts = ref([]);
    const getTableData = () => {
      const params = {
        current: tableRecord.pageParams.currentPage,
        size: tableRecord.pageParams.pageSize,
        ...filterRecord.searchParams,
      };
      delete params.time;
      loadingStatisticsApi.getTableData(params).then((res) => {
        if (res && res.code == 0) {
          tableRecord.tableTotal = res.data.loadRecordVOPage?.total;
          tableRecord.tableData = res.data.loadRecordVOPage ? res.data.loadRecordVOPage.records : []

          if (res.data.productGroupTypeAmounts?.length > 0) {
            res.data.productGroupTypeAmounts.map((val) => {
              deliveryFactory.value.filter((item) => {
                if (item.code === val.productGroupType) {
                  item.amount = val.amount
                }
              })
            })
          } else {
            deliveryFactory.value.forEach((val) => {
              val.amount = 0
            })
          }
          productGroupTypeAmounts.value = dataSort(deliveryFactory.value)
          
          transformArrayData(
            tableRecord.tableData,
            true,
            true,
            tableRecord.pageParams.currentPage,
            tableRecord.pageParams.pageSize
          );
        } else {
          deliveryFactory.value.forEach((val) => {
            val.amount = 0
          })
          productGroupTypeAmounts.value = dataSort(deliveryFactory.value)
        }
      })
      .catch(() => {
        deliveryFactory.value.forEach((val) => {
          val.amount = 0
        })
        productGroupTypeAmounts.value = dataSort(deliveryFactory.value)
      })
    };
    getTableData();

    const dataSort = (arr) => {
      for (let i = 0; i < arr.length; i++) {
        for (let j = i + 1; j < arr.length; j++) {
          if (Number(arr[i].sortValue) > Number(arr[j].sortValue)) {
            let a = arr[i]
            arr[i] = arr[j]
            arr[j] = a
          }
        }
      }
      return arr
    }

    const onSearch = (val) => {
      tableRecord.pageParams.currentPage = 1;
      if (val.time && val.time.length) {
        val.startTime = moment(val.time[0]).format("YYYY-MM-DD 00:00:00");
        val.endTime = moment(val.time[1]).format("YYYY-MM-DD 23:59:59");
        // delete val.time;
      }
      filterRecord.searchParams = val;
      getTableData();
    };
    
    const paginationChange = (data) => {
      const { currentPage, pageSize } = tableRecord.pageParams;
      if (data.currentPage == currentPage && data.pageSize == pageSize) {
        return;
      }
      tableRecord.pageParams = { ...data };
      getTableData();
    };

    return {
      ...toRefs(filterRecord),
      ...toRefs(tableRecord),
      productGroupTypeAmounts,
      filterItems,
      tableColumns,
      onSearch,
      paginationChange,
      getAssetsImg
    };
  },
}
</script>

<style lang="scss" scoped>
.tab-box {
  padding: 0 24px;
  background: #fff;
}
::v-deep {
  .my-multiple-filter-container {
    display: flex;
    justify-content: space-between;
    .my-form-container {
      min-width: calc(100% / 3 * 2);

      .el-form-item {
        margin: 0;
      }
    }
    .button-box {
      min-width: 145px;
    }
  }
}
.item-container {
  margin-top: 20px;
  ul {
    display: flex;
    justify-content: space-between;
  }
  .item{
    width: 23%;
    height: 116px;
    background-color: #fff;
    box-sizing: border-box;
    display: flex;
    .item-title {
      margin-top: 28px;
      height: 20px;
      font-size: 14px;
      text-align: left;
      color: #5A78A0;
      line-height: 20px;
      font-family: PingFangSC-Regular, PingFang SC;
    }
    .tiem-num{
      margin-top: 4px;
      height: 36px;
      font-size: 30px;
      font-family: HelveticaNeue-Bold, HelveticaNeue;
      font-weight: bold;
      color: #092D5C;
      line-height: 37px;
      .unit{
        width: 14px;
        height: 20px;
        font-size: 14px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #5A78A0;
        line-height: 20px;
      }
    }
    .imgBox{
      width: 40px;
      height: 40px;
      margin-top: 37px;
      margin-left: 24px;
      margin-right: 16px;
      img{
        width: 40px;
        height: 40px;
      }
    }
  }
}
</style>
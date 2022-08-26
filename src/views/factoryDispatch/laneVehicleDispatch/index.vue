<template>
  <MyContainer>
    <template v-slot:top>
      <el-tabs
        class="custom-tabs"
        type="card"
        v-model="activeName"
        @tab-change="handleClick"
      >
        <el-tab-pane
          v-for="item in productList"
          :key="item.id"
          :label="item.name"
          :name="item.code"
        ></el-tab-pane>
      </el-tabs>
    </template>
    <MyMultipleFilter
      :formItems="filterItems"
      :formData="searchParams"
      :initData="initParams"
      @onSearch="onSearch"
    />
    <div class="content">
      <div class="content-top">
        <div>
          <el-button @click="getLaneData"
            ><i class="iconfont icon-shuaxin" />刷新</el-button
          >
        </div>
        <div class="top-lend">
          图例：
          <div class="lend-box" v-for="(item, index) in lengList" :key="index">
            <span :style="`background-color:${item.color}`"></span>
            {{ item.name }}
          </div>
        </div>
      </div>
      <div v-if="laneData.length > 0" class="content-box">
        <div class="lane-item" :key="index" v-for="(vals, index) in laneData">
          <div class="lane-material">
            <div class="switch">
              <el-switch
                :width="50"
                v-model="vals.isEnable"
                inline-prompt
                active-text="启用"
                inactive-text="停用"
                @change="onUpdataStatus(vals)"
              />
            </div>
            <div v-if="vals.isEnable" class="title">
              <img :src="getAssetsImg('xialiaokou.png')" />
              <span>{{ vals.name }}</span>
            </div>
            <div v-else class="title">
              <img :src="getAssetsImg('xialiaokou2.png')" />
              <span style="color: #b7c4d7">{{ vals.name }}</span>
            </div>
          </div>
          <draggable
            v-model="vals.dispatchVehicleQueueVOList"
            @start="drag = true"
            @end="drag = false"
            @change="moveUpdate"
            handle=".move"
            item-key="sort"
            animation="500"
            class="bgline"
          >
            <template #item="{ element }">
              <div class="lane">
                <div
                  :class="`lane-box ${element.queueStatus != 100 && 'move'}`"
                >
                  <div class="box-top" @click="onNodeClick(element)">
                    <img :src="getAssetsImg('cheliang.png')" />
                  </div>
                  <div class="box-bot">
                    <div
                      :class="`car-box ${
                        element.id == laneCheckIndex && 'is-active'
                      }`"
                      :style="carStatus(element.queueStatus)"
                    >
                      {{ element.licensePlate }}
                    </div>
                    <div
                      class="butbox"
                      @click="onLeaveCar(element)"
                      v-if="element.id == laneCheckIndex"
                    >
                      <el-button
                        type="danger"
                        style="width: 30px; height: 30px"
                        circle
                      >
                        <img :src="getAssetsImg('yichu2.png')"
                      /></el-button>
                      <span>移除队列</span>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </draggable>
        </div>
      </div>
      <div style="text-align: center" v-else>暂无数据</div>
      <div style="padding: 24px">
        <MyPagination
          :total="laneTotal"
          :queryData="pageParams"
          @paginationChange="paginationChange"
        />
      </div>
    </div>
  </MyContainer>
</template>

<script>
import { computed, reactive, ref, toRefs } from "vue";
import MyContainer from "@/components/MyContainer.vue";
import MyPagination from "@/components/MyPagination.vue";
import MyMultipleFilter from "@/components/MyMultipleFilter.vue";
import { laneVehicleDispatchApi } from "@/request/services/factoryDispatch";
import commonApi from "@/request/services/common";
import { useStore } from "vuex";
import { ElMessage, ElMessageBox } from "element-plus";
import { getAssetsImg } from "@/utils/index";

import draggable from "vuedraggable";

export default {
  components: {
    MyContainer,
    MyPagination,
    draggable,
    MyMultipleFilter,
  },
  setup() {
    const store = useStore();
    const activeName = ref("");
    const productList = ref([]);
     const tenantList = ref(computed(() => {
      if(store.state.common.tenantList.length) {
        return store.state.common.tenantList;
      } else {
        store.dispatch('common/getTenantList');
      }
    }));
    const lengList = [
      {
        name: "装车中",
        color: "#5BD100",
      },
      {
        name: "待装车",
        color: "#3C82FE",
      },
      {
        name: "预入队",
        color: "#B7C4D7",
      },
      {
        name: "当前操作车辆",
        color: "#F7BA2A",
      },
    ];
    //获取数据字典
    const getDictionaryList = (code, setData) => {
      commonApi.getDictionaryList(code).then((res) => {
        if (res && res.code == 0) {
          let sortArr = [...res.data];
          sortArr.sort((a, b) => {
            return a.sortValue * 1 > b.sortValue * 1 ? 1 : -1;
          });
          setData.value = sortArr;
          activeName.value = sortArr[0].code;
        }
      });
    };
    getDictionaryList("PRODUCT_GROUP_TYPE", productList);
    // const getTenantList = () => {
    //   commonApi.getCompany().then((res) => {
    //     if (res && res.code == 0) {
    //       res.data.map((item) => {
    //         item.label = item.name;
    //         item.value = item.id;
    //       });
    //       tenantList.value = res.data;
    //     }
    //   });
    // };
    // getTenantList();
     const filterRecord = reactive({
      initParams: {
        tenantId: sessionStorage.getItem("tenantId") * 1 || "",
      },
      searchParams: {
        tenantId: sessionStorage.getItem("tenantId") * 1 || "",
      },
    });
    const laneRecord = reactive({
      laneTotal: 0,
      laneCheckIndex: "",
      laneData: [],
      pageParams: {
        currentPage: 1,
        pageSize: 10,
      },
      formData: {
        tenantId: "",
      },
    });

    const getLaneData = () => {
      const params = {
        current: laneRecord.pageParams.currentPage,
        size: laneRecord.pageParams.pageSize,
        productGroupType: activeName.value,
        ...filterRecord.searchParams,
      };
      laneVehicleDispatchApi.getLaneData(params).then((res) => {
        if (res && res.code == 0) {
          laneRecord.laneTotal = res.data.total;
          laneRecord.laneData = res.data.records;
        }
      });
    };

    const filterItems = ref([
      {
        type: "select",
        label: "所属公司",
        paramName: "tenantId",
        options: tenantList,
        span: 12,
      },
    ]);

    const onSearch = (val) => {
      laneRecord.pageParams.currentPage = 1;

      filterRecord.searchParams = val;
      getLaneData();
    };

    const handleClick = () => {
      getLaneData();
      onDeliteClose();
    };
    const moveUpdate = (data) => {
      const { newIndex, element } = data.moved;
      let selectItem = {};
      let upId = 0;
      let downId = 0;
      laneRecord.laneData.map((item) => {
        item.dispatchVehicleQueueVOList?.map((val) => {
          if (val.id == element.id) {
            selectItem = item;
          }
        });
      });
      if (newIndex > 0) {
        upId = selectItem.dispatchVehicleQueueVOList[newIndex - 1].id;
      }
      if (newIndex < selectItem.dispatchVehicleQueueVOList.length - 1) {
        downId = selectItem.dispatchVehicleQueueVOList[newIndex + 1].id;
      }
      let params = {
        currentQueueId: element.id,
        targetDownQueueId: downId,
        targetUpQueueId: upId,
      };
      laneVehicleDispatchApi.onMove(params).then((res) => {
        if (res.code == 0) {
          ElMessage.success("操作成功");
        } else {
          ElMessage.error(res.message);
        }
        getLaneData();
      });
    };
    //撤回的方法
    const onUpdataStatus = (val) => {
      ElMessageBox.confirm(
        `<strong>提示</strong><br/>您确定要将该车道${
          val.isEnable ? "启用" : "停用"
        }吗？`,
        {
          dangerouslyUseHTMLString: true,
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
        .then(() => {
          let params = {
            isEnable: val.isEnable,
            loadLaneId: val.id,
          };
          laneVehicleDispatchApi.onUpdate(params).then((res) => {
            if (res.code == 0) {
              ElMessage.success("操作成功");
            } else {
              ElMessage.error(res.message);
            }
            getLaneData();
          });
        })
        .catch(() => {
          getLaneData();
        });
    };

    //删除的方法
    const onLeaveCar = (data) => {
      ElMessageBox.confirm(
        `<strong>提示</strong><br/>您确定要将${data.licensePlate}移除队列吗？`,
        {
          dangerouslyUseHTMLString: true,
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).then(() => {
        laneVehicleDispatchApi.onLeave(data.id).then((res) => {
          if (res.code == 0) {
            ElMessage.success("移除成功");
            getLaneData();
          } else {
            ElMessage.error(res.message);
            getLaneData();
          }
        });
      });
    };
    const paginationChange = (data) => {
      const { currentPage, pageSize } = laneRecord.pageParams;
      if (data.currentPage == currentPage && data.pageSize == pageSize) {
        return;
      }
      laneRecord.pageParams = { ...data };
      getLaneData();
    };

    //点击节点触发
    const onNodeClick = (data) => {
      if (data.queueStatus !== 100) {
        if (laneRecord.laneCheckIndex == data.id) {
          laneRecord.laneCheckIndex = 0;
        } else {
          laneRecord.laneCheckIndex = data.id;
        }
      }
    };

    const carStatus = (status) => {
      if (status == 10) {
        return "background: #B7C4D7";
      } else if (status == 100) {
        return "background: #5BD100";
      } else {
        return "background: #3C82FE";
      }
    };
    return {
      activeName,
      filterItems,
      lengList,
      productList,
      getLaneData,
      handleClick,
      ...toRefs(filterRecord),
      ...toRefs(laneRecord),
      paginationChange,
      onUpdataStatus,
      onLeaveCar,
      moveUpdate,
      getAssetsImg,
      onSearch,
      onNodeClick,
      carStatus,
    };
  },
};
</script>

<style lang="scss" scoped>
.container {
  height: calc(100% - 30px);
  color: $color-text;
  .content {
    background: #fff;
    margin-top: 24px;
    width: 100%;
    .content-top {
      justify-content: space-between;
      padding: 24px;
      display: flex;
      .iconfont {
        color: #dce5ed;
      }
      .top-lend {
        display: flex;
        color: $color-text;
        .lend-box {
          span {
            display: inline-block;
            width: 30px;
            height: 12px;
            border-radius: 6px;
          }
        }
      }
    }
    .content-box {
      width: 100%;
      overflow: auto;
      display: flex;
      .lane-item {
        width: 230px;
        background: #ffffff;
        box-shadow: 8px 8px 10px 0px rgba(0, 0, 0, 0.14);
        border-radius: 4px;
        border: 1px solid #dce5ed;
        display: flex;
        flex-direction: column;
        margin: 0 24px;
        flex-shrink: 0;
        .lane-material {
          width: 100%;
          height: 60px;
          .switch {
            text-align: right;
            padding-right: 10px;
          }
          .title {
            padding-left: 24px;
            display: flex;
            align-items: center;
            img {
              width: 24px;
            }
            span {
              padding-left: 8px;
              font-size: 14px;
              font-family: PingFangSC-Semibold, PingFang SC;
              font-weight: 600;
              color: #092d5c;
            }
          }
        }
        .bgline::before {
          content: "";
          position: absolute;
          top: 20px;
          left: 50%;
          width: 4px;
          height: calc(100% - 40px);
          background: #3d84fe;
          transform: translate(-50%);
        }
        .bgline {
          position: relative;
        }
        .lane {
          position: relative;
          width: 100%;
          height: 120px;
          display: flex;
          justify-content: center;
          align-items: center;
          .lane-box {
            position: relative;
            background: #fff;
            z-index: 11;
            .box-top {
            cursor: pointer;
              display: flex;
              justify-content: center;
              align-items: center;
            }
            .box-bot {
              display: flex;
              justify-content: center;
              align-items: center;
              .car-box {
                color: #fff;
                width: 114px;
                height: 32px;
                border-radius: 20px;
                line-height: 32px;
                text-align: center;
              }
              .is-active {
                background: #f7ba2a !important;
              }
              .butbox {
                cursor: pointer;
                width: 90px;
                height: 30px;
                background: #ffd3d0;
                box-shadow: 1px 2px 3px 0px rgba(0, 0, 0, 0.18);
                border-radius: 15px;
                border: 1px solid #ff3b30;
                color: #ff3b30;
              }
            }
          }
        }

        .line {
          position: relative;
          left: 50%;
          transform: translate(-50%);
          width: 1px;
          height: 40px;
          background: #000;
        }
      }
    }
  }
}
::v-deep {
  .el-tabs__nav-scroll {
    color: $color-text;
    background: #fff;
  }
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
</style>
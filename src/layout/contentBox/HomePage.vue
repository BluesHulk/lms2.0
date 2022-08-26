<template>
  <div class="home-main">
    <div class="home-left">
      <div class="head-portrait">
        <div class="tou-icon">
          <img
            class="user-img"
            src="@/assets/imgs/icon-qiyelogo.png"
            v-if="!homeInfo.tenantLogoUrl"
          />
          <img class="user-img" :src="homeInfo.tenantLogoUrl" @error="setDefaultImg" v-else />
        </div>
        <div class="user-info">
          <p class="title">你好，{{ homeInfo.userName }}</p>
          <p class="smtitle" @click="toUserRoleMange" v-if="perfectHanldShow">
            你现在的身份是：
            <span v-if="homeInfo.roleName == null">游客</span>
            <span v-else>{{ homeInfo.roleName }}</span>
          </p>
          <p class="smtitle" v-else>
            你现在的身份是：
            <span v-if="homeInfo.roleName == null">游客</span>
            <span v-else>{{ homeInfo.roleName }}</span>
          </p>
        </div>
      </div>
      <div class="brand clearfix">
        <div class="brand-item">
          <img class="user-img" src="@/assets/imgs/brand-icon3.png" />
          <p>银牌企业</p>
        </div>
        <div class="brand-item">
          <img class="user-img" src="@/assets/imgs/brand-icon2.png" :style="`filter: ${homeInfo.tenantInfoPCT ? 'none' : 'grayscale(1)'}`" />
          <p>{{ homeInfo.tenantInfoPCT ? "信息已完善" : "信息未完善" }}</p>
        </div>
        <div class="brand-item">
          <img class="user-img" src="@/assets/imgs/brand-icon1.png" :style="`filter: ${homeInfo.tenantIsAuth ? 'none' : 'grayscale(1)'}`" />
          <p>{{ homeInfo.tenantIsAuth ? "企业已认证" : "企业未认证" }}</p>
        </div>
      </div>
      <div class="handle" v-if="perfectHanldShow">
        <p class="handle-tips">建议完成以下操作：</p>
        <div class="handle-box">
          <router-link to="/businessInfo">
            <div
              class="handle-item items"
              v-if="!homeInfo.tenantInfoPCT"
            >
              补全企业信息
            </div>
          </router-link>
          <router-link to="/userMange">
            <div class="handle-item">添加公司用户</div>
          </router-link>
          <router-link to="/organizeMange" v-if="!homeInfo.tenantIsDept">
            <div class="handle-item">建立组织结构</div>
          </router-link>
          <router-link to="/roleMange">
            <div class="handle-item">维护角色</div>
          </router-link>
          <!-- <div class="handle-item items" @click="buildOri">建立组织结构</div>
          <div class="handle-item" @click="buildrole">维护角色</div> -->
        </div>
      </div>
    </div>
    <div class="home-right" v-loading="loading">
      <div class="home-right-main">
        <p class="title">快捷入口</p>
        <div class="quick-box">
          <div
            class="quick-item items"
            v-for="(item, index) in itemList"
            :key="index"
          >
            <div class="quick-item-main" @click="logistics(item)">
              <img :src="item.icon" v-if="item.icon" />
              <img src="@/assets/imgs/application-default.png" v-else />
              <p class="item-name" :title="item.name">{{ item.name }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, computed, reactive, toRefs, ref, watch } from "vue";
import store from "@/store";
import router from "@/router";
import { homeInfo } from "@/request/services/homeInfo.js";

export default defineComponent({
  setup() {
    const loading = ref(false);
    const getFastList = () => {
      loading.value = true;
      homeInfo.getFastList().then((res) => {
        if (res.code == 0) {
          state.itemList = res.data || [];
        }
        loading.value = false;
      });
    };
    const getHomeInfo = () => {
      homeInfo.getHomeInfo().then((res) => {
        if (res.code == 0) {
          state.homeInfo = res.data || {};
          store.commit('common/setHomeInfo', state.homeInfo);
          sessionStorage.setItem('homeInfo', JSON.stringify(res.data));
        }
      });
    };
    getFastList();
    getHomeInfo();

    const state = reactive({
      userInfo: computed(() => store.state.common.userInfo),
      toUserRoleMange: () => {
        router.replace("/roleMange");
      },
      logistics: (record) => {
        sessionStorage.setItem('sysCode', record.code);
        localStorage.setItem('sysCode', record.code);
        
        location.href = record.applicationUrl;
      },
      itemList: [],
      homeInfo: {},
      buildOri: () => {
        store.dispatch("business/checkTabsValue", "1");
        store.dispatch("BusOrganization/setOrgId", {
          id: state.userInfo.tenantId,
        });
        router.replace(
          `/businessMange/add?type=edit&id=${state.userInfo.tenantId}`
        );
      },
      buildrole: () => {
        store.dispatch("business/checkTabsValue", "2");
        store.dispatch("business/setOrgId", { id: state.userInfo.tenantId });
        router.replace(
          `/businessMange/add?type=edit&id=${state.userInfo.tenantId}`
        );
      },
    });

    const setDefaultImg = (event) => {
      // const img = event.srcElement;
      // img.src = require('../../assets/imgs/icon-qiyelogo.png');
      // img.onerror = null;
    }

    watch(() => store.state.common.userInfo.tenantId, () => {
      getFastList();
      getHomeInfo();
    })
    return {
      loading,
      perfectHanldShow: computed(() => {
        return state.homeInfo.roleTypes && (state.homeInfo.roleTypes.indexOf('MANAGER') > -1 || state.homeInfo.roleTypes.indexOf('COMPANY_MANAGEMENT') > -1);
      }),
      setDefaultImg,
      ...toRefs(state),
    };
  },
});
</script>

<style lang="scss" scoped>
.home-main {
  display: flex;
  margin: 0.4rem;
  margin-right: 0.2rem;
  height: calc(100% - 0.8rem);
  .home-left {
    border-right: 1px solid #dddddd;
    width: 462px;
    height: 100%;
    .head-portrait {
      display: flex;
      .tou-icon {
        height: 0.6rem;
        width: 0.6rem;
        border: 1px solid #239CFF;
        border-radius: 100%;
        overflow: hidden;

        img {
          width: 100%;
          height: 100%;
        }
      }
      .user-info {
        display: flex;
        margin-left: 16px;
        width: 300px;
        height: 60px;
        flex-direction: column;
        justify-content: space-between;
      }
      .title {
        font-size: 18px;
        font-family: PingFangSC-Semibold, PingFang SC;
        font-weight: 600;
        color: #333333;
        line-height: 25px;
      }
      .smtitle {
        color: #999999;
        cursor: pointer;
        span {
          color: $color-blue;
        }
      }
    }
    .brand {
      margin: 0.2rem 0 0.3rem;
      .brand-item {
        float: left;
        margin-right: 0.3rem;
        text-align: center;
        color: #666;
        .user-img {
          margin-bottom: 8px;
          height: 40px;
          width: 40px;
          overflow: hidden;
        }
      }
    }
    .handle {
      .handle-tips {
        font-size: 16px;
        font-family: PingFangSC-Semibold, PingFang SC;
        font-weight: 600;
        color: #333333;
        line-height: 22px;
      }
      .handle-box {
        display: flex;
        width: 100%;
        height: 0.9rem;
        margin-top: 0.2rem;
        flex-wrap: wrap;
        .handle-item {
          margin-right: 30px;
          margin-bottom: 10px;
          width: 144px;
          height: 36px;
          text-align: center;
          line-height: 36px;
          color: $color-blue;
          background: #F2F9FF;
          border-radius: 4px;
        }
        .items {
          margin-left: 0;
        }
      }
    }
  }
  .home-right {
    width: 100%;
    overflow: auto;
    .home-right-main {
      margin: 0 0 0 0.6rem;
      .title {
        font-size: 18px;
        font-family: PingFangSC-Semibold, PingFang SC;
        font-weight: 600;
        color: #333333;
        line-height: 25px;
      }
      img {
        width: 50px;
        height: 50px;
      }
      .quick-box {
        margin-top: 0.24rem;
        display: flex;
        flex-wrap: wrap;
        .quick-item {
          margin: 0 24px 24px 0;
          width: 254px;
          height: 72px;
          border-radius: 4px;
          border: 1px solid #cccccc;
          .quick-item-main {
            display: flex;
            padding: 12px;
            align-items: center;
            img {
              width: 50px;
              height: 50px;
            }
            .item-name {
              margin-left: 12px;
              width: 100%;
              font-size: 16px;
              font-family: PingFangSC-Semibold, PingFang SC;
              font-weight: 600;
              color: #333333;
              overflow: hidden;
              white-space: nowrap;
              text-overflow: ellipsis;
            }
            .quick-btn {
              width: 1.3rem;
              height: 0.32rem;
              text-align: center;
              line-height: 0.32rem;
              background-color: #fff;
              color: $color-blue;
              border: 1px solid $color-blue;
              border-radius: 4px;
              cursor: pointer;
            }
          }
        }
        .quick-item:hover {
          border: 1px solid $color-blue;
          box-shadow: 0px 2px 11px 0px rgba(0, 0, 0, 0.2);

          .quick-btn {
            width: 1.3rem;
            height: 0.32rem;
            text-align: center;
            line-height: 0.32rem;
            background-color: $color-blue;
            color: #ffffff;
            border-radius: 4px;
            cursor: pointer;
          }
        }
        .items {
          margin-left: 0;
        }
      }
    }
  }
}
</style>
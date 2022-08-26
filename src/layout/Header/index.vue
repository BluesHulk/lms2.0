<template>
  <div class="header">
    <div class="title-item">
      <img :src="getAssetsImg('logo.png')" />
      <p class="title">灵鱼</p>
    </div>
    <!-- 菜单标签-->
    <div class="navTab">
      <!-- <nav class="nav">
        <scroll-bar>
          <div class="nav-box">
            <div
              ref="navList"
              v-for="(navItem, index) in navList"
              :key="navItem.id"
              :class="['nav-item', currMenu == navItem.path && 'nav-curr']"
              @mouseenter="hoverPath = navItem.path"
              @mouseleave="hoverPath = null"
              @contextmenu.prevent="openMenuBox($event, navItem, index)"
            >
              <span @click="switchContent(navItem)">{{ navItem.name }}</span>
              <i
                class="el-icon-close"
                @click="closePath(navItem, index)"
                :style="closeStyle(navItem)"
              ></i>
            </div>
          </div>
        </scroll-bar>
      </nav> -->
      <ul v-show="visible" class="contextmenu" :style="menuStyle">
        <li @click="closePath(currPath, currPathIndex)">关闭当前</li>
        <li @click="closeOtherPath(currPath, currPathIndex)">关闭其他</li>
        <li @click="closeAllPath">关闭所有</li>
      </ul>
    </div>
    <!-- 用户设置相关 -->
    <div class="userset">
      <div class="left">
        <el-autocomplete
          v-model="searchState"
          placeholder="请输入功能名称"
          class="w-50 m-2 search-input"
          size="small"
        >
          <template #prefix>
            <div>
              <i class="iconfont icon-sousuo"></i>
            </div>
          </template>
          <template></template>
        </el-autocomplete>
        <div class="icon-list">
          <i class="iconfont icon-wenti" @click="onClickHelp"></i>
          <el-popover
            popper-class="message-popper"
            placement="bottom"
            :width="200"
            trigger="click"
          >
            <template #reference>
              <el-badge :is-dot="messageList.length" class="item">
                <i class="iconfont icon-news"></i>
              </el-badge>
            </template>
            <div class="message-list">
              <template v-if="messageList.length">
                <div
                  class="message-item"
                  v-for="item in messageList"
                  :key="item.messageId"
                  @click="readMessage(item.messageId)"
                >
                  <div class="message-content">{{ item.msg }}</div>
                  <div class="message-time">{{ item.createTime }}</div>
                </div>
              </template>
              <template v-else>
                <div class="message-hint">暂无数据</div>
              </template>
            </div>
          </el-popover>
          <i class="iconfont icon-suofang fullscreen" @click="fullScreen"></i>
        </div>
      </div>
      <div class="right">
        <el-dropdown popper-class="user-dropdown-popper">
          <span class="user-info">
            <img
              class="user-img"
              src="@/assets/imgs/icon-qiyelogo.png"
              v-if="!homeInfo.tenantLogoUrl"
            />
            <img
              class="user-img"
              :src="homeInfo.tenantLogoUrl"
              @error="setDefaultImg"
              v-else
            />
            <span class="user-name">{{ homeInfo.userName }}</span>
            <span>
              <i class="iconfont icon-xiala"></i>
            </span>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item class="user-info">
                <div class="left">
                  <img
                    class="user-img"
                    :src="homeInfo.tenantLogoUrl"
                    @error="setDefaultImg"
                  />
                </div>
                <div class="right">
                  <span class="user-name" :title="homeInfo.userName">{{
                    homeInfo.userName
                  }}</span>
                  <span class="user-roles" :title="homeInfo.roleName">{{
                    homeInfo.roleName || "游客"
                  }}</span>
                </div>
              </el-dropdown-item>
              <el-dropdown-item @click="checkPassword"
                >修改密码</el-dropdown-item
              >
              <el-dropdown-item class="log-out" @click="logout"
                >退出登录</el-dropdown-item
              >
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
    <!-- 修改密码 -->
    <ChangePassword ref="changePasswordRef" />
  </div>
</template>

<script>
import {
  ref,
  watch,
  computed,
  defineComponent,
  onMounted,
  onUnmounted,
  reactive,
  toRefs,
} from "vue";
import { useStore } from "vuex";
// import ScrollBar from "../contentBox/ScrollBar.vue";
import router from "@/router";
import { useRoute } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import ChangePassword from "./components/ChangePassword.vue";
import { messageCenterApi } from "@/request/services/messageCenter";
import moment from "moment";
import { getAssetsImg } from "@/utils/index";

export default defineComponent({
  name: "HeaderBox",
  components: { /*ScrollBar,*/ ChangePassword },
  props: {
    isCollapse: Boolean,
  },

  setup(props) {
    const store = useStore();
    
    store.dispatch("common/setUserInfo");

    const scrollBarData = sessionStorage.getItem("scrollBarData");
    if (scrollBarData) {
      store.dispatch("common/setStorageNavList", JSON.parse(scrollBarData));
    }
    const homeInfo = ref(computed(() => {
      return store.state.common.userInfo
    }))

    const messageRecord = reactive({
      messageList: [],
    });
    const getSocketMessage = () => {
      messageCenterApi.getSocketMessageList({ read: false }).then((res) => {
        if (res && res.code == 0) {
          res.data.map((item) => {
            item.createTime = moment(item.createTime).format(
              "YYYY-MM-DD HH:mm"
            );
          });
          messageRecord.messageList = res.data;
        } else {
          ElMessage.error(res.message);
        }
      });
    };
    getSocketMessage();

    const readMessage = (id) => {
      messageCenterApi.readMessage(id).then((res) => {
        if (res && res.code == 0) {
          getSocketMessage();
        } else {
          ElMessage.error(res.message);
        }
      });
    };

    let websock = null;

    const websocketonopen = () => {
      console.log("WebSocket连接成功");

      //连接建立之后执行send方法发送数据
      // let actions = { test: "12345" };
      // websocketsend(JSON.stringify(actions));
    };
    const websocketonerror = () => {
      console.log("WebSocket连接失败");
      //连接建立失败重连
      initWebSocket();
    };
    const websocketonmessage = (e) => {
      //数据接收
      if (e.data != "conn_success") {
        const messageList = [...messageRecord.messageList];
        const data = JSON.parse(e.data);
        messageList.unshift(data);
        messageRecord.messageList = messageList;
      }
      console.log(e, e.data, "WebSocket接收数据");
    };
    // const websocketsend = (data) => {
    //   //数据发送
    //   websock.send(data);
    // };
    const websocketclose = (e) => {
      //关闭
      console.log("断开连接", e);
    };

    const initWebSocket = () => {
      if ("WebSocket" in window) {
        const location = window.location;
        websock = new WebSocket(
          `${location.protocol == "http:" ? "ws:" : "wss:"}//${
            location.host
          }/message-center-management-provider/api/websocket/${homeInfo.value.id}`
        );

        websock.onmessage = websocketonmessage;
        websock.onopen = websocketonopen;
        websock.onerror = websocketonerror;
        websock.onclose = websocketclose;
      } else {
        console.log("当前浏览器不支持websocket");
      }
    };
    initWebSocket();

    const searchState = ref("");
    const changePasswordRef = ref(null);

    const currPathIndex = ref(null);
    // 右键菜单的显示和隐藏;
    let visible = ref(false),
      menuStyle = ref("display:none;"),
      currPath = ref({}),
      hoverPath = ref("");
    const closeMenu = () => {
      visible.value = false;
    };
    watch(visible, (nV) => {
      if (nV) {
        document.body.addEventListener("click", closeMenu);
      } else {
        document.body.removeEventListener("click", closeMenu);
      }
    });
    // 显示右键菜单时设置所选中的菜单项
    const openMenuBox = (e, path, index) => {
      let isCollapse = props.isCollapse,
        width = document.body.clientWidth;
      if (e.clientX + 110 > width) {
        menuStyle.value = `top:${e.clientY + 5}px;right:${
          width - e.clientX - 5
        }px`;
      } else {
        menuStyle.value = isCollapse
          ? `top:${e.clientY + 5}px;left:calc(${e.clientX}px - .5rem)`
          : `top:${e.clientY + 5}px;left:calc(${e.clientX}px - 2.5rem)`;
      }
      (currPath.value = path),
        (currPathIndex.value = index),
        (visible.value = true);
    };

    // 导航菜单列表和当前路由
    let navList = computed(() => store.state.common.navList);
    let currMenu = computed(() => useRoute().path);
    const switchContent = (navItem) => {
      router.replace(navItem.path);
    };
    const checkPassword = () => {
      changePasswordRef.value.modalShow();
    };

    const setDefaultImg = (event) => {
      const img = event.srcElement;
      img.src = getAssetsImg('icon-qiyelogo.png');
      img.onerror = null;
    };

    const spreadMenuData = ref(
      computed(() => store.state.common.spreadMenuData)
    );

    const onClickHelp = () => {
      let helpUrl = "http://wiki.laihui.cn";
      spreadMenuData.value.map((item) => {
        if (currMenu.value == item.menuUrl && item.helpUrl) {
          helpUrl = item.helpUrl;
        }
      });
      window.open(helpUrl);
    };

    onMounted(() => {
      window.addEventListener("beforeunload", () => {
        sessionStorage.setItem("scrollBarData", JSON.stringify(navList.value));
      });
    });

    onUnmounted(() => {
      websock.close();
    });

    return {
      visible,
      menuStyle,
      currPath,
      currPathIndex,
      hoverPath,
      navList,
      currMenu,
      openMenuBox,
      switchContent,
      searchState,
      changePasswordRef,
      checkPassword,
      homeInfo,
      setDefaultImg,
      ...toRefs(messageRecord),
      onClickHelp,
      readMessage,
      getAssetsImg,
    };
  },
  methods: {
    // 退出登录
    logout() {
      ElMessageBox.confirm("你确定要退出吗?", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
      })
        .then(() => {
          sessionStorage.removeItem("scrollBarData");
          this.closeAllPath();

          // router.push("/login");
          location.href = `${location.protocol}//${location.host}/middleground-web/#/login`;
        })
        .catch(() => {});
    },
    closeStyle(navItem) {
      return navItem.path == this.hoverPath && navItem.path != "/home"
        ? "opacity: 1;"
        : "";
    },
    closePath(navItem, index) {
      if (index == 0) return;
      if (navItem.path == "/homepage") return;
      this.$store.commit("common/setNavList", {
        type: 2,
        navItem: navItem,
        delIndex: index,
      });
    },
    closeOtherPath(navItem, index) {
      this.$store.commit("common/setNavList", {
        type: 3,
        navItem: navItem,
        delIndex: index,
      });
    },
    closeAllPath() {
      this.$store.commit("common/setNavList", {
        type: 0,
      });
    },
    // 全屏
    fullScreen() {
      let element = document.documentElement;
      if (this.fullscreen) {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.webkitCancelFullScreen) {
          document.webkitCancelFullScreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
      } else {
        if (element.requestFullscreen) {
          element.requestFullscreen();
        } else if (element.webkitRequestFullScreen) {
          element.webkitRequestFullScreen();
        } else if (element.mozRequestFullScreen) {
          element.mozRequestFullScreen();
        } else if (element.msRequestFullscreen) {
          // IE11
          element.msRequestFullscreen();
        }
      }
      this.fullscreen = !this.fullscreen;
    },
  },
});
</script>

<style lang="scss" scoped>
.header {
  position: relative;
  background: $color-theme;
  height: 100%;
  display: flex;
  color: #ffffff;
  padding: 0 24px;
  .title-item {
    display: flex;
    margin-left: 10px;
    height: 100%;
    font-size: 16px;
    align-items: center;
    img {
      margin-right: 0.08rem;
    }
  }
  .title {
    text-align: center;
    float: left;
  }

  .navTab {
    height: 100%;
    width: calc(100% - 300px - 580px);
    margin-left: 0.24rem;
    position: relative;
    .nav {
      position: relative;
      height: 100%;
      &-box {
        height: 0.4rem;
        white-space: nowrap;
      }
      &-item {
        display: inline-block;
        white-space: nowrap;
        width: 1.2rem;
        text-align: center;
        background: #026fc8;
        color: #ffffff;
        border-radius: 8px 8px 0px 0px;
        height: 100%;
        line-height: 34px;
        cursor: pointer;
        position: relative;

        &:not(:first-child) {
          margin-left: 0.08rem;
        }
        .el-icon-close {
          position: absolute;
          top: 0.1rem;
          right: 0.01rem;
        }
        > span {
          display: inline-block;
          min-width: 0.3rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        > i {
          font-size: 0.12rem;
          color: #ffffff;
          transform: scale(0.9);
          padding: 0.05rem;
          opacity: 0;
          cursor: pointer;
          flex: 0 0 auto;
          &:hover {
            color: #cccccc;
            background-color: #fff;
            border-radius: 50%;
          }
        }
      }
      &-curr {
        background: #fff;
        color: $color-blue;
        font-weight: 600;
        line-height: 40px;
      }
    }
  }
  .contextmenu {
    margin: 0;
    position: absolute;
    top: 0px;
    left: 0;
    width: 92px;
    font-size: 13px;
    font-weight: 400;
    color: #333;
    background: #fff;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    list-style-type: none;
    z-index: 99;
    li {
      margin: 0;
      padding: 7px 20px;
      cursor: pointer;
      &:hover {
        background-color: #e8f4ff;
        color: #46a6ff;
      }
    }
  }
  .userset {
    display: flex;
    width: 533px;
    justify-content: space-around;
    align-items: center;
    position: absolute;
    top: 50%;
    right: 32px;
    transform: translate(0, -50%);

    .left {
      position: relative;
      padding-right: 20px;
      display: flex;
      width: 362px;
      justify-content: space-between;
      align-items: center;
      .icon-list {
        display: flex;
        width: 100px;
        justify-content: space-between;
        cursor: pointer;
        .iconfont {
          font-size: 20px;
        }
      }

      &::before {
        content: "";
        width: 1px;
        height: 27px;
        background-color: #ffffff;
        position: absolute;
        top: 50%;
        right: 0;
        transform: translate(0, -50%);
      }
    }
    .right {
      display: flex;
      width: 150px;
      justify-content: center;

      .user-info {
        height: 100% !important;
        display: flex;
        flex-direction: row;
        align-items: center;
        position: relative;
        cursor: pointer;
        .icon-xiala {
          color: #fff;
        }
      }
      .user-name {
        padding: 0 0.05rem;
        max-width: 80px;
        color: #ffffff;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        box-sizing: border-box;
      }
      .user-img {
        height: 38px;
        width: 38px;
        border-radius: 100%;
        border: 1px solid #f1f1f1;
        overflow: hidden;
      }
    }
    ::v-deep {
      .search-input {
        width: 232px;
        
        .el-input.el-input--small {
          height: 30px;

          .el-input__wrapper {
            border-radius: 16px;
          }
        }
      }
      .el-input--prefix .el-input__inner {
        border: none;
        border-radius: 0.16rem;
      }
      .el-dropdown {
        position: relative;
      }
    }
  }
}
</style>

<style lang="scss">
.user-dropdown-popper {
  border: 1px solid #ccc;
  box-shadow: 0px 0px 6px 0px rgba(0, 0, 0, 0.04),
    0px 2px 4px 0px rgba(0, 0, 0, 0.12);
  .el-dropdown-menu {
    .el-dropdown-menu__item {
      padding: 0 10px;
      width: 146px;
      box-sizing: border-box;
    }
    .user-info {
      display: flex;
      padding: 10px;

      .left {
        width: 32px;
        height: 32px;
        img {
          width: 100%;
          height: 100%;
        }
      }
      .right {
        display: flex;
        margin-left: 8px;
        height: 32px;
        font-size: 14px;
        flex-direction: column;
        justify-content: space-between;

        span {
          display: inline-block;
          width: 85px;
          line-height: 14px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .user-roles {
          color: $color-blue;
        }
      }
    }
    .log-out {
      color: #ff3b30;
      &:hover {
        color: #ff3b30;
      }
    }
    .el-dropdown-menu__item:not(.is-disabled):not(.log-out):hover {
      color: $color-blue;
    }
  }
}
.message-popper {
  max-height: 300px;
  overflow-y: auto;
  .message-list {
    .message-item {
      padding: 3px 0;
      cursor: pointer;

      .message-time {
        font-size: 12px;
        color: #ddd;
      }
    }
    .message-hint {
      padding: 6px;
      text-align: center;
    }
  }
}
</style>
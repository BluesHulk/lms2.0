<template>
  <div :class="`sidebar ${isCollapse && 'sidebar-collapse'}`">
    <!-- <div class="sidebar-top">
      <button class="btn-icon" @click="onCollapseChange">
        <i class="iconfont icon-icon_cebianlan"></i>
      </button>
      <el-dropdown
        trigger="click"
        placement="bottom-start"
        @command="handleCommand"
      >
        <div class="el-dropdown-div" v-show="!isCollapse">
          <span class="el-dropdown-link">
            {{ businessName }}
          </span>
          <i class="iconfont el-icon-arrow-down"></i>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item
              v-for="item in businessList"
              :key="item.id"
              :command="item.id"
              :disabled="item.status == 0"
            >
              {{ item.name }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div> -->
    <el-menu
      class="el-menu-custom"
      @select="selectMenu"
      background-color="#fff"
      text-color="#092D5C"
      active-text-color="#3C82FE"
      :default-active="defaultActive"
      :collapse="isCollapse"
      :router="true"
      :unique-opened="false"
    >
      <!-- <el-menu-item index="/home">
        <i class="iconfont icon-icon_homePage_choose"></i>
        <template #title>
          <span class="menuName">首页</span>
        </template>
      </el-menu-item> -->
      <template v-for="(menu, index) in menuList" :key="menu.id">
        <el-sub-menu
          :index="index + ''"
          popper-class="main-menu-box"
          v-if="menu.children.length"
        >
          <template #title>
            <i :class="menu.iconName"></i>
            <span class="menu-name">{{ menu.name }}</span>
          </template>
          <el-menu-item
            v-for="item in menu.children"
            :index="item.path"
            :key="item.id"
          >
            <span>{{ item.name }}</span>
          </el-menu-item>
        </el-sub-menu>
        <el-menu-item :index="menu.path" v-else>
          <template #title>
            <i :class="menu.iconName"></i>
            <span class="menu-name">{{ menu.name }}</span>
          </template>
        </el-menu-item>
      </template>
    </el-menu>
  </div>
  <div :class="`collapse-btn ${isCollapse && 'collapse-btn-rollover'}`" @click="onCollapseChange"></div>
</template>

<script>
import { ref, watch, computed, defineComponent, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { useStore } from "vuex";
import commonApi from "@/request/services/common";
import config from "@/utils/config";
import user from "@/request/services/user";
import navData from "./NavConfig.js";

export default defineComponent({
  name: "Sidebar",
  props: {
    isCollapse: Boolean,
  },
  setup(props, { emit }) {
    const store = useStore();
    // 侧边栏收缩展开
    let isCollapseSidebar = ref();

    watch(isCollapseSidebar, (newVal) => {
      emit("changeCollapse", newVal);
    });
    watch(() => props.isCollapse, (val) => {
      isCollapseSidebar.value = val;
    })
    const router = useRouter();
    onMounted(() => {
      getBusinessList();

      store.commit("common/setCurrentRouterData", {
        title: router.currentRoute.value.meta.title,
        path: router.currentRoute.value.path,
      });
    });
    const getBusinessInfo = () => {
      commonApi.getTenantInfo().then((res) => {
        if (res.code == 0) {
          store.dispatch("common/setUserTenantInfo", res.data);
        } else {
          ElMessage({
            type: "error",
            message: res.message,
          });
        }
      });
    };
    getBusinessInfo();
    // 全部菜单，根据权限筛选展示的菜单;
    const allMenu = ref(navData);

    // config.isLocalhost = true;
    // config.isDevelop = true;

    // 获取用户权限
    const getUserMenuAuth = () => {
      store.commit(
        "common/setRoleMenuData",
        store.state.common.initRoleMenuData
      );

      const sysCode = localStorage.getItem('sysCode') || sessionStorage.getItem('sysCode');

      store
        .dispatch("common/getRoleMenuData", {
          sysCode,
        })
        .then((data) => {
          allMenu.value = handleMenuData(data);

          if (!config.isLocalhost && !config.isDevelop) {
            handleMenu();
          }
        });
    };
    getUserMenuAuth();

    const businessList = ref([]);
    const getBusinessList = async () => {
      const { data } = await user.getbusinessList();
      businessList.value = data;
    };
    const handleCommand = async (val) => {
      console.log("qian", router.currentRoute.value.path);
      sessionStorage.setItem("tenantId", val);
      router.push("/home");
      getBusinessInfo();

      if (!config.isLocalhost && !config.isDevelop) {
        menu.value = [];
      }
      getUserMenuAuth();
    };

    const handleMenuData = (data) => {
      for (let i = 0; i < data.length; i++) {
        data[i].path = data[i].menuUrl;
        data[i].iconName = data[i].picUrl;

        if (data[i].children) {
          data[i].children = handleMenuData(data[i].children);
        }
      }
      return data;
    };

    let menuObj = {};
    let menuList = ref([]);

    const handleMenu = () => {
      allMenu.value.forEach((list) => {
        let children = [];
        list.children &&
          list.children.forEach((item) => {
            let isHavePerms = store.getters.isHavePerms(item.id);
            if (isHavePerms) {
              children.push({ ...item });
              menuObj[item.path] = item;
            }
          });
        menuList.value.push({
          id: list.id,
          name: list.name,
          iconName: list.iconName,
          path: list.path || list.menuUrl,
          children,
        });
      });
    };
    (config.isLocalhost || config.isDevelop) && handleMenu();

    // 菜单选中的默认选项
    const defaultActive = computed(() => {
      if (useRoute().path == "/") {
        return null;
      } else {
        if (useRoute().meta.active) {
          return useRoute().meta.active;
        } else {
          return useRoute().path;
        }
      }
    });

    const onCollapseChange = () => {
      isCollapseSidebar.value = !isCollapseSidebar.value;
    };

    const selectMenu = (info) => {
      if (info == "/home") {
        store.commit("common/setNavList", {
          type: 1,
          navItem: { id: "1", name: "首页", path: "/home" },
        });
      } else {
        if (menuObj[info]) {
          store.commit("common/setNavList", {
            type: 1,
            navItem: menuObj[info],
          });
        } else {
          router.push("/error");
        }
      }
      store.commit("common/setCurrentRouterData", {
        title: menuObj[info] && menuObj[info].name,
        path: info,
      });
    };
    return {
      isCollapseSidebar,
      menuList,
      defaultActive,
      businessList,
      getBusinessList,
      getBusinessInfo,
      handleCommand,
      businessName: computed(() => store.state.common.businessInfo.name),
      onCollapseChange,
      selectMenu,
    };
  },
});
</script>

<style lang="scss" scoped>
.sidebar {
  width: 100%;
  height: calc(100vh - 54px);
  background: #fff;
  z-index: 9;
  overflow-y: auto;

  .el-menu {
    background: #fff;
    font-weight: 600;
    border: none;
    overflow: hidden;

    .menu-name {
      padding-left: 8px;
    }

    .el-menu-item {
      margin: 0 auto;
      width: 192px;
      min-width: 192px;
      height: 38px;
    }
    .el-menu-item.is-active {
      background: #edf1ff;
      border-radius: 4px;
    }
  }

  ::v-deep {
    .el-dropdown {
      color: #fff;
      text-align: center;
      line-height: 0.5rem;
      cursor: pointer;
    }
  }
}
.collapse-btn {
  position: absolute;
  top: 50%;
  right: 0;
  width: 12px;
  height: 68px;
  background: url("@/assets/imgs/side-bar-btn.png") no-repeat;
  background-size: 100% 100%;
  transform: translate(50%, -50%);
  z-index: 100;
  cursor: pointer;
}
.collapse-btn-rollover {
  transform: rotate(180deg) translate(-50%, 50%);
}
.sidebar-collapse {
  width: 60px;
  overflow: hidden;
  animation: minusWidth 0.5s;
}
@keyframes minusWidth {
  from {
    width: 240px;
  }
  to {
    width: 60px;
  }
}
</style>

<style lang="scss">
.main-menu-box {
  .el-menu-item.is-active {
    position: relative;
    color: $color-blue;

    &::after {
      content: "";
      position: absolute;
      top: 50%;
      left: 0;
      width: 6px;
      height: 0.4rem;
      background-color: $color-blue;
      transform: translateY(-50%);
    }
  }
}
</style>
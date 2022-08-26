import router from '@/router'
import user from "@/request/services/user"
import commonApi from "@/request/services/common";

function spreadMenuData(data, menuList) {
  for (let i = 0; i < data.length; i++) {
    if (data[i].menuUrl) {
      menuList.push(data[i]);
    }
    if (data[i].children) {
      spreadMenuData(data[i].children, menuList);
    }
  }
  return menuList;
}

const state = {
  navList: [{
    id: '1',
    name: "首页1",
    path: '/home'
  }],
  currMenu: '1',
  permissions: [],
  userInfo: {
    avatar: "",
    tenantId: undefined,
    deptId: undefined,
    deptName: null,
    email: null,
    mobile: null,
    roleId: null,
    roleName: null,
    username: ''
  },
  breadCrumb: [],
  homeInfo: {},
  currentRouterData: {},
  roleMenuData: [],
  initRoleMenuData: [],
  spreadMenuData: [],
  isFilterShow: false, // 右侧高级筛选显隐
  tenantList: [], // 当前公司及其子公司列表
}
const mutations = {
  setPermissions: (state, data) => {
    state.permissions = data;
  },
  setNavList: (state, data) => {
    let index = -1;
    if (data.type == 1) {
      index = state.navList.findIndex(item => {
        return item.id == data.navItem.id
      });
      index = index == 0 ? 0 : (index || -1);
    }

    let currRouter = router.currentRoute.value.path;
    switch (data.type) {
      case 0: //清空
        state.navList = [{
          id: '1',
          name: "首页",
          path: '/home'
        }];
        router.push('/home');
        state.currMenu = '1';
        break;
      case 1: //新增
        if (index == -1) {
          state.navList.push(data.navItem);
        }
        router.push(data.navItem.path);
        state.currMenu = data.navItem.id;
        break;
      case 2: //删除
        if (currRouter == data.navItem.path) {
          router.push(state.navList[data.delIndex - 1].path);
          state.currMenu = state.navList[data.delIndex - 1].id;
        }
        state.navList.splice(data.delIndex, 1);
        break;
      case 3: //删除其他
        state.navList = data.navItem.id == 1 ? [{
          id: '1',
          name: "首页",
          path: '/home'
        }] : [{
          id: '1',
          name: "首页",
          path: '/home'
        }, {
          ...data.navItem
        }];
        router.push(data.navItem.path);
        state.currMenu = data.navItem.id;
        break;
      default:
        break;
    }
  },
  setStorageNavList: (state, data) => {
    state.navList = data;
  },
  setUserInfo: (state, data) => {
    state.userInfo = data;
  },
  setUserTenantInfo: (state, data) => {
    // state.userInfo = data;
    state.userInfo.tenantId = data.id;
  },
  setBreadCrumb: (state, data) => {
    state.breadCrumb = data;
  },
  setHomeInfo: (state, data) => {
    state.homeInfo = data;
  },
  setCurrentRouterData: (state, data) => {
    state.currentRouterData = data;
  },
  setRoleMenuData: (state, data) => {
    state.roleMenuData = data;
  },
  setInitRoleMenuData: (state, data) => {
    state.initRoleMenuData = data;
  },
  setSpreadMenuData: (state, data) => {
    state.spreadMenuData = data;
  },
  setAsideFilterShow: (state, data) => {
    state.isFilterShow = data;
  },
  setTenantList: (state, data) => {
    state.tenantList = data;
  }
}

const actions = {
  setUserInfo({ commit }) {
    user.getUserInfo().then(res => {
      if (res.code == 0) {
        commit('setUserInfo', res.data);
        sessionStorage.setItem('homeInfo', JSON.stringify(res.data))
      }
    }).catch(() => { })
  },
  setUserTenantInfo({ commit }, data) {
    commit('setUserTenantInfo', data || {});
  },
  setBreadCrumb({ commit }, data) {
    commit('setBreadCrumb', data);
  },
  setStorageNavList({ commit }, data) {
    commit('setStorageNavList', data);
  },
  getRoleMenuData({ commit }, data = {}) {
    const { type, ...params } = data;
    return new Promise((resolve, reject) => {
      const sysCode = localStorage.getItem('sysCode') || sessionStorage.getItem('sysCode');
      commonApi.getMenuByUser({ sysCode, ...params })
        .then(res => {
          if (res && res.code == 0) {
            const menuList = spreadMenuData(res.data, []);
            const roleMenuList = [...state.initRoleMenuData];
            menuList.map(item => {
              roleMenuList.push(item.menuUrl);
            })

            commit('setRoleMenuData', roleMenuList);
            commit('setSpreadMenuData', menuList);
            if (type == 'roleMenu') {
              resolve(roleMenuList);
            } else {
              resolve(res.data);
            }
          } else {
            reject(res);
          }
        })
    })
  },
  async getTenantList({ commit }) {
    // 当前企业详情
    const tenantInfo =  await new Promise((resolve, reject) => {
      commonApi.getTenantInfo().then(res => {
        if (res && res.code == 0) {
          res.data.label = res.data.name;
          res.data.value = res.data.id;
          resolve(res.data);
        } else {
          reject(res);
        }
      })
    })
    // 当前企业子公司列表
    // const subsidiaryList = await new Promise((resolve, reject) => {
    //   commonApi.getSubsidiaryList().then(res => {
    //     if (res && res.code == 0) {
    //       res.data.map(item => {
    //         item.label = item.tenantName;
    //         item.value = item.tenantId;
    //       })
    //       resolve(res.data);
    //     } else {
    //       reject(res);
    //     }
    //   })
    // })
    commit('setTenantList', [
      tenantInfo,
      // ...subsidiaryList,
    ])
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
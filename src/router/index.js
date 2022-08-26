import {
  createRouter,
  createWebHashHistory
} from 'vue-router';
import store from '../store';
import { routes, layoutRoutes } from './routes.js';
import config from '../utils/config';


// 创建路由
const router = createRouter({
  history: createWebHashHistory(),
  routes: [...routes],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return {
        top: 0
      }
    }
  }
})

filterAddRouter(layoutRoutes, 'Home');
// 根据权限过滤路由,动态添加路由
function filterAddRouter(allRouters, parentName) {
  for (let route of allRouters) {
    let itemRouter = {
      ...route
    };
    router.addRoute(parentName, {
      ...itemRouter,
    });
    if (itemRouter.children) {
      filterAddRouter(itemRouter.children, itemRouter.name)
    }
  }
}

function getRouterPath(data, list) {
  for (let i = 0; i < data.length; i++) {
    if (list.indexOf(data[i].path) < 0) {
      list.push(data[i].path);
    }
    if (data[i].children && data[i].children.length) {
      getRouterPath(data[i].children, list);
    }
  }
  return list;
}
store.commit('common/setInitRoleMenuData', getRouterPath(routes, []));

// 首次进入系统跳转到有权限的第一个页面
const firstJump = (list, next) => {
  const initRoleMenus = getRouterPath(routes, []);
  const roleMenus = [];
  list.map(item => {
    if(initRoleMenus.indexOf(item) < 0) {
      roleMenus.push(item);
    }
  })
  next(roleMenus[0]);
}

router.beforeEach(async (to, from, next) => {
  // 设置面包屑
  const breadCrumbList = []
  to.matched.forEach(item => {
    breadCrumbList.push({ name: item.meta.title, path: item.path, icon: item.meta.icon });
  })
  store.dispatch('common/setBreadCrumb', breadCrumbList);

  const token = sessionStorage.getItem('token');

  if (to.name == 'Login') {
    next();
  } else {
    if (token) {
      console.log('登录成功');
      console.log(to.name)
      if (router.hasRoute(to.name)) {
        if (config.isLocalhost || config.isDevelop) {
          next();
          return;
        }
        const roleMenuList = store.state.common.roleMenuData || [];
        if (roleMenuList.length) {
          if (roleMenuList.indexOf(to.path) > -1 || roleMenuList.indexOf(to.meta.active) > -1) {
            if(to.name == 'app') {
              firstJump(roleMenuList, next);
            } else {
              next();
            }
          } else {
            next('error');
            return false;
          }
        } else {
          await store.dispatch('common/getRoleMenuData', { type: 'roleMenu' }).then(list => {
            if (list.indexOf(to.path) > -1 || list.indexOf(to.meta.active) > -1) {
              if(to.name == 'app') {
                firstJump(list, next);
              } else {
                next();
              }
            } else {
              next('error');
              return false;
            }
          });
        }
      } else {
        if (config.isLocalhost || config.isDevelop) {
          next();
          return;
        }
        next("/error");
      }
    } else {
      console.log('未登录1');
      // next('/login');
      location.href = `${location.protocol}//${location.host}/middleground-web/#/login`;
      return false;
    }
  }
})

export default router
const getters = {
  isHavePerms: (state) => (perms) => {
    if (state.common.permissions.length == 0) {
      return true;
    }
    let index = state.common.permissions.indexOf(perms);
    return index > -1 ? true : false
  },
  env: state => state.app.env,
  asideMenu: state => state.app.asideMenu,
  users: state => state.user.users
}
export default getters

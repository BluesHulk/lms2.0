import { get, put, post, patch, postJson, del, qs} from '../http';


const accountStatementApi = {
  getTableData(params) {
    return postJson(`/tenant-lms-account-provide/capitalStatement/page`, params );
  },
  getDetail(params) {
    return get(`/tenant-lms-account-provide/capitalStatement/detail`, params );
  },
  confirm(params) {
    return put(`/tenant-lms-account-provide/capitalStatement/confirm?${qs(params)}`);
  },
  check(params) {
    return put(`/tenant-lms-account-provide/capitalStatement/check?${qs(params)}` );
  },
  cancelCheck(params) {
    return put(`/tenant-lms-account-provide/capitalStatement/cancelCheck?${qs(params)}`);
  },
  toSave(params) {
    return postJson(`/tenant-lms-account-provide/capitalStatement/save`, params );
  },

  getDpOrderList(params) {
    return get(`/tenant-lms-sales-provide/lms/business/sales/dporder/page`, params );
  }

}



export { accountStatementApi };
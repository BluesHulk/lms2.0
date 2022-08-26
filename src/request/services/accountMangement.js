import { get, put, post, patch, postJson, del, qs} from '../http';

const saleApi = {
  getTableData(params) {
    // return postJson(`/tenant-lms-account-provide/capitalAccount/page?${qs(params)}` );
    return postJson(`/tenant-lms-account-provide/capitalAccount/page?${qs(params)}` );
  },
  getDetail(params) {
    return get(`/tenant-lms-account-provide/capitalAccount/detail`,params );
  },
  updateSatus(params) {
    return put(`/tenant-lms-account-provide/capitalAccount/update?${qs(params)}`);
  },
  addSubAccount(params) {
    return postJson(`/tenant-lms-account-provide/capitalAccount/addSubAccount`,params );
  },
  addLoan(params) {
    return postJson(`/tenant-lms-account-provide/capitalAccountCreditLoan/loan?${qs(params)}`);
  },
  addQuota(params) {
    return postJson(`/tenant-lms-account-provide/capitalAccountQuota/save?${qs(params)}` );
  },
  addPermissions(params) {
    return postJson(`/tenant-lms-account-provide/capitalAccountPermission/permissions`,params );
  },

  getQuotaTableData(params) {
    return postJson(`/tenant-lms-account-provide/capitalAccountQuota/page?${qs(params)}` );
  },
  quotaCheck(params) {
    return put(`/tenant-lms-account-provide/capitalAccountQuota/check?${qs(params)}`);
  },
  quotaDelete(params) {
    return del(`/tenant-lms-account-provide/capitalAccountQuota/delete?${qs(params)}`)
  },
  quotaUpdate(params) {
    return put(`/tenant-lms-account-provide/capitalAccountQuota/update?${qs(params)}`)
  },

  //
  addAccount(params) {
    return postJson(`/tenant-lms-account-provide/capitalAccount/save`,params)
  },
  addAccountBacth(params) {
    return postJson(`/tenant-lms-account-provide/capitalAccount/saveBatch`,params)
  }
}

const statementApi = {
  getTableData(params) {
    // return postJson(`/tenant-lms-account-provide/capitalAccountChange/page?${qs(params)}` );
    return postJson(`/tenant-lms-account-provide/capitalAccountChange/page?${qs(params)}` );
  }
}

const purchaseAapi = {
  getTableData(params) {
    // return postJson(`/tenant-lms-account-provide/capitalAccount/page?${qs(params)}` );
    return postJson(`/tenant-lms-account-provide/capitalAccount/page`,params );
  },
  
  addAcount(params) {
    return postJson(`/tenant-lms-account-provide/capitalAccount/addSubAccount`, params );
  },
  addCredit(params) {
    return postJson(`/tenant-lms-account-provide/capitalAccount/page`, params );
  }
}


export { saleApi, statementApi, purchaseAapi };
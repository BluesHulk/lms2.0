import { get, put, patch, postJson, delJson, post, qs } from '../http';
import { getParams } from '@/utils/index'
const creditApi = {
  // 授信列表
  capitalAccountCreditpage(params) {
    return postJson(`/tenant-lms-account-provide/capitalAccountCredit/page?${qs(params)}`);
  },
  //授信详情
  capitalAccountCreditdetail(params) {
    return get(`/tenant-lms-account-provide/capitalAccountCredit/detail?${qs(params)}`)
  },
  // 账户授信额度申请-分页查询
  capitalAccountCreditQuotapage(params) {
    return postJson(`/tenant-lms-account-provide/capitalAccountCreditQuota/page?${qs(params)}`);
  },
  //账户授信额度申请-新增记录
  creditQuotasave(params) {
    return postJson(`/tenant-lms-account-provide/capitalAccountCreditQuota/save?${qs(params)}`);
  },
  // 账户授信额度申请-编辑记录
  creditQuotaupdate(params) {
    return put(`/tenant-lms-account-provide/capitalAccountCreditQuota/update?${qs(params)}`);
  },
  // 账户授信额度申请-删除记录
  creditQuotadelete(params) {
    return delJson(`/tenant-lms-account-provide/capitalAccountCreditQuota/delete?${qs(params)}`);
  },
  // 账户授信额度申请-审核
  creditQuotacheck(params) {
    return put(`/tenant-lms-account-provide/capitalAccountCreditQuota/check?${qs(params)}`);
  },
  // 账户授信额度申请-取消审核
  creditQuotacancelCheck(params) {
    return put(`/tenant-lms-account-provide/capitalAccountCreditQuota/cancelCheck?${qs(params)}`);
  },

  // 信用借款记录-分页查询
  creditLoanpage(params) {
    return postJson(`/tenant-lms-account-provide/capitalAccountCreditLoan/page?${qs(params)}`);
  },
  //信用借款记录-信用还款
  creditLoanrepay(params) {
    return postJson(`/tenant-lms-account-provide/capitalAccountCreditLoan/repay?${qs(params)}`);
  },
  //信用借款记录-信用借款
  creditLoanloan(params) {
    return postJson(`/tenant-lms-account-provide/capitalAccountCreditLoan/loan?${qs(params)}`);
  },
}



export { creditApi };
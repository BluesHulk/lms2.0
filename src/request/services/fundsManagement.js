import { get, put, postJson, delJson, qs } from '../http';

const receiptVoucherApi = {
  getTableData(params) {
    return postJson(`/tenant-lms-account-provide/capitalReceipt/page?${qs(params)}`);
  },
  getDetail(id) {
    return get('/tenant-lms-account-provide/capitalReceipt/detail', { id })
  },
  onAdd(params) {
    return postJson('/tenant-lms-account-provide/capitalReceipt/save', params);
  },
  onEdit(params) {
    return postJson('/tenant-lms-account-provide/capitalReceipt/update', params);
  },
  onDelete(id) {
    return delJson(`/tenant-lms-account-provide/capitalReceipt/delete?id=${id}`);
  },
  onAudit(id) {
    return put(`/tenant-lms-account-provide/capitalReceipt/check?id=${id}`);
  },
  onCancelAudit(id) {
    return put(`/tenant-lms-account-provide/capitalReceipt/cancelCheck?id=${id}`);
  }
}

const singleReceivableApi = {
  getTableData(params) {
    return postJson(`/tenant-lms-account-provide/capitalReceivable/page?${qs(params)}`);
  },
  getDetail(id) {
    return get('/tenant-lms-account-provide/capitalReceivable/detail', { id })
  },
  onDelete(id) {
    return delJson(`/tenant-lms-account-provide/capitalReceivable/delete?id=${id}`);
  },
  onAudit(id) {
    return put(`/tenant-lms-account-provide/capitalReceivable/check?id=${id}`);
  },
  onCancelAudit(id) {
    return put(`/tenant-lms-account-provide/capitalReceivable/cancelCheck?id=${id}`);
  },
  getDetailTableData(params) {
    return get('/tenant-lms-account-provide/capitalReceiptRecord/page', params);
  },
  onVerify(params) {
    return put(`/tenant-lms-account-provide/capitalReceivableRecord/verify?${qs(params)}`);
  },
  onCancelVerify(id) {
    return put(`/tenant-lms-account-provide/capitalReceivableRecord/cancelVerify?id=${id}`);
  },
}

const paymentOrderApi = {
  getTableData(params) {
    return postJson(`/tenant-lms-account-provide/capitalPayment/page?${qs(params)}`);
  },
  getDetail(id) {
    return get('/tenant-lms-account-provide/capitalPayment/detail', { id })
  },
  onAdd(params) {
    return postJson('/tenant-lms-account-provide/capitalPayment/save', params);
  },
  onEdit(params) {
    return postJson('/tenant-lms-account-provide/capitalPayment/update', params);
  },
  onDelete(id) {
    return delJson(`/tenant-lms-account-provide/capitalPayment/delete?id=${id}`);
  },
  onAudit(id) {
    return put(`/tenant-lms-account-provide/capitalPayment/check?id=${id}`);
  },
  onCancelAudit(id) {
    return put(`/tenant-lms-account-provide/capitalPayment/cancelCheck?id=${id}`);
  }
}

const billsPayableApi = {
  getTableData(params) {
    return postJson(`/tenant-lms-account-provide/capitalPayable/page?${qs(params)}`);
  },
  getDetail(id) {
    return get('/tenant-lms-account-provide/capitalPayable/detail', { id })
  },
  onDelete(id) {
    return delJson(`/tenant-lms-account-provide/capitalPayable/delete?id=${id}`);
  },
  onAudit(id) {
    return put(`/tenant-lms-account-provide/capitalPayable/check?id=${id}`);
  },
  onCancelAudit(id) {
    return put(`/tenant-lms-account-provide/capitalPayable/cancelCheck?id=${id}`);
  },
  getDetailTableData(params) {
    return get('/tenant-lms-account-provide/capitalPaymentRecord/page', params);
  },
  onVerify(params) {
    return put(`/tenant-lms-account-provide/capitalPayableRecord/verify?${qs(params)}`);
  },
  onCancelVerify(id) {
    return put(`/tenant-lms-account-provide/capitalPayableRecord/cancelVerify?id=${id}`);
  },
}


export { receiptVoucherApi, singleReceivableApi, paymentOrderApi, billsPayableApi };
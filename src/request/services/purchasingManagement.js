import { get, put, postJson, delJson, qs, patch } from '../http';

const purchaseOrderApi = {
  getTableData(params) {
    return get('/tenant-lms-purchase-provide/lms/business/purchase/order/page', params);
  },
  getMaterialTableData(params) {
    return get('/tenant-lms-purchase-provide/lms/business/purchase/order/getOrderProductList', params);
  },
  getDetail(id) {
    return get(`/tenant-lms-purchase-provide/lms/business/purchase/order/detail?id=${id}`);
  },
  onAdd(params) {
    return postJson('/tenant-lms-purchase-provide/lms/business/purchase/order/self-save', params);
  },
  onRevise(params) {
    return put('/tenant-lms-purchase-provide/lms/business/purchase/order/revise', params);
  },
  orderOpen(params) {
    return put('/tenant-lms-purchase-provide/lms/business/purchase/order/orderOpen', params);
  },
  orderClose(id) {
    return put(`/tenant-lms-purchase-provide/lms/business/purchase/order/orderClose?id=${id}`);
  },
  orderSubmit(params) {
    return put('/tenant-lms-purchase-provide/lms/business/purchase/order/orderSubmit', params);
  },
  orderSuspend(params) {
    return put('/tenant-lms-purchase-provide/lms/business/purchase/order/orderSuspend', params);
  },
  orderWithdraw(params) {
    return put('/tenant-lms-purchase-provide/lms/business/purchase/order/orderWithdraw', params);
  },
  onSendCar(params) {
    return postJson('/tenant-lms-purchase-provide/lms/business/purchase/order/dispatch', params);
  },
  onDelete(ids) {
    return patch('/tenant-lms-purchase-provide/lms/business/purchase/order/delete', ids);
  },
  getOperatingRecordData(params) {
    return get('/tenant-lms-purchase-provide/lms/business/sales/record/listByOrderId', params);
  },

  getAddress(params) {
    return get('/tenant-lms-basic-provide/lms/basic/address/getAddress',params)
  }
};

const purchaseOrderReceivedApi = {
  getTableData(params) {
    return get('/tenant-lms-purchase-provide/lms/business/purchase/dporder/page', params);
  },
  getDetail(id) {
    return get(`/tenant-lms-purchase-provide/lms/business/purchase/dporder/detail?id=${id}`);
  }
}

export { purchaseOrderApi, purchaseOrderReceivedApi };
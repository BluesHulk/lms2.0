import { get, put, post, patch, postJson, del, qs} from '../http';

const saleOrderApi = {
  getTableData(params) {
    return get(`/tenant-lms-sales-provide/lms/business/sales/order/page`, params );
  },
  getDetail(params) {
    return get(`/tenant-lms-sales-provide/lms/business/sales/order/detail`, params)
  },
  addItemSelf(params) {
    return postJson(`/tenant-lms-sales-provide/lms/business/sales/order/self-save`, params)
  },
  addItemPrice(params) {
    return postJson(`/tenant-lms-sales-provide/lms/business/sales/order/price-save`, params)
  },
 
  orderClose(params) {
    return put(`/tenant-lms-sales-provide/lms/business/sales/order/orderClose?${qs(params)}`)
  },
  orderOpen(params) {
    return put(`/tenant-lms-sales-provide/lms/business/sales/order/orderOpen`,params)
  },
  orderSubmit(params) {
    return put(`/tenant-lms-sales-provide/lms/business/sales/order/orderSubmit`,params)
  },
  orderSuspend(params) {
    return put(`/tenant-lms-sales-provide/lms/business/sales/order/orderSuspend`,params)
  },
  orderWithdraw(params) {
    return put(`/tenant-lms-sales-provide/lms/business/sales/order/orderWithdraw`,params)
  },
  orderSubmit(params) {
    return put(`/tenant-lms-sales-provide/lms/business/sales/order/orderSubmit`,params)
  },
  orderDelete(params) {
    return patch(`/tenant-lms-sales-provide/lms/business/sales/order/delete`,params)
  },
  orderRevise(params) {
    return put(`/tenant-lms-sales-provide/lms/business/sales/order/revise`,params)
  },
  orderDispatch(params) {
    return postJson(`/tenant-lms-sales-provide/lms/business/sales/order/dispatch`,params)
  },

  //获取订单物料子表列表
  getMaterialTableData(params) {
    return get('/tenant-lms-sales-provide/lms/business/sales/order/getOrderProductList', params);
  },


  //选项
  getOrderProductList(params) {
    return get(`/tenant-lms-sales-provide/lms/business/sales/order/getOrderProductList`, params)
  },
  getAccountList(params) {
    // return postJson(`/tenant-lms-account-provide/capitalAccount/list?${qs(params)}`)
    return postJson(`/tenant-lms-account-provide/capitalAccount/accountList?${qs(params)}`)
  },
  getReceiptOrderList(params) {
    return get('/tenant-lms-account-provide/capitalReceiptRecord/page',params)
  },
  getAddress(params) {
    return get('/tenant-lms-basic-provide/lms/basic/address/getAddress',params)
  },

  getCustomerPrice(params) {
    return get(`/tenant-lms-price-provide/priceListCustomer/page`, params)
  },

  //记录
  getRecordById(params) {
    return get(`/tenant-lms-sales-provide/lms/business/sales/record/listByOrderId`, params)
  }
}

const saleInvoiceApi = {
  getTableData(params) {
    return get(`/tenant-lms-sales-provide/lms/business/sales/dporder/page`, params );
  },
}




export { saleOrderApi, saleInvoiceApi };
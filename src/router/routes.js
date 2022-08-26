import Layout from '@/layout/index.vue';

// 默认的路由
let routes = [
  {
    path: '/app',
    name: 'app',
    component: Layout,
    children: [
      {
        path: '/error',
        name: 'error',
        component: () => import('@/layout/Error.vue')
      }
    ]
  },
  // {
  //   path: '/login',
  //   name: 'Login',
  //   component: () => import('@/views/Login.vue')
  // },
  {
    path: '/',
    redirect: '/app',
  }
]

// 菜单路由
let layoutRoutes = [
  {
    path: '/priceMangement',
    name: 'priceMangement',
    component: Layout,
    meta: { title: '价格管理', icon: 'icon-xuanzhong1', type: 'fold' },
    children: [
      {
        path: '/priceSetting',
        name: 'priceSetting',
        component: () => import('@/views/priceManagement/priceSetting/index.vue'),
        meta: { title: '价格设置' },
      },
      {
        path: '/priceSetting/listPriceInfo',
        name: 'listPriceInfo',
        meta: {
          title: '销售价格表',
          active: '/priceSetting'
        },
        component: () => import('@/views/priceManagement/priceSetting/listPrice/info.vue'),
      },
      {
        path: '/priceSetting/listPriceAdd',
        name: 'listPriceAdd',
        meta: {
          title: '销售价格表',
          active: '/priceSetting'
        },
        component: () => import('@/views/priceManagement/priceSetting/listPrice/add.vue'),
      },
      {
        path: '/priceSetting/dealPriceInfo',
        name: 'dealPriceInfo',
        meta: {
          title: '销售价格表',
          active: '/priceSetting'
        },
        component: () => import('@/views/priceManagement/priceSetting/dealPrice/info.vue'),
      },
      {
        path: '/priceSetting/dealPriceAdd',
        name: 'dealPriceAdd',
        meta: {
          title: '销售价格表',
          active: '/priceSetting'
        },
        component: () => import('@/views/priceManagement/priceSetting/dealPrice/add.vue'),
      },
      {
        path: '/dadjapManagement',
        name: 'dadjapManagement',
        component: () => import('@/views/priceManagement/dadjapManagement/index.vue'),
        meta: { title: '调价单管理' },
      },
      {
        path: '/dadjapManagement/dadjapInfo',
        name: 'dadjapInfo',
        meta: {
          title: '调价单详情',
          active: '/dadjapManagement'
        },
        component: () => import('@/views/priceManagement/dadjapManagement/info.vue'),
      },
      {
        path: '/dadjapManagement/dadjapAdd',
        name: 'dadjapAdd',
        meta: {
          title: '调价单申请',
          active: '/dadjapManagement'
        },
        component: () => import('@/views/priceManagement/dadjapManagement/add.vue'),
      },
      {
        path: '/customerPriceList',
        name: 'customerPriceList',
        component: () => import('@/views/priceManagement/customerPriceList/index.vue'),
        meta: { title: '客户价格单' },
      },
    ]
  },
  {
    path: '/saleAccountMgt',
    name: 'saleAccountMgt',
    component: Layout,
    meta: { title: '销售账户', icon: 'icon-xuanzhong1', type: 'fold' },
    children: [
      {
        path: '/saleAccount',
        name: 'saleAccount',
        component: () => import('@/views/accountMangement/sale/index.vue'),
        meta: { title: '客户账户' },
      },
      {
        path: '/saleDetail',
        name: 'saleDetail',
        component: () => import('@/views/accountMangement/sale/detail/index.vue'),
        meta: { title: '账户详情',active:'/saleAccount' },
      },
      {
        path: '/saleStatement',
        name: 'saleStatement',
        component: () => import('@/views/accountMangement/statement/saleStatement.vue'),
        meta: { title: '账户流水' },
      },
      {
        path: '/saleCreditGranting',
        name: 'saleCreditGranting',
        component: () => import('@/views/creditGrantingMangnement/creditGrantingSale/index.vue'),
        meta: { title: '客户授信' },
      },
      {
        path: '/saleApprovalTranche',
        name: 'saleApprovalTranche',
        component: () => import('@/views/creditGrantingMangnement/approvalTrancheSale/index.vue'),
        meta: { title: '额度审批' },
      },
      {
        path: '/saleCreditRecords',
        name: 'saleCreditRecords',
        component: () => import('@/views/creditGrantingMangnement/creditRecordsSale/index.vue'),
        meta: { title: '信用借款记录' },
      },
    ]
  },
  {
    path: '/purchaseAccountMgt',
    name: 'purchaseAccountMgt',
    component: Layout,
    meta: { title: '采购账户', icon: 'icon-xuanzhong1', type: 'fold' },
    children: [
      {
        path: '/purchaseAccount',
        name: 'purchaseAccount',
        component: () => import('@/views/accountMangement/purchase/index.vue'),
        meta: { title: '采购账户' },
      },
      {
        path: '/purchaseDetail',
        name: 'purchaseDetail',
        component: () => import('@/views/accountMangement/purchase/detail/index.vue'),
        meta: { title: '采购账户详情',active:'/purchaseAccount' },
      },
      {
        path: '/purchaseApproval',
        name: 'purchaseApproval',
        component: () => import('@/views/accountMangement/purchase/approval.vue'),
        meta: { title: '调额审批' },
      },
      {
        path: '/purchaseStatement',
        name: 'purchaseStatement',
        component: () => import('@/views/accountMangement/statement/index.vue'),
        meta: { title: '账户流水' },
      },
      {
        path: '/purchaseCreditGranting',
        name: 'purchaseCreditGranting',
        component: () => import('@/views/creditGrantingMangnement/creditGranting/index.vue'),
        meta: { title: '授信列表' },
      },
      {
        path: '/purchaseCreditRecords',
        name: 'purchaseCreditRecords',
        component: () => import('@/views/creditGrantingMangnement/creditRecords/index.vue'),
        meta: { title: '信用借款记录' },
      },
    ]
  },
  // {
  //   path: '/accountMangement',
  //   name: 'accountMangement',
  //   component: Layout,
  //   meta: { title: '账户管理', icon: 'icon-xuanzhong1', type: 'fold' },
  //   children: [
  //     {
  //       path: '/sale',
  //       name: 'sale',
  //       component: () => import('@/views/accountMangement/sale/index.vue'),
  //       meta: { title: '销售账户' },
  //     },
  //     {
  //       path: '/saleDetail',
  //       name: 'saleDetail',
  //       component: () => import('@/views/accountMangement/sale/detail/index.vue'),
  //       meta: { title: '账户详情' },
  //     },
  //     {
  //       path: '/purchase',
  //       name: 'purchase',
  //       component: () => import('@/views/accountMangement/purchase/index.vue'),
  //       meta: { title: '采购账户' },
  //     },
  //     {
  //       path: '/purchaseDetail',
  //       name: 'purchaseDetail',
  //       component: () => import('@/views/accountMangement/purchase/detail/index.vue'),
  //       meta: { title: '采购账户详情' },
  //     },
  //     {
  //       path: '/statement',
  //       name: 'statement',
  //       component: () => import('@/views/accountMangement/statement/index.vue'),
  //       meta: { title: '账户流水' },
  //     },
  //   ]
  // },
  {
    path: '/creditGrantingMangnement',
    name: 'creditGrantingMangnement',
    component: Layout,
    meta: { title: '授信管理', icon: 'icon-xuanzhong1', type: 'fold' },
    children: [
      {
        path: '/creditGranting',
        name: 'creditGranting',
        component: () => import('@/views/creditGrantingMangnement/creditGranting/index.vue'),
        meta: { title: '授信列表' },
      },
      {
        path: '/approvalTranche',
        name: 'approvalTranche',
        component: () => import('@/views/creditGrantingMangnement/approvalTranche/index.vue'),
        meta: { title: '额度审批' },
      },
      {
        path: '/creditRecords',
        name: 'creditRecords',
        component: () => import('@/views/creditGrantingMangnement/creditRecords/index.vue'),
        meta: { title: '信用借款记录' },
      },
    ]
  },
  {
    path: '/settlementMangement',
    name: 'settlementMangement',
    component: Layout,
    meta: { title: '结算管理', icon: 'icon-xuanzhong1', type: 'fold' },
    children: [
      {
        path: '/accountStatement',
        name: 'accountStatement',
        component: () => import('@/views/settlementMangement/accountStatement/index.vue'),
        meta: { title: '对账单' },
      },
      {
        path: '/accountStatementEdit',
        name: 'accountStatementEdit',
        component: () => import('@/views/settlementMangement/accountStatement/Edit.vue'),
        meta: { title: '对账单编辑', active:'/accountStatement' },
      },
      {
        path: '/accountStatementDetail',
        name: 'accountStatementDetail',
        component: () => import('@/views/settlementMangement/accountStatement/Detail.vue'),
        meta: { title: '对账单详情', active:'/accountStatement' },
      },
    ]
  },
  {
    path: '/fundsManagement',
    name: 'fundsManagement',
    component: Layout,
    meta: { title: '资金管理', icon: 'icon-xuanzhong1', type: 'fold' },
    children: [
      {
        path: '/receiptVoucher',
        name: 'receiptVoucher',
        component: () => import('@/views/fundsManagement/receiptVoucher/index.vue'),
        meta: { title: '收款单' },
      },
      {
        path: '/receiptVoucherEdit',
        name: 'receiptVoucherEdit',
        component: () => import('@/views/fundsManagement/receiptVoucher/Edit.vue'),
        meta: { title: '新增收款单', active: '/receiptVoucher' },
      },
      {
        path: '/receiptVoucherDetail',
        name: 'receiptVoucherDetail',
        component: () => import('@/views/fundsManagement/receiptVoucher/Detail.vue'),
        meta: { title: '收款单详情', active: '/receiptVoucher' },
      },
      {
        path: '/singleReceivable',
        name: 'singleReceivable',
        component: () => import('@/views/fundsManagement/singleReceivable/index.vue'),
        meta: { title: '应收单' },
      },
      {
        path: '/singleReceivableDetail',
        name: 'singleReceivableDetail',
        component: () => import('@/views/fundsManagement/singleReceivable/Detail.vue'),
        meta: { title: '应收单详情', active: '/singleReceivable' },
      },
      {
        path: '/paymentOrder',
        name: 'paymentOrder',
        component: () => import('@/views/fundsManagement/paymentOrder/index.vue'),
        meta: { title: '付款单' },
      },
      {
        path: '/paymentOrderEdit',
        name: 'paymentOrderEdit',
        component: () => import('@/views/fundsManagement/paymentOrder/Edit.vue'),
        meta: { title: '新增付款单', active: '/paymentOrder' },
      },
      {
        path: '/paymentOrderDetail',
        name: 'paymentOrderDetail',
        component: () => import('@/views/fundsManagement/paymentOrder/Detail.vue'),
        meta: { title: '付款单详情', active: '/paymentOrder' },
      },
      {
        path: '/billsPayable',
        name: 'billsPayable',
        component: () => import('@/views/fundsManagement/billsPayable/index.vue'),
        meta: { title: '应付单' },
      },
      {
        path: '/billsPayableDetail',
        name: 'billsPayableDetail',
        component: () => import('@/views/fundsManagement/billsPayable/Detail.vue'),
        meta: { title: '应付单详情', active: '/billsPayable' },
      },
    ]
  },
  {
    path: '/measure',
    name: 'measure',
    component: Layout,
    meta: { title: '计量管理', icon: 'icon-xuanzhong1', type: 'fold' },
    children: [
      {
        path: '/weighpound',
        name: 'weighpound',
        component: () => import('@/views/measure/weighpound/index.vue'),
        meta: { title: '计量磅单' },
      },
      {
        path: '/makeByHand',
        name: 'makeByHand',
        component: () => import('@/views/measure/makeByHand/index.vue'),
        meta: { title: '手工制单' },
      },
      // {
      //   path: '/shortDownMeasure',
      //   name: 'shortDownMeasure',
      //   component: () => import('@/views/measure/shortDownMeasure/Detail.vue'),
      //   meta: { title: '短倒计量' },
      // },
      {
        path: '/ladderError',
        name: 'ladderError',
        component: () => import('@/views/measure/ladderError/index.vue'),
        meta: { title: '阶梯误差' },
      },
      {
        path: '/tareVehicle',
        name: 'tareVehicle',
        component: () => import('@/views/measure/tareVehicle/index.vue'),
        meta: { title: '车辆皮重' },
      },
      {
        path: '/paramConfig',
        name: 'paramConfig',
        component: () => import('@/views/measure/paramConfig/index.vue'),
        meta: { title: '参数配置' },
      },
      {
        path: '/cardManage',
        name: 'cardManage',
        component: () => import('@/views/measure/cardManage/index.vue'),
        meta: { title: '磁卡管理' },
      },
      {
        path: '/flowManagement',
        name: 'flowManagement',
        component: () => import('@/views/measure/flowManagement/index.vue'),
        meta: { title: '流程管理' },
      },
    ]
  },
  {
    path: '/examinationRoom',
    name: 'examinationRoom',
    component: Layout,
    meta: { title: '中化室', icon: 'icon-xuanzhong1', type: 'fold' },
    children: [
      {
        path: '/examinationRoomSetting',
        name: 'examinationRoomSetting',
        component: () => import('@/views/examinationRoom/examinationRoomSetting/index.vue'),
        meta: { title: '中化室设置' },
      },
      {
        path: '/materialBatchRecord',
        name: 'materialBatchRecord',
        component: () => import('@/views/examinationRoom/materialBatchRecord/index.vue'),
        meta: { title: '物料批次记录' },
      },
      {
        path: '/materialBatchManagement',
        name: 'materialBatchManagement',
        component: () => import('@/views/examinationRoom/materialBatchManagement/index.vue'),
        meta: { title: '物料批次管理' },
      },
      {
        path: '/testRecordManagement',
        name: 'testRecordManagement',
        component: () => import('@/views/examinationRoom/testRecordManagement/index.vue'),
        meta: { title: '检验记录管理' },
      },
      {
        path: '/qualityInspectionReport',
        name: 'qualityInspectionReport',
        component: () => import('@/views/examinationRoom/qualityInspectionReport/index.vue'),
        meta: { title: '质检报告单' },
      },
      {
        path: '/batchReceipt',
        name: 'batchReceipt',
        component: () => import('@/views/examinationRoom/batchReceipt/index.vue'),
        meta: { title: '批次回单' },
      },
    ]
  },
  {
    path: '/factoryLine',
    name: 'factoryLine',
    component: Layout,
    meta: { title: '厂内排队', icon: 'icon-xuanzhong1', type: 'fold' },
    children: [
      {
        path: '/lineUpList',
        name: 'lineUpList',
        component: () => import('@/views/factoryLine/lineUpList/index.vue'),
        meta: { title: '排队列表' },
      },
      {
        path: '/warningConfiguration',
        name: 'warningConfiguration',
        component: () => import('@/views/factoryLine/warningConfiguration/index.vue'),
        meta: { title: '预警配置' },
      },
    ]
  },
  {
    path: '/logisticsManagement',
    name: 'logisticsManagement',
    component: Layout,
    meta: { title: '物流管理', icon: 'icon-xuanzhong1', type: 'fold' },
    children: [
      {
        path: '/freight',
        name: 'freight',
        component: () => import('@/views/logisticsManagement/freight/index.vue'),
        meta: { title: '运价管理' },
      },
      {
        path: '/waybill',
        name: 'waybill',
        component: () => import('@/views/logisticsManagement/waybill/index.vue'),
        meta: { title: '运单管理' },
      },
      {
        path: '/waybillDetail',
        name: 'waybillDetail',
        component: () => import('@/views/logisticsManagement/waybill/detail/index.vue'),
        meta: { title: '运单详情' },
      },
      // {
      //   path: '/waybillUpdate',
      //   name: 'waybillUpdate',
      //   component: () => import('@/views/logisticsManagement/waybill/update/index.vue'),
      //   meta: { title: '新建运单' },
      // },
    ]
  },
  {
    path: '/saleMgt',
    name: 'saleMgt',
    component: Layout,
    meta: { title: '销售管理', icon: 'icon-xuanzhong1', type: 'fold' },
    children: [
      {
        path: '/saleOrder',
        name: 'saleOrder',
        component: () => import('@/views/saleMgt/order/index.vue'),
        meta: { title: '销售订单' },
      },
      {
        path: '/saleOrderDetail',
        name: 'saleOrderDetail',
        component: () => import('@/views/saleMgt/order/detail/index.vue'),
        meta: { title: '销售订单详情', active: '/saleOrder' },
      },
      {
        path: '/saleOrderEdit',
        name: 'saleOrderEdit',
        component: () => import('@/views/saleMgt/order/edit/index.vue'),
        meta: { title: '销售订单编辑', active: '/saleOrder' },
      },
      {
        path: '/saleOrderRevision',
        name: 'saleOrderRevision',
        component: () => import('@/views/saleMgt/order/revision/index.vue'),
        meta: { title: '销售订单修订', active: '/saleOrder' },
      },
      {
        path: '/saleInvoice',
        name: 'saleInvoice',
        component: () => import('@/views/saleMgt/invoice/index.vue'),
        meta: { title: '销售发货单' },
      },
    ]
  },
  {
    path: '/purchasingManagement',
    name: 'purchasingManagement',
    component: Layout,
    meta: { title: '采购管理', icon: 'icon-xuanzhong1', type: 'fold' },
    children: [
      {
        path: '/purchaseOrder',
        name: 'purchaseOrder',
        component: () => import('@/views/purchasingManagement/purchaseOrder/index.vue'),
        meta: { title: '原材料采购订单' },
      },
      {
        path: '/purchaseOrderEdit',
        name: 'purchaseOrderEdit',
        component: () => import('@/views/purchasingManagement/purchaseOrder/Edit.vue'),
        meta: { title: '新增订单', active: '/purchaseOrder' },
      },
      {
        path: '/purchaseOrderDetail',
        name: 'purchaseOrderDetail',
        component: () => import('@/views/purchasingManagement/purchaseOrder/Detail.vue'),
        meta: { title: '采购订单详情' },
      },
      {
        path: '/purchaseOrderRevision',
        name: 'purchaseOrderRevision',
        component: () => import('@/views/purchasingManagement/purchaseOrder/Revision.vue'),
        meta: { title: '订单修订', active: '/purchaseOrder' },
      },
      {
        path: '/purchaseOrderReceived',
        name: 'purchaseOrderReceived',
        component: () => import('@/views/purchasingManagement/purchaseOrderReceived/index.vue'),
        meta: { title: '采购到货单' },
      },
    ]
  },
  {
    path: '/factoryDispatch',
    name: 'factoryDispatch',
    component: Layout,
    meta: { title: '厂内调度', icon: 'icon-xuanzhong1', type: 'fold' },
    children: [
      {
        path: '/dispatchSetting',
        name: 'dispatchSetting',
        component: () => import('@/views/factoryDispatch/dispatchSetting/index.vue'),
        meta: { title: '调度设置' },
      },
      // {
      //   path: '/millManagement',
      //   name: 'millManagement',
      //   component: () => import('@/views/factoryDispatch/millManagement/index.vue'),
      //   meta: { title: '磨机管理' },
      // },
      // {
      //   path: '/customerLaneSetting',
      //   name: 'customerLaneSetting',
      //   component: () => import('@/views/factoryDispatch/customerLaneSetting/index.vue'),
      //   meta: { title: '客户车道设置' },
      // },
      // {
      //   path: '/groupMaterialSetting',
      //   name: 'groupMaterialSetting',
      //   component: () => import('@/views/factoryDispatch/groupMaterialSetting/index.vue'),
      //   meta: { title: '分组物料设置' },
      // },
      {
        path: '/laneManagement',
        name: 'laneManagement',
        component: () => import('@/views/factoryDispatch/laneManagement/index.vue'),
        meta: { title: '装车道管理' },
      },
      {
        path: '/laneVehicleDispatch',
        name: 'laneVehicleDispatch',
        component: () => import('@/views/factoryDispatch/laneVehicleDispatch/index.vue'),
        meta: { title: '车道车辆调度' },
      },
      {
        path: '/salesVehicleDispatch',
        name: 'salesVehicleDispatch',
        component: () => import('@/views/factoryDispatch/salesVehicleDispatch/index.vue'),
        meta: { title: '销售车辆调度' },
      },
      {
        path: '/reinstallationRecordQuery',
        name: 'reinstallationRecordQuery',
        component: () => import('@/views/factoryDispatch/reinstallationRecordQuery/index.vue'),
        meta: { title: '补装记录查询' },
      },
      {
        path: '/loadingStatistics',
        name: 'loadingStatistics',
        component: () => import('@/views/factoryDispatch/loadingStatistics/index.vue'),
        meta: { title: '装车统计' },
      },
    ]
  },
  {
    path: '/controlMachine',
    name: 'controlMachine',
    component: Layout,
    meta: { title: '中控一体机管理', icon: 'icon-xuanzhong1', type: 'fold' },
    children: [
      {
        path: '/registrationCode',
        name: 'registrationCode',
        component: () => import('@/views/controlMachine/registrationCode/index.vue'),
        meta: { title: '注册码管理' },
      },
      {
        path: '/registrationSettings',
        name: 'registrationSettings',
        component: () => import('@/views/controlMachine/registrationSettings/index.vue'),
        meta: { title: '注册设置' },
      },
      {
        path: '/hardwareManagement',
        name: 'hardwareManagement',
        component: () => import('@/views/controlMachine/hardwareManagement/index.vue'),
        meta: { title: '硬件管理' },
      },
      {
        path: '/hardwareTypeData',
        name: 'hardwareTypeData',
        component: () => import('@/views/controlMachine/hardwareTypeData/index.vue'),
        meta: { title: '硬件类型主数据' },
      },
      {
        path: '/pairingSettings',
        name: 'pairingSettings',
        component: () => import('@/views/controlMachine/pairingSettings/index.vue'),
        meta: { title: '主从配对设置' },
      },
      {
        path: '/greetingSettings',
        name: 'greetingSettings',
        component: () => import('@/views/controlMachine/greetingSettings/index.vue'),
        meta: { title: 'LED问候语设置' },
      },
      {
        path: '/vehicleNumberManagement',
        name: 'vehicleNumberManagement',
        component: () => import('@/views/controlMachine/vehicleNumberManagement/index.vue'),
        meta: { title: '常用车辆号管理' },
      },
      {
        path: '/hostLog',
        name: 'hostLog',
        component: () => import('@/views/controlMachine/hostLog/index.vue'),
        meta: { title: '一体机日志' },
      },
      {
        path: '/terminalManagement',
        name: 'terminalManagement',
        component: () => import('@/views/controlMachine/terminalManagement/index.vue'),
        meta: { title: '终端管理' },
      },
    ]
  },
];

export { routes, layoutRoutes };
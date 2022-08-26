const navData = [
  {
    id: "priceMangement",
    name: "价格管理",
    iconName: "iconfont icon-xuanzhong1",
    children: [
      {
        id: "priceSetting",
        name: "价格设置",
        path: "/priceSetting",
      },
      {
        id: "dadjapManagement",
        name: "调价单管理",
        path: "/dadjapManagement",
      },
      {
        id: "customerPriceList",
        name: "客户价格单",
        path: "/customerPriceList",
      },
    ],
  },
  {
    id: "settlementMangement",
    name: "结算管理",
    iconName: "iconfont icon-xuanzhong1",
    children: [
      {
        id: "accountStatement",
        name: "对账单",
        path: "/accountStatement",
      },
    ]
  },
  {
    id: "saleAccountMgt",
    name: "销售账户",
    iconName: "iconfont icon-xuanzhong1",
    children: [
      {
        id: "saleAccount",
        name: "客户账户",
        path: "/saleAccount",
      },
      {
        id: "saleStatement",
        name: "账户流水",
        path: "/saleStatement",
      },
      {
        id: "saleCreditGranting",
        name: "客户授信",
        path: "/saleCreditGranting",
      },
      {
        id: "saleApprovalTranche",
        name: "额度审批",
        path: "/saleApprovalTranche",
      },
      {
        id: "saleCreditRecords",
        name: "信用借款记录",
        path: "/saleCreditRecords",
      },
    ],
  },
  {
    id: "purchaseAccountMgt",
    name: "采购账户",
    iconName: "iconfont icon-xuanzhong1",
    children: [
      {
        id: "purchaseAccount",
        name: "采购账户",
        path: "/purchaseAccount",
      },
      {
        id: "purchaseApproval",
        name: "调额审批",
        path: "/purchaseApproval",
      },
      {
        id: "purchaseStatement",
        name: "账户流水",
        path: "/purchaseStatement",
      },
      {
        id: "purchaseCreditGranting",
        name: "授信列表",
        path: "/purchaseCreditGranting",
      },
      {
        id: "purchaseCreditRecords",
        name: "信用借款记录",
        path: "/purchaseCreditRecords",
      },
    ],
  },
  // {
  //   id: "accountMangement",
  //   name: "账户管理",
  //   iconName: "iconfont icon-xuanzhong1",
  //   children: [
  //     {
  //       id: "sale",
  //       name: "销售账户",
  //       path: "/sale",
  //     },
  //     {
  //       id: "purchase",
  //       name: "采购账户",
  //       path: "/purchase",
  //     },
  //     {
  //       id: "statement",
  //       name: "账户流水",
  //       path: "/statement",
  //     },
  //   ],
  // },
  // {
  //   id: "creditGrantingMangnement",
  //   name: "授信管理",
  //   iconName: "iconfont icon-xuanzhong1",
  //   children: [
  //     {
  //       id: "creditGranting",
  //       name: "授信列表",
  //       path: "/creditGranting",
  //     },
  //     {
  //       id: "papprovalTranche",
  //       name: "额度审批",
  //       path: "/approvalTranche",
  //     },
  //     {
  //       id: "creditRecords",
  //       name: "信用借款记录",
  //       path: "/creditRecords",
  //     },
  //   ],
  // },
  {
    id: "fundsManagement",
    name: "资金管理",
    iconName: "iconfont icon-xuanzhong",
    children: [
      {
        id: "receiptVoucher",
        name: "收款单",
        path: "/receiptVoucher",
      },
      {
        id: "singleReceivable",
        name: "应收单",
        path: "/singleReceivable",
      },
      {
        id: "paymentOrder",
        name: "付款单",
        path: "/paymentOrder",
      },
      {
        id: "billsPayable",
        name: "应付单",
        path: "/billsPayable",
      }
    ]
  },
  {
    id: 'measure',
    iconName: "iconfont icon-xuanzhong",
    name: '计量管理',
    children: [
      {
        id: 'weighpound',
        name: '计量磅单',
        path: '/weighpound',
      },
      // {
      //   id: 'makeByHand',
      //   path: '/makeByHand',
      //   name: '手工制单',
      // },
      // {
      //   id: 'shortDownMeasure',
      //   path: '/shortDownMeasure',
      //   name: '短倒计量',
      // },
      {
        path: '/ladderError',
        id: 'ladderError',
        name: '阶梯误差',
      },
      {
        path: '/tareVehicle',
        id: 'tareVehicle',
        name: '车辆皮重',
      },
      {
        path: '/paramConfig',
        id: 'paramConfig',
        name: '参数配置',
      },
      {
        path: '/cardManage',
        id: 'cardManage',
        name: '磁卡管理',
      },
      {
        path: '/flowManagement',
        id: 'flowManagement',
        name: '流程管理',
      },
    ]
  },
  {
    id: 'examinationRoom',
    iconName: "iconfont icon-xuanzhong",
    name: '中化室',
    children: [
      {
        id: 'examinationRoomSetting',
        name: '中化室设置',
        path: '/examinationRoomSetting',
      },
      {
        id: 'materialBatchRecord',
        path: '/materialBatchRecord',
        name: '物料批次记录',
      },
      {
        id: 'materialBatchManagement',
        path: '/materialBatchManagement',
        name: '物料批次管理',
      },
      {
        id: 'testRecordManagement',
        path: '/testRecordManagement',
        name: '检验记录管理',
      },
      {
        id: 'qualityInspectionReport',
        path: '/qualityInspectionReport',
        name: '质检报告单',
      },
      {
        id: 'batchReceipt',
        path: '/batchReceipt',
        name: '批次回单',
      },
    ]
  },
  // {
  //   id: "factoryLine",
  //   name: "厂内排队",
  //   iconName: "iconfont icon-xuanzhong1",
  //   children: [
  //     {
  //       id: "lineUpList",
  //       name: "排队列表",
  //       path: "/lineUpList",
  //     },
  //     {
  //       id: "warningConfiguration",
  //       name: "预警配置",
  //       path: "/warningConfiguration",
  //     },
  //   ]
  // },
  // {
  //   id: "logisticsManagement",
  //   name: "物流管理",
  //   iconName: "iconfont icon-xuanzhong1",
  //   children: [
  //     {
  //       id: "freight",
  //       name: "运价管理",
  //       path: "/freight",
  //     },
  //     {
  //       id: "waybill",
  //       name: "运单管理",
  //       path: "/waybill",
  //     },
  //   ]
  // },
  {
    id: "saleMgt",
    name: "销售管理",
    iconName: "iconfont icon-xuanzhong1",
    children: [
      {
        id: "saleOrder",
        name: "销售订单",
        path: "/saleOrder",
      },
      {
        id: "saleInvoice",
        name: "销售发货单",
        path: "/saleInvoice",
      },
    ]
  },
  {
    id: "purchasingManagement",
    name: "采购管理",
    iconName: "iconfont icon-xuanzhong1",
    children: [
      {
        id: "purchaseOrder",
        name: "原材料采购订单",
        path: "/purchaseOrder",
      },
      {
        id: "purchaseOrderReceived",
        name: "采购到货单",
        path: "/purchaseOrderReceived",
      },
    ]
  },
  {
    id: "factoryDispatch",
    name: "厂内调度",
    iconName: "iconfont icon-xuanzhong1",
    children: [
      {
        id: "dispatchSetting",
        name: "调度设置",
        path: "/dispatchSetting",
      },
      {
        id: "laneManagement",
        name: "装车道管理",
        path: "/laneManagement",
      },
      {
        id: "laneVehicleDispatch",
        name: "车道车辆调度",
        path: "/laneVehicleDispatch",
      },
      {
        id: "salesVehicleDispatch",
        name: "销售车辆调度",
        path: "/salesVehicleDispatch",
      },
      {
        id: "reinstallationRecordQuery",
        name: "补装记录查询",
        path: "/reinstallationRecordQuery",
      },
      {
        id: "loadingStatistics",
        name: "装车统计",
        path: "/loadingStatistics",
      },
    ]
  },
  {
    id: "controlMachine",
    name: "中控一体机管理",
    iconName: "iconfont icon-xuanzhong1",
    children: [
      {
        id: "registrationCode",
        name: "注册码管理",
        path: "/registrationCode",
      },
      {
        id: "registrationSettings",
        name: "注册设置",
        path: "/registrationSettings",
      },
      {
        id: "hardwareManagement",
        name: "硬件管理",
        path: "/hardwareManagement",
      },
      {
        id: "hardwareTypeData",
        name: "硬件类型主数据",
        path: "/hardwareTypeData",
      },
      {
        id: "pairingSettings",
        name: "主从配对设置",
        path: "/pairingSettings",
      },
      {
        id: "greetingSettings",
        name: "LED问候语设置",
        path: "/greetingSettings",
      },
      {
        id: "vehicleNumberManagement",
        name: "常用车辆号管理",
        path: "/vehicleNumberManagement",
      },
      {
        id: "hostLog",
        name: "一体机日志",
        path: "/hostLog",
      },
      {
        id: "terminalManagement",
        name: "终端管理",
        path: "/terminalManagement",
      },
    ]
  },
];

export default navData;
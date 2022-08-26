let isLocalhost = false;
if (window.location.hostname == 'localhost') {
  isLocalhost = true;
}

let isDevelop = false;
if (window.location.hostname == '192.168.17.221' || window.location.hostname == '192.168.19.35') {
  isDevelop = true;
}

export default {
  isLocalhost,
  isDevelop,
  rules: ({ type, maxLength = 30, trigger = 'blur', message }) => {
    const rules = {
      required: {
        required: true,
        message: message || '不能为空',
        trigger
      },
      maxLength: {
        max: maxLength,
        message: message || `最多输入${maxLength}个字符`,
        trigger
      },
      phone: {
        pattern: /^[1][3,4,5,6,7,8,9][0-9]{9}$/,
        message: "请输入正确格式的手机号",
        trigger
      },
      intrger: {
        pattern: /^-?[1-9]\d*$/,
        message: "请输入整数",
        trigger
      },
      integer1: {
        pattern: /^[0-9]\d*$/,
        message: message || '请填写非负整数',
        trigger
      },
      positiveInteger: {
        pattern: /^[1-9]\d*$/,
        message: "请输入正整数",
        trigger
      },
      long: {
        pattern: /^(-?\d+)(\.\d+)?$/,
        message: '请填写正确的数值',
        trigger
      },
      long2: {
        pattern: /(^[1-9]\d*(\.\d{1,2})?$)|(^0(\.\d{1,2})?$)/,
        message: '保留两位小数',
      },
      price: {
        pattern: /(^[1-9]\d*(\.\d{1,2})?$)|(^0(\.\d{1,2})?$)/,
        message: '请输入正确的金额',

      },
      space: {
        pattern: /^\S*$/,
        message: '请勿输入空格',
        trigger
      },
      link: {
        pattern: /^(http|https):\/\/([\w.]+\/?)\S*/,
        message: '请输入正确的地址',
        trigger
      },
      idCard: {
        pattern: /^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/,
        message: '请输入正确身份证',
        trigger
      },
      licenseNumber: {
        pattern: /^([京津沪渝冀豫云辽⿊湘皖鲁新苏浙赣鄂桂⽢晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[a-zA-Z](([DF]((?![IO])[a-zA-Z0-9](?![IO]))[0-9]{4})|([0-9]{5}[DF]))|[京津沪渝冀豫云辽⿊湘皖鲁新苏浙赣鄂桂⽢晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z]{1}[A-Z0-9]{4}[A-Z0-9挂学警港澳]{1})$/,
        message: '请输入正确车牌号',
        trigger
      }
    };

    return rules[type];
  }
}

// 文件下载
export const fileDownTable = function(name, data) {
  const fileName = name
  const blob = new Blob([data], { type: 'application/vnd.ms-excel' })
  // let blob = new Blob([data], { type: 'application/x-7z-compressed' })
  if (window.navigator.msSaveOrOpenBlob) {
    navigator.msSaveBlob(blob) // 本地保存
  } else {
    const link = document.createElement('a') // a标签下载
    link.href = window.URL.createObjectURL(blob)
    link.download = fileName
    link.click()
    window.URL.revokeObjectURL(link.href)
  }
}

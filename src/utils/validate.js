/**
 * @description 判断是否为正整数
 * @param value
 * @returns {boolean}
 */
 export function positiveInteger(value) {
  const reg = /^[1-9]\d*$/
  return reg.test(value)
}
let config={};

// 使用webpack的require.context()遍历所有serve文件
// const files = require.context('./services/', true, /\.js$/);

// files.keys().forEach((key) => {
//   let keyName=key.match(/(?<=\.\/).*(?=\.js)/);
//   //文件名作为对象的key
//   config[keyName] = files(key).default;
// });

export default config
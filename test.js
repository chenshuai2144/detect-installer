const test = require('./dist/index');
const path = require('path');

const packages = [
  { npm: ['npm'] },
  { cnpm: ['tnpm', 'cnpm', 'pnpm'] },
  { tyarn: ['tyarn', 'yarn'] },
  { yarn: ['tyarn', 'yarn'] },
  { tnpm: ['tnpm', 'cnpm', 'pnpm'] },
];

const equalArray = (list, list2) => {
  return list.every(value => list2.includes(value));
};

packages.map(package => {
  const key = Object.keys(package)[0];
  const file = path.join(__dirname, 'example', key);
  const packageList = test(file);
  console.log('路径：' + file);
  console.log('可使用的包：' + packageList);
  if (!equalArray(package[key], packageList)) {
    throw new Error(`${key} 测试不通过`);
  }
});

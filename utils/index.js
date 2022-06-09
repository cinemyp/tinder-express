exports.limitText = (text, limit) => {
  text = text.trim();
  if (text.length <= limit) return text;
  text = text.slice(0, limit); // тупо отрезать по лимиту
  lastSpace = text.lastIndexOf(' ');
  if (lastSpace > 0) {
    // нашлась граница слов, ещё укорачиваем
    text = text.substr(0, lastSpace);
  }
  return text + '...';
};
exports.parseToken = (req) => {
  return req.headers.authorization.split(' ')[1];
};
exports.mergeArrays = (arr) => {
  return [].concat.apply([], arr);
};
exports.removeDuplicates = (arr, isObject, propName) => {
  const seen = {};
  const result = [];
  const len = arr.length;

  let index = 0;

  for (let i = 0; i < len; i++) {
    const item = arr[i];
    const key = isObject ? item[propName] : item;
    if (seen[key] !== 1) {
      seen[key] = 1;
      result[index++] = item;
    }
  }

  return result;
};
exports.getDuplicates = (arr1, arr2) => {
  const result = [];
  arr1.forEach((item) => {
    if (arr2.indexOf(item) !== -1) {
      result.push(item);
    }
  });
  return result;
};
exports.getUniqArray = (arr1, arr2) => {
  return this.removeDuplicates([...arr1, ...arr2]);
};
exports.getAvg = (arr) => {
  const sum = arr.reduce((a, b) => a + b, 0);
  return sum / arr.length || 0;
};
exports.getBaseLog = (b, x) => {
  return Math.log(x) / Math.log(b);
};

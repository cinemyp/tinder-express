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

// exports.verifyUser = () => {
//   return function (req, res, next) {
//     console.log('verify', req.isAuthenticated());
//     if (req.isAuthenticated()) {
//       return next();
//     }
//     res.redirect('exp://localhost:19000/Login');
//   };
// };
// exports.upload = () => {};
const mcache = require('memory-cache');

exports.cache = (duration) => {
  return function (req, res, next) {
    let key = '__express__' + req.originalUrl || req.url;
    let cachedBody = mcache.get(key);
    if (cachedBody) {
      res.jsonp(cachedBody);
      return;
    } else {
      res.sendResponse = res.jsonp;
      res.jsonp = (body) => {
        mcache.put(key, body, duration * 1000);
        res.sendResponse(body);
      };
    }
    next();
  };
};

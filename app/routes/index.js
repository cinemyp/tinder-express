const profileRoutes = require('./profile_routes');
module.exports = function (app, db) {
  profileRoutes(app, db);
  // Тут, позже, будут и другие обработчики маршрутов
};

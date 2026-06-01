const healthService = require("../services/healthService");

function getHealth(req, res) {
  res.status(200).json(healthService.getHealth());
}

module.exports = {
  getHealth,
};

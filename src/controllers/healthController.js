import * as healthService from '../services/healthService.js';

function getHealth(req, res) {
  res.status(200).json(healthService.getHealth());
}

export { getHealth };

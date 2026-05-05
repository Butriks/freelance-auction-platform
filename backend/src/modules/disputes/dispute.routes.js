const { Router } = require('express');
const disputeController = require('./dispute.controller');
const authMiddleware = require('../../middleware/authMiddleware');
const roleMiddleware = require('../../middleware/roleMiddleware');

const router = Router();

router.use(authMiddleware);

router.post(
  '/contracts/:contractId/disputes',
  roleMiddleware('CLIENT', 'FREELANCER'),
  disputeController.createDispute,
);
router.get(
  '/disputes/my',
  roleMiddleware('CLIENT', 'FREELANCER'),
  disputeController.getMyDisputes,
);

module.exports = router;


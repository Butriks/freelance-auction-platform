const { Router } = require('express');
const contractController = require('./contract.controller');
const authMiddleware = require('../../middleware/authMiddleware');
const roleMiddleware = require('../../middleware/roleMiddleware');

const router = Router();

router.use(authMiddleware);

router.post(
  '/tasks/:taskId/accept-bid/:bidId',
  roleMiddleware('CLIENT'),
  contractController.acceptBid,
);
router.get(
  '/contracts/my',
  roleMiddleware('CLIENT', 'FREELANCER', 'ADMIN'),
  contractController.getMyContracts,
);
router.get(
  '/contracts/:id',
  roleMiddleware('CLIENT', 'FREELANCER', 'ADMIN'),
  contractController.getContractById,
);

module.exports = router;


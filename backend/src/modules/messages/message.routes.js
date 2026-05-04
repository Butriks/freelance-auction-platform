const { Router } = require('express');
const messageController = require('./message.controller');
const authMiddleware = require('../../middleware/authMiddleware');
const roleMiddleware = require('../../middleware/roleMiddleware');

const router = Router();

router.use(authMiddleware);

router.get(
  '/contracts/:contractId/messages',
  roleMiddleware('CLIENT', 'FREELANCER', 'ADMIN'),
  messageController.getContractMessages,
);
router.post(
  '/contracts/:contractId/messages',
  roleMiddleware('CLIENT', 'FREELANCER', 'ADMIN'),
  messageController.createMessage,
);

module.exports = router;


const { Router } = require('express');
const walletController = require('./wallet.controller');
const authMiddleware = require('../../middleware/authMiddleware');
const roleMiddleware = require('../../middleware/roleMiddleware');

const router = Router();

router.use(authMiddleware);

router.get('/wallet/me', walletController.getMyWallet);
router.get('/wallet/transactions', walletController.getMyTransactions);
router.post(
  '/wallet/mock-top-up',
  roleMiddleware('CLIENT', 'FREELANCER', 'ADMIN'),
  walletController.mockTopUp,
);

module.exports = router;

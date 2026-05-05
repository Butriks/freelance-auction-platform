const { Router } = require('express');
const adminController = require('./admin.controller');
const authMiddleware = require('../../middleware/authMiddleware');
const roleMiddleware = require('../../middleware/roleMiddleware');

const router = Router();

router.use(authMiddleware);
router.use(roleMiddleware('ADMIN'));

router.get('/users', adminController.getUsers);
router.patch('/users/:id/block', adminController.blockUser);
router.patch('/users/:id/unblock', adminController.unblockUser);
router.get('/tasks', adminController.getTasks);
router.get('/contracts', adminController.getContracts);
router.get('/disputes', adminController.getDisputes);
router.patch('/disputes/:id/resolve', adminController.resolveDispute);
router.get('/logs', adminController.getLogs);
router.get('/analytics', adminController.getAnalytics);

module.exports = router;

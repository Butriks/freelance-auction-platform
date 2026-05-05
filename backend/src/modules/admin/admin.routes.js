const { Router } = require('express');
const adminController = require('./admin.controller');
const authMiddleware = require('../../middleware/authMiddleware');
const roleMiddleware = require('../../middleware/roleMiddleware');

const router = Router();

router.use(authMiddleware);
router.use(roleMiddleware('ADMIN'));

router.get('/admin/users', adminController.getUsers);
router.patch('/admin/users/:id/block', adminController.blockUser);
router.patch('/admin/users/:id/unblock', adminController.unblockUser);
router.get('/admin/tasks', adminController.getTasks);
router.get('/admin/contracts', adminController.getContracts);
router.get('/admin/disputes', adminController.getDisputes);
router.patch('/admin/disputes/:id/resolve', adminController.resolveDispute);
router.get('/admin/logs', adminController.getLogs);
router.get('/admin/analytics', adminController.getAnalytics);

module.exports = router;


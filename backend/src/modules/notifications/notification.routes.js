const { Router } = require('express');
const notificationController = require('./notification.controller');
const authMiddleware = require('../../middleware/authMiddleware');

const router = Router();

router.use(authMiddleware);

router.get('/notifications/unread-count', notificationController.getUnreadCount);
router.get('/notifications', notificationController.getNotifications);
router.patch('/notifications/read-all', notificationController.markAllAsRead);
router.patch('/notifications/:id/read', notificationController.markAsRead);

module.exports = router;


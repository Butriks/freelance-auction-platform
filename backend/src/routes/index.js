const { Router } = require('express');
const authRoutes = require('../modules/auth/auth.routes');
const taskRoutes = require('../modules/tasks/task.routes');
const bidRoutes = require('../modules/bids/bid.routes');
const contractRoutes = require('../modules/contracts/contract.routes');
const milestoneRoutes = require('../modules/milestones/milestone.routes');
const reviewRoutes = require('../modules/reviews/review.routes');
const messageRoutes = require('../modules/messages/message.routes');
const notificationRoutes = require('../modules/notifications/notification.routes');
const disputeRoutes = require('../modules/disputes/dispute.routes');
const adminRoutes = require('../modules/admin/admin.routes');

const router = Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

router.use('/api/auth', authRoutes);
router.use('/api', contractRoutes);
router.use('/api', milestoneRoutes);
router.use('/api', reviewRoutes);
router.use('/api', messageRoutes);
router.use('/api', notificationRoutes);
router.use('/api', disputeRoutes);
router.use('/api', adminRoutes);
router.use('/api/tasks/:taskId/bids', bidRoutes);
router.use('/api/tasks', taskRoutes);

module.exports = router;

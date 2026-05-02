const { Router } = require('express');
const authRoutes = require('../modules/auth/auth.routes');
const taskRoutes = require('../modules/tasks/task.routes');
const bidRoutes = require('../modules/bids/bid.routes');

const router = Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

router.use('/api/auth', authRoutes);
router.use('/api/tasks/:taskId/bids', bidRoutes);
router.use('/api/tasks', taskRoutes);

module.exports = router;

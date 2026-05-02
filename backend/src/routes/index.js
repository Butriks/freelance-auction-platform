const { Router } = require('express');
const authRoutes = require('../modules/auth/auth.routes');

const router = Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

router.use('/api/auth', authRoutes);

module.exports = router;

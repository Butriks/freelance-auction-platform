const { Router } = require('express');
const bidController = require('./bid.controller');
const authMiddleware = require('../../middleware/authMiddleware');
const roleMiddleware = require('../../middleware/roleMiddleware');

const router = Router({ mergeParams: true });

router.use(authMiddleware);

router.post('/', roleMiddleware('FREELANCER'), bidController.createBid);
router.get('/', bidController.listBidsByTask);

module.exports = router;


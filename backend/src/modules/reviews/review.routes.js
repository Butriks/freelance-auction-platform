const { Router } = require('express');
const reviewController = require('./review.controller');
const authMiddleware = require('../../middleware/authMiddleware');
const roleMiddleware = require('../../middleware/roleMiddleware');

const router = Router();

router.use(authMiddleware);

router.post(
  '/contracts/:contractId/reviews',
  roleMiddleware('CLIENT', 'FREELANCER'),
  reviewController.createReview,
);
router.get(
  '/contracts/:contractId/reviews',
  roleMiddleware('CLIENT', 'FREELANCER', 'ADMIN'),
  reviewController.getContractReviews,
);
router.get(
  '/users/:userId/reviews',
  reviewController.getUserReviews,
);

module.exports = router;


const { Router } = require('express');
const milestoneController = require('./milestone.controller');
const authMiddleware = require('../../middleware/authMiddleware');
const roleMiddleware = require('../../middleware/roleMiddleware');

const router = Router();

router.use(authMiddleware);

router.get(
  '/contracts/:contractId/milestones',
  roleMiddleware('CLIENT', 'FREELANCER', 'ADMIN'),
  milestoneController.listMilestones,
);
router.post(
  '/contracts/:contractId/milestones',
  roleMiddleware('CLIENT'),
  milestoneController.createMilestone,
);
router.patch(
  '/milestones/:id/submit',
  roleMiddleware('FREELANCER'),
  milestoneController.submitMilestone,
);
router.patch(
  '/milestones/:id/approve',
  roleMiddleware('CLIENT'),
  milestoneController.approveMilestone,
);
router.patch(
  '/milestones/:id/reject',
  roleMiddleware('CLIENT'),
  milestoneController.rejectMilestone,
);

module.exports = router;


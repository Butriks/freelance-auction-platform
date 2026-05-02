const { Router } = require('express');
const taskController = require('./task.controller');
const authMiddleware = require('../../middleware/authMiddleware');
const roleMiddleware = require('../../middleware/roleMiddleware');

const router = Router();

router.use(authMiddleware);

router.post('/', roleMiddleware('CLIENT'), taskController.createTask);
router.get('/', taskController.listTasks);
router.get('/:id', taskController.getTaskById);
router.patch('/:id', roleMiddleware('CLIENT'), taskController.updateTask);
router.delete('/:id', roleMiddleware('CLIENT'), taskController.deleteTask);

module.exports = router;


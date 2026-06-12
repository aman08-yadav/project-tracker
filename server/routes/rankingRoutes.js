const express = require('express');
const {
  getReviewQueue,
  getStudentRanks,
  assignRank,
  bulkAssignRanks,
  getMyRank,
} = require('../controllers/rankingController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(authMiddleware);

// Review Queue — Faculty only
router.get('/review-queue', roleMiddleware('faculty'), getReviewQueue);

// Student Ranks
router.get('/ranks/:projectId', getStudentRanks);
router.get('/my-rank/:projectId', getMyRank);

// Assign Rank — Faculty only
router.post('/rank', roleMiddleware('faculty'), assignRank);
router.post('/rank/bulk', roleMiddleware('faculty'), bulkAssignRanks);

module.exports = router;

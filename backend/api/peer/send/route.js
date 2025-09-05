// server/routes/status.js
import express from 'express';
const router = express.Router();

// GET /api/status
router.get('/', (req, res) => {
  return res.status(200).json({ status: "ok" });
});

export default router;


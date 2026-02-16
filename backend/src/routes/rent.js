/**
 * POST /api/rent — Start a rental (unlock umbrella).
 * Body: { stationId, slotNumber [, sessionId ] }
 */

const express = require("express");
const rentalService = require("../services/rentalService");
const { requireJsonContentType, requireBody, requireFields, sessionId } = require("../middleware/validate");

const router = express.Router();

router.post(
  "/",
  requireJsonContentType,
  requireBody,
  requireFields("stationId", "slotNumber"),
  async (req, res, next) => {
    try {
      const sid = sessionId(req);
      const { stationId, slotNumber } = req.body;

      const stationIdStr = String(stationId).trim();
      const slotNum = parseInt(slotNumber, 10);
      if (isNaN(slotNum) || slotNum < 0) {
        return res.status(400).json({
          success: false,
          error: "slotNumber must be a non-negative integer",
        });
      }

      const result = await rentalService.startRental(sid, stationIdStr, slotNum);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;

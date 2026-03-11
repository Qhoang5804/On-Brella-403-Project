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
  requireFields("stationId"),
  async (req, res, next) => {
    try {
      const sid = sessionId(req);
      const { stationId, slotNumber } = req.body;

      // Validate slotNumber if provided
      if (slotNumber !== undefined && slotNumber !== null) {
        const slotNum = Number(slotNumber);
        if (isNaN(slotNum) || !Number.isInteger(slotNum) || slotNum < 1) {
          return res.status(400).json({ error: "Invalid slotNumber: must be a positive integer" });
        }
      }

      const stationIdStr = String(stationId).trim();

      const result = await rentalService.startRental(sid, stationIdStr);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
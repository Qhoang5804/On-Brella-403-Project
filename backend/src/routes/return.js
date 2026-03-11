/**
 * POST /api/return — End a rental (return umbrella).
 * Body: { rentalId, stationId, umbrellaId [, slotNumber, sessionId ] }
 */

const express = require("express");
const rentalService = require("../services/rentalService");
const { requireJsonContentType, requireBody, requireFields, sessionId } = require("../middleware/validate");

const router = express.Router();

router.post(
  "/",
  requireJsonContentType,
  requireBody,
  requireFields("rentalId", "stationId", "umbrellaId"),
  async (req, res, next) => {
    try {
      const sid = sessionId(req);
      const { rentalId, stationId, umbrellaId, slotNumber } = req.body;

      // Validate slotNumber if provided
      if (slotNumber !== undefined && slotNumber !== null) {
        const slotNum = Number(slotNumber);
        if (isNaN(slotNum) || !Number.isInteger(slotNum)) {
          return res.status(400).json({ error: "Invalid slotNumber: must be an integer" });
        }
      }

      const stationIdStr = String(stationId).trim();
      const rentalIdStr = String(rentalId).trim();
      const umbrellaIdStr = String(umbrellaId).trim();

      const result = await rentalService.endRental(
        sid,
        rentalIdStr,
        stationIdStr,
        umbrellaIdStr
      );

      res.json(result);
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
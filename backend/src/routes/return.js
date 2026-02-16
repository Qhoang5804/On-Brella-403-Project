/**
 * POST /api/return — End a rental (return umbrella).
 * Body: { rentalId, stationId, slotNumber, umbrellaId [, sessionId ] }
 */

const express = require("express");
const rentalService = require("../services/rentalService");
const { requireJsonContentType, requireBody, requireFields, sessionId } = require("../middleware/validate");

const router = express.Router();

router.post(
  "/",
  requireJsonContentType,
  requireBody,
  requireFields("rentalId", "stationId", "slotNumber", "umbrellaId"),
  async (req, res, next) => {
    try {
      const sid = sessionId(req);
      const { rentalId, stationId, slotNumber, umbrellaId } = req.body;

      const stationIdStr = String(stationId).trim();
      const rentalIdStr = String(rentalId).trim();
      const umbrellaIdStr = String(umbrellaId).trim();
      const slotNum = parseInt(slotNumber, 10);

      if (isNaN(slotNum) || slotNum < 0) {
        return res.status(400).json({
          success: false,
          error: "slotNumber must be a non-negative integer",
        });
      }

      const result = await rentalService.endRental(
        sid,
        rentalIdStr,
        stationIdStr,
        slotNum,
        umbrellaIdStr
      );
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;

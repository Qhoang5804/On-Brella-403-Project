/**
 * GET /api/stations — List stations with availability.
 */

const express = require("express");
const rentalService = require("../services/rentalService");

const router = express.Router();

router.get("/", async (_req, res, next) => {
  try {
    const data = await rentalService.getStations();
    res.json(data);
  } catch (err) {
    next(err);
  }
});

module.exports = router;

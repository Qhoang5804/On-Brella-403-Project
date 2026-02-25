/**
 * Mounts all API routes.
 */

const express = require("express");
const stationsRouter = require("./stations");
const rentRouter = require("./rent");
const returnRouter = require("./return");

const router = express.Router();

router.use("/stations", stationsRouter);
router.use("/rent", rentRouter);
router.use("/return", returnRouter);

module.exports = router;

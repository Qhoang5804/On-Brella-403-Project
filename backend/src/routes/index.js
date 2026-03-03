/**
 * Mounts all API routes.
 */

const express = require("express");
const { requireAdmin } = require("../middleware/requireAdmin");
const stationsRouter = require("./stations");
const rentRouter = require("./rent");
const returnRouter = require("./return");
const historyRouter = require("./history");
const adminRouter = require("./admin");

const router = express.Router();

router.use("/stations", stationsRouter);
router.use("/rent", rentRouter);
router.use("/return", returnRouter);
router.use("/history", historyRouter);
router.use("/admin", requireAdmin, adminRouter);

module.exports = router;

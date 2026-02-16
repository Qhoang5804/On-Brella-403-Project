/**
 * Express app setup. Modular: add middleware and routes here.
 */

const express = require("express");
const apiRoutes = require("./routes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", apiRoutes);

app.use(errorHandler);

module.exports = app;

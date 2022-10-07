const {Router} = require("express");
const config = require("../../../../config");

const {
    healthController
} = require("../../controllers/healthController");

const healthRouter = Router();

// @access Public
// @data []
healthRouter.get("/", healthController);

module.exports = healthRouter;

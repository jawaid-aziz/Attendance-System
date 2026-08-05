const express = require("express");
const { getUserById, getUserByName } = require("../common/getUser");
const { getCompanyBySlug } = require("../common/getCompany");
const authenticateToken = require("../middleware/authMiddleware");
const router = express.Router();

router.get("/getUser/:id", authenticateToken, getUserById);
router.get("/getUserByName/:name", authenticateToken, getUserByName);
router.get("/company/:slug", authenticateToken, getCompanyBySlug);

module.exports = router;

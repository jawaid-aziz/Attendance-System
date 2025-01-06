const express = require("express");
const { getUserById } = require("../common/getUser");
const router = express.Router();

router.get("/getUser/:id", getUserById);

module.exports = router;

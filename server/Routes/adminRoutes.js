const express = require("express");
const { addUser } = require("../controllers/adminController");
const { verifyAdmin } = require("../middleware/verifyAdmin");
const router = express.Router();

router.post("/add",verifyAdmin, addUser)

module.exports = router;

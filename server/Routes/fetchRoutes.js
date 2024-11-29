const express= require("express");
const {verifyAdmin}= require("../middleware/verifyAdmin")
const getAllEmployee = require("../controllers/fetchController")
const router=express.Router();
console.log("verifyAdmin type:", typeof verifyAdmin); // Should log 'function'
console.log("getAllEmployee type:", typeof getAllEmployee); // Should log 'function'
router.get("/get",  verifyAdmin, getAllEmployee,);

module.exports= router;
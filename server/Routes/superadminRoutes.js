const express = require("express");
const authenticateToken = require("../middleware/authMiddleware");
const authorizeSuperAdmin = require("../middleware/authorizeSuperAdmin");
const { listCompanies } = require("../controllers/superadminController/listCompanies");
const { getCompanyDetails } = require("../controllers/superadminController/getCompanyDetails");
const { createCompany } = require("../controllers/superadminController/createCompany");
const { setCompanyStatus } = require("../controllers/superadminController/setCompanyStatus");
const { deleteCompany } = require("../controllers/superadminController/deleteCompany");
const { inviteSuperAdmin } = require("../controllers/superadminController/inviteSuperAdmin");
const { listSuperAdmins } = require("../controllers/superadminController/listSuperAdmins");

const router = express.Router();

router.get("/companies", authenticateToken, authorizeSuperAdmin, listCompanies);
router.get("/companies/:id", authenticateToken, authorizeSuperAdmin, getCompanyDetails);
router.post("/companies", authenticateToken, authorizeSuperAdmin, createCompany);
router.patch("/companies/:id/status", authenticateToken, authorizeSuperAdmin, setCompanyStatus);
router.delete("/companies/:id", authenticateToken, authorizeSuperAdmin, deleteCompany);
router.get("/admins", authenticateToken, authorizeSuperAdmin, listSuperAdmins);
router.post("/invite-superadmin", authenticateToken, authorizeSuperAdmin, inviteSuperAdmin);

module.exports = router;

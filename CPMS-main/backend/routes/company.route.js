const express = require('express');

// router after /company/
const router = express.Router();

const authenticateToken = require('../middleware/auth.middleware');
const {verifyRole} = require('../routes/user.route.js');

const { AddCompany, UpdateCompany, CompanyDetail, AllCompanyDetail, DeleteCompany } = require('../controllers/Company/company.all-company.controller');

// List companies - requires company_list permission
router.get('/company-detail', authenticateToken, verifyRole, AllCompanyDetail);

//check permision middleware
router.post('/check-permission', authenticateToken, verifyRole, (req, res) => {
  res.status(200).json({ msg: "Permission granted." });
});

// Add company - requires company_add permission
router.post('/add-company', authenticateToken,verifyRole, AddCompany);

// Update company - requires company_edit permission
router.post('/update-company', authenticateToken, verifyRole, UpdateCompany);

// Delete company - requires company_delete permission
router.post('/delete-company', authenticateToken, verifyRole, DeleteCompany);

// Public company data
router.get('/company-data', CompanyDetail);

module.exports = router;
const express = require('express');
const router = express.Router();

const { getMenu } = require('../controllers/dashboardController');

router.get('/manager', getMenu('manager'));
router.get('/team-lead', getMenu('team-lead'));
router.get('/member', getMenu('member'));

module.exports = router;

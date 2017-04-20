const router = require('express').Router();

const Self = require('../models/Self');

router.post('/initFromLock', Self.initFromLock);

module.exports = router;

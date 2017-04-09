const router= require('express').Router();

const User = require('../models/User');

router.post('/initFromLock', User.initFromLock);
router.post('/createChildUser', User.createChildUser);

module.exports = router;

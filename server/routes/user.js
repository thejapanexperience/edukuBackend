const router= require('express').Router();

const User = require('../models/User');

router.post('/initFromLock', User.initFromLock);

module.exports = router;

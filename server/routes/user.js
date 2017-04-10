const router = require('express').Router();

const User = require('../models/User');

router.post('/initFromLock', User.initFromLock);
router.post('/createChildUser', User.createChildUser);
router.get('/getChildUser', User.getChildUser);

module.exports = router;

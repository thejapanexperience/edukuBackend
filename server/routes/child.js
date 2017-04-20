const router = require('express').Router();

const Child = require('../models/Child');

router.post('/createChildUser', Child.createChildUser);
router.get('/getChildUser', Child.getChildUser);

module.exports = router;

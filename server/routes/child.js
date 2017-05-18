const router = require('express').Router();

const Child = require('../models/Child');

router.route('/')
  .post(Child.createChildUser)
  .get(Child.getChildUser)
  .delete(Child.deleteChildUser);

module.exports = router;

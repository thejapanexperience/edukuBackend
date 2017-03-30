const router = require('express').Router();

router.use('/validate-jwt', require('./validateJwt'));

module.exports = router;

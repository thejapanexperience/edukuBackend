const router = require('express').Router();
const jwt = require('express-jwt');

const authenticate = jwt({
  secret: process.env.AUTH0_SECRET,
  audience: process.env.AUTH0_CLIENT_ID,
});

router.use('/validate-jwt', require('./validateJwt'));
router.use('/user', authenticate, require('./user'));

module.exports = router;

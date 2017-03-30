const router = require('express').Router();
const jwt = require('express-jwt');

const authenticate = jwt({
  secret: process.env.AUTH0_SECRET,
  audience: process.env.AUTH0_CLIENT_ID,
});

router.get('/', authenticate, (req, res) => {
  console.log('req.user: ', req.user);
  res.handle(null, 'VALID');
});

module.exports = router;

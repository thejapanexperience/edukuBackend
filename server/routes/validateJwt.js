const router = require('express').Router();

router.get('/', (req, res) => {
  console.log('req.user: ', req.user);
  res.handle(null, 'VALID');
});

module.exports = router;

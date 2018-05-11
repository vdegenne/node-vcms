const {Router} = require('vcms');

const router = Router();

// GET /hello
router.get('/hello', (req, res) => {
  res.send('hello world');
});

// GET /bye
router.get('/bye', (req, res) => {
  res.send('bye world');
});

module.exports = router;

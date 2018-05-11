const {Router} = require('../lib/vcms');

const router = Router();


router.get('/hello', (req, res) => {
  if (req.session) {
    res.send(req.session.hello);
  }
});


module.exports = router;

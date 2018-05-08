import {Router} from 'express';
import {raw} from 'objection';

import User from '../models/User';

// import {post} from 'req-control';

const router: Router = Router();

router.get('/', async (req, res) => {
  res.send(req.session.user);
});

router.post('/login', async (req, res) => {
  for (const p of ['username', 'password']) {
    if (!req.body[p]) {
      res.status(400).end('Wrong arguments.');
    }
  }

  const username = req.body.username;
  const password = Buffer.from(req.body.password, 'base64').toString('utf8');

  let user = (await User.query().where('username', username))[0];

  if (!user) {
    res.status(200).send({success: false, message: 'The user doesn\'t exist.'});
    return;
  }

  user = (await User.query()
              .eager('roles')
              .where('username', username)
              .where(raw(`password = crypt('${password}', password)`)))[0];

  if (!user) {
    res.status(200).send(
        {success: false, message: 'The password is incorrect.'});
    return;
  }

  // success we save the user informations in the session
  req.session.user = {
    name: user.username,
    firstname: user.firstname,
    lastname: user.lastname,
    roles: user.roles.map(({name}) => name)
  };

  res.status(200).send({success: true, message: user});
});


export {router as userRouter};

import express from 'express';

import userRoute from './routes/userRoute';
import catRoute from './routes/catRoute';
import authRoute from './routes/authRoute';
import passport from 'passport';
import {MessageResponse} from '../types/MessageTypes';

const router = express.Router();

router.use(passport.initialize());

router.get<{}, MessageResponse>('/', (req, res) => {
  res.json({
    message: 'routes: auth, user, cat',
  });
});

router.use('/auth', authRoute);
router.use('/users', userRoute);
router.use('/cats', catRoute);

export default router;

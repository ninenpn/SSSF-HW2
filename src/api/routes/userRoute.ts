import express from 'express';
import {
  checkToken,
  userDeleteCurrent,
  userGet,
  userListGet,
  userPost,
  userPutCurrent,
} from '../controllers/userController';
import {authenticate} from '../../middlewares';
import {body, param} from 'express-validator';

const router = express.Router();

router
  .route('/')
  .get(userListGet)
  .post(body('email').isEmail(), userPost)
  .put(authenticate, userPutCurrent)
  .delete(authenticate, userDeleteCurrent);

router.get('/token', authenticate, checkToken);

router.route('/:id').get(param('id'), userGet);

export default router;

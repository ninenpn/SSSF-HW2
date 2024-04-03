// TODO: create the following functions:
// - userGet - get user by id
// - userListGet - get all users
// - userPost - create new user. Remember to hash password
// - userPutCurrent - update current user
// - userDeleteCurrent - delete current user
// - checkToken - check if current user token is valid: return data from res.locals.user as UserOutput. No need for database query
import {Request, Response, NextFunction} from 'express';
import {User, UserOutput} from '../../types/DBTypes';
import CustomError from '../../classes/CustomError';
import userModel from '../models/userModel';
import {MessageResponse} from '../../types/MessageTypes';
import {hashSync} from 'bcryptjs';

const userGet = async (
  req: Request<{id: string}>,
  res: Response<UserOutput>,
  next: NextFunction
) => {
  try {
    const user = await userModel
      .findById(req.params.id)
      .select('-password -role');
    if (!user) {
      throw new Error('User not found');
    }
    console.log(user);
    res.json(user);
  } catch (error) {
    next(error);
  }
};

const userListGet = async (
  req: Request,
  res: Response<UserOutput[]>,
  next: NextFunction
) => {
  try {
    const users = await userModel.find().select('-password -role');
    res.json(users);
  } catch (error) {
    next(error);
  }
};

const userPost = async (
  req: Request<{}, {}, User>,
  res: Response<MessageResponse & {data: Omit<User, 'password' | 'role'>}>,
  next: NextFunction
) => {
  try {
    const {user_name, email} = req.body;
    const password = hashSync(req.body.password, 10);
    const user = {
      user_name,
      email,
      password,
    };
    const response = await userModel.create(user);
    const outUser = {
      user_name: response.user_name,
      email: response.email,
      _id: response._id,
    };
    res.json({message: 'User created', data: outUser});
  } catch (error) {
    next(error);
  }
};

const userPutCurrent = async (
  req: Request<{}, {}, Omit<User, '_id'>>,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = (res.locals.user as User)._id;
    const user = await userModel
      .findByIdAndUpdate(id, req.body, {new: true})
      .select('-password -role');

    if (!user) {
      throw new CustomError('User not found', 404);
    }
    res.json({message: 'User updated', data: user as UserOutput});
  } catch (error) {
    next(error);
  }
};

const userDeleteCurrent = async (
  req: Request<{}, {}, User>,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!res.locals.user) {
      throw new CustomError('No user', 400);
    }

    const response = await userModel.findByIdAndDelete(res.locals.user._id);
    if (!response) {
      throw new CustomError('No user found', 400);
    }
    const outUser = {
      _id: response._id,
      user_name: response.user_name,
      email: response.email,
    };
    res.json({message: 'User deleted', data: outUser});
  } catch (error) {
    next(error);
  }
};

const checkToken = (req: Request, res: Response) => {
  if (!res.locals.user) {
    throw new CustomError('Unvalid token', 403);
  } else {
    const userOutput: UserOutput = {
      _id: (res.locals.user as User)._id,
      user_name: (res.locals.user as User).user_name,
      email: (res.locals.user as User).email,
    };
    res.json(userOutput);
  }
};

export {
  userGet,
  userListGet,
  userPost,
  userPutCurrent,
  userDeleteCurrent,
  checkToken,
};

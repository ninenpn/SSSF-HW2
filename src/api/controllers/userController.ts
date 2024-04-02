// TODO: create the following functions:
// - userGet - get user by id
// - userListGet - get all users
// - userPost - create new user. Remember to hash password
// - userPutCurrent - update current user
// - userDeleteCurrent - delete current user
// - checkToken - check if current user token is valid: return data from res.locals.user as UserOutput. No need for database query
import bcrypt from 'bcryptjs';
import {Request, Response, NextFunction} from 'express';
import {User, UserOutput} from '../../types/DBTypes';
import CustomError from '../../classes/CustomError';
import userModel from '../models/userModel';

const salt = bcrypt.genSaltSync(12);

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
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.body.role) {
      req.body.role = 'user';
    }
    console.log(req.body.role + 'User role in user post');
    const userInput = {
      user_name: req.body.user_name,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, salt),
      role: req.body.role,
    };

    const user = await userModel.create(userInput);
    const outUser: UserOutput = {
      _id: user._id,
      user_name: user.user_name,
      email: user.email,
    };
    console.log(outUser);
    res.status(200).json({message: 'User created', user: outUser});
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
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = (await userModel.findByIdAndDelete(
      res.locals.user._id
    )) as unknown as User;
    if (!user) {
      throw new CustomError('User not found', 404);
    }

    const userOutput: UserOutput = {
      _id: user._id,
      user_name: user.user_name,
      email: user.email,
    };
    res.json({message: 'User deleted', user: userOutput});
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

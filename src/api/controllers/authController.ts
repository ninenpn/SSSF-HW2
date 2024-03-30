import {Request, Response, NextFunction} from 'express';
import jwt from 'jsonwebtoken';
import CustomError from '../../classes/CustomError';
import {LoginUser, UserOutput} from '../../types/DBTypes';
import {LoginResponse} from '../../types/MessageTypes';
import userModel from '../models/userModel';
import bcrypt from 'bcryptjs';

const login = async (
  req: Request<{}, {}, {username: string; password: string}>,
  res: Response<LoginResponse>,
  next: NextFunction
) => {
  try {
    const {username, password} = req.body;
    if (!username || !password) {
      throw new CustomError('username and password are required', 400);
    }
    // Note: email is used as username
    const user = await userModel.findOne({email: username});
    if (!user) {
      throw new CustomError('User or password is incorrect', 200);
    }
    if (user.password && !bcrypt.compareSync(password, user.password)) {
      throw new CustomError('User or password is incorrect', 200);
    }

    if (!process.env.JWT_SECRET) {
      next(new CustomError('JWT secret not set', 500));
      return;
    }

    // delete password and role before sending data back to client
    const outUser: UserOutput = {
      _id: user._id,
      user_name: user.user_name,
      email: user.email,
    };

    // delete only password for user in token
    const outUserToken: LoginUser = {
      _id: user._id,
      user_name: user.user_name,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(outUserToken, process.env.JWT_SECRET);

    const message: LoginResponse = {
      token,
      user: outUser,
    };
    res.json(message);
  } catch (error) {
    next(error);
  }
};

export {login};

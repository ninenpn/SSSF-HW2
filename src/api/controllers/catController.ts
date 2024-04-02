// TODO: create following functions:
// - catGetByUser - get all cats by current user id
// - catGetByBoundingBox - get all cats by bounding box coordinates (getJSON)
// - catPutAdmin - only admin can change cat owner
// - catDeleteAdmin - only admin can delete cat
// - catDelete - only owner can delete cat
// - catPut - only owner can update cat
// - catGet - get cat by id
// - catListGet - get all cats
// - catPost - create new cat
import {Request, Response, NextFunction} from 'express';
import {Cat} from '../../types/DBTypes';
import catModel from '../models/catModel';
import {User} from '../../types/DBTypes';
import CustomError from '../../classes/CustomError';
import rectangleBounds from '../../utils/rectangleBounds';

const catGet = async (
  req: Request<{id: string}>,
  res: Response<Cat>,
  next: NextFunction
) => {
  try {
    const cat = await catModel.findById(req.params.id).populate({
      path: 'owner',
      select: '-__v -password -role',
    });
    if (!cat) {
      throw new CustomError('Cat not found', 404);
    }
    res.json(cat);
  } catch (error) {
    next(error);
  }
};

const catListGet = async (
  req: Request,
  res: Response<Cat[]>,
  next: NextFunction
) => {
  try {
    const cats = await catModel
      .find()
      .populate({
        path: 'owner',
        select: '-__v -password -role',
      })
      .populate({
        path: 'location',
      });
    res.json(cats);
  } catch (error) {
    next(error);
  }
};

const catPost = async (
  req: Request<{}, {}, Omit<Cat, '_id'>>,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.body.location) {
      req.body.location = res.locals.coordinates;
    }
    req.body.owner = res.locals.user._id;
    const cat = await catModel.create(req.body);
    res.json({message: 'Cat created', data: cat});
  } catch (error) {
    next(error);
  }
};

const catGetByUser = async (
  req: Request<{}, {}, User>,
  res: Response<Cat[]>,
  next: NextFunction
) => {
  try {
    const cats = await catModel.find({owner: res.locals.user._id}).populate({
      path: 'owner',
      select: '-__v -password -role',
    });
    res.json(cats);
  } catch (error) {
    next(error);
  }
};

const catGetByBoundingBox = async (
  req: Request<{}, {}, {}, {topRight: string; bottomLeft: string}>,
  res: Response<Cat[]>,
  next: NextFunction
) => {
  try {
    const topRight = req.query.topRight;
    const bottomLeft = req.query.bottomLeft;
    const [rightCorner1, rightCorner2] = topRight.split(',');
    const [leftCorner1, leftCorner2] = bottomLeft.split(',');

    const bounds = rectangleBounds(
      {
        lat: Number(rightCorner1),
        lng: Number(rightCorner2),
      },
      {
        lat: Number(leftCorner1),
        lng: Number(leftCorner2),
      }
    );

    const cats = await catModel
      .find({
        location: {
          $geoWithin: {
            $geometry: bounds,
          },
        },
      })
      .select('-__v');
    res.json(cats);
  } catch (error) {
    next(error);
  }
};

const catPutAdmin = async (
  req: Request<{id: string}, {}, Omit<Cat, '__id'>>,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.user && (req.user as User).role !== 'admin') {
      throw new CustomError('Only admin can change cat owner', 403);
    }
    req.body.location = res.locals.coordinates;
    const cat = await catModel
      .findByIdAndUpdate(req.params.id, req.body, {new: true})
      .select('-__v');
    if (!cat) {
      throw new CustomError('Cat not found', 404);
    }
    res.json({message: 'Cat updated', data: cat});
  } catch (error) {
    next(error);
  }
};

const catDeleteAdmin = async (
  req: Request<{id: string}>,
  res: Response,
  next: NextFunction
) => {
  try {
    if (res.locals.user.role !== 'admin') {
      throw new CustomError('Only admin can delete cat', 403);
    }
    const cat = (await catModel.findByIdAndDelete(
      req.params.id
    )) as unknown as Cat;
    if (!cat) {
      throw new CustomError('Cat not found', 404);
    }
    res.json({message: 'Cat deleted', data: cat});
  } catch (error) {
    next(error);
  }
};

const catDelete = async (
  req: Request<{id: string}>,
  res: Response,
  next: NextFunction
) => {
  try {
    const cat = (await catModel.findOneAndDelete({
      _id: req.params.id,
      owner: res.locals.user._id,
    })) as unknown as Cat;
    if (!cat) {
      throw new CustomError('Cat not found', 404);
    }
    res.json({message: 'Cat deleted', data: cat});
  } catch (error) {
    next(error);
  }
};

const catPut = async (
  req: Request<{id: string}, {}, Omit<Cat, '_id'>>,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.user && (req.user as User)._id !== (req.body as Cat).owner) {
      throw new CustomError('Only admin can change cat owner', 403);
    }

    req.body.location = res.locals.coordinates;
    const cat = await catModel
      .findByIdAndUpdate(req.params.id, req.body, {new: true})
      .select('-__v');

    if (!cat) {
      throw new CustomError('Cat not found', 404);
    }
    res.json({message: 'Cat updated', data: cat});
  } catch (error) {
    next(error);
  }
};

export {
  catGetByUser,
  catGetByBoundingBox,
  catPutAdmin,
  catDeleteAdmin,
  catDelete,
  catPut,
  catGet,
  catListGet,
  catPost,
};

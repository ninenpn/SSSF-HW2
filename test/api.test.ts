import app from '../src/app';
import {
  deleteUser,
  getCurrentUser,
  getSingleUser,
  getUser,
  postAuthLogin,
  postAuthLoginError,
  postUser,
  putUser,
} from './userFunctions';
import {User, UserTest} from '../src/types/DBTypes';
import mongoose from 'mongoose';
import {getNotFound} from './testFunctions';
import {
  adminDeleteCat,
  adminPutCat,
  getCat,
  getCatByBoundingBox,
  getCatByOwner,
  getSingleCat,
  postCat,
  userDeleteCat,
  userPutCat,
} from './catFunctions';

import randomstring from 'randomstring';

interface UserWithToken {
  user: User;
  token: string;
}

describe('GET /api/v1', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.DATABASE_URL as string);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  // test not found
  it('responds with a not found message', async () => {
    await getNotFound(app);
  });

  // test login error
  it('should return error message on invalid credentials', async () => {
    await postAuthLoginError(app);
  });

  // test create user
  let token: string;
  let user: UserWithToken;
  const testUser: UserTest = {
    user_name: 'Test User ' + randomstring.generate(7),
    email: randomstring.generate(9) + '@user.fi',
    password: 'asdfQEWR1234',
  };
  it('should create a new user', async () => {
    await postUser(app, testUser);
  });

  // test login
  it('should return a user object and bearer token on valid credentials', async () => {
    user = await postAuthLogin(app, {
      username: testUser.email!,
      password: testUser.password!,
    });
    token = user.token;
  });

  // test get all users
  it('should return array of users', async () => {
    await getUser(app);
  });

  // test get single user
  it('should return single user', async () => {
    await getSingleUser(app, user.user._id);
  });

  // test update user
  it('should update user', async () => {
    await putUser(app, token);
  });

  // test get current user based on token
  it('should return current user', async () => {
    await getCurrentUser(app, token);
  });

  // test cat upload without GPS
  let catID: string;
  it('should upload a cat', async () => {
    const message = await postCat(app, token, 'cat.jpg');
    catID = message.data._id;
  });

  // test cat upload with GPS
  let catID2: string;
  it('should upload a cat with GPS', async () => {
    const message = await postCat(app, token, 'picWithGPS.jpg');
    catID2 = message.data._id;
  });

  // test get all cats
  it('should return array of cats', async () => {
    await getCat(app);
  });

  // test get single cat
  it('should return single cat', async () => {
    await getSingleCat(app, catID);
  });

  // get cats by current user
  it('should return cats by current user', async () => {
    await getCatByOwner(app, token);
  });

  // get cats by bounding box
  it('should return cats by bounding box', async () => {
    await getCatByBoundingBox(app);
  });

  // modify user's cat
  it('should modify a cat', async () => {
    await userPutCat(app, token, catID);
  });

  // upload another cat for admin tests
  let catID3: string;
  it('should upload a cat for admin test', async () => {
    const message = await postCat(app, token, 'cat.jpg');
    catID3 = message.data._id;
  });

  // login as admin
  let adminToken: string;
  it('should login as admin', async () => {
    const user = await postAuthLogin(app, {
      username: 'admin@metropolia.fi',
      password: '1234',
    });
    adminToken = user.token;
  });

  // test modify user's cat as admin
  it('should modify a cat as admin', async () => {
    await adminPutCat(app, adminToken, catID3);
  });

  // test delete user's cat as admin
  it('should delete a cat as admin', async () => {
    await adminDeleteCat(app, adminToken, catID3);
  });

  // test delete user's cat
  it('should delete a cat', async () => {
    await userDeleteCat(app, token, catID);
  });

  // delete GPS image
  it('should delete GPS image', async () => {
    await userDeleteCat(app, token, catID2);
  });

  // test delete user based on token
  it('should delete current user', async () => {
    await deleteUser(app, token);
  });
});

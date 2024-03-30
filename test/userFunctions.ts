/* eslint-disable node/no-unpublished-import */
import request from 'supertest';
import expect from 'expect';
import {User, UserTest} from '../src/types/DBTypes';
import {ErrorResponse} from '../src/types/MessageTypes';

interface UserWithToken {
  user: User;
  token: string;
}

const getUser = (url: string | Function): Promise<User[]> => {
  return new Promise((resolve, reject) => {
    request(url)
      .get('/api/v1/users')
      .expect(200, (err, response) => {
        if (err) {
          reject(err);
        } else {
          const users: User[] = response.body;
          users.forEach((user) => {
            expect(user).toHaveProperty('_id');
            expect(user).toHaveProperty('user_name');
            expect(user).toHaveProperty('email');
            expect(user).not.toHaveProperty('role');
          });
          resolve(users);
        }
      });
  });
};

const getSingleUser = (url: string | Function, id: number): Promise<User> => {
  return new Promise((resolve, reject) => {
    request(url)
      .get('/api/v1/users/' + id)
      .expect(200, (err, response) => {
        if (err) {
          reject(err);
        } else {
          const user = response.body;
          expect(user).toHaveProperty('_id');
          expect(user).toHaveProperty('user_name');
          expect(user).toHaveProperty('email');
          expect(user).not.toHaveProperty('role');
          resolve(response.body);
        }
      });
  });
};

const postUser = (
  url: string | Function,
  user: UserTest
): Promise<UserWithToken> => {
  return new Promise((resolve, reject) => {
    request(url)
      .post('/api/v1/users/')
      .set('Content-type', 'application/json')
      .send(user)
      .expect('Content-Type', /json/)
      .expect(200, (err, response) => {
        if (err) {
          reject(err);
        } else {
          expect(response.body).toHaveProperty('message');
          expect(response.body).toHaveProperty('data');
          expect(response.body.data).not.toHaveProperty('password');
          expect(response.body.data).not.toHaveProperty('role');
          resolve(response.body);
        }
      });
  });
};

const putUser = (url: string | Function, token: string) => {
  return new Promise((resolve, reject) => {
    const newValue = 'Test User ' + new Date().toISOString();
    request(url)
      .put('/api/v1/users/')
      .set('Content-type', 'application/json')
      .set('Authorization', 'Bearer ' + token)
      .send({
        user_name: newValue,
      })
      .expect('Content-Type', /json/)
      .expect(200, (err, response) => {
        if (err) {
          reject(err);
        } else {
          expect(response.body).toHaveProperty('message');
          expect(response.body).toHaveProperty('data');
          expect(response.body.data).not.toHaveProperty('password');
          expect(response.body.data).not.toHaveProperty('role');
          expect(response.body.data.user_name).toBe(newValue);
          resolve(response.body);
        }
      });
  });
};

const getCurrentUser = (
  url: string | Function,
  token: string
): Promise<User> => {
  return new Promise((resolve, reject) => {
    request(url)
      .get('/api/v1/users/token')
      .set('Authorization', 'Bearer ' + token)
      .expect(200, (err, response) => {
        if (err) {
          reject(err);
        } else {
          const user = response.body;
          expect(user).toHaveProperty('_id');
          expect(user).toHaveProperty('user_name');
          expect(user).toHaveProperty('email');
          expect(user).not.toHaveProperty('role');
          expect(user).not.toHaveProperty('password');
          resolve(response.body);
        }
      });
  });
};

const postAuthLogin = (
  url: string | Function,
  user: {username: string; password: string}
): Promise<UserWithToken> => {
  return new Promise((resolve, reject) => {
    request(url)
      .post('/api/v1/auth/login')
      .send(user)
      .expect(200, (err, response) => {
        if (err) {
          reject(err);
        } else {
          expect(response.body).toHaveProperty('user');
          expect(response.body).toHaveProperty('token');
          const user: User = response.body.user;
          expect(user).toHaveProperty('user_name');
          expect(user).toHaveProperty('email');
          expect(user).not.toHaveProperty('role');
          expect(user).toHaveProperty('_id');
          expect(user).not.toHaveProperty('password');
          resolve(response.body);
        }
      });
  });
};

const postAuthLoginError = (url: string | Function): Promise<ErrorResponse> => {
  return new Promise((resolve, reject) => {
    request(url)
      .post('/api/v1/auth/login')
      .send({
        username: 'wrong@example.com',
        password: 'wrongpassword',
      })
      .expect(200, (err, response) => {
        if (err) {
          reject(err);
        } else {
          expect(response.body).toHaveProperty('message');
          expect(response.body).toHaveProperty('stack');
          resolve(response.body);
        }
      });
  });
};

const deleteUser = (
  url: string | Function,
  token: string
): Promise<ErrorResponse> => {
  return new Promise((resolve, reject) => {
    request(url)
      .delete('/api/v1/users')
      .set('Authorization', 'Bearer ' + token)
      .expect(200, (err, response) => {
        if (err) {
          reject(err);
        } else {
          expect(response.body).toHaveProperty('message');
          expect(response.body).toHaveProperty('data');
          expect(response.body.data).toHaveProperty('user_name');
          expect(response.body.data).toHaveProperty('email');
          expect(response.body.data).not.toHaveProperty('role');
          expect(response.body.data).not.toHaveProperty('password');
          resolve(response.body);
        }
      });
  });
};

export {
  getUser,
  getSingleUser,
  getCurrentUser,
  postUser,
  putUser,
  postAuthLogin,
  postAuthLoginError,
  deleteUser,
};

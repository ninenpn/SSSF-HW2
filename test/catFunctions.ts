/* eslint-disable node/no-unpublished-import */
import request from 'supertest';
import expect from 'expect';
import {Cat} from '../src/types/DBTypes';
import {MessageResponse} from '../src/types/MessageTypes';

const getCat = (url: string | Function): Promise<Cat[]> => {
  return new Promise((resolve, reject) => {
    request(url)
      .get('/api/v1/cats')
      .expect(200, (err, response) => {
        if (err) {
          reject(err);
        } else {
          const cats: Cat[] = response.body;
          cats.forEach((cat) => {
            expect(cat).toHaveProperty('_id');
            expect(cat).toHaveProperty('cat_name');
            expect(cat.owner._id).not.toBeUndefined();
            expect(cat).toHaveProperty('weight');
            expect(cat).toHaveProperty('birthdate');
            expect(cat.location).toHaveProperty('type');
          });
          resolve(cats);
        }
      });
  });
};

const getSingleCat = (url: string | Function, id: string): Promise<Cat> => {
  return new Promise((resolve, reject) => {
    request(url)
      .get('/api/v1/cats/' + id)
      .expect(200, (err, response) => {
        if (err) {
          reject(err);
        } else {
          const cat = response.body;
          expect(cat).toHaveProperty('_id');
          expect(cat).toHaveProperty('cat_name');
          expect(cat.owner._id).not.toBeUndefined();
          expect(cat).toHaveProperty('weight');
          expect(cat).toHaveProperty('birthdate');
          expect(cat.location).toHaveProperty('type');
          resolve(response.body);
        }
      });
  });
};

const postCat = (
  url: string | Function,
  token: string,
  pic: string
): Promise<MessageResponse & {data: Cat}> => {
  return new Promise((resolve, reject) => {
    request(url)
      .post('/api/v1/cats/')
      .set('Content-type', 'form-data')
      .set('Authorization', 'Bearer ' + token)
      .attach('cat', 'test/' + pic)
      .field('cat_name', 'Test Cat ' + new Date().toLocaleDateString('fi-FI'))
      .field('birthdate', '2020-01-01')
      .field('weight', 13.3)
      .expect(200, (err, response) => {
        if (err) {
          reject(err);
        } else {
          const cat: MessageResponse & {data: Cat} = response.body;
          expect(cat.data._id).not.toBe('');
          expect(cat.message).not.toBe('');
          resolve(response.body);
        }
      });
  });
};

// admin modify cat
const adminPutCat = (
  url: string | Function,
  token: string,
  id: string
): Promise<MessageResponse & {data: Cat}> => {
  return new Promise((resolve, reject) => {
    const newName = 'Admin Test Cat ' + new Date().toISOString();
    request(url)
      .put('/api/v1/cats/admin/' + id)
      .set('Content-type', 'application/json')
      .set('Authorization', 'Bearer ' + token)
      .send({
        cat_name: newName,
      })
      .expect(200, (err, response) => {
        if (err) {
          reject(err);
        } else {
          const cat: MessageResponse & {data: Cat} = response.body;
          expect((cat.data as Cat).cat_name).toBe(newName);
          expect(cat.message).not.toBe('');
          resolve(cat);
        }
      });
  });
};

// user modify cat
const userPutCat = (
  url: string | Function,
  token: string,
  id: string
): Promise<MessageResponse & {data: Cat}> => {
  return new Promise((resolve, reject) => {
    const newName = 'Test Cat ' + new Date().toISOString();
    request(url)
      .put('/api/v1/cats/' + id)
      .set('Content-type', 'application/json')
      .set('Authorization', 'Bearer ' + token)
      .send({
        cat_name: newName,
      })
      .expect(200, (err, response) => {
        if (err) {
          reject(err);
        } else {
          const cat: MessageResponse & {data: Cat} = response.body;
          expect(cat.message).not.toBe('');
          expect((cat.data as Cat).cat_name).toBe(newName);
          resolve(cat);
        }
      });
  });
};

// admin delete cat
const adminDeleteCat = (
  url: string | Function,
  token: string,
  id: string
): Promise<MessageResponse & {data: Cat}> => {
  return new Promise((resolve, reject) => {
    request(url)
      .delete('/api/v1/cats/admin/' + id)
      .set('Content-type', 'application/json')
      .set('Authorization', 'Bearer ' + token)
      .expect(200, (err, response) => {
        if (err) {
          reject(err);
        } else {
          const cat: MessageResponse & {data: Cat} = response.body;
          expect(cat.message).not.toBe('');
          expect(cat.data._id).toBe(id);
          resolve(cat);
        }
      });
  });
};

// user delete cat
const userDeleteCat = (
  url: string | Function,
  token: string,
  id: string
): Promise<MessageResponse & {data: Cat}> => {
  return new Promise((resolve, reject) => {
    request(url)
      .delete('/api/v1/cats/' + id)
      .set('Content-type', 'application/json')
      .set('Authorization', 'Bearer ' + token)
      .expect(200, (err, response) => {
        if (err) {
          reject(err);
        } else {
          const cat: MessageResponse & {data: Cat} = response.body;
          expect(cat.message).not.toBe('');
          expect(cat.data._id).toBe(id);
          resolve(cat);
        }
      });
  });
};

const getCatByOwner = (
  url: string | Function,
  token: string
): Promise<Cat[]> => {
  return new Promise((resolve, reject) => {
    request(url)
      .get('/api/v1/cats/user')
      .set('Content-type', 'application/json')
      .set('Authorization', 'Bearer ' + token)
      .expect(200, (err, response) => {
        if (err) {
          reject(err);
        } else {
          const cats: Cat[] = response.body;
          expect(cats.length).toBeGreaterThan(0);
          resolve(cats);
        }
      });
  });
};

const getCatByBoundingBox = (url: string | Function): Promise<Cat[]> => {
  return new Promise((resolve, reject) => {
    request(url)
      .get('/api/v1/cats/area')
      .set('Content-type', 'application/json')
      .query({
        topRight: '71,38',
        bottomLeft: '60,20',
      })
      .expect(200, (err, response) => {
        if (err) {
          reject(err);
        } else {
          const cat: Cat[] = response.body;
          expect(cat.length).toBeGreaterThan(0);
          resolve(cat);
        }
      });
  });
};

export {
  getCat,
  getSingleCat,
  postCat,
  adminPutCat,
  userPutCat,
  adminDeleteCat,
  userDeleteCat,
  getCatByOwner,
  getCatByBoundingBox,
};

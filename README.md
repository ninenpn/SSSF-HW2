# SSSF week 2 exercise. Submit to Oma

Convert the REST API from last weeks assignment to use MongoDB and Mongoose

## Getting started

- Clone this repo
- create .env based on .env.example
- `npm i` to install dependencies
- `npm run dev` to start development server
- `npm run test` to run tests

## Assignment

- Your task is to complete all TODOs in the code until all tests are passed

## Database

- Create the Schemas based on the JSON examples below

Cat:

```json
{
  "_id",
  "cat_name": "Siiri",
  "weight": 4,
  "filename": "9434b5b5d9222ed366d22ebcc8e5c828",
  "birthdate": "2010-03-04",
  "coords": {
    "type": "Point",
    "coordinates" : [
      61.5,
      24.7
    ]
  }
  "owner": {
    "_id": 37,
    "user_name": "Test User",
    "email": "a@b.fi"
  }
}
```

User:

```json
{
  "_id": 37,
  "user_name": "Test User", // this is not username, just firsname lastname
  "email": "john@metropolia.fi", // shoud be unique
  "role": "user", // or "admin" // don't send this
  "password": "1234" // don't send this
}
```

## Routes

- /auth
- /users
- /cats

# Important

- login users email as username
- create admin manually to user collection: admin@metropolia.fi, password: 1234
- Always empty your cats after tests, so that you dont have user_ids that are not in users collection

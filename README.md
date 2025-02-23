## Description
ManageLynk API is the backend RESTful service for a property-management SaaS platform that streamlines maintenance management and vendor sourcing for commercial property managers. The API provides endpoints for user and vendor onboarding, work order creation, vendor bidding, and status tracking—helping property managers automate and simplify their day-to-day operations.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# start database
$ npm run start:dev

# development
$ npm run start

# run migration 
$ npm run migrate

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

#### API Docs: http://localhost:3000/api
#### API Server: http://localhost:3000

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

Encode your certificate in Base64:

bash
Copy code

```base64 -w 0 path/to/certificate.crt > cert_base64.txt```

This creates a Base64-encoded version of your certificate.

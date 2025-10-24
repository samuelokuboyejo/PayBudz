

## Description

This is a simple example of a wallet service built in NestJS using Postgres. This service exposes functionalities for interacting with wallets, performing atomic transactions based on this wallet featuring:

- **Append-only ledger architecture** for complete auditability
- **Atomic transactions** with ACID compliance
- **No balance storage** - balances computed from transaction history
- **Idempotency support** to prevent duplicate transactions
- **Double-entry bookkeeping** for transfers
- **Comprehensive validation** and error handling

## How To Set Up The Project Locally

Follow these steps in the exact order.

### 1. Installing Packages

```bash
$ npm install
```

### 2. Run Tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

### 3. Set Up the Database

Docker is recommended.

```bash
# Docker should be installed
$ docker-compose up -d postgres
```

### 3. Running The DB Migration

```bash
# psql should be installed
$ psql -h localhost -U postgres -d wallet_db -f migrations/v1.sql
```

### 4. Run the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev
```

### Finally, Check The API Doc in Swagger and Play Around with the API

Check the service logs and open the [API Doc](http://localhost:3001/api/docs).

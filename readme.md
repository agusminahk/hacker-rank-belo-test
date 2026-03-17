# Hacker-Rank Belo Test

A payments API built with NestJS, TypeORM and PostgreSQL that allows managing money transfers between users.

---

## Getting started

### 1. Start the database

```bash
docker-compose up -d
```

### 2. Install dependencies and run the app

```bash
npm install
npm run start:dev
```

### 3. Explore the API

Open [http://localhost:3000/swagger](http://localhost:3000/swagger) to browse the interactive Swagger documentation.

### 4. Seed users

Before hitting any endpoint, insert at least **2 users** directly in the database — they will act as sender and receiver in transactions.

```sql
INSERT INTO "user" (id, name, email, balance, "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'Alice', 'alice@example.com', 100000, now(), now()),
  (gen_random_uuid(), 'Bob',   'bob@example.com',   100000, now(), now());
```

---

## Running tests

```bash
# Unit + integration
npm run test

# With coverage
npm run test:cov
```

---

## Environment variables

| Variable          | Default     | Description              |
|-------------------|-------------|--------------------------|
| `POSTGRES_HOST`   | `localhost` | PostgreSQL host          |
| `POSTGRES_PORT`   | `5432`      | PostgreSQL port          |
| `POSTGRES_USER`   | `postgres`  | PostgreSQL user          |
| `POSTGRES_PASSWORD` | `postgres` | PostgreSQL password     |
| `POSTGRES_DB`     | `payments`  | PostgreSQL database name |

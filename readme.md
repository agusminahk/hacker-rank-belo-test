# Hacker-Rank Belo Test

API de pagos construida con NestJS, TypeORM y PostgreSQL que permite gestionar transferencias de dinero entre usuarios.

---

## Cómo levantar el proyecto

### 1. Levantar la base de datos

```bash
docker-compose up -d
```

### 2. Instalar dependencias e iniciar la app

```bash
npm install
npm run start:dev
```

### 3. Explorar la API

Abrí [http://localhost:3000/swagger](http://localhost:3000/swagger) para ver la documentación interactiva de Swagger.

### 4. Crear usuarios en la base de datos

Antes de usar los endpoints, insertá al menos **2 usuarios** directamente en la base de datos — van a actuar como emisor y receptor de las transacciones.

```sql
INSERT INTO "user" (id, name, email, balance, "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'Alice', 'alice@example.com', 100000, now(), now()),
  (gen_random_uuid(), 'Bob',   'bob@example.com',   100000, now(), now());
```

---

## Correr los tests

```bash
# Unit + integración
npm run test

```

---

## Variables de entorno

| Variable            | Default     | Descripción                     |
|---------------------|-------------|---------------------------------|
| `POSTGRES_HOST`     | `localhost` | Host de PostgreSQL              |
| `POSTGRES_PORT`     | `5432`      | Puerto de PostgreSQL            |
| `POSTGRES_USER`     | `postgres`  | Usuario de PostgreSQL           |
| `POSTGRES_PASSWORD` | `postgres`  | Contraseña de PostgreSQL        |
| `POSTGRES_DB`       | `payments`  | Nombre de la base de datos      |

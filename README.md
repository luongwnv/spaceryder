# SpaceRyder Backend

Backend system for SpaceRyder, an intercity space travel booking service with high-speed spaceships (1,000 mph). Built with  **NestJS** , it supports  **GraphQL** ,  **RESTful API** , **WebSocket** for real-time notifications, **BullMQ** for asynchronous processing with  **Redis** , and **TypeORM** with **PostgreSQL** for data storage. PostgreSQL and Redis run in **Docker** containers, while the application runs locally with Node.js. Environment variables are managed via a centralized configuration file.

## Features

* **Request Trip** : Book a trip with departure, destination, and time via REST or GraphQL, processed asynchronously via BullMQ.
* **Cancel Trip** : Cancel a trip using `tripId`.
* **Check Status** : View trip status (SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED).
* **Real-time Notifications** : Receive trip status updates via WebSocket.
* **API Documentation** : Swagger for RESTful API and GraphQL Playground for GraphQL API.
* **Health Check** : Monitor application health via `GET /health` endpoint.
* **Initial Data** :
* Spaceships: `SS-001 (Galactic Voyager, JFK)`, `SS-002 (Star Hopper, JFK)`, `SS-003 (Cosmic Cruiser, SFO)`.
* Airports: `JFK`, `SFO`, `LAX`.

## Technologies

* **NestJS** : Node.js backend framework.
* **GraphQL** : API query language with Playground.
* **RESTful API** : Traditional HTTP endpoints with Swagger.
* **WebSocket** : Real-time notifications.
* **BullMQ** : Asynchronous job queue with Redis.
* **TypeORM** : ORM for PostgreSQL.
* **Jest** : Framework for unit and E2E testing.
* **Swagger** : API documentation for RESTful endpoints.
* **Docker** : Containerization for PostgreSQL and Redis.
* **Config** : Centralized environment variable management with `@nestjs/config`.
* **Bull Board** : Web UI for monitoring BullMQ queues.
* **Class Validator** : Input validation for API requests.

## Installation

### Prerequisites

* **Node.js** : v18 or higher (install from [https://nodejs.org/](https://nodejs.org/)).
* **npm** : v8 or higher (comes with Node.js).
* **Docker** : Install Docker and Docker Compose (see [https://docs.docker.com/get-docker/](https://docs.docker.com/get-docker/)).

### Setup Steps

1. **Clone the repository** :

```bash
   git clone <repository-url>
   cd spacerryder
```

1. **Install Node.js dependencies** :

```bash
   npm install
```

1. **Set up environment variables** :

* Create a `.env` file in the root directory:
  ```
  DB_HOST=localhost
  DB_PORT=5432
  DB_USERNAME=user123
  DB_PASSWORD=password123
  DB_NAME=spacerryder
  REDIS_HOST=localhost
  REDIS_PORT=6379
  PORT=3000
  ```
* If using Docker Desktop on macOS/Windows, try `REDIS_HOST=host.docker.internal` if `localhost` fails.

1. **Run PostgreSQL and Redis with Docker** :

* Start Docker containers:
  ```bash
  docker-compose up -d
  ```
* Verify containers are running:
  ```bash
  docker ps
  ```

1. **Initialize database** :

* Run migrations to create tables and seed initial data:
  ```bash
  npm run migration:run
  ```
* If migrations fail, ensure PostgreSQL container is running and `.env` matches Docker configuration.

1. **Run the application locally** :

* Development mode:
  ```bash
  npm run start:dev
  ```
* Production mode:
  ```bash
  npm run build
  npm run start
  ```

1. **Stop Docker services** :

```bash
   docker-compose down
```

1. **Access services** :

* RESTful API: `http://localhost:3000`
* Swagger UI: `http://localhost:3000/api/docs`
* GraphQL Playground: `http://localhost:3000/graphql`
* WebSocket: `ws://localhost:3000`
* Bull Board: `http://localhost:3000/admin/queues`
* PostgreSQL: `localhost:5432` (user: `user123`, password: `password123`, database: `spacerryder`)
* Redis: `localhost:6379` (or `host.docker.internal:6379` on macOS/Windows)

## Application Structure

* **AppController (`app.controller.ts`)** : Handles basic HTTP requests, such as the root endpoint (`GET /`) for a welcome message and `GET /health` for application health status.
* **AppService (`app.service.ts`)** : Contains logic for `AppController`, including welcome message and health check.
* **TripModule (`trip/trip.module.ts`)** : Handles trip-related logic, including REST and GraphQL endpoints.
* **TripQueueModule (`trip/queue/trip-queue.module.ts`)** : Manages BullMQ queue and worker for asynchronous trip processing.

## API Usage

### Swagger (RESTful API Documentation)

* URL: `http://localhost:3000/api/docs`
* Endpoints:
  * `GET /`: Welcome message.
  * `GET /health`: Check application health (PostgreSQL and Redis status).
  * `POST /trips`: Request a new trip.
  * `DELETE /trips/:tripId`: Cancel a trip.
  * `GET /trips/:tripId`: Get trip status.

#### Health Check

* **Endpoint** : `GET /health`
* **Response** (success):
  ```json
  {
    "status": "healthy",
    "postgres": true,
    "redis": true
  }
  ```
* **Response** (failure):
  ```json
  {
    "status": "unhealthy",
    "postgres": false,
    "redis": true
  }
  ```

#### Request a Trip

* **Endpoint** : `POST /trips`
* **Body** :

```json
  {
    "departureLocationCode": "JFK",
    "destinationLocationCode": "LAX",
    "departureAt": "2025-01-01T00:00:00Z"
  }
```

* **Response** : Job ID (string) for the queued task.

#### Cancel a Trip

* **Endpoint** : `DELETE /trips/:tripId`
* **Example** : `DELETE /trips/uuid-123`
* **Response** : Job ID (string).

#### Check Trip Status

* **Endpoint** : `GET /trips/:tripId`
* **Example** : `GET /trips/uuid-123`
* **Response** :

```json
  {
    "id": "uuid-123",
    "departureLocationCode": "JFK",
    "destinationLocationCode": "LAX",
    "departureAt": "2025-01-01T00:00:00.000Z",
    "arrivalAt": "2025-01-01T02:27:51.000Z",
    "spaceshipId": "SS-001",
    "status": "SCHEDULED"
  }
```

### GraphQL Playground

* URL: `http://localhost:3000/graphql`
* **Request a Trip** :

```graphql
  mutation {
    requestTrip(input: { departureLocationCode: "JFK", destinationLocationCode: "LAX", departureAt: "2025-01-01T00:00:00Z" })
  }
```

* **Cancel a Trip** :

```graphql
  mutation {
    cancelTrip(tripId: "uuid-123")
  }
```

* **Check Trip Status** :

```graphql
  query {
    tripStatus(tripId: "uuid-123") {
      id
      departureLocationCode
      destinationLocationCode
      departureAt
      arrivalAt
      spaceshipId
      status
    }
  }
```

* **Subscribe to Status Updates** :

```graphql
  subscription {
    tripStatusUpdated {
      id
      status
    }
  }
```

### WebSocket Endpoint

* URL: `ws://localhost:3000`
* Receives JSON: `{ event: 'tripStatusUpdated', data: trip }`.

## BullMQ

* **Queue** : Uses `trip-queue` for asynchronous processing.
* **Monitoring** :
* Access Bull Board: `http://localhost:3000/admin/queues`
* Check logs:

  ```bash
  npm run start:dev
  ```

  Look for `TripQueueProcessor initialized`, `TripQueueService: Adding trip request job`, and `TripService: Trip saved`.
* Check Redis logs:

  ```bash
  docker logs spacerryder_redis
  ```

## Environment Configuration

* Managed via `config/env.config.ts` and `.env`.
* Defaults: `DB_HOST=localhost`, `DB_PORT=5432`, `REDIS_HOST=localhost`, `REDIS_PORT=6379`, `PORT=3000`.

## Testing

* **Unit Tests** :

```bash
  npm run test
```

* **E2E Tests** (ensure Docker containers are running):
  ```bash
  npm run test:e2e
  ```
* Test files:
  * `test/trip/trip.service.spec.ts`
  * `test/trip/trip.controller.spec.ts`
  * `test/app.e2e-spec.ts`

## Troubleshooting

* **Error: database "user123" does not exist** :
* Ensure `.env` has `DB_NAME=spacerryder`.
* Verify `docker-compose.yml` has `POSTGRES_DB: spacerryder`.
* Restart Docker:
  ```bash
  docker-compose down
  docker-compose up -d
  npm run migration:run
  ```
* **Health Check Failure** :
* If `GET /health` returns `unhealthy`, check PostgreSQL (`localhost:5432`) and Redis (`localhost:6379`).
* **Trip Not Added to Queue** :
* Check Bull Board (`http://localhost:3000/admin/queues`).
* Verify `TripRequestInput`:
  * `departureLocationCode`, `destinationLocationCode`: Must be `JFK`, `SFO`, or `LAX`.
  * `departureAt`: Must be ISO 8601 (e.g., `2025-01-01T00:00:00Z`).
* Check logs for `TripQueueService`, `TripQueueProcessor`, `TripService`.
* Verify Redis:
  ```bash
  docker exec spacerryder_redis redis-cli ping
  ```
* Check database:
  ```bash
  docker exec -it spacerryder_postgres psql -U user123 -d spacerryder -c "SELECT * FROM trip;"
  ```
* **Error: Worker requires a connection** :
* Ensure Redis is running:
  ```bash
  docker ps
  docker exec spacerryder_redis redis-cli ping
  ```
* If `localhost:6379` fails, try `REDIS_HOST=host.docker.internal` in `.env` (macOS/Windows with Docker Desktop).
* Verify `app.module.ts` has `BullModule.forRootAsync` with correct Redis config.
* Check logs for `TripQueueProcessor initialized`. If missing, worker is not starting.
* Reinstall dependencies:
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  ```
* Test Redis connection:
  ```bash
  redis-cli -h localhost -p 6379 ping
  ```
* If using Docker Desktop, ensure host-to-container communication works. Try:
  ```bash
  redis-cli -h host.docker.internal -p 6379 ping
  ```
* Check Redis logs:
  ```bash
  docker logs spacerryder_redis
  ```
* Ensure `TripQueueModule` is imported in `app.module.ts`.
* Restart application:
  ```bash
  npm run start:dev
  ```

## Directory Structure

```
spacerryder/
├── docker-compose.yml             # Docker Compose for PostgreSQL and Redis
├── .env                           # Environment variables
├── .eslintrc.js                   # ESLint configuration
├── .prettierrc                    # Prettier configuration
├── config/
│   └── env.config.ts              # Environment configuration
├── package.json                   # Dependencies and scripts
├── tsconfig.json                  # TypeScript configuration
├── tsconfig.build.json            # TypeScript build configuration
├── README.md                      # Project documentation
├── test/
│   ├── app.e2e-spec.ts            # E2E tests for main app
│   ├── jest-e2e.json              # Jest E2E configuration
│   └── trip/
│       ├── trip.controller.spec.ts # Trip controller tests
│       └── trip.service.spec.ts   # Trip service tests
├── nest-cli.json                  # NestJS CLI configuration
└── src/
    ├── app.controller.ts          # Main app controller
    ├── app.module.ts              # Main module
    ├── app.service.ts             # Main app service
    ├── main.ts                    # Application entry point
    ├── data-source.ts             # TypeORM configuration
    ├── schema.gql                 # GraphQL schema
    ├── airport/
    │   ├── airport.entity.ts      # Airport entity
    │   ├── airport.module.ts      # Airport module
    │   ├── airport.resolver.ts    # GraphQL resolver
    │   ├── airport.service.ts     # Airport service
    │   └── dto/                   # Data Transfer Objects
    ├── spaceship/
    │   ├── spaceship.entity.ts    # Spaceship entity
    │   ├── spaceship.module.ts    # Spaceship module
    │   ├── spaceship.resolver.ts  # GraphQL resolver
    │   ├── spaceship.service.ts   # Spaceship service
    │   └── dto/                   # Data Transfer Objects
    ├── trip/
    │   ├── dto/                   # Trip DTOs
    │   ├── entities/              # Trip entities
    │   ├── queue/                 # BullMQ integration
    │   │   ├── trip-queue.module.ts # Queue module
    │   │   ├── trip-queue.processor.ts # Queue processor
    │   │   └── trip-queue.service.ts # Queue service
    │   ├── trip.controller.ts     # RESTful controller
    │   ├── trip.module.ts         # Trip module
    │   ├── trip.resolver.ts       # GraphQL resolver
    │   └── trip.service.ts        # Trip service
    ├── common/
    │   ├── constants/             # Application constants
    │   ├── decorators/            # Custom decorators
    │   ├── dto/                   # Common DTOs
    │   ├── filters/               # Exception filters
    │   ├── interfaces/            # Interfaces and types
    │   └── utils/                 # Utility functions
    ├── database/
    │   ├── migrations/            # TypeORM migrations
    │   └── seeds/                 # Database seed data
    └── bull-board.module.ts       # Bull Board for queue monitoring
```

## Potential Improvements

* Add authentication for Bull Board.
* Add detailed spaceship status checks.
* Handle concurrent request queues.
* Optimize spaceship selection.
* Add authentication and authorization for APIs.
* Add tests for BullMQ error cases.

## Contact

For questions, contact via email: [your-email@example.com](mailto:nguyenvanluong1511@gmail.com).

# SpaceRyder Backend

SpaceRyder is a backend application for intercity space travel booking, built with  **NestJS** ,  **TypeORM** ,  **GraphQL** ,  **BullMQ** ,  **PostgreSQL** , and  **Redis** . It provides APIs to request, cancel, and retrieve trip statuses, with support for pagination, WebSocket updates, and job queue processing.

## Features

* **REST and GraphQL APIs** : Manage trips via REST endpoints (`/trips`, `/trips/:tripId/status`) and GraphQL queries/mutations (`getAllTrips`, `requestTrip`, `cancelTrip`).
* **Pagination** : Retrieve trips with pagination support (`page`, `limit`).
* **Asynchronous Processing** : Trip requests and cancellations are processed via BullMQ job queues with Redis.
* **WebSocket Updates** : Real-time trip status updates via WebSocket.
* **Swagger Documentation** : API documentation at `/api/docs`.
* **Bull Board** : Job queue monitoring at `/admin/queues`.
* **GraphQL Playground** : Test GraphQL queries/mutations at `/graphql`.

## Tech Stack

* **NestJS** : Backend framework.
* **TypeORM** : ORM for PostgreSQL.
* **GraphQL** : API query language with Apollo Server.
* **BullMQ** : Job queue processing with Redis.
* **PostgreSQL** : Database for storing trips, airports, and spaceships.
* **Redis** : Queue storage and caching.
* **Docker** : Containerized PostgreSQL and Redis services.

## Prerequisites

* **Node.js** : v18 or higher.
* **Docker** : For running PostgreSQL and Redis containers.
* **npm** : v9 or higher.

## Installation

1. **Clone the repository** :

```bash
   git clone <repository-url>
   cd spacerryder
```

1. **Install dependencies** :

```bash
   npm install
```

1. **Set up environment variables** :
   Create a `.env` file in the root directory based on `.env.example`:

```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=user123
   DB_PASSWORD=password123
   DB_NAME=spacerryder
   REDIS_HOST=localhost
   REDIS_PORT=6379
```

1. **Run Docker containers** :
   Start PostgreSQL and Redis using Docker Compose:

```bash
   docker-compose up -d
```

1. **Run database migrations** :

```bash
   npm run migration:run
```

## Running the Application

1. **Start in development mode** :

```bash
   npm run start:dev
```

1. **Verify services** :

* **GraphQL Playground** : `http://localhost:3000/graphql`
* **Swagger API Docs** : `http://localhost:3000/api/docs`
* **Bull Board** : `http://localhost:3000/admin/queues`

1. **Check logs** :
   Ensure the following logs appear:

```
   Bootstrap: JSON and URL-encoded middleware enabled
   Bootstrap: Application is listening on port 3000
   TripService: TripService initialized
   TripResolver: TripResolver initialized
   TypeORM: Connection to database established
```

## Testing GraphQL APIs

Access **GraphQL Playground** at `http://localhost:3000/graphql` to test queries and mutations.

### Example Queries/Mutations

1. **Request a Trip** :

```graphql
   mutation {
     requestTrip(input: {
       departureLocationCode: "JFK"
       destinationLocationCode: "LAX"
       departureAt: "2025-01-01T00:00:00Z"
     }) {
       message
       jobId
       statusCode
     }
   }
```

1. **Get All Trips (with Pagination)** :

```graphql
   query {
     getAllTrips(page: 1, limit: 10) {
       trips {
         id
         departureLocationCode
         destinationLocationCode
         departureAt
         arrivalAt
         spaceshipId
         status
       }
       total
       page
       limit
     }
   }
```

1. **Cancel a Trip** :

```graphql
   mutation {
     cancelTrip(tripId: "uuid-123") {
       message
       jobId
       statusCode
     }
   }
```

### Expected Responses

* **requestTrip** :

```json
  {
    "data": {
      "requestTrip": {
        "message": "Trip request added successfully",
        "jobId": "request-trip-JFK-LAX-2025-01-01T00:00:00Z",
        "statusCode": 200
      }
    }
  }
```

* **getAllTrips** :

```json
  {
    "data": {
      "getAllTrips": {
        "trips": [
          {
            "id": "uuid-123",
            "departureLocationCode": "JFK",
            "destinationLocationCode": "LAX",
            "departureAt": "2025-01-01T00:00:00.000Z",
            "arrivalAt": "2025-01-01T03:00:00.000Z",
            "spaceshipId": "SS-001",
            "status": "SCHEDULED"
          }
        ],
        "total": 1,
        "page": 1,
        "limit": 10
      }
    }
  }
```

* **cancelTrip** :

```json
  {
    "data": {
      "cancelTrip": {
        "message": "Cancel trip request added successfully",
        "jobId": "cancel-trip-uuid-123",
        "statusCode": 200
      }
    }
  }
```

## Testing REST APIs

Use tools like Postman or `curl` to test REST endpoints.

1. **Get All Trips** :

```bash
   curl "http://localhost:3000/trips?page=1&limit=10"
```

1. **Request a Trip** :

```bash
   curl -X POST http://localhost:3000/trips \
     -H "Content-Type: application/json" \
     -d '{"departureLocationCode":"JFK","destinationLocationCode":"LAX","departureAt":"2025-01-01T00:00:00Z"}'
```

1. **Get Trip Status** :

```bash
   curl http://localhost:3000/trips/uuid-123/status
```

## Database and Queue Monitoring

1. **Check PostgreSQL** :

```bash
   docker exec -it spacerryder_postgres psql -U user123 -d spacerryder -c "SELECT * FROM trip;"
   docker exec -it spacerryder_postgres psql -U user123 -d spacerryder -c "SELECT * FROM airport;"
   docker exec -it spacerryder_postgres psql -U user123 -d spacerryder -c "SELECT * FROM spaceship;"
```

1. **Check Redis** :

```bash
   redis-cli -h localhost -p 6379 ping
   docker logs spacerryder_redis
```

1. **Monitor BullMQ Jobs** :
   Access Bull Board at `http://localhost:3000/admin/queues` to view job statuses (`request-trip`, `cancel-trip`).

## Troubleshooting

* **GraphQL Playground not loading** :
* Check logs for errors related to `@nestjs/graphql` or `@apollo/server`.
* Ensure `http://localhost:3000/graphql` is accessed with `Content-Type: application/json`.
* Verify `main.ts` includes `app.use(express.json())`.
* **EntityMetadataNotFoundError** :
* Ensure `trip.entity.ts` is in `src/trip` and included in `TypeOrmModule` (`entities: [join(__dirname, '**', '*.entity{.ts,.js}')]`).
* Run migrations: `npm run migration:run`.
* **Job queue issues** :
* Check Redis connection: `redis-cli -h localhost -p 6379 ping`.
* Monitor job statuses in Bull Board (`http://localhost:3000/admin/queues`).
* **Database issues** :
* Verify PostgreSQL connection in `.env`.
* Check table schema: `docker exec -it spacerryder_postgres psql -U user123 -d spacerryder -c "\d trip"`.

## Development

* **Build** :

```bash
  npm run build
```

* **Run tests** :

```bash
  npm run test
  npm run test:e2e
```

* **Generate migrations** :

```bash
  npm run typeorm migration:generate -- -d src/data-source.ts -n <MigrationName>
```

## Directory Structure

```
spacerryder/
├── config/
│   └── env.config.ts              # Environment configuration
├── docker-compose.yml             # Docker setup for PostgreSQL and Redis
├── .env                           # Environment variables
├── .env.example                   # Example environment variables
├── .eslintrc.js                   # ESLint configuration
├── .prettierrc                    # Prettier configuration
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
    ├── app/
    │   ├── airport/
    │   │   ├── airport.entity.ts  # Airport entity
    │   │   ├── airport.module.ts  # Airport module
    │   │   ├── airport.resolver.ts # GraphQL resolver
    │   │   ├── airport.service.ts # Airport service
    │   │   └── dto/               # Data Transfer Objects
    │   ├── spaceship/
    │   │   ├── spaceship.entity.ts # Spaceship entity
    │   │   ├── spaceship.module.ts # Spaceship module
    │   │   ├── spaceship.resolver.ts # GraphQL resolver
    │   │   ├── spaceship.service.ts # Spaceship service
    │   │   └── dto/               # Data Transfer Objects
    │   └── trip/
    │       ├── dto/               # Trip DTOs
    │       ├── entities/          # Trip entities
    │       ├── queue/             # BullMQ integration
    │       │   ├── trip-queue.module.ts # Queue module
    │       │   ├── trip-queue.processor.ts # Queue processor
    │       │   └── trip-queue.service.ts # Queue service
    │       ├── trip.controller.ts # RESTful controller
    │       ├── trip.module.ts     # Trip module
    │       ├── trip.resolver.ts   # GraphQL resolver
    │       ├── trip.service.ts    # Trip service
    │       └── trip.gateway.ts    # WebSocket gateway
    ├── bull/
    │   └── bull-board.module.ts   # Bull Board for queue monitoring
    ├── common/
    │   ├── constants/             # Application constants
    │   ├── decorators/            # Custom decorators
    │   ├── dto/                   # Common DTOs
    │   ├── filters/               # Exception filters
    │   ├── interfaces/            # Interfaces and types
    │   └── utils/                 # Utility functions
    └── database/
        ├── migrations/            # TypeORM migrations
        └── seeds/                 # Database seed data
```

## License

MIT License

For questions, contact via email: `nguyenvanluong1511@gmail.com`.

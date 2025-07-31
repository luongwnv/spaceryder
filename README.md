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
* **yarn** : v1 or higher.

## Installation

1. **Install dependencies** :

```bash
   yarn install
```

2. **Set up environment variables** :
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

3. **Run Docker containers** :
   Start PostgreSQL and Redis using Docker Compose:

```bash
   docker-compose up -d
```

4. **Run database migrations** :

```bash
   yarn migration:run
```

## Running the Application

1. **Start in development mode** :

```bash
   yarn start:dev
```

2. **Verify services** :

* **GraphQL Playground** : `http://localhost:3000/graphql`
* **Swagger API Docs** : `http://localhost:3000/api/docs`
* **Bull Board** : `http://localhost:3000/admin/queues`
* **WebSocket Test Page** : `http://localhost:3000/test-websocket.html`

3. **Check logs** :
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

2. **Get All Trips (with Pagination)** :

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

3. **Get Trip Status** :

```graphql
   query {
     getTripStatus(tripId: "646493af-230a-4164-a9ac-aec87bc647a1") {
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

4. **Cancel a Trip** :

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

* **getTripStatus** :

```json
  {
    "data": {
      "getTripStatus": {
        "id": "uuid-123",
        "departureLocationCode": "JFK",
        "destinationLocationCode": "LAX",
        "departureAt": "2025-01-01T00:00:00.000Z",
        "arrivalAt": "2025-01-01T03:00:00.000Z",
        "spaceshipId": "SS-001",
        "status": "SCHEDULED"
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

## Testing WebSocket Updates

Access the WebSocket test page at `http://localhost:3000/test-websocket.html` to verify real-time trip status updates.

1. **Connect to WebSocket** : Open the test page and verify the connection status.
2. **Subscribe to Trip Updates** : Enter a trip ID to subscribe to status changes.
3. **Test Updates** : Make changes to trip status using REST or GraphQL APIs and observe real-time updates in the WebSocket test interface.

## Testing REST APIs

Use tools like Postman or `curl` to test REST endpoints.

1. **Get All Trips** :

```bash
   curl "http://localhost:3000/trips?page=1&limit=10"
```

2. **Request a Trip** :

```bash
   curl -X POST http://localhost:3000/trips \
     -H "Content-Type: application/json" \
     -d '{"departureLocationCode":"JFK","destinationLocationCode":"LAX","departureAt":"2025-01-01T00:00:00Z"}'
```

3. **Get Trip Status** :

```bash
   curl http://localhost:3000/trips/uuid-123
```

4. **Cancel a Trip** :

```bash
   curl -X POST http://localhost:3000/trips/646493af-230a-4164-a9ac-aec87bc647a1
```

## Database and Queue Monitoring

1. **Check PostgreSQL** :

```bash
   docker exec -it spacerryder_postgres psql -U user123 -d spacerryder -c "SELECT * FROM trip;"
   docker exec -it spacerryder_postgres psql -U user123 -d spacerryder -c "SELECT * FROM airport;"
   docker exec -it spacerryder_postgres psql -U user123 -d spacerryder -c "SELECT * FROM spaceship;"
```

2. **Check Redis** :

```bash
   redis-cli -h localhost -p 6379 ping
   docker logs spacerryder_redis
```

3. **Monitor BullMQ Jobs** :
   Access Bull Board at `http://localhost:3000/admin/queues` to view job statuses (`request-trip`, `cancel-trip`).

## Troubleshooting

* **GraphQL Playground not loading** :
* Check logs for errors related to `@nestjs/graphql` or `@apollo/server`.
* Ensure `http://localhost:3000/graphql` is accessed with `Content-Type: application/json`.
* Verify `main.ts` includes `app.use(express.json())`.
* **EntityMetadataNotFoundError** :
* Ensure `trip.entity.ts` is in `src/trip` and included in `TypeOrmModule` (`entities: [join(__dirname, '**', '*.entity{.ts,.js}')]`).
* Run migrations: `yarn migration:run`.
* **Job queue issues** :
* Check Redis connection: `redis-cli -h localhost -p 6379 ping`.
* Monitor job statuses in Bull Board (`http://localhost:3000/admin/queues`).
* **Database issues** :
* Verify PostgreSQL connection in `.env`.
* Check table schema: `docker exec -it spacerryder_postgres psql -U user123 -d spacerryder -c "\d trip"`.

## Development

* **Build** :

```bash
  yarn build
```

* **Run tests** :

```bash
  yarn test
  yarn test:e2e
```

* **Generate migrations** :

```bash
  yarn typeorm migration:generate -- -d src/data-source.ts -n <MigrationName>
```

## Directory Structure

```
spacerryder/
├── config/
│   └── env.config.ts              # Environment configuration
├── docker-compose.yml             # Docker setup for PostgreSQL and Redis
├── .env                           # Environment variables
├── .prettierrc                    # Prettier configuration
├── package.json                   # Dependencies and scripts
├── tsconfig.json                  # TypeScript configuration
├── README.md                      # Project documentation
├── test/
│   ├── app.e2e-spec.ts            # E2E tests for main app
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
    │   │   └── airport.service.ts # Airport service
    │   ├── spaceship/
    │   │   ├── spaceship.entity.ts # Spaceship entity
    │   │   ├── spaceship.module.ts # Spaceship module
    │   │   ├── spaceship.resolver.ts # GraphQL resolver
    │   │   └── spaceship.service.ts # Spaceship service
    │   └── trip/
    │       ├── dto/               # Trip DTOs
    │       ├── interface/         # Trip Interface
    │       ├── queue/             # BullMQ integration
    │       │   ├── trip-queue.module.ts # Queue module
    │       │   ├── trip-queue.processor.ts # Queue processor
    │       │   └── trip-queue.service.ts # Queue service
    │       ├── trip.controller.ts # RESTful controller
    │       ├── trip.entity.ts     # Trip entity
    │       ├── trip.module.ts     # Trip module
    │       ├── trip.resolver.ts   # GraphQL resolver
    │       ├── trip.service.ts    # Trip service
    │       └── trip.gateway.ts    # WebSocket gateway
    ├── bull/
    │   └── bull-board.module.ts   # Bull Board for queue monitoring
    ├── common/
    │   └── utils/                 # Utility functions
    └── database/
        └── migrations/            # TypeORM migrations
```

## License

MIT License

For questions, contact via email: `nguyenvanluong1511@gmail.com`.

## Testing with Postman

SpaceRyder includes a Postman collection (`spaceryder.postman_collection.json`) for easy API testing.

### Import Postman Collection

1. **Open Postman** and click **Import** in the top left corner
2. **Select File** and choose `spaceryder.postman_collection.json` from the project root
3. **Click Import** to add the collection to your workspace

### Set Up Environment Variables

1. **Create a new Environment** in Postman named "SpaceRyder Local"
2. **Add variables**:
   - `baseUrl`: `http://localhost:3000`
   - `tripId`: (will be set automatically from responses)

### Available Endpoints in Collection

The collection includes the following requests organized by folders:

#### **Trip Management**
- **GET All Trips** - Retrieve paginated trips (`/trips?page=1&limit=10`)
- **POST Request Trip** - Create a new trip request (`/trips`)
- **GET Trip Status** - Get specific trip details (`/trips/:tripId`)
- **POST Cancel Trip** - Cancel an existing trip (`/trips/:tripId/cancel`)

#### **GraphQL**
- **GraphQL Queries** - Test GraphQL endpoint (`/graphql`)
- **Request Trip Mutation** - Create trip via GraphQL
- **Get All Trips Query** - Retrieve trips via GraphQL
- **Cancel Trip Mutation** - Cancel trip via GraphQL

### Using the Collection

1. **Start the application**:
   ```bash
   yarn start:dev
   ```

2. **Select the SpaceRyder Local environment** in Postman

3. **Run requests in order**:
   - First, use **POST Request Trip** to create a new trip
   - Copy the `tripId` from the response and set it in your environment variables
   - Use **GET Trip Status** to check the trip details
   - Use **POST Cancel Trip** to cancel the trip if needed

### Example Request Bodies

The collection includes pre-configured request bodies:

**Request Trip**:
```json
{
  "departureLocationCode": "JFK",
  "destinationLocationCode": "LAX",
  "departureAt": "2025-01-01T00:00:00.000Z"
}
```

**GraphQL Request Trip**:
```json
{
  "query": "mutation { requestTrip(input: { departureLocationCode: \"JFK\", destinationLocationCode: \"LAX\", departureAt: \"2025-01-01T00:00:00.000Z\" }) { message jobId statusCode } }"
}
```

### Testing Flow

1. **Request a Trip** → Get `jobId` and wait for processing
2. **Get All Trips** → Find your trip in the list
3. **Get Trip Status** → Check individual trip details
4. **Cancel Trip** → Cancel if needed
5. **Monitor in Bull Board** → Check job processing at `http://localhost:3000/admin/queues`

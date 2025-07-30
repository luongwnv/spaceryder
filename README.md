
# SpaceRyder Backend

Backend system for SpaceRyder, an intercity space travel booking service with high-speed spaceships (1,000 mph). Built with  **NestJS** , it supports  **GraphQL** ,  **RESTful API** , **WebSocket** for real-time notifications, **BullMQ** for asynchronous processing, and **TypeORM** with **PostgreSQL** for data storage. **Swagger** and **GraphQL Playground** are integrated for API documentation and testing.

## Features

* **Request Trip** : Book a trip with departure, destination, and time via REST or GraphQL, processed asynchronously via BullMQ.
* **Cancel Trip** : Cancel a trip using `tripId`.
* **Check Status** : View trip status (SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED).
* **Real-time Notifications** : Receive trip status updates via WebSocket.
* **API Documentation** : Use Swagger for RESTful API and GraphQL Playground for GraphQL API.
* **Initial Data** :
* Spaceships: `SS-001 (Galactic Voyager, JFK)`, `SS-002 (Star Hopper, JFK)`, `SS-003 (Cosmic Cruiser, SFO)`.
* Airports: `JFK`, `SFO`, `LAX`.

## Technologies

* **NestJS** : Node.js backend framework.
* **GraphQL** : API query language with Playground.
* **RESTful API** : Traditional HTTP endpoints with Swagger documentation.
* **WebSocket** : Real-time notifications.
* **BullMQ** : Asynchronous job queue with Redis.
* **TypeORM** : ORM for PostgreSQL.
* **Jest** : Framework for unit and E2E testing.
* **Swagger** : API documentation for RESTful endpoints.
* **TypeScript** : Ensures type safety.

## Installation

### Prerequisites

* **Node.js** : v18 or higher.
* **PostgreSQL** : v14 or higher.
* **Redis** : v4 or higher (for BullMQ).
* **npm** : v8 or higher.

### Setup Steps

1. **Clone the repository** :

```bash
   git clone <repository-url>
   cd spacerryder
```

1. **Install dependencies** :

```bash
   npm install
```

1. **Configure environment** :

* Create a `.env` file in the root directory:
  ```
  DB_HOST=localhost
  DB_PORT=5432
  DB_USERNAME=postgres
  DB_PASSWORD=postgres
  DB_NAME=spacerryder
  PORT=3000
  REDIS_HOST=localhost
  REDIS_PORT=6379
  ```
* Update database and Redis details as needed.

1. **Set up Redis** :

* Install Redis: Follow instructions at [https://redis.io/docs/install/install-redis/](https://redis.io/docs/install/install-redis/)
* Start Redis:
  ```bash
  redis-server
  ```

1. **Initialize database** :

* Ensure PostgreSQL is running.
* Run migrations to create tables and seed initial data:
  ```bash
  npm run migration:run
  ```

1. **Run the application** :

* Development mode:
  ```bash
  npm run start:dev
  ```
* Production mode:
  ```bash
  npm run build
  npm run start
  ```

## API Usage

### Swagger (RESTful API Documentation)

* URL: `http://localhost:3000/api/docs`
* Access Swagger UI to view and test RESTful endpoints interactively.
* Endpoints:
  * `POST /trips`: Request a new trip.
  * `DELETE /trips/:tripId`: Cancel a trip.
  * `GET /trips/:tripId`: Get trip status.

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
* **Note** : Processed asynchronously via BullMQ.

#### Cancel a Trip

* **Endpoint** : `DELETE /trips/:tripId`
* **Example** : `DELETE /trips/uuid-123`
* **Response** : Job ID (string) for the cancel task.

#### Check Trip Status

* **Endpoint** : `GET /trips/:tripId`
* **Example** : `GET /trips/uuid-123`
* **Response** :

```json
  {
    "tripId": "uuid-123",
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
* Access GraphQL Playground to test queries, mutations, and subscriptions interactively.

#### Request a Trip

```graphql
mutation {
  requestTrip(input: { departureLocationCode: "JFK", destinationLocationCode: "LAX", departureAt: "2025-01-01T00:00:00Z" })
}
```

* **Response** : Job ID (string) for the queued task.

#### Cancel a Trip

```graphql
mutation {
  cancelTrip(tripId: "uuid-123")
}
```

* **Response** : Job ID (string) for the cancel task.

#### Check Trip Status

```graphql
query {
  tripStatus(tripId: "uuid-123") {
    tripId
    departureLocationCode
    destinationLocationCode
    departureAt
    arrivalAt
    spaceshipId
    status
  }
}
```

#### Subscribe to Status Updates

```graphql
subscription {
  tripStatusUpdated {
    tripId
    status
  }
}
```

### WebSocket Endpoint

* URL: `ws://localhost:3000`
* Receives JSON notifications: `{ event: 'tripStatusUpdated', data: trip }`.

## BullMQ

* **Queue** : Uses `trip-queue` for asynchronous processing of trip requests and cancellations.
* **Monitoring** : Optionally integrate Bull Board for queue monitoring (see [https://github.com/felixmosh/bull-board](https://github.com/felixmosh/bull-board)).
* **Redis Configuration** :
* Ensure Redis is running on `localhost:6379` or update `.env`.
* Jobs are added to the queue and processed by `TripQueueProcessor`.

## Testing

### Run Tests

* Unit tests:
  ```bash
  npm run test
  ```
* E2E tests:
  ```bash
  npm run test:e2e
  ```
* Tests cover:
  * `trip.service.spec.ts`: Tests `TripService` logic.
  * `trip.controller.spec.ts`: Tests RESTful API endpoints.
  * `app.e2e-spec.ts`: Tests integration of REST, GraphQL, WebSocket, and BullMQ.

### Test Files

* `test/trip/trip.service.spec.ts`: Tests core trip logic.
* `test/trip/trip.controller.spec.ts`: Tests RESTful API endpoints.
* `test/app.e2e-spec.ts`: Tests integration, including BullMQ queue.

## Directory Structure

```
spacerryder/
├── src/
│   ├── airport/               # Airport management module
│   ├── spaceship/             # Spaceship management module
│   ├── trip/                  # Trip management module
│   │   ├── queue/             # BullMQ queue module
│   ├── common/                # Utilities and interfaces
│   ├── database/              # Database migrations
│   ├── test/                  # Unit and E2E tests
│   ├── app.module.ts          # Main module
│   ├── main.ts                # Application entry point
│   ├── data-source.ts         # TypeORM configuration
│   └── schema.gql             # GraphQL schema
├── package.json               # Dependencies and scripts
├── tsconfig.json              # TypeScript configuration
├── .env                       # Environment variables
├── README.md                  # Project documentation
├── test/jest-e2e.json         # Jest E2E configuration
└── nest-cli.json              # NestJS CLI configuration
```

## Potential Improvements

* Integrate Bull Board for queue monitoring.
* Add detailed spaceship status checks (e.g., in-flight, available).
* Handle concurrent request queues.
* Optimize spaceship selection (e.g., select earliest available).
* Add authentication and authorization for APIs.
* Add tests for BullMQ error cases (e.g., job failures, retries).

## Alternative: RabbitMQ

To use RabbitMQ instead of BullMQ:

* Install `@nestjs/microservices` and `amqplib`.
* Create `RabbitMQService` to send messages to queue.
* Create consumer with `@EventPattern` to process messages.
* Update `app.module.ts` for RabbitMQ connection.
* See details at: [https://docs.nestjs.com/microservices/rabbitmq](https://docs.nestjs.com/microservices/rabbitmq)

## Contact

For questions, contact via email: [your-email@example.com](mailto:your-email@example.com).

import { BullModule, getQueueToken } from '@nestjs/bullmq';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { createTestClient } from 'apollo-server-testing';
import { Queue } from 'bullmq';
import { gql } from 'graphql-tag';
import request from 'supertest';
import { Repository } from 'typeorm';
import WebSocket from 'ws';
import { AppModule } from '../app.module';
import { Trip } from '../app/trip/trip.entity';

describe('App (e2e)', () => {
  let app: INestApplication;
  let tripRepository: Repository<Trip>;
  let tripQueue: Queue;
  let ws: WebSocket;

  beforeAll(async () => {
    const dbHost = process.env.DB_HOST ?? 'localhost';
    const dbPort = process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432;
    const dbUsername = process.env.DB_USERNAME ?? 'user123';
    const dbPassword = process.env.DB_PASSWORD ?? 'password123';
    const dbName = process.env.DB_NAME ?? 'spacerryder_test';
    const redisHost = process.env.REDIS_HOST ?? 'localhost';
    const redisPort = process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: dbHost,
          port: dbPort,
          username: dbUsername,
          password: dbPassword,
          database: dbName,
          entities: [Trip],
          synchronize: true,
        }),
        BullModule.forRoot({
          connection: {
            host: redisHost,
            port: redisPort,
          },
        }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    tripRepository = moduleFixture.get<Repository<Trip>>(getRepositoryToken(Trip));
    tripQueue = moduleFixture.get<Queue>(getQueueToken('trip-queue'));
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await tripRepository.query('TRUNCATE TABLE trip CASCADE;');
    await tripQueue.clean(0, 0, 'completed');
    await tripQueue.clean(0, 0, 'failed');
    await tripQueue.clean(0, 0, 'wait');
  });

  describe('REST API with BullMQ', () => {
    it('POST /trips should add a trip job to queue', async () => {
      const response = await request(app.getHttpServer())
        .post('/trips')
        .send({
          departureLocationCode: 'JFK',
          destinationLocationCode: 'LAX',
          departureAt: '2025-01-01T00:00:00Z',
        })
        .expect(201);

      expect(response.body).toBeDefined(); 
      const jobs = await tripQueue.getJobs(['waiting', 'active']);
      expect(jobs.length).toBeGreaterThan(0);
      expect(jobs[0].name).toBe('request-trip');
    });

    it('DELETE /trips/:tripId should add a cancel job to queue', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/trips')
        .send({
          departureLocationCode: 'JFK',
          destinationLocationCode: 'LAX',
          departureAt: '2025-01-01T00:00:00Z',
        })
        .expect(201);

      // Wait for job to be processed
      await new Promise(resolve => setTimeout(resolve, 1000));

      const trip = await tripRepository.findOne({ where: { status: 'SCHEDULED' } });
      if (!trip) {
        throw new Error('Trip not found');
      }
      const tripId = trip.id;

      const response = await request(app.getHttpServer())
        .delete(`/trips/${tripId}`)
        .expect(200);

      expect(response.body).toBeDefined();
      const jobs = await tripQueue.getJobs(['waiting', 'active']);
      expect(jobs.length).toBeGreaterThan(0);
      expect(jobs[0].name).toBe('cancel-trip');
    });

    it('GET /trips/:tripId should return trip status', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/trips')
        .send({
          departureLocationCode: 'JFK',
          destinationLocationCode: 'LAX',
          departureAt: '2025-01-01T00:00:00Z',
        })
        .expect(201);

      await new Promise(resolve => setTimeout(resolve, 1000));

      const trip = await tripRepository.findOne({ where: { status: 'SCHEDULED' } });
      if (!trip) {
        throw new Error('Trip not found');
      }
      const tripId = trip.id;

      const response = await request(app.getHttpServer())
        .get(`/trips/${tripId}`)
        .expect(200);

      expect(response.body.tripId).toBe(tripId);
      expect(response.body.status).toBe('SCHEDULED');
    });
  });

  describe('GraphQL API with BullMQ', () => {
    let query: any;

    beforeAll(async () => {
      const { query: testQuery } = createTestClient(app.getHttpServer());
      query = testQuery;
    });

    it('mutation requestTrip should add a trip job to queue', async () => {
      const REQUEST_TRIP = gql`
        mutation {
          requestTrip(input: { departureLocationCode: "JFK", destinationLocationCode: "LAX", departureAt: "2025-01-01T00:00:00Z" })
        }
      `;

      const response = await query({ query: REQUEST_TRIP });
      expect(response.data.requestTrip).toBeDefined();
      const jobs = await tripQueue.getJobs(['waiting', 'active']);
      expect(jobs.length).toBeGreaterThan(0);
      expect(jobs[0].name).toBe('request-trip');
    });

    it('mutation cancelTrip should add a cancel job to queue', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/trips')
        .send({
          departureLocationCode: 'JFK',
          destinationLocationCode: 'LAX',
          departureAt: '2025-01-01T00:00:00Z',
        })
        .expect(201);

      await new Promise(resolve => setTimeout(resolve, 1000));

      const trip = await tripRepository.findOne({ where: { status: 'SCHEDULED' } });
      if (!trip) {
        throw new Error('Trip not found');
      }
      const tripId = trip.id;

      const CANCEL_TRIP = gql`
        mutation CancelTrip($tripId: String!) {
          cancelTrip(tripId: $tripId)
        }
      `;

      const response = await query({ query: CANCEL_TRIP, variables: { tripId } });
      expect(response.data.cancelTrip).toBeDefined();
      const jobs = await tripQueue.getJobs(['waiting', 'active']);
      expect(jobs.length).toBeGreaterThan(0);
      expect(jobs[0].name).toBe('cancel-trip');
    });
  });

  describe('WebSocket', () => {
    beforeEach((done) => {
      ws = new WebSocket('ws://localhost:3000');
      ws.on('open', () => done());
    });

    afterEach(() => {
      ws.close();
    });

    it('should receive trip status update on creation', (done) => {
      ws.on('message', (data) => {
        const message = JSON.parse(data.toString());
        expect(message.event).toBe('tripStatusUpdated');
        expect(message.data).toHaveProperty('tripId');
        expect(message.data.status).toBe('SCHEDULED');
        done();
      });

      request(app.getHttpServer())
        .post('/trips')
        .send({
          departureLocationCode: 'JFK',
          destinationLocationCode: 'LAX',
          departureAt: '2025-01-01T00:00:00Z',
        })
        .expect(201);
    });
  });
});
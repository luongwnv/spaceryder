import { Logger } from '@nestjs/common';
import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Trip } from './trip.entity';

@WebSocketGateway({
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
})
export class TripGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server | undefined;

    private logger = new Logger(TripGateway.name);

    afterInit(server: Server) {
        this.logger.log('Socket.IO server initialized');
    }

    handleConnection(client: Socket) {
        this.logger.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('subscribeToTrips')
    handleSubscribeToTrips(client: Socket, payload: any) {
        this.logger.log(`Client ${client.id} subscribed to trips`);
        client.join('trips');
        return { event: 'subscribed', data: { message: 'Successfully subscribed to trips' } };
    }

    notifyTripStatus(trip: Trip) {
        this.logger.log(`Notifying trip status: ${JSON.stringify(trip)}`);
        if (this.server) {
            this.logger.log('Emitting tripStatusUpdated event');
            this.server.emit('tripStatusUpdated', { trip });
        } else {
            this.logger.warn('Socket.IO server not initialized');
        }
    }
}

import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'ws';
import { Trip } from './trip.entity';

@WebSocketGateway()
export class TripGateway {
    @WebSocketServer()
    server: Server | undefined;

    notifyTripStatus(trip: Trip) {
        if (this.server) {
            this.server.clients.forEach(
                (client: { readyState: number; send: (arg0: string) => void }) => {
                    if (client.readyState === 1) {
                        client.send(JSON.stringify({ event: 'tripStatusUpdated', data: trip }));
                    }
                }
            );
        }
    }
}

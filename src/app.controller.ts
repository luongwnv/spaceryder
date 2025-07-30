import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('Health')
@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Get()
    @ApiOperation({ summary: 'Get welcome message' })
    @ApiResponse({ status: 200, description: 'Welcome message', type: String })
    getHello(): string {
        return this.appService.getHello();
    }

    @Get('health')
    @ApiOperation({ summary: 'Check application health' })
    @ApiResponse({ status: 200, description: 'Health status of the application' })
    @ApiResponse({ status: 503, description: 'Service unavailable' })
    async getHealth(): Promise<{ status: string; postgres: boolean; redis: boolean }> {
        return this.appService.checkHealth();
    }
}

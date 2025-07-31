import { NestFactory } from '@nestjs/core';
import * as express from 'express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.use(express.json());

    app.use(express.static(join(process.cwd(), 'public')));

    app.use(express.urlencoded({ extended: true }));
    AppModule.setupSwagger(app);
    AppModule.setupBullBoard(app);
    await app.listen(process.env.PORT || 3000);
}
bootstrap();

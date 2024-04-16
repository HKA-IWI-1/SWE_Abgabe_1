/*
 * Copyright (c) 2024 - present Florian Sauer
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
 * documentation files (the “Software”), to deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions
 * of the Software.
 *
 * THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT
 * LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 */
import {
    DocumentBuilder,
    type SwaggerCustomOptions,
    SwaggerModule,
} from '@nestjs/swagger';
import { type INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module.js';
import { NestFactory } from '@nestjs/core';
import compression from 'compression';
import { corsOptions } from './config/cors.js';
import { helmetHandlers } from './security/http/helmet.handler.js';
import { nodeConfig } from './config/node.js';
import { paths } from './config/paths.js';

const { httpsOptions, port } = nodeConfig;

const setupSwagger = (app: INestApplication) => {
    const config = new DocumentBuilder()
        .setTitle('film')
        .setDescription('Projekt für das Modul Software Engineering')
        .setVersion('2024.04.0')
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, config);
    const options: SwaggerCustomOptions = {
        customSiteTitle: 'SWE 23/24 Gruppe 4',
    };
    SwaggerModule.setup(paths.swagger, app, document, options);
};

const bootstrap = async () => {
    const app = await NestFactory.create(AppModule, { httpsOptions }); // "Shorthand Properties" ab ES 2015
    app.use(helmetHandlers, compression());
    app.useGlobalPipes(new ValidationPipe());
    setupSwagger(app);
    app.enableCors(corsOptions);
    await app.listen(port);
};

await bootstrap();

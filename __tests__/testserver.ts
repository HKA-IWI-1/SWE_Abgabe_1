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
    HttpStatus,
    type INestApplication,
    ValidationPipe,
} from '@nestjs/common';
import { Agent } from 'node:https';
import { AppModule } from '../src/app.module.js';
import { NestFactory } from '@nestjs/core';
import { v2 as compose } from 'docker-compose';
import { config } from '../src/config/app.js';
import { dbType } from '../src/config/db.js';
import { env } from '../src/config/env.js';
import isPortReachable from 'is-port-reachable';
import { join } from 'node:path';
// todo Jürgen auf obiges Problem ansprechen.
import { nodeConfig } from '../src/config/node.js';
import { paths } from '../src/config/paths.js';
import { typeOrmModuleOptions } from '../src/config/typeormOptions.js';

export const loginPath = `${paths.auth}/${paths.login}`;
export const refreshPath = `${paths.auth}/${paths.refresh}`;

export const { host, port } = nodeConfig;

const { httpsOptions } = nodeConfig;

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const dbPort: number = (typeOrmModuleOptions as any).port;
const dockerComposeDir = join('.extras', 'compose');

let dbHealthCheck: string;
switch (dbType) {
    case 'postgres': {
        dbHealthCheck = 'until pg_isready; do sleep 1; done';
        break;
    }
    case 'mysql': {
        dbHealthCheck = 'until healthcheck.sh; do sleep 1; done';
        break;
    }
    case 'oracle': {
        dbHealthCheck = 'until ping; do sleep 1; done';
        break;
    }
    case 'sqlite': {
        dbHealthCheck = '';
        break;
    }
}

// -----------------------------------------------------------------------------
// D B - S e r v e r   w i t h   D o c k e r   C o m p o s e
// -----------------------------------------------------------------------------
const startDbServer = async () => {
    if (dbType === 'sqlite') {
        return;
    }
    const isDBReachable = await isPortReachable(dbPort, { host: 'localhost' });
    if (isDBReachable) {
        console.info('DB-server already gestartet.');
        return;
    }

    console.info('Docker-Container with DB-server is getting started.');
    try {
        await compose.upAll({
            cwd: dockerComposeDir,
            commandOptions: [dbType],
            composeOptions: [['-f', `compose.${dbType}.yml`]],
            log: true,
        });
    } catch (err: unknown) {
        console.error(`startDbServer: ${JSON.stringify(err)}`);
        return;
    }

    await compose.exec(dbType, ['sh', '-c', dbHealthCheck], {
        cwd: dockerComposeDir,
    });
    console.info('Docker-Container with DB-server is started.');
};

const shutdownDbServer = async () => {
    if (dbType === 'sqlite') {
        return;
    }
    await compose.down({
        cwd: dockerComposeDir,
        composeOptions: [['-f', 'compose.postgres.yml']],
        log: true,
    });
};

// -----------------------------------------------------------------------------
// T e s t s e r v e r   w i t h   H T T P S
// -----------------------------------------------------------------------------
let server: INestApplication;

export const startServer = async () => {
    if (
        env.START_DB_SERVER === 'true' ||
        env.START_DB_SERVER === 'TRUE' ||
        config.test?.startDbServer === true
    ) {
        console.info('DB-server must be started.');
        await startDbServer();
    }

    server = await NestFactory.create(AppModule, {
        httpsOptions,
        logger: ['log'],
        // logger: ['debug'],
    });
    server.useGlobalPipes(
        new ValidationPipe({
            errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    );

    await server.listen(port);
    return server;
};

export const shutdownServer = async () => {
    try {
        await server.close();
    } catch {
        console.warn('The server was closed faulty.');
    }

    if (env.START_DB_SERVER === 'true' || env.START_DB_SERVER === 'TRUE') {
        await shutdownDbServer();
    }
};

export const httpsAgent = new Agent({
    requestCert: true,
    rejectUnauthorized: false,
    ca: httpsOptions.cert as Buffer,
});

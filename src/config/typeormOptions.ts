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

/**
 * Das Modul enthält die Konfiguration für den Zugriff auf die DB.
 * @packageDocumentation
 */
import { BASEDIR, config } from './app.js';
import {
    OracleNamingStrategy,
    SnakeNamingStrategy,
} from './typeormNamingStrategy.js';
// import { Film } from '../SWE_ABGABE_1/entity/film.entity.js';
import { type DataSourceOptions } from 'typeorm';
import { dbType } from './db.js';
// import { entities } from '../SWE_ABGABE_1/entity/entities.js';
import { logLevel } from './logger.js';
import { nodeConfig } from './node.js';
import path from 'node:path';
import { readFileSync } from 'node:fs';

const { db } = config;

// nullish coalescing
// const database = (db?.name as string | undefined) ?? Film.name.toLowerCase();

const host = (db?.host as string | undefined) ?? 'localhost';
//  const username =
//    (db?.username as string | undefined) ?? Film.name.toLowerCase();
const pass = (db?.password as string | undefined) ?? 'p';
const passAdmin = (db?.passwordAdmin as string | undefined) ?? 'p';

// https://github.com/tonivj5/typeorm-naming-strategies/blob/master/src/snake-naming.strategy.ts
// https://github.com/typeorm/typeorm/blob/master/src/naming-strategy/DefaultNamingStrategy.ts
// https://github.com/typeorm/typeorm/blob/master/sample/sample12-custom-naming-strategy/naming-strategy/CustomNamingStrategy.ts
const namingStrategy =
    dbType === 'oracle'
        ? new OracleNamingStrategy()
        : new SnakeNamingStrategy();

// logging bei TypeORM durch console.log()
const logging =
    (nodeConfig.nodeEnv === 'development' || nodeConfig.nodeEnv === 'test') &&
    logLevel === 'debug';
const logger = 'advanced-console';

export const dbResourcesDir = path.resolve(
    nodeConfig.resourcesDir,
    'db',
    dbType,
);
console.debug('dbResourcesDir = %s', dbResourcesDir);

// TODO records als "deeply immutable data structure" (Stage 2)
// https://github.com/tc39/proposal-record-tuple
let dataSourceOptions: DataSourceOptions;
switch (dbType) {
    case 'postgres': {
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        const cert = readFileSync(
            path.resolve(dbResourcesDir, 'certificate.cer'), // eslint-disable-line sonarjs/no-duplicate-string
        );
        dataSourceOptions = {
            type: 'postgres',
            host,
            port: 5432,
            username,
            password: pass,
            database,
            schema: username,
            poolSize: 10,
            entities,
            namingStrategy,
            logging,
            logger,
            ssl: { cert },
            extra: {
                ssl: {
                    rejectUnauthorized: false,
                },
            },
        };
        break;
    }
    case 'mysql': {
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        const cert = readFileSync(
            path.resolve(dbResourcesDir, 'certificate.cer'),
        );
        dataSourceOptions = {
            type: 'mysql',
            host,
            port: 3306,
            username,
            password: pass,
            database,
            poolSize: 10,
            entities,
            namingStrategy,
            supportBigNumbers: true,
            logging,
            logger,
            ssl: { cert },
            extra: {
                ssl: {
                    rejectUnauthorized: false,
                },
            },
        };
        break;
    }
    case 'oracle': {
        dataSourceOptions = {
            type: 'oracle',
            host,
            port: 1521,
            username,
            password: pass,
            database: 'FREEPDB1',
            serviceName: 'freepdb1',
            schema: username.toUpperCase(),
            poolSize: 10,
            entities,
            namingStrategy,
            logging,
            logger,
        };
        break;
    }
    // 'better-sqlite3' erfordert Python zum Uebersetzen, wenn das Docker-Image gebaut wird
    case 'sqlite': {
        const sqliteDatabase = path.resolve(
            BASEDIR,
            'config',
            'resources',
            'db',
            'sqlite',
            `${database}.sqlite`,
        );
        dataSourceOptions = {
            type: 'better-sqlite3',
            database: sqliteDatabase,
            entities,
            namingStrategy,
            logging,
            logger,
        };
        break;
    }
}
Object.freeze(dataSourceOptions);
export const typeOrmModuleOptions = dataSourceOptions;

if (logLevel === 'debug') {
    // "rest properties" ab ES 2018: https://github.com/tc39/proposal-object-rest-spread
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { password, ssl, ...typeOrmModuleOptionsLog } =
        typeOrmModuleOptions as any;
    console.debug('typeOrmModuleOptions = %o', typeOrmModuleOptionsLog);
}

export const dbPopulate = db?.populate === true;
let adminDataSourceOptionsTemp: DataSourceOptions | undefined;
if (dbType === 'postgres') {
    const cert = readFileSync(path.resolve(dbResourcesDir, 'certificate.cer')); // eslint-disable-line security/detect-non-literal-fs-filename
    adminDataSourceOptionsTemp = {
        type: 'postgres',
        host,
        port: 5432,
        username: 'postgres',
        password: passAdmin,
        database,
        schema: database,
        namingStrategy,
        logging,
        logger,
        ssl: { cert },
        extra: {
            ssl: {
                rejectUnauthorized: false,
            },
        },
    };
} else if (dbType === 'mysql') {
    const cert = readFileSync(path.resolve(dbResourcesDir, 'certificate.cer')); // eslint-disable-line security/detect-non-literal-fs-filename
    adminDataSourceOptionsTemp = {
        type: 'mysql',
        host,
        port: 3306,
        username: 'root',
        password: passAdmin,
        database,
        namingStrategy,
        supportBigNumbers: true,
        logging,
        logger,
        ssl: { cert },
        extra: {
            ssl: {
                rejectUnauthorized: false,
            },
        },
    };
}
export const adminDataSourceOptions = adminDataSourceOptionsTemp;

/* eslint-disable @stylistic/quotes */
/*
 * Copyright (C) 2024 - present Adrian Spindler Hochschule Karlsruhe
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

/**
 * Dieses Modul enthält Funktionen um die Test-DB neu zu laden.
 * todo @packagedocumentation implementieren
 */

import { Injectable, type OnApplicationBootstrap } from '@nestjs/common';
import {
    adminDataSourceOptions,
    dbPopulate,
    dbResourcesDir,
} from '../typeormOptions.js';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { dbType } from '../db.js';
import { getLogger } from '../../logger/logger.js';
import path from 'node:path';
import { readFileSync } from 'node:fs';

/**
 * Die Test-DB wird im dev Modus neu geladen, nachdem alle Module initialisiert sind.
 * Wird durch 'OnApplicationBootstrap' realisiert.
 *
 * DB Migration mit TypeORM
 */

@Injectable()
export class DbPopulateService implements OnApplicationBootstrap {
    readonly #tabellen = ['film', 'produktionsstudio', 'produzent'];

    readonly #datasource: DataSource;

    readonly #resourcesDir = dbResourcesDir;

    readonly #logger = getLogger(DbPopulateService.name);

    /**
     * Initialisierung durch DI mit `DataSource` für SQL-Queries.
     */
    constructor(@InjectDataSource() dataSource: DataSource) {
        this.#datasource = dataSource;
    }

    /**
     * Die Test-DB wird im Development-Modus neu geladen.
     */
    async onApplicationBootstrap() {
        await this.populateTestdaten();
    }

    async populateTestdaten() {
        if (!dbPopulate) {
            return;
        }
        this.#logger.warn('DB wird neu geladen');
        switch (dbType) {
            case 'postgres': {
                await this.#populatePostgres();
                break;
            }
            case 'sqlite': {
                await this.#populateSQLite();
                break;
            }
            case 'mysql': {
                break;
            }
            case 'oracle': {
                break;
            }
        }
        this.#logger.warn('DB wurde neu geladen');
    }

    async #populatePostgres() {
        const dropScript = path.resolve(this.#resourcesDir, 'drop.sql');
        this.#logger.debug('dropScript: %s', dropScript);
        const dropStatements = readFileSync(dropScript, 'utf8'); // eslint-disable-line security/detect-non-literal-fs-filename,n/no-sync

        await this.#datasource.query(dropStatements);

        const createScript = path.resolve(this.#resourcesDir, 'create.sql');
        this.#logger.debug('createScript: %s', createScript);
        const createStatements = readFileSync(createScript, 'utf8'); // eslint-disable-line security/detect-non-literal-fs-filename,n/no-sync

        await this.#datasource.query(createStatements);

        // um die CSV-Dateien zu kopieren sind Admin Rechte erforderlich
        const dataSource = new DataSource(adminDataSourceOptions!);
        await dataSource.initialize();
        await dataSource.query(
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            `SET search_path TO ${adminDataSourceOptions!.database};`,
        );
        const copyStmt =
            'COPY %TABELLE% FROM \'/csv/%TABELLE%.csv\' (FORMAT csv, DELIMITER \';\', HEADER true);'; // todo eslint disablen
        for (const tabelle of this.#tabellen) {
            // eslint-disable-next-line unicorn/prefer-string-replace-all
            await dataSource.query(copyStmt.replace(/%TABELLE%/gu, tabelle));
        }
        await dataSource.destroy();
    }

    async #populateSQLite() {
        const dropScript = path.resolve(this.#resourcesDir, 'drop.sql');
        await this.#executeStatements(dropScript);

        const createScript = path.resolve(this.#resourcesDir, 'create.sql');
        await this.#executeStatements(createScript);

        const insertScript = path.resolve(this.#resourcesDir, 'insert.sql');
        await this.#executeStatements(insertScript);
    }

    async #executeStatements(script: string, removeSemi = false) {
        const statements: string[] = [];
        let statement = '';
        readFileSync(script, 'utf8') // eslint-disable-line security/detect-non-literal-fs-filename,n/no-sync
            .split(/\r?\n/u)
            .filter((line) => !line.includes('--'))
            .forEach((line) => {
                statement += line;
                if (line.endsWith(';')) {
                    if (removeSemi) {
                        statements.push(statement.slice(0, -1));
                    } else {
                        statements.push(statement);
                    }
                    statement = '';
                }
            });

        for (statement of statements) {
            await this.#datasource.query(statement);
        }
    }
}

/* eslint-enable @stylistic/quotes */

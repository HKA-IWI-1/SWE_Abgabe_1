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
 * Das Modul besteht aus der Klasse {@linkcode QueryBuilder}.
 * @packageDocumentation
 */

import { Film } from '../entity/film.entity.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Produktionsstudio } from '../entity/produktionsstudio.entity.js';
import { Produzent } from '../entity/produzent.entity';
import { Repository } from 'typeorm';
import { type Suchkriterien } from './suchkriterien.js';
import { getLogger } from '../../logger/logger.js';
import { typeOrmModuleOptions } from '../../config/typeormOptions.js';

/** Typdefinitionen für die Suche mit der Film-ID. */
export interface BuildIdParams {
    /** ID des gesuchten Filmes. */
    readonly id: number;
    /** Sollen die Abbildungen mitgeladen werden? */
    readonly mitProduzenten?: boolean;
}

/**
 * Die Klasse `QueryBuilder` implementiert das Lesen für Filme und greift
 * mit _TypeORM_ auf eine relationale DB zu.
 */
@Injectable()
export class QueryBuilder {
    readonly #filmAlias = `${Film.name
        .charAt(0)
        .toLowerCase()}${Film.name.slice(1)}`;

    readonly #produktionsstudioAlias = `${Produktionsstudio.name
        .charAt(0)
        .toLowerCase()}${Produktionsstudio.name.slice(1)}`;

    readonly #produzentenAlias = `${Produzent.name
        .charAt(0)
        .toLowerCase()}${Produzent.name.slice(1)}`;

    readonly #repo: Repository<Film>;

    readonly #logger = getLogger(QueryBuilder.name);

    constructor(@InjectRepository(Film) repo: Repository<Film>) {
        this.#repo = repo;
    }

    /**
     * Einen Film mit der ID suchen.
     * @param id ID des gesuchten Filmes.
     * @param mitProduzenten Definiert, ob auch Produzenten geladen werden sollen.
     * @returns QueryBuilder
     */
    buildId({ id, mitProduzenten = false }: BuildIdParams) {
        const queryBuilder = this.#repo.createQueryBuilder(this.#filmAlias);

        // Fetch-Join: aus QueryBuilder "film" die Property "produktionsstudio" ->  Tabelle "produktionsstudio"
        queryBuilder.innerJoinAndSelect(
            `${this.#filmAlias}.produktionsstudio`,
            this.#produktionsstudioAlias,
        );

        if (mitProduzenten) {
            queryBuilder.leftJoinAndSelect(
                `${this.#filmAlias}.produzenten`,
                this.#produzentenAlias,
            );
        }

        queryBuilder.where(`${this.#filmAlias}.id = :id`, { id: id }); // eslint-disable-line object-shorthand
        return queryBuilder;
    }

    /**
     * Filme asynchron suchen.
     * @param suchkriterien JSON-Objekt mit Suchkriterien
     * @returns QueryBuilder
     */
    build({ produktionsstudio, ...props }: Suchkriterien) {
        this.#logger.debug('build: titel=%s, props=%o', props);

        let queryBuilder = this.#repo.createQueryBuilder(this.#filmAlias);
        queryBuilder.innerJoinAndSelect(
            `${this.#filmAlias}.produktionsstudio`,
            'produktionsstudio',
        );

        // type-coverage:ignore-next-line

        let useWhere = true;

        // type-coverage:ignore-next-line
        if (
            produktionsstudio !== undefined &&
            typeof produktionsstudio === 'string'
        ) {
            const ilike =
                typeOrmModuleOptions.type === 'postgres' ? 'ilike' : 'like';
            queryBuilder = queryBuilder.where(
                `${this.#produktionsstudioAlias}.name ${ilike} :name`,
                { produktionsstudio: `%${produktionsstudio}%` },
            );
            useWhere = false;
        }

        // Restliche Properties als Key-Value-Paare: Vergleiche auf Gleichheit
        Object.keys(props).forEach((key) => {
            const param: Record<string, any> = {};
            param[key] = (props as Record<string, any>)[key]; // eslint-disable-line @typescript-eslint/no-unsafe-assignment, security/detect-object-injection
            queryBuilder = useWhere
                ? queryBuilder.where(
                      `${this.#filmAlias}.${key} = :${key}`,
                      param,
                  )
                : queryBuilder.andWhere(
                      `${this.#filmAlias}.${key} = :${key}`,
                      param,
                  );
            useWhere = false;
        });

        this.#logger.debug('build: sql=%s', queryBuilder.getSql());
        return queryBuilder;
    }
}

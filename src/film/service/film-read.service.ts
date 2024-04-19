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
 * Das Modul besteht aus der Klasse {@linkcode FilmReadService}.
 * @packageDocumentation
 */

import { Injectable, NotFoundException } from '@nestjs/common';
import { Film } from './../entity/film.entity.js';
import { QueryBuilder } from './query-builder.js';
import { type Suchkriterien } from './suchkriterien.js';
import { getLogger } from '../../logger/logger.js';

/**
 * Typdefinition für `findById`
 */
export interface FindByIdParams {
    /** ID des gesuchten Filmes */
    readonly id: number;
    /** Sollen die Produzenten mitgeladen werden? */
    readonly mitProduzenten?: boolean;
}

/**
 * Die Klasse `FilmReadService` implementiert das Lesen für Filme und greift
 * mit _TypeORM_ auf eine relationale DB zu.
 */
@Injectable()
export class FilmReadService {
    static readonly ID_PATTERN = /^[1-9]\d{0,10}$/u;

    readonly #filmProps: string[];

    readonly #queryBuilder: QueryBuilder;

    readonly #logger = getLogger(FilmReadService.name);

    constructor(queryBuilder: QueryBuilder) {
        const filmDummy = new Film();
        this.#filmProps = Object.getOwnPropertyNames(filmDummy);
        this.#queryBuilder = queryBuilder;
    }

    /**
     * Einen Film asynchron anhand seiner ID suchen.
     * @param id ID des gesuchten Filmes.
     * @returns Der gefundene Film vom Typ [Film](film_entity_film_entity.Film.html)
     *          in einem Promise aus ES2015.
     * @throws NotFoundException falls kein Film mit der ID existiert.
     */
    async findById({ id, mitProduzenten = false }: FindByIdParams) {
        this.#logger.debug('findById: id=%d', id);

        const film = await this.#queryBuilder
            .buildId({ id, mitProduzenten })
            .getOne();
        if (film === null) {
            throw new NotFoundException(
                `Es gibt keinen Film mit der ID ${id}.`,
            );
        }
        if (film.genres === null) {
            film.genres = [];
        }

        if (this.#logger.isLevelEnabled('debug')) {
            this.#logger.debug(
                'findById: film=%s, titel=%o',
                film.toString(),
                film.titel,
            );
            if (mitProduzenten) {
                this.#logger.debug(
                    'findById: produzenten=%o',
                    film.produzenten,
                );
            }
        }
        return film;
    }

    /**
     * Filme asynchron suchen.
     * @param suchkriterien JSON-Objekt mit Suchkriterien.
     * @returns Ein JSON-Array mit den gefundenen Filmen.
     * @throws NotFoundException falls keine Filme gefunden wurden.
     */
    async find(suchkriterien?: Suchkriterien) {
        this.#logger.debug('find: suchkriterien=%o', suchkriterien);

        if (suchkriterien === undefined) {
            return this.#queryBuilder.build({}).getMany();
        }
        const keys = Object.keys(suchkriterien);
        if (keys.length === 0) {
            return this.#queryBuilder.build(suchkriterien).getMany();
        }

        if (!this.#checkKeys(keys)) {
            throw new NotFoundException('Ungueltige Suchkriterien');
        }

        const filme = await this.#queryBuilder.build(suchkriterien).getMany();
        if (filme.length === 0) {
            this.#logger.debug('find: Keine Filme gefunden');
            throw new NotFoundException(
                `Keine Filme gefunden: ${JSON.stringify(suchkriterien)}`,
            );
        }
        filme.forEach((film) => {
            if (film.genres === null) {
                film.genres = [];
            }
        });
        this.#logger.debug('find: filme=%o', filme);
        return filme;
    }

    #checkKeys(keys: string[]) {
        let validKeys = true;
        keys.forEach((key) => {
            if (
                !this.#filmProps.includes(key)
                // todo: ggf. Pendants zu keys wie "javascript" überlegen
            ) {
                this.#logger.debug(
                    '#checkKeys: ungueltiges Suchkriterium "%s"',
                    key,
                );
                validKeys = false;
            }
        });

        return validKeys;
    }
}
